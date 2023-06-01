from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView, status
from requests import Request, post, get
from rest_framework.response import Response
from .utils import *
from django.http import JsonResponse
from api.models import Room
from .models import SkipVote, SuggestedSong
from .tasks import clear_suggested_song
from celery.result import AsyncResult
from project53.celery_config import app
from django.db.models import F


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize?",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    if not request.session.exists(request.session.session_key):
        request.session.create()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if error:
        # Log the error and return an error response
        print(f"Error in Spotify callback: {error}")
        return JsonResponse({"error": "Error in Spotify callback"}, status=400)

    if not isinstance(expires_in, int):
        # expires_in is not an integer, return an error response
        try:
            expires_in = int(expires_in)
        except ValueError:
            print(f"Invalid expires_in value: {expires_in}")
            return JsonResponse({"error": "Invalid expires_in value"}, status=400)

    update_or_create_user_tokens(
        session_id=request.session.session_key,
        access_token=access_token,
        token_type=token_type,
        expires_in=expires_in,
        refresh_token=refresh_token,
    )

    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "/player/currently-playing"
        response = execute_spotify_api_call(session_id=host, endpoint=endpoint)

        if response.status_code == 200:
            response = response.json()
        elif response.status_code == 401:
            print("response 401")
            return Response({"Error": response}, status=status.HTTP_401_UNAUTHORIZED)
        elif response.status_code == 429:
            print("response 429")
            retry_time = response.headers.get("retry-after")
            return Response(
                {"Error": response, "Retry-After": retry_time},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        else:
            return Response(
                {"Error": "Unknown error occured"},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        votes = len(SkipVote.objects.filter(room=room, song_id=song_id))
        artist_string = ""

        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "img_url": album_cover,
            "is_playing": is_playing,
            "votes": votes,
            "votes_required": room.votes_to_skip,
            "id": song_id,
        }

        self.update_room_song(room=room, song_id=song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            SkipVote.objects.filter(room=room).delete()


class PlayPauseSong(APIView):
    def put(self, request, format=None):
        playback = self.request.data.get("playback")

        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            if playback == True:
                pause_song(room.host)
            if playback == False:
                play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        votes = SkipVote.objects.filter(room=room, song_id=room.current_song)
        votes_to_skip = room.votes_to_skip

        if (
            self.request.session.session_key == room.host
            or len(votes) + 1 >= votes_to_skip
        ):
            votes.delete()
            skip_song(room.host)
        else:
            vote = SkipVote(
                user=self.request.session.session_key,
                room=room,
                song_id=room.current_song,
            )
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)


class SearchSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host

        search_query = self.request.data.get("query")
        type = "track"
        spotify_response = search_song(
            session_id=host, search_query=search_query, type=type
        )
        if spotify_response is not None:
            print("Response received")
        else:
            print("Repsonse is none")

        songs = []
        query_list = []
        artists = ""

        for song in range(5):
            songs.append(spotify_response.get("tracks").get("items")[song])

        for song in songs:
            artists = ""
            for i, artist in enumerate(song.get("artists")):
                if i > 0:
                    artists += ", "
                name = artist.get("name")
                artists += name

            query = {
                "name": song.get("name"),
                "album": song.get("album").get("name"),
                "img": song.get("album").get("images")[2].get("url"),
                "duration": song.get("duration_ms"),
                "id": song.get("id"),
                "artists": artists,
            }

            query_list.append(query)

        search_results = {
            "query_1": query_list[0],
            "query_2": query_list[1],
            "query_3": query_list[2],
            "query_4": query_list[3],
            "query_5": query_list[4],
        }

        return Response(search_results, status=status.HTTP_200_OK)


class GetQueue(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host = room.host
        spotify_response = get_queue(session_id=host, track_id=None, get_=True)

        queue_list_json = []
        queued_songs = []

        try:
            for song in range(5):
                queue_list_json.append(spotify_response.get("queue")[song])

            for song in queue_list_json:
                queued_song = {
                    "name": song.get("name"),
                    "album": song.get("album").get("name"),
                    "img": song.get("album").get("images")[2].get("url"),
                    "duration": song.get("duration_ms"),
                    "id": song.get("id"),
                }
                artists = ""
                for i, artist in enumerate(song.get("artists")):
                    if i > 0:
                        artists += ", "
                    name = artist.get("name")
                    artists += name

                queued_song["artists"] = artists
                queued_songs.append(queued_song)

            return Response(queued_songs, status=status.HTTP_200_OK)
        except:
            print(spotify_response)


class AddQueue(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]

        votes_to_queue = room.votes_to_suggest_song
        query_id = self.request.data.get("query_id")
        query_duration = self.request.data.get("query_duration")
        query_name = self.request.data.get("query_name")
        query_artist = self.request.data.get("query_artist")
        query_album = self.request.data.get("query_album")
        query_img = self.request.data.get("query_img")

        if not SuggestedSong.objects.filter(spotify_id=query_id, room=room).exists():
            suggested_song = SuggestedSong(
                user=self.request.session.session_key,
                name=query_name,
                artist=query_artist,
                album=query_album,
                img=query_img,
                duration=query_duration,
                spotify_id=query_id,
                room=room,
            )
            suggested_song.save()
            task = clear_suggested_song.apply_async(
                args=[query_id, room.code], countdown=10
            )
            suggested_song.task_id = task.id
            suggested_song.save()
        else:
            suggested_song = SuggestedSong.objects.filter(spotify_id=query_id, room=room).first()

        if (
            self.request.session.session_key == room.host
            or suggested_song.votes + 1 >= votes_to_queue
        ):
            # Revoke the delete task
            task = AsyncResult(suggested_song.task_id, app=app)
            task.revoke(terminate=True)
            # Delete the suggested song instance manually
            suggested_song.delete()
            get_queue(session_id=room.host, track_id=query_id, post_=True)
            return Response(
                {"Success": "Song added to queue"}, status=status.HTTP_200_OK
            )
        else:
            suggested_song = SuggestedSong.objects.filter(
                spotify_id=query_id, room=room
            ).first()
            suggested_song.votes = F("votes") + 1
            suggested_song.save()

            return Response({"Sucess": "Vote counted"}, status=status.HTTP_200_OK)

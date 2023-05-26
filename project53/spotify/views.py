from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView, status
from requests import Request, post
from rest_framework.response import Response
from .utils import *
from django.http import JsonResponse
from api.models import Room
from .models import Vote


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

    print(f"Access token: {access_token}")
    print(f"TokenType: {token_type}")
    print(f"Refresh Token: {refresh_token}")
    print(f"Expires in: {expires_in}")
    print(f"Error: {error}")

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

        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = response.get("id")
        votes = len(Vote.objects.filter(room=room, song_id=song_id))
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
            'votes_required': room.votes_to_skip,
            "id": song_id,
        }

        self.update_room_song(room=room, song_id=song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if (
            self.request.session.session_key == room.host
            or len(votes) + 1 >= votes_needed
        ):
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(
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

        search_query = self.request.data.get('query')
        type = 'track'
        spotify_response = search_song(session_id=host, search_query=search_query, type=type)
        if spotify_response is not None:
            print("Response received")
        else:
            print('Repsonse is none')

        songs=[]
        query_list = []

        for song in range(5):
            songs.append(spotify_response.get('tracks').get('items')[song])

        for song in songs:
            
            query={
                'name': song.get('name'),
                'album': song.get('album').get('name'),
                'img': song.get('album').get('images')[2].get('url'),
                'duration': song.get('duration_ms'),
                'id': song.get('id')
            }

            query_list.append(query)
        
        search_results = {
            'query_1': query_list[0],
            'query_2': query_list[1],
            'query_3': query_list[2],
            'query_4': query_list[3],
            'query_5': query_list[4]

        }

        return Response(search_results, status=status.HTTP_200_OK)
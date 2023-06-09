from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
import time
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get

BASE_URL = 'https://api.spotify.com/v1/me'
SEARCH_URL = 'https://api.spotify.com/v1/search?q='

def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(
    session_id, access_token, token_type, expires_in, refresh_token
):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=int(expires_in))

    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.refresh_token = refresh_token
        tokens.save(
            update_fields=[
                "access_token",
                "token_type",
                "expires_in",
                "refresh_token",
            ]
        )
    else:
        tokens = SpotifyToken(
            user=session_id,
            access_token=access_token,
            token_type=token_type,
            expires_in=expires_in,
            refresh_token=refresh_token,
        )
        tokens.save()


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    update_or_create_user_tokens(
        session_id=session_id,
        access_token=access_token,
        token_type=token_type,
        expires_in=expires_in,
        refresh_token=refresh_token,
    )


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id=session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id=session_id)
        
        return True

    return False


def execute_spotify_api_call(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id=session_id)
    header = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=header)
    if put_:
        put(BASE_URL + endpoint, headers=header)

    response = get(BASE_URL + endpoint, {}, headers=header)
    print(response)
    
    return response
    
def play_song(session_id):
    return execute_spotify_api_call(session_id=session_id, endpoint='/player/play', put_=True)

def pause_song(session_id):
    return execute_spotify_api_call(session_id=session_id, endpoint='/player/pause', put_=True)

def skip_song(session_id):
    return execute_spotify_api_call(session_id=session_id, endpoint='/player/next', post_=True)

def skip_prev_song(session_id):
    return execute_spotify_api_call(session_id=session_id, endpoint='/player/previous', post_=True)

def search_song(session_id, search_query, type, limit=10):
    tokens = get_user_tokens(session_id=session_id)
    header = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokens.access_token}
    
    response = get(SEARCH_URL + search_query + '&type=' + type, {}, headers=header)

    return response.json()

def get_queue(session_id, track_id, get_=False, post_=False):
    endpoint = '/player/queue'
    tokens = get_user_tokens(session_id=session_id)
    header = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokens.access_token}

    if get_:
        get_response = get(BASE_URL + endpoint, headers=header)
    
        if get_response.status_code == 429:
            return {'Error': 'Too many requests'}
        else:
            try:
                return get_response.json()
            except:
                print(get_response.headers)
                print(get_response.status_code)
                return {'Error': 'Issue with request'}
    
    if post_:
        post(BASE_URL + endpoint + '?uri=spotify:track:' + track_id, headers=header)
    
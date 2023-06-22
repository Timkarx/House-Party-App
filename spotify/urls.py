from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('song-playback', PlayPauseSong.as_view()),
    path('skip-song', SkipSong.as_view()),
    path('search-song', SearchSong.as_view()),
    path('get-queue', GetQueue.as_view()),
    path('add-queue', AddQueue.as_view())
]

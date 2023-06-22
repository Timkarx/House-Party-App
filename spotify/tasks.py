from __future__ import absolute_import
from celery import shared_task
from .models import SuggestedSong

@shared_task
def clear_suggested_song(spotify_id, room_code):
    SuggestedSong.objects.filter(spotify_id=spotify_id, room__code=room_code).delete()
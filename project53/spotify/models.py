from django.db import models
from api.models import Room

class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

class SkipVote(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    song_id = models.CharField(max_length=50)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

class SuggestedSong(models.Model):
    user = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=50)
    album = models.CharField(max_length=50)
    artist = models.CharField(max_length=50)
    duration = models.IntegerField()
    img = models.CharField(max_length=150)
    spotify_id = models.CharField(max_length=150)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    votes = models.IntegerField(default=0)
    task_id = models.CharField(max_length=50, null=True)
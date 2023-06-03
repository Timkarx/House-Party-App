from rest_framework import serializers
from .models import Room
from spotify.models import SuggestedSong


class RoomSerializer(serializers.ModelSerializer):
    suggested_songs = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = (
            "id",
            "code",
            "host",
            "guest_can_pause",
            "votes_to_skip",
            "votes_to_suggest_song",
            "created_at",
            "suggested_songs",
        )

    def get_suggested_songs(self, obj):
        suggested_songs = SuggestedSongSerializer(obj.suggested_songs.all(), many=True)
        return suggested_songs.data


class SuggestedSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestedSong
        fields = ("name", "album", "artist", "duration", "img", "spotify_id", "votes")


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "votes_to_suggest_song")


class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "code", "votes_to_suggest_song")

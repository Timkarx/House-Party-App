from rest_framework import serializers
from .models import Room


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
        return [
            (
                song.name,
                song.album,
                song.artist,
                song.duration,
                song.img,
                song.spotify_id,
                song.votes,
            )
            for song in obj.suggested_songs.all()
        ]


class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "votes_to_suggest_song")


class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "code", "votes_to_suggest_song")

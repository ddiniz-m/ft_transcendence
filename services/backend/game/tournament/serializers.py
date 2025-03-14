from rest_framework import serializers
from .models import Tournament, TournamentPlayer, TMessage
from lobby.serializers import LobbySerializer

class TMessageSerializer(serializers.ModelSerializer):
	class Meta:
			model = TMessage
			fields = ['sender', 'content', 'color']

class TournamentSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	game1 = LobbySerializer()
	game2 = LobbySerializer()
	game3 = LobbySerializer()
	chat = TMessageSerializer(many=True, read_only=True)

	class Meta:
		model = Tournament
		fields = ['tournament_id', 'players', 'game1', 'game2', 'game3', 'chat']

	def get_players(self, obj):
		return [
			{"id": tp.player.id, "username": tp.player.username, "joined_at": tp.joined_at}
			for tp in TournamentPlayer.objects.filter(tournament=obj).order_by("joined_at")
		]

<template>
	<div class="leaderboard-page">
	  <h1>Classement des joueurs</h1>
	  <h2>Découvrez nos 10 meilleurs joueurs !</h2>
	  <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th class="avatar-column">Avatar</th>
          <th>Username</th>
          <th>Level</th>
          <th>Wins</th>
          <th>Loses</th>
		  <th>Elo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(player, index) in players" :key="player.id">
          <td>{{ index + 1 }}</td>
          <td><img :src="player.avatar" alt="Avatar" class="avatar"></td>
          <td><a :href="`/user/${player.id}`">{{ player.username }}</a></td>
          <td>{{ player.level }}</td>
          <td>{{ player.win }}</td>
          <td>{{ player.lose }}</td>
		  <td>{{ player.elo }}</td>
        </tr>
      </tbody>
    </table>
	</div>
  </template>
  
  <script lang="ts">
	import axios from 'axios';
	export default {
		name: 'Leaderboard',
		data() {
			
			return {
				headers: [
					{ text: 'Rank', value: 'rank', width: '5%' },
					{ text: 'Avatar', value: 'avatar', width: '10%', sortable: false },
					{ text: 'Username', value: 'username' },
					{ text: 'Level', value: 'level' },
					{ text: 'Wins', value: 'win' },
					{ text: 'Losses', value: 'lose' },
					{ text: 'Elo', value: 'elo' },
				],
				players: []
			};
		},
		async mounted() {
			try {
				const response = await axios.get('http://localhost:3000/users');
				this.players = response.data;
				for (const player of this.players) {
					player.elo = 1000 + (player.win * 10) - (player.lose * 5);
					if (player.elo < 1000) {
						player.elo = 1000;
					}
				}
				this.players
					.sort((a, b) => b.elo - a.elo)
					.slice(0, 10);
				for (let i = 0; i < this.players.length; i++) {
					this.players[i].rank = i + 1;
				}
			} catch (error) {
				console.error('Erreur lors de la récupération des joueurs:', error);
			}
		},
  }
  </script>
  
  <style scoped>
	.leaderboard-page {
		text-align: center;
		width: 80%;
		margin: 2rem auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 0.5rem;
		text-align: left;
	}
  
	th {
		background-color: #f2f2f2;
	}

	.avatar {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 50%;
	}

	.avatar-column {
  		width: 70px;
	}
  </style>
<template>
	<div class="leaderboard-page">
	  <h1>Classement des joueurs</h1>
	  <p>Découvrez les 10 meilleurs joueurs !</p>
	  <table>
		<thead>
		  <tr>
			<th>Position</th>
			<th>Joueur</th>
			<th>Victoires</th>
			<th>Défaites</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="(player, index) in players" :key="player.id">
			<td>{{ index + 1 }}</td>
			<td>{{ player.username }}</td>
			<td>{{ player.win }}</td>
			<td>{{ player.lose }}</td>
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
			players: [],
		};
		},
		async mounted() {
			try {
				const response = await axios.get('http://localhost:3000/users');
				this.players = response.data
					.sort((a, b) => b.level - a.level)
					.slice(0, 10);
			} catch (error) {
				console.error('Erreur lors de la récupération des joueurs:', error);
			}
		},
	};
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
  </style>
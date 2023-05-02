<template>
	<div>
		<v-card class="mx-auto text-center card-main" max-width="80%">
			<v-btn class="goback-button" color="primary" @click="goBack">Go back</v-btn>
			<v-img v-if="user.avatar" :src="getAvatar(user)" class="user-avatar" height="200px"></v-img>

			<v-card-title>
				<div>
					<div class="headline mb-2">{{ user.username }}</div>
					<div>Level: {{ user.level }}</div>
					<div>Win: {{ user.win }} | Lose: {{ user.lose }}</div>
				</div>
			</v-card-title>

			<v-card-subtitle>
				<v-card-title>Friends</v-card-title>
				<v-list dense>
					<v-list-item v-for="friend in friendsAsUser" :key="friend.id" :title="friend.username"></v-list-item>
				</v-list>
			</v-card-subtitle>

			<v-card class="match-card mx-auto text-center" max-width="70%" mb-2>
				<v-card-title>Last 20 Matchs History</v-card-title>
				<v-table>
					<thead>
						<tr>
							<th class="text-center">Opponent</th>
							<th class="text-center">Score</th>
							<th class="text-center">Result</th>
							<th class="text-center">Date</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="match in matches" :key="match.id">
							<td class="text-center"><a :href="`/user/${match.opponent}`"> {{ match.opponentName }}</a></td>
							<td class="text-center">{{ match.score }}</td>
							<td class="text-center">{{ match.result }}</td>
							<td class="text-center">{{ new Date(match.date).toLocaleString() }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card>
		</v-card>
	</div>
</template>

<script lang="ts">
export default {
	data() {
		return {
			user: {
				avatar: '',
				username: '',
				level: 0,
				win: 0,
				lose: 0,
				friends: [],
			},
			matches: [],
			URL: "http://localhost:3000/users/avatar/",
			friendsAsUser: [],
		};
	},
	async created() {
		const id = this.$route.params.id;
		const response = await fetch(`http://localhost:3000/users/${id}`);
		this.user = await response.json();

		const responseHistory = await fetch('http://localhost:3000/history', { credentials: 'include' });
		const allMatches = await responseHistory.json();
		if (Array.isArray(allMatches)) {
			allMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
			this.matches = allMatches.filter(match => match.player1 === id || match.player2 === id).slice(0, 20);
			for (const match of this.matches) {
				match.opponent = match.player1 == id ? match.player2 : match.player1;
				var side = match.opponent == match.player1 ? 2 : 1;
				match.result = match.winner == side ? 'Win' : 'Lose';
				var allUsers = await fetch(`http://localhost:3000/users`);
				allUsers = await allUsers.json();
				match.opponentName = allUsers.find(user => user.id == match.opponent).username;
				match.score = match.player1_score + " - " + match.player2_score;
			}
		} else {
			console.error('allMatches is not an array', allMatches);
		}
		this.friendsAsUser = await this.getFriends();
	},
	methods: {
		goBack() {
			this.$router.go(-1);
		},
		getAvatar(user: any) {
			if (user.avatar.startsWith("https://cdn.intra.42.fr/")) {
				return user.avatar;
			}
			return this.URL + user.avatar;
		},
		async getFriends(): Promise<any[]> {
			const friends = this.user.friends;
			if (friends === undefined) {
				return [];
			}
			let friendsList = [];
			for (let i = 0; i < friends.length; i++) {
				const friend = await fetch(
					"http://localhost:3000/users/" + friends[i].userId,
					{
						method: "GET",
						credentials: "include",
					}
				);
				if (friend !== undefined) {
					const data = await friend.json();
					friendsList.push(data);
				}
			}
			return friendsList;
		},
	},
};
</script>

<style scoped>
.match-card {
	margin-bottom: 20px;
}

.card-main {
	margin-top: 20px;
}

.goback-button {
	margin-top: 20px;
}

.user-avatar {
	border-radius: 50%;
	margin: 20px;
}
</style>
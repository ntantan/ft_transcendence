<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";
import axios from "axios";

export default defineComponent({
	name: "MatchHistory",

	data() {
		return {
			avatar: {
				size: "50",
			},
			userStore,

			history: {},
			users: {},
			opponents_ids: [],
			opponents_name: [],
			opponents_avatar: [],
			URL: "http://localhost:3000/users/avatar/",
		};
	},

	created() {
		this.fetch()
	},

	methods: {
		async fetch() {
			const id = this.userStore.user.id;
			const history_api = "http://localhost:3000/history/";

			await axios.get(history_api + id, { withCredentials: true })
				.then((response) => {
					this.history = response.data;
				})
				.catch((error) => {
					console.log(error);
				})

			for (const item of this.history) {
				const opponent_id = item.player1 == this.userStore.user.id ? item.player2 : item.player1;
				this.opponents_ids.push(opponent_id);
			}

			this.history.forEach(history => {
				history.date = new Date(history.date).toLocaleString()
			});

			const users_api = "http://localhost:3000/users";
			await axios.get(users_api, { withCredentials: true })
				.then((response) => {
					this.users = response.data
				})
				.catch((error) => {
					console.log(error)
				})

			for (const item of this.opponents_ids) {
				const opponent = this.users.find((user) => user.id == item);
				this.opponents_name.push(opponent.username);
				this.opponents_avatar.push(this.getAvatar(opponent.avatar));
			}


		},

		getAvatar(avatar: string): string {
			if (avatar.startsWith("https://cdn.intra.42.fr/")) {
				return avatar;
			}
			return this.URL + avatar;
		},

		getResult(history: any): string {
			history.opponent = history.player1 == userStore.user.id ? history.player2 : history.player1;
			let side = history.opponent == history.player1 ? 2 : 1;
			return (history.winner == side ? 'win' : 'lose');
		}
	},

	computed: {
	}
});
</script>

<template>
	<div style="overflow-y: scroll; height: 65%; min-height: 950px;">
		<v-container>
			<h1 class="d-flex justify-center align-center">Match history</h1>
			<v-card>
				<v-row>
					<v-col cols="3" class="column my-2">Opponent</v-col>
					<v-col cols="3" class="column my-2">Score</v-col>
					<v-col cols="3" class="column my-2">Result</v-col>
					<v-col cols="3" class="column my-2">Date</v-col>
				</v-row>
			</v-card>

			<div>
				<div v-for="(item, index) in this.history" v-motion-fade :delay="(index + 1) * 100">
					<v-card>
						<v-row class="ma-2">
							<v-col cols="3" class="column">
								<v-avatar>
									<v-img :src="this.opponents_avatar[index]"></v-img>
								</v-avatar>
								<div class="ml-3">
									{{ opponents_name[index] }}
								</div>
							</v-col>

							<v-col cols="3" class="column">
								{{ this.history[index].player1_score }} - {{ this.history[index].player2_score }}
							</v-col>

							<v-col cols="3" class="column">
								<!-- {{ this.history[index].winner == this.userStore.user.id ? "win" : "lose" }} -->
								{{ this.getResult(this.history[index]) }}
							</v-col>

							<v-col cols="3" class="column">
								{{ this.history[index].date }}
							</v-col>
						</v-row>
					</v-card>
				</div>
			</div>
		</v-container>
	</div>
</template>

<style scoped>
.scroll {
	height: 100%;
	overflow-y: scroll;
	scrollbar-color: rebeccapurple green;
	scrollbar-width: thin;
}

.column {
	display: flex;
	justify-content: center;
	align-items: center;
}

.row {
	display: flex;
	justify-content: center;
	align-items: center;
}

.row-item {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 3em 3em auto 3em;
}
</style>
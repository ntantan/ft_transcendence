<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";

import BannerBar from "./components/BannerBar.vue";
import NavBar from "./components/NavBar.vue";

import { gameStore } from "./stores/game";
import { chatStore } from "./stores/chat";
import router from "./router";

export default defineComponent({
	name: "App",


	components: {
		BannerBar,
		NavBar,
	},

	watch: {
		// $route(to) {
		// 	document.title = `${to.meta.title}`;
		// 	const link = document.querySelector("[rel='icon']");
		// 	link.setAttribute('href',to.meta.icon);
		// }
	},

	data() {
		return {
			gameStore,
			chatStore,
			// piniaGameStore: gameStore(),

			snackbar: false,
			snackbar_text: 'My timeout is set to 2000.',
			timeout: 3000,

			invitebar: false,
			invitebar_text: '',
			invitebar_timeout: 5000,
			invite_room: "",
			invite_player: "",
		};
	},

	created() {
		
		const localhost = import.meta.env.VITE_LOCALHOST; // ${localhost}
		
		this.gameStore.socket = io(`http://localhost:3000/game`, { withCredentials: true });
		
		this.chatStore.socket = io(`http://localhost:3000/chat`, { withCredentials: true });
	},
	
	mounted() {

		// Print an error notification
		this.chatStore.socket.on('error', (response) => {
			this.sendSnackbar(response.message);
		});

		this.gameStore.socket.on('error', (response) => {
			this.sendSnackbar(response.message);
		})
		this.gameStore.socket.on('gameInvite', (response) => {
			console.log("test")
			this.sendInviteBar("You received an invitation to play from " + response.inviter);
			this.invite_room = response.room_name;
			this.invite_player = response.inviter;
		})
	},

	methods: {
		sendSnackbar(msg: string)
		{
			this.snackbar_text = msg;
			this.snackbar = true;
		},

		sendInviteBar(msg: string)
		{
			this.invitebar_text = msg;
			this.invitebar = true;
		},

		acceptInvite()
		{		
			this.gameStore.socket.emit("joinRoom", { roomName: this.invite_room }, (response) => {
				this.gameStore.inGame = response.player_side;
				if (this.gameStore.inGame)
					this.gameStore.currentRoom = response.roomName;
			});
			router.push('/game');
			console.log(this.gameStore.currentRoom, this.gameStore.inGame)
		},
	}
});
</script>

<template>
	<v-app id="app">
		<v-main>
			<banner-bar />
			<v-divider class="border-opacity-30"></v-divider>
			<router-view />
			<nav-bar />

			<!-- error bar -->
			<div class="text-center">
				<v-snackbar
				v-model="snackbar"
				:timeout="timeout"
				>
				{{ snackbar_text }}
					<template v-slot:actions>
						<v-btn
						color="blue"
						variant="text"
						@click="snackbar = false"
						>
						Close
						</v-btn>
					</template>
				</v-snackbar>
			</div>

			<!-- invite bar -->
			<div class="text-center">
			<v-snackbar
			v-model="invitebar"
			:timeout="invitebar_timeout"
			location="top"
			>
			{{ invitebar_text }}
				<template v-slot:actions>
					<v-btn
					color="blue"
					variant="text"
					@click="invitebar = false; acceptInvite()"
					>
					Play
					</v-btn>
				</template>
			</v-snackbar>
			</div>

		</v-main>
	</v-app> 
</template>

<style>
</style>

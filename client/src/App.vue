<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";

import BannerBar from "./components/BannerBar.vue";
import NavBar from "./components/NavBar.vue";

import { gameStore } from "./stores/game";
import { chatStore } from "./stores/chat";

export default defineComponent({
	name: "App",

	components: {
		BannerBar,
		NavBar,
	},

	watch: {
		$route(to) {
			document.title = `${to.meta.title}`;
			const link = document.querySelector("[rel='icon']");
			link.setAttribute('href',to.meta.icon);
		}
	},

	data() {
		return {
			gameStore,
			chatStore,

			snackbar: false,
			snackbar_text: 'My timeout is set to 2000.',
			timeout: 3000,
		};
	},

	created() {
		const localhost = import.meta.env.VITE_LOCALHOST; // ${localhost}
		this.gameStore.socket = io(`http://localhost:3000/game`, { withCredentials: true });

		this.chatStore.socket = io(`http://localhost:3000/chat`, { withCredentials: true })
	},

	mounted() {

		// Print an error notification
			this.chatStore.socket.on('error', (response: any) => {
			this.sendSnackbar(response.message);
		})
	},

	methods: {
		sendSnackbar(msg: string)
		{
			this.snackbar_text = msg;
			this.snackbar = true;
		},
	}
});
</script>

<template>
	<v-app id="app">
		<v-main>
			<banner-bar />
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

		</v-main>
	</v-app> 
</template>

<style>

</style>

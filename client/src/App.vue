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
			chatStore
		};
	},

	created() {
		const localhost = import.meta.env.VITE_LOCALHOST; // ${localhost}
		this.gameStore.socket = io(`http://localhost:3000/game`, { withCredentials: true });

		this.chatStore.socket = io(`http://localhost:3000/chat`, { withCredentials: true })
	},

	mounted() {
	},

	methods: {
	}
});
</script>

<template>
	<v-app id="app">
		<v-main>
			<banner-bar />
			<router-view />
			<nav-bar />
		</v-main>
	</v-app> 
</template>

<style>

</style>

<script lang="ts">
import { defineComponent } from "vue";
import PongGame from "../components/PongGame.vue";
import RoomsList from "@/components/RoomsList.vue";
import { gameStore } from "../stores/game";
import { io } from "socket.io-client";

export default defineComponent({
	name: "GameView",
		
	components: {
		PongGame,
		RoomsList,
	},

	data() {
		return {
			gameStore,
		};
	},

	created() {
	},

	
}); 
</script>

<template>
	<PongGame v-if="this.gameStore.inGame > 0" />
	<RoomsList />
</template>

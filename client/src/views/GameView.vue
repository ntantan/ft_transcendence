<script lang="ts">
import { defineComponent } from "vue";
import PongGame from "../components/PongGame.vue";
import RoomsList from "@/components/RoomsList.vue";
import { useGameStore } from "../stores/game";
import { io } from "socket.io-client";

export default defineComponent({
	name: "GameView",
		
	components: {
		PongGame,
		RoomsList,
	},

	data() {
		return {
			gameStore: useGameStore(),
		};
	},

	created() {
	},
	
	mounted() {
		this.gameStore.socket.on('reconnect', (response) => {
			console.log("RECON", response);
			if (response.player_side)
				this.gameStore.inGame = response.player_side;
			if (response.currentRoom)
				this.gameStore.currentRoom = response.room;
		})
	},

	
}); 
</script>

<template>
	<PongGame v-if="this.gameStore.inGame > 0" />
	<RoomsList />
</template>

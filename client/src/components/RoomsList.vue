<script lang="ts">
import { defineComponent } from "vue";
import { gameStore } from "../stores/game";
import HistoryDialog from "@/components/HistoryDialog.vue";
import gamemod2 from "@/assets/screenshot_gamemod2.png";
import gamemod1 from "@/assets/screenshot_gamemod1.png";
import gamemod0 from "@/assets/screenshot_gamemod0.png";
import axios from "axios";

export default defineComponent({

	data() {
		return {
			gamemod0: gamemod0,
			gamemod1: gamemod1,
			gamemod2: gamemod2,
			rooms: [],
			gameStore,
			model: 1,
		};
	},

	components: {
		HistoryDialog,
	},

	mounted() {
		this.getRooms();

		this.gameStore.socket.on("endGame", (data) => {
			const roomName = data.roomName;
			this.gameStore.socket.emit("leaveRoom", { roomName });
			this.gameStore.inGame = 0;
			this.getRooms();
		});
	},

	methods: {
		async getRooms() {
			// const localhost = import.meta.env.VITE_LOCALHOST;
			// const response = await fetch(`http://${localhost}:3000/rooms`);
			// this.rooms = await response.json();
			axios.get("http://localhost:3000/rooms", {withCredentials: true})
				.then((response) => {
					this.rooms = response.data;
				})
				.catch((error) => {
					console.log(error);
				})
		},

		test() 
		{
			this.gameStore.socket.emit("test");
		},

		joinQueue()
		{
			this.gameStore.socket.emit("joinQueue", { mod: this.model },(response) => {
				this.gameStore.inGame = response.player_side;
				if (this.gameStore.inGame)
					this.gameStore.currentRoom = response.roomName;
			});
		},

		// joinRoom(roomName: string)
		// {
		// 	// response is either 0 if no rooms entered, 1 if player 1, 2 if player 2
		// 	this.gameStore.socket.emit("joinRoom", { roomName }, (response) => {
		// 		this.gameStore.inGame = response.player_side;
		// 		if (this.gameStore.inGame)
		// 			this.gameStore.currentRoom = response.roomName;
		// 	});
		// },

		leaveRoom(roomName: string)
		{
			this.gameStore.socket.emit("leaveRoom", { roomName });
			this.gameStore.currentRoom = null;
			this.gameStore.inGame = 0;
		},

		spectateRoom(roomName: string)
		{
			this.gameStore.socket.emit("spectateRoom", { roomName });
			this.gameStore.currentRoom = roomName;
			this.gameStore.inGame = 3;
		},
	} 
});
</script>

<template>

	<v-card v-if="!this.gameStore.inGame" class="mx-auto ma-4" elevation="2" max-width="730">
		<v-slide-group v-model="model" class="pa-4" selected-class="bg-primary" mandatory show-arrows>

			<v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }">
				<v-card color="grey-lighten-1" :class="['ma-4', selectedClass]" height="200" width="200" @click="toggle">
					<div class="d-flex fill-height align-center justify-center">
						<v-img :src="gamemod0"/>
					</div>
				</v-card>
			</v-slide-group-item>

			<v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }">
				<v-card color="grey-lighten-1" :class="['ma-4', selectedClass]" height="200" width="200" @click="toggle">
					<div class="d-flex fill-height align-center justify-center">
						<v-img :src="gamemod1"/>
					</div>
				</v-card>
			</v-slide-group-item>

			<v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }">
				<v-card color="grey-lighten-1" :class="['ma-4', selectedClass]" height="200" width="200" @click="toggle">
					<div class="d-flex fill-height align-center justify-center">
						<v-img :src="gamemod2"/>
					</div>
				</v-card>
			</v-slide-group-item>
			
      	</v-slide-group>
  
		<v-expand-transition>
			<v-sheet v-if="model != null" height="100">
				<div class="d-flex fill-height align-center justify-center">
					<div v-if="model == 0">
						<h3 class="d-flex justify-center">Pong more boring</h3>
						<p class="font-italic opacity">A moving racket in the middle for a lot of fun</p>
					</div>
					<div v-if="model == 1">
						<h3 class="d-flex justify-center">Original Pong</h3>
						<p class="font-italic opacity">Original experience, for real OG</p>
					</div>
					<div v-if="model == 2">
						<h3 class="d-flex justify-center">Pong less boring</h3>
						<p class="font-italic opacity">Add some stars to your life with this incredible remaster of Pong</p>
					</div>
				</div>
			</v-sheet>
		</v-expand-transition>
		
		<v-btn 
			class="d-flex alight-center justify-center mx-auto ma-4"
			color="primary"
			v-if="!this.gameStore.inGame" v-on:click="joinQueue()"
			>Find a match</v-btn>
		
    </v-card>

	<v-row justify="center">
		<v-col cols="auto pa-8">
			<v-btn
				v-if="this.gameStore.inGame" v-on:click="leaveRoom(this.gameStore.currentRoom)"
				>Leave</v-btn>
		</v-col>
	</v-row>

	<v-row v-if="!this.gameStore.inGame" justify="center">
		<v-col cols="auto pa-8">
			<HistoryDialog />
		</v-col>
	</v-row>

	<div v-if="!this.gameStore.inGame">
		<v-row wrap>
			<v-col class="d-flex justify-center pa-8">
				<v-card class="d-flex" max-width="300">
					<v-list>	
						<v-list-item v-for="room in rooms" :key="room.id" :value="room.name" width="300">
							<template v-if="!this.gameStore.inGame" v-slot:append>
							<!-- <v-btn v-on:click="joinRoom(room.name)">join</v-btn> -->
							<v-btn v-on:click="spectateRoom(room.name)"> <v-icon>mdi-eye-outline</v-icon> </v-btn>
							</template>
							<v-list-item-title v-text="room.name"></v-list-item-title>
						</v-list-item>
					</v-list>
				</v-card>
			</v-col>
		</v-row> 
	</div>
</template>

<style>

.opacity {
	opacity: 0.5;
}

</style>
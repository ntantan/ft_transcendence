import { Socket } from "socket.io-client";
import { reactive } from "vue";
import { defineStore } from 'pinia';

export const gameStore = reactive({
	invitedUser: {},
	inGame: 0,
	socket: undefined,
	currentRoom: "roomlist",
})

export const useGameStore = defineStore('game', {
	state: () => {
		return {
			socket: {},
			hello: "",
		};
	},
	actions: {
		setSocket(socket: any) {
			this.socket = socket;
		}
	},
	persist: true,
})
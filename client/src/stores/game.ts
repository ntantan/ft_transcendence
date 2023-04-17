import { Socket } from "socket.io-client";
import { reactive } from "vue";

export const gameStore = reactive({
	inGame: 0,
	socket: undefined,
	currentRoom: "roomlist",
})
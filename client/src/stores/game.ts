import { Socket } from "socket.io-client";
import { reactive } from "vue";

export const gameStore = reactive({
	invitedUser: {},
	inGame: 0,
	socket: undefined,
	currentRoom: "roomlist",
})

// export const useGameStore = defineStore('main', {
// 	state: () => {
// 		return {
// 			invitedUser: {},
// 			inGame: 0,
// 			currentRoom: "roomlist",
// 			socket: {},
// 		};
// 	},
// 	persist: true,
// })
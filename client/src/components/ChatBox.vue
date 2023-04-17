<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";

export default defineComponent({
    
	data() {
		return {
            socket: {},
			messages: [],
			texteGeneral: "",
			roomName: "",
		};
	},

	created() {
		this.socket = io("http://localhost:3000/chat", { withCredentials: true });
	},

	methods: {

		handleSubmitNewMessage(message) {
			if (this.texteGeneral) {
			console.log(this.texteGeneral)
			this.socket.emit('message', this.texteGeneral)
			}
		},
		clearSearch() {
			this.texteGeneral = ''
			this.roomName = ''
		},
		clickButton() {
			if (this.texteGeneral) {
				console.log("Button clicked");
			}
		},
		createNewRoom() {
			if (this.roomName) {
				this.socket.emit('createRoom', 
					{
						room_name: this.roomName
						
					})
			}
		},
		scrollToBottom() {
			this.$ref.chatTextarea.scrollTop = this.$ref.chatTextarea.scrollHeight;
		},
	},

	mounted() {
		this.socket.on('message', (message) => {
			this.messages.push(message);
		})
	},
});

</script>

<template>
	<div class="general-chat">
		<ul style="liste-style-type: none;" v-for="item in this.messages">
			<li><v-card text="">{{ item }}</v-card></li>
		</ul>
	</div>
	<div class="input-field">
		<input @keydown.enter="handleSubmitNewMessage(message), clearSearch()" id="input" type="text" v-model="texteGeneral" />
		<button @click="handleSubmitNewMessage(message), clearSearch()">Send message</button>
		<input @keydown.enter=" createNewRoom(), clearSearch()" id="input" type="text" v-model="roomName" />
		<button @click=" createNewRoom(), clearSearch()">Create new room</button>
	</div>
</template>

<style>
	.input-field {
		position: fixed;
		bottom: 10%;
		background-color: aquamarine;
	}
	.general-chat {
		height: 500px;
		overflow-y: scroll;
		overscroll-behavior: auto;
		scroll-behavior: auto;
	}
</style>
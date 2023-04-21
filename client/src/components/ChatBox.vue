<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import axios from 'axios';

import { chatStore } from "@/stores/chat";
import { mergeProps } from "vue";

const CHANNELS_URL = "http://localhost:3000/channels/";

export default defineComponent ({
    data() {
        return {
            chatStore,
            socket: {},
			isJoined: false,
            room: {},

            channels: [],

            selectedChannel: "",
            roomName: "",
            passWord: "",
            messageText: "",

			rules: [
				value => {
					if (value)
						return (true)
					return ("Field can not be empty")
				}
			],

			snackbar: false,
			snackbar_text: 'My timeout is set to 2000.',
			timeout: 2000,
        }
    },

    created() {
        this.socket = this.chatStore.socket;
    },

    mounted() {
        this.fetchAllRooms();
        this.socket.on('newRoom', () => {
            this.fetchAllRooms();
        })

		// Print an error notification
		this.socket.on('error', (response: any) => {
			this.sendSnackbar(response);
		})
    },

    watch: {
        selectedChannel(newVal, oldVal) {
            if (newVal)
                this.fetchRoom();
        }
    },

    methods: {
        fetchAllRooms() {
            axios.get(CHANNELS_URL, {withCredentials: true})
            .then((response) => {
                this.channels = response.data;
            })
        },

        fetchRoom() {
            axios.get((CHANNELS_URL + this.selectedChannel), {withCredentials: true})
            .then((response) => {
                console.log(response);
				this.isJoined = true;
                this.room = response.data
            })
            .catch((error) => {
				this.isJoined = false;
				this.sendSnackbar(error.response.data.message);
                console.log(error);
            })
        },

        createNewRoom() {
			if (!this.roomName)
				return;
            this.socket.emit('createRoom', {room_name: this.roomName, password: this.passWord});
            this.clearTextArea();
            window.scrollTo(0, document.body.scrollHeight);
        },

        clearTextArea() {
            this.messageText = "";
            this.roomName = "";
            this.passWord = "";
        },

        async SubmitNewMessage() {
            if (this.messageText && this.selectedChannel){
                this.socket.emit('textMessage', {msg: this.messageText,
                                                id: this.selectedChannel});
                this.clearTextArea();
            }
        },

        muteUser(user: any) {
            this.socket.emit('muteUser', {id: this.selectedChannel, userMuted: user.id})
            // ajouter temps de mute
        },

        kickUser(user: any) {
            this.socket.emit('kickUser', {id: this.selectedChannel, userKicked: user.id})
            console.log("kickUser OK");
        },

        changeAdmin(user: any) {
            this.socket.emit('changeAdmin', {id: this.selectedChannel, userAdmin: user.id})
            console.log("changeAdmin OK");
            //changer icone apres changeAdmin
        },

        inviteGame() {
            console.log("inviteGame OK");
        },
        mergeProps,
		sendSnackbar(msg: string)
		{
			this.snackbar_text = msg;
			this.snackbar = true;
		}
    },
});
</script>

<template>
    <v-card width="1200" class="h-chat mx-auto ma-6">
        <v-row>
            <v-col cols="3">

                <v-card class="h-chat">

					<h2 class="d-flex justify-center align">Channels</h2>

					<v-card height="700" class="scroll my-3">
						<v-item-group v-model="selectedChannel">
							<v-item v-for="channel in channels" :value="channel.id" v-slot="{isSelected, selectedClass, toggle}">
								<v-card :class="['d-flex pa-3', selectedClass]" @click="toggle">
									{{channel.name}}
								</v-card>
							</v-item>
						</v-item-group>
					</v-card>

					<v-form @submit.prevent>
						<v-text-field v-model="this.roomName" :rules="rules" label="Room name"></v-text-field>
						<v-text-field v-model="this.passWord" label="Password"></v-text-field>
						<v-btn type="submit" block @click="this.createNewRoom()">create room</v-btn>
					</v-form>

                </v-card>

            </v-col>

            <v-col align-self="end">
				<v-card class="h-options">
					<v-card-title>{{ selectedChannel }}</v-card-title>
                    <!-- ajouter bouton chgt mdp -->
				</v-card>
				<v-card class="h-message my-2">
					<v-list>
                        <ul v-for="message in this.room.messages" :key="message">
                            <li>
                                <!-- mise en page messages -->
                                {{ message.date }}
                                {{ message.message }}
                            </li>
                        </ul>
					</v-list>
				</v-card>

				<v-text-field v-model="messageText" label="Enter your message here" @keydown.enter="SubmitNewMessage()">						
				</v-text-field>
            </v-col>

            <v-col cols="3">
                <v-card class="h-chat">
                    <h2 class="d-flex justify-center">User</h2>

                    <v-menu v-for="user in this.room.channel_users" :key="user">
                        <template v-slot:activator="{ props: menu }">
                            <v-tooltip>
                                <template v-slot:activator="{ props: tooltip }">
                                    <v-btn color="primary" v-bind="mergeProps(menu, tooltip)">{{ user.user.username }}</v-btn> 
                                </template>
                            </v-tooltip>
                        </template>
                    <v-list>
                        <v-list-item>
                            <v-list-item-title><v-btn type="submit" block @click="this.muteUser(user)" color="primary">mute</v-btn></v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title><v-btn type="submit" block @click="this.kickUser(user)" color="primary">kick</v-btn></v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title><v-btn type="submit" block @click="this.changeAdmin(user)" color="primary">admin</v-btn></v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title><v-btn type="submit" block @click="this.inviteGame()" color="primary">invite game</v-btn></v-list-item-title>
                        </v-list-item>
                    </v-list>
                    </v-menu>
                </v-card>
            </v-col>
        </v-row>
    </v-card>

	<!-- error bar -->
	<div class="text-center">
		<!-- <v-btn
		color="orange-darken-2"
		@click="snackbar = true"
		>
		Open Snackbar
		</v-btn> -->

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

</template>

<style>

.scroll{
	overflow-y: scroll;
    scroll-behavior: smooth;
}

.h-chat{
	height: 1000px;
}

.h-message{ 
	height: 850px;
}

.h-options{
	height: 50px;
}

</style>
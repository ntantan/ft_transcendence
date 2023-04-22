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

			roomPassword: "",
			rules: [
				value => {
					if (value)
						return (true)
					return ("Field can not be empty")
				}
			],
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

		this.socket.on('updateRoom', () => {
			this.fetchRoom();
		})
    },

    watch: {
        selectedChannel(newVal, oldVal) {
            if (newVal)
                this.fetchRoom();
			else
				this.selectedChannel = oldVal
        }
    },

	computed: {
		selectedRoomname() {
			const find = this.channels.find((channel) => channel.id == this.selectedChannel);
			if (find)
				return (find.name);
		}
	},

    methods: {
        fetchAllRooms() {
            axios.get(CHANNELS_URL, {withCredentials: true})
            .then((response) => {
                this.channels = response.data;
				console.log(response)
            })
        },

        fetchRoom() {
            axios.get((CHANNELS_URL + this.selectedChannel), {withCredentials: true})
            .then((response) => {
                console.log(response);
				this.isJoined = true;
                this.room = response.data;
				this.socket.emit('joinSocket', {
					id: this.selectedChannel,
				});
            })
            .catch((error) => {
				this.room = {};
				this.isJoined = false;
				this.sendSnackbar(error.response.data.message);
                // console.log(error);
            })
        },

        createNewRoom() {
			if (!this.roomName)
				return;
            this.socket.emit('createRoom', {room_name: this.roomName, password: this.passWord});
            this.clearTextArea();
            window.scrollTo(0, document.body.scrollHeight);
        },

		joinRoom() {
			this.socket.emit('joinRoom', {
				id: this.selectedChannel,
				password: this.roomPassword,
			})
		},

		leaveRoom() {
			this.socket.emit('leaveRoom', {
				id: this.selectedChannel,
			})
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

        muteUser(channel_user: any) {
            this.socket.emit('addMute', {
								id: this.selectedChannel, 
								user_id: channel_user.user.id})
            // ajouter temps de mute
        },

        kickUser(channel_user: any) {
            this.socket.emit('kickUser', {
								id: this.selectedChannel,
								user_id: channel_user.user.id})
            console.log("kickUser OK");
        },

        addAdmin(channel_user: any) {
            this.socket.emit('addAdmin', {
								id: this.selectedChannel,
								user_id: channel_user.user.id})
            console.log("changeAdmin OK");
            //changer icone apres changeAdmin
        },

		rmAdmin(channel_user: any) {
			this.socket.emit('rmAdmin', {
								id: this.selectedChannel,
								user_id: channel_user.user.id})
		},

        inviteGame() {
            console.log("inviteGame OK");
        },

		mergeProps,
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
						<v-text-field clearable v-model="this.roomName" :rules="rules" label="Room name"></v-text-field>
						<v-text-field v-model="this.passWord" label="Password"></v-text-field>
						<v-btn type="submit" block @click="this.createNewRoom()">create room</v-btn>
					</v-form>

                </v-card>

            </v-col>

            <v-col align-self="end">

				<v-card class="h-options mx-auto">

					<v-row v-if="!isJoined && selectedChannel">
						<v-col class="ma-2" align-self="center" cols="5">
							<v-card-title>{{ selectedRoomname }}</v-card-title>
						</v-col>
						<v-col class="mr-3"  cols="4" align-self="center">
							<v-text-field
								style="width: 200px;"
								v-model="roomPassword"
								label="Leave empty if not required"
								variant="underlined">
							</v-text-field>
						</v-col>
						<v-col align-self="center">
							<v-btn width="100" color="primary" @click="joinRoom()">Join</v-btn>
						</v-col>
					</v-row>

					<v-row  v-if="isJoined">
						<v-col class="ma-2" align-self="center" cols="9">
							<v-card-title>{{ selectedRoomname }}</v-card-title>
						</v-col>

						<v-col align-self="center">
							<v-btn width="100" color="primary" @click="leaveRoom()">Leave</v-btn>
						</v-col>
					</v-row>

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
                            <v-list-item-title>
								<v-btn v-if="!user.admin" type="submit" block @click="this.addAdmin(user)" color="primary">admin</v-btn>
								<v-btn v-if="user.admin" type="submit" block @click="this.rmAdmin(user)" color="primary">unadmin</v-btn>
							</v-list-item-title>
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
	height: 65px;
}

.h-sub-options{
	height: 40px;
}

</style>
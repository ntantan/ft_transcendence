<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import axios from 'axios';

import { chatStore } from "@/stores/chat";
import { gameStore } from "@/stores/game";
import { userStore } from "@/stores/user";
import { mergeProps } from "vue";
import router from "@/router";

const CHANNELS_URL = "http://localhost:3000/channels/";

export default defineComponent ({
    data() {
        return {
            chatStore,
			gameStore,
			userStore,
            socket: {},
			isJoined: false,
            room: {},
			
			users: [],
			select_direct_id: "",
			select_private_id: "",
			direct_channels: [],
			private_channels: [],
			public_channels: [],
            channels: [],

			channel_types: ["public", "private", "direct"],
			n_channel_types: 3,
			selected_channel_type: 0,

			muted_time: "",
			
            selectedChannel: "",
            roomName: "",
            passWord: "",
            messageText: "",
			
			roomPassword: "",
			rules: [
				value => {
					if (value && value.length < 20)
						return (true)
					return ("Field can not be empty")
				}
			],

			snackbar: false,
			snackbar_text: 'My timeout is set to 2000.',
			timeout: 3000,
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

		this.socket.on('channelRemoved', () => {
			this.fetchAllRooms();
		})
    },

    watch: {
        selectedChannel(newVal, oldVal) {
            if (newVal)
                this.fetchRoom();
			else
				this.selectedChannel = oldVal
        },

		selected_channel_type(newVal, oldVal) {
			this.channelType();
		}
    },

	computed: {
		selectedRoomname() {
			const find = this.channels.find((channel) => channel.id == this.selectedChannel);
			if (find)
				return (find.name);
			return (null);
		}
	},

    methods: {
        async fetchAllRooms() {
			this.fetchPublicRooms();
			this.fetchPrivateRooms();
			this.fetchDirectRooms();
			this.fetchUsers();
			this.channelType();
        },

		fetchPublicRooms() {
			axios.get(CHANNELS_URL + 'public', {withCredentials: true})
				.then((response) => {
					this.public_channels = response.data;
					this.channelType();
					// console.log(response);
				})
				.catch((error) => {
						console.log(error)
				})
		},

		fetchPrivateRooms() {
			axios.get(CHANNELS_URL + 'private', { withCredentials: true })
				.then((response) => {
					this.private_channels = response.data;
					this.channelType();
					// console.log(response);
				})
				.catch((error) => {
						console.log(error)
				})
		},

		fetchDirectRooms() {
			axios.get(CHANNELS_URL + 'direct', { withCredentials: true })
				.then((response) => {
					this.direct_channels = response.data;
					this.channelType();
					// console.log(response.data);
				})
				.catch((error) => {
					console.log(error);
				})
		},

		fetchUsers() {
			axios.get("http://localhost:3000/users", { withCredentials: true })
				.then((response) => {
					this.users = response.data;
				})
				.catch((error) => {
					console.log(error)
				})
		},

        fetchRoom() {
            axios.get((CHANNELS_URL + this.selectedChannel), {withCredentials: true})
            .then((response) => {
                // console.log(response.data);
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
            this.socket.emit('createRoom', {room_name: this.roomName,
											password: this.passWord, 
											room_type: this.channel_types[this.selected_channel_type]});
            this.clearTextArea();
            window.scrollTo(0, document.body.scrollHeight);
        },

		// Create a direct mesage room
		createDirectRoom() {
			if (this.select_direct_id)
			{
				this.socket.emit('createDirectRoom', {
					user_id: this.select_direct_id,
				})
			}
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

		//  Add user to a private room
		privateAddUser() {
			if (this.select_private_id)
			{
				this.socket.emit('addUserPrivate', {
					id: this.selectedChannel,
					user_id: this.select_private_id
				})
			}
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
								user_id: channel_user.user.id,
								muted_time: '99999'})
            // ajouter temps de mute
        },

		unmuteUser(channel_user: any) {
			this.socket.emit('rmMute', {
				id: this.selectedChannel,
				user_id: channel_user.user.id
			})
		},

		timedMuteUser(channel_user: any, time: string) {
            this.socket.emit('addMute', {
								id: this.selectedChannel, 
								user_id: channel_user.user.id,
								muted_time: time})
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

        inviteGame(channel_user: any) {
			this.gameStore.invitedUser = channel_user.user;
			router.push({ path: '/game/custom' });
            console.log("inviteGame OK");
        },

		// Redirect to selected user profile page
		toProfile(channel_user: any)
		{
			const id = channel_user.user.id;
			
		},

		sendSnackbar(msg: string)
		{
			this.snackbar_text = msg;
			this.snackbar = true;
		},

		channelType()
		{
			if (this.channel_types[this.selected_channel_type] == "public")
				this.channels = this.public_channels;
			else if (this.channel_types[this.selected_channel_type] == "private")
				this.channels = this.private_channels;
			else if (this.channel_types[this.selected_channel_type] == "direct")
				this.channels = this.direct_channels;
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

					<v-window
					v-model="selected_channel_type"
					show-arrows
					>

					<template v-slot:prev="{ props }">
						<v-btn
						size="small"
						icon="mdi-chevron-left"
						@click="props.onClick"
						>
						</v-btn>
					</template>
					<template v-slot:next="{ props }">
						<v-btn
						size="small"
						icon="mdi-chevron-right"
						@click="props.onClick"
						>
						</v-btn>
					</template>

					<v-window-item
						v-for="n in n_channel_types"
						:key="n"
						>
						<v-card height="50px" class="d-flex justify-center align-center">
							<span>{{ channel_types[selected_channel_type] }}</span>
						</v-card>
						</v-window-item>
					</v-window>

					<v-card height="700" class="scroll my-3">
						<v-item-group v-model="selectedChannel">
							<v-item v-for="channel in channels" :value="channel.id" v-slot="{isSelected, selectedClass, toggle}">
								<v-card :class="['d-flex pa-3', selectedClass]" @click="toggle">
									{{channel.name}}
								</v-card>
							</v-item>
						</v-item-group>
					</v-card>

					<div v-if="channel_types[selected_channel_type] == 'public'">
						<v-form @submit.prevent>
							<v-text-field clearable v-model="this.roomName" :rules="rules" label="Room name"></v-text-field>
							<v-text-field v-model="this.passWord" label="Password"></v-text-field>
							<v-btn type="submit" block @click="this.createNewRoom()">create room</v-btn>
						</v-form>
					</div>

					<div v-if="channel_types[selected_channel_type] == 'private'">
						<v-form @submit.prevent>
							<v-text-field clearable v-model="this.roomName" :rules="rules" label="Room name"></v-text-field>
							<v-btn type="submit" block @click="this.createNewRoom()">create room</v-btn>
						</v-form>
					</div>

					<div v-if="channel_types[selected_channel_type] == 'direct'">
						<v-form @submit.prevent>
							<v-autocomplete v-model="this.select_direct_id" :items="this.users" item-title="username" item-value="id" label="Select user"></v-autocomplete>
							<v-btn type="submit" block @click="this.createDirectRoom()">Start conversation</v-btn>
						</v-form>
					</div>

                </v-card>

            </v-col>

            <v-col align-self="end">

				<v-card class="h-options mx-auto">

					<v-row v-if="!isJoined && selectedRoomname">
						<v-col class="ma-2" align-self="center" cols="5">
							<v-card-title>{{ selectedRoomname }}</v-card-title>
						</v-col>
						<div v-if="this.channel_types[this.selected_channel_type] == 'public'">
							<v-col class="mr-3"  cols="4" align-self="center">
								<v-text-field
									style="width: 200px;"
									v-model="roomPassword"
									label="Leave empty if not required"
									variant="underlined"
									clearable>
								</v-text-field>
							</v-col>
							<v-col align-self="center">
								<v-btn width="100" color="primary" @click="joinRoom()">Join</v-btn>
							</v-col>
						</div>
					</v-row>

					<v-row  v-if="isJoined">
						<v-col class="ma-2" align-self="center" cols="5">
							<v-card-title>{{ selectedRoomname }}</v-card-title>
						</v-col>

						<v-col cols="4">
						</v-col>
						<div v-if="this.channel_types[this.selected_channel_type] !== 'direct'">
							<v-col align-self="center">
								<v-btn width="100" color="primary" @click="leaveRoom()">Leave</v-btn>
							</v-col>
						</div>
					</v-row>

				</v-card>
				<v-card class="h-message my-2 scroll">
					<v-list>
                        <!-- <ul v-for="message in this.room.messages" :key="message">
                            <li> -->
                                <!-- mise en page messages -->
								<v-card width="200" v-for="message in this.room.messages" style="overflow-wrap: break-word;">
									{{ message.date }}
									{{ message.message }}
								</v-card>
                            <!-- </li>
                        </ul> -->
					</v-list>
				</v-card>

				<v-text-field v-model="messageText" label="Enter your message here" @keydown.enter="SubmitNewMessage()">						
				</v-text-field>
            </v-col>

            <v-col cols="3">
                <v-card class="h-chat scroll">
                    <h2 class="d-flex justify-center">User</h2>

					<v-menu v-for="user in this.room.channel_users" :key="user">
						<template v-slot:activator="{ props: menu }">
							<v-tooltip>
								<template v-slot:activator="{ props: tooltip }">
									<v-btn color="primary" v-bind="mergeProps(menu, tooltip)">{{ user.user.username }}</v-btn> 
								</template>
							</v-tooltip>
						</template>
						<!-- <div > -->
						<!-- && user.user.id !== this.userStore.user.id"> -->
						<v-list v-if="channel_types[selected_channel_type] !== 'direct'">  
								<v-list-item>
									<v-list-item-title>
										<v-btn v-if="!user.muted" type="submit" block @click="this.muteUser(user)" color="primary">mute</v-btn>
										<v-btn v-if="user.muted" type="submit" block @click="this.unmuteUser(user)" color="primary">unmute</v-btn>
										<v-btn-group
										color="secondary"
										>
											<v-btn value="1" @click="timedMuteUser(user, '1')">1</v-btn>
											<v-btn value="10" @click="timedMuteUser(user, '10')">10</v-btn>
											<v-btn value="60" @click="timedMuteUser(user, '60')">60</v-btn>
										</v-btn-group>
									</v-list-item-title>
								</v-list-item>
								<v-list-item>
									<v-list-item-title>
										<v-btn type="submit" block @click="this.kickUser(user)" color="primary">kick</v-btn>
									</v-list-item-title>
								</v-list-item>
								<v-list-item>
									<v-list-item-title>
										<v-btn v-if="!user.admin" type="submit" block @click="this.addAdmin(user)" color="primary">admin</v-btn>
										<v-btn v-if="user.admin" type="submit" block @click="this.rmAdmin(user)" color="primary">unadmin</v-btn>
									</v-list-item-title>
								</v-list-item>
								<v-list-item>
									<v-list-item-title>
										<v-btn type="submit" block @click="this.inviteGame(user)" color="primary">invite game</v-btn>
									</v-list-item-title>
								</v-list-item>
								<v-list-item>
									<v-list-item-title>
										<v-btn type="submit" block @click="this.toProfile(user)" color="primary">Profile</v-btn>
									</v-list-item-title>
								</v-list-item>
							</v-list>
							<!-- </div> -->
						</v-menu>
				
				<div v-if="this.room.type == 'private'" class="mr-2 mt-4">
					<v-form @submit.prevent>
						<v-autocomplete v-model="this.select_private_id" :items="this.users" item-title="username" item-value="id" label="Select user"></v-autocomplete>
						<v-btn type="submit" block @click="this.privateAddUser()">Add</v-btn>
					</v-form>
					</div>
                </v-card>
            </v-col>
        </v-row>
    </v-card>

	<!-- error bar -->
	<div class="text-center">
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

::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background-color: #ccc;
}
::-webkit-scrollbar-thumb {
  background-color: #888;
}

.scroll{
	overflow-y: scroll;
    scroll-behavior: smooth;
	scrollbar-color: rebeccapurple green;
 	 scrollbar-width: thin;
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
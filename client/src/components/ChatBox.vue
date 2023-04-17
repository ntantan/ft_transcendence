<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import axios from 'axios';

const CHANNELS_URL = "http://localhost:3000/channels";

export default defineComponent ({
    data() {
        return {
            socket: {},

            channels: [],

            selectedChannel: "",
            roomName: "",
            passWord: "",

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
        this.socket = io("http://localhost:3000/chat");
    },

    mounted() {
        this.fetchAllRooms();
        this.socket.on('newRoom', () => {
            this.fetchAllRooms();
        })
    },

    methods: {
        fetchAllRooms() {
            axios.get(CHANNELS_URL)
            .then((response) => {
                this.channels = response.data;
            })
        },

        createNewRoom() {
			if (!this.roomName)
				return;
            this.socket.emit('createRoom', {room_name: this.roomName, password: this.passWord});
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
				</v-card>

				<v-card class="h-message my-2">
					<v-list>
						<!-- <v-list-item v-for="item in channels"> -->
					</v-list>
				</v-card>

				<v-text-field label="Enter your message here" >						
				</v-text-field>
            </v-col>

            <v-col cols="3">
                <v-card class="h-chat">
                    <h2 class="d-flex justify-center">User</h2>
                    <v-list>
                        <!-- <v-list-item v-for="item in channels"> -->
                    </v-list>
                </v-card>
            </v-col>

        </v-row>
    </v-card>
</template>

<style>

.scroll{
	overflow-y: scroll;
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
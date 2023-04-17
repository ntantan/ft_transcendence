<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import axios from 'axios';

const CHANNELS_URL = "http://localhost:3000/channels";

export default defineComponent ({
    data() {
        return {
            socket: {},
            selectedChannel: "",
            channels: [],
            roomName: "",
            passWord: "",
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
            this.socket.emit('createRoom', {room_name: this.roomName, password: this.passWord})
        }
    },
});
</script>

<template>
    <v-card width="1200" height="900" class="mx-auto ma-6">
        <v-row align="start">

            <v-col cols="3">
                <v-card height="900">

                    <v-row>
                        <v-col>
                            <h2 class="d-flex justify-center">Channels</h2>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <!-- <v-btn-toggle v-model="selectedChannel">
                                <v-btn v-for="item in channels" :value="item.id">
                                    <v-row>
                                        {{ item.name }}
                                    </v-row>
                                </v-btn>
                            </v-btn-toggle> -->

                            
                            <v-list v-model="selectedChannel">
                                <v-list-item-group>
                                    <v-list-item v-for="item in channels" :value="item.id">
                                        {{ item.name }}
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                    </v-row>
                    
                    <v-row align="end">
                        <v-col>
                            <v-text-field v-model="this.roomName" label="Room name"></v-text-field>
                            <v-text-field v-model="this.passWord" label="Password"></v-text-field>
                            <v-btn type="submit" @click="this.createNewRoom()">create room</v-btn>
                        </v-col>
                    </v-row>

                </v-card>
            </v-col>

            <v-col class="d-flex align-self-end">
                <v-text-field >
                </v-text-field>
            </v-col>

            <v-col cols="3">
                <v-card height="900">
                    <h2 class="d-flex justify-center">User</h2>
                    <v-list>
                        <!-- <v-list-item v-for="item in channels"> -->
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
    </v-card>

    <div>{{ roomName }}</div>
    <div>{{ passWord }}</div>
    <div>{{ selectedChannel }}</div>
</template>

<style>
</style>
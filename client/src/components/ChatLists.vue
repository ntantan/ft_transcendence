<script lang="ts">
import { defineComponent } from "vue";
import { io } from "socket.io-client";
import axios from 'axios';

const CHANNELS_URL = "http://localhost:3000/channels/";

export default defineComponent({

    data() {
        return {
            socket: {},
            showForm: false,
            texte: "",
            chatLists: null,
            oneRoom: null,
            roomData: {
                roomName: '',
                password: '',
            },
            channelSelected: "",
            textMessage: "",
            messages:[],
        };
    },

    computed: {

    },

    watch: {

    },

    mounted(){
        this.fetchRoom();
        this.socket.on('updateRoom', () => {
            this.fetchOneRoom();
        })
    },

    created() {
        this.socket = io("http://localhost:3000/chat");
    },

    methods: {
        async createNewRoom(){
            await this.socket.emit('createRoom', {
													room_name: this.roomData.roomName,
													password: this.roomData.password
												});
            this.toggleButton();
            this.clearForm();
            window.location.reload();
        },

        toggleButton() {
            if (this.showForm == false)
                this.showForm = true;
            else
                this.showForm = false;
        },
        
        clearForm() {
            this.roomData.roomName = '';
            this.roomData.password = '';
        },

        clearMessage() {
            this.textMessage = '';
        },

        async fetchRoom() {
            this.chatLists = await (await fetch(CHANNELS_URL)).json();
        },

        async fetchOneRoom() {
			// this.oneRoom = await (await fetch(CHANNELS_URL + this.channelSelected, {credentials: "include"})).json();
			// if (this.oneRoom != null) {
			//     this.messages = this.oneRoom.messages;
			// }

			axios.get(CHANNELS_URL + this.channelSelected, {withCredentials: true})
				 .then((response) => {
					this.oneRoom = response.data;
					this.messages = response.data.messages;
				 })
				 .catch((error) => {
					window.alert(error);
				 });
        },

        async joinRoom() {
            await this.socket.emit('joinRoom', {
													id: this.channelSelected,
													password: ''
												});
            await this.fetchOneRoom();
        },

        async handleSubmitNewMessage() {
            if (this.textMessage) {
                await this.socket.emit('textMessage', {msg: this.textMessage,
                                                    	id: this.channelSelected});
                this.clearMessage();
            }
        },
    },
});
</script>

<template>
    <div class="createRoomButton">
    <button @click="toggleButton()">CREATE A ROOM</button><br>
    </div>
    <div v-if="this.showForm">
        <form @submit.prevent="createNewRoom()">
            <div class="form">
            <p>room name:</p>
            <input type="text" v-model="roomData.roomName" />
            <p>password:</p>
            <input type="pass" v-model="roomData.password" />
            <button class="createButton" type="submit">create</button> 
            </div>
        </form>
    </div>
    <p>
        CHANNEL LIST
    </p>
    <select v-model="channelSelected" size="5" v-on:change="joinRoom()">
        <option v-for="item in chatLists" :value="item.id"> {{ item.name }}</option>
    </select>

    <div v-if="this.channelSelected && oneRoom">
        <ul v-for="msg in messages" :key="msg.id">
            <li>{{ msg.message }}</li>
        </ul>
        <div>        
            <!-- <input id="input" type="text" v-model="textMessage" @keydown.enter="handleSubmitNewMessage()" />
            <button @click="handleSubmitNewMessage()">Send message</button> -->
            <form @submit.prevent="handleSubmitNewMessage()">
                <input type="text" v-model="textMessage" />
                <button type="submit">Send message</button>
            </form>
        </div>
    </div>

</template>

<style>
    .createRoomButton {
        font-size: x-large;
        text-align: right;
    }
    .form {
        font-size: larger;
    }
    .createButton {
        display: inline-block;
        background-color: bisque;
        border-radius: 10px;
        border: 4px double #cccccc;
        color: #eeeeee;
        text-align: center;
        font-size: medium;
        -webkit-transition: all 0.5s;
        -moz-transition: all 0.5s;
        -o-transition: all 0.5s;
        transition: all 0.5s;
        cursor: pointer;
        margin: 5px;
    }
    /* .chatList {
        font-size: x-large;
        position: fixed;
        text-align: left;
        width: 120px;
        height: 30px;
        border: 1px solid #999;
        font-size: 18px;
        color: #1c87c9;
        background-color: #eee;
        border-radius: 5px;
        box-shadow: 4px 4px #ccc;
    } */
</style>
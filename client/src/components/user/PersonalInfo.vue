<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
	name: "PersonalInfo",
		
	data() {
		return {
            userStore,
            URL: "http://localhost:3000/users/avatar/",
            nameEdit: false,
		};
	},
    
    computed: {
        user() {
            return userStore.user;
        },
        userAvatar() {
            return this.user.avatar;
        }
    },

    methods: {
        async updateAvatar() {
            const file = (document.getElementById("avatar") as HTMLInputElement).files[0];
            if (file == null) {
                return;
            }
            const formData = new FormData();
            formData.append("avatar", file);
            const res = await fetch("http://localhost:3000/users/avatar/" + userStore.user.id, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const data = await res.json();
            if (data.error) {
                console.log(data.error);
                return;
            }
            if (data.avatar)
                this.userStore.updateAvatar(data.avatar);
        },
        
        getAvatar() {
            if (this.userAvatar.startsWith("https://cdn.intra.42.fr/")) {
                return this.userAvatar;
            }
            return this.URL + this.userAvatar;
        }
    },
	
}); 
</script>

<template>
    <v-card>
        <v-card-title>
            <v-avatar size="100">
                <img :src="getAvatar()" class="avatar" />
            </v-avatar>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="updateAvatar">Update avatar</v-btn>
            <input type="file" id="avatar" />
        </v-card-title>
        <v-card v-if="!nameEdit"
            title="Username"
            :subtitle="user.username"
        ><template v-slot:append>
            <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="nameEdit = !nameEdit"
            >Edit</v-btn>
          </template></v-card>
        <v-card v-if="nameEdit"
            title="New username:"
        >
        <template>
            <input type="text" v-model="user.username" />
            <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="nameEdit = !nameEdit"
            >Save</v-btn>
        </template></v-card>
        <v-card
            title="Level"
            :subtitle="user.level"
        ></v-card>
        <v-card
            title="Status"
            :subtitle="user.status"
        ></v-card>

    </v-card>
</template>
<style>
    .avatar {
        max-width: 100px;
        max-height: 100px;
    }
</style>
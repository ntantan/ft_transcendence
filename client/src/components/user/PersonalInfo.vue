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
        },

        async changeUsername() {
            this.nameEdit = false;
            //user.username send to server
            await fetch("http://localhost:3000/users/" + this.user.id, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: this.user.username,
                }),
            }).catch((err) => {
                console.log(err);
            });
            this.userStore.updateUserName(this.user.username);
        },
    },
	
}); 
</script>

<template>
    <v-card>
        <v-card-title>
            <v-avatar size="150" rounded="0">
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
        <v-card v-if="nameEdit">
            <v-card-title>
                Please type your new username
            </v-card-title>
            <v-card-text>
                <v-form>
                    <v-text-field label="New username" v-model="user.username" required @keydown.enter.prevent="changeUsername"></v-text-field>
                    <v-btn color="primary" @click.stop="changeUsername">Save</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <v-card
            title="Level"
            :subtitle="user.level.toString()"
        ></v-card>
        <v-card
            title="Status"
            :subtitle="user.status"
        ></v-card>

    </v-card>
</template>
<style>
    /* .avatar {
        max-width: 100px;
        max-height: 100px;
    } */
</style>
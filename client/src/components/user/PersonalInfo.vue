<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";
import axios from "axios";

export default defineComponent({
    name: "PersonalInfo",

    data() {
        return {
            userStore,
            URL: "http://localhost:3000/users/avatar/",
            nameEdit: false,
            tmpName: "",
        };
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
            if (this.userStore.user.avatar.startsWith("https://cdn.intra.42.fr/")) {
                return this.userStore.user.avatar;
            }
            return this.URL + this.userStore.user.avatar;
        },

        async changeUsername() {
            this.nameEdit = false;
            await axios.patch("http://localhost:3000/users/" + this.userStore.user.id, {
                username: this.tmpName
            }, {
                withCredentials: true
            }).then(response => {
                //this.userStore.user.username = this.tmpName;
                this.userStore.user.username = this.tmpName;
                this.tmpName = "";
            }).catch((error) => {
                if (error.response.status === 400) {
                    alert("Username already exists");
                }
                this.tmpName = "";
            });
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
        <v-card v-if="!nameEdit" title="Username">
            <template v-slot:subtitle>
                {{ userStore.user.username }}
            </template>
            <template v-slot:append>
                <v-btn variant="text" icon="mdi-chevron-left" @click.stop="nameEdit = !nameEdit">Edit</v-btn>
            </template>
        </v-card>
        <v-card v-if="nameEdit">
            <v-card-title>
                Please type your new username
            </v-card-title>
            <v-card-text>
                <v-form>
                    <v-text-field label="New username" v-model="tmpName" required
                        @keydown.enter.prevent="changeUsername"></v-text-field>
                    <v-btn color="primary" @click.stop="changeUsername">Save</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <v-card title="Level" :subtitle="userStore.user.level.toString()"></v-card>
        <v-card title="Status" :subtitle="userStore.user.status"></v-card>

    </v-card>
</template>
<style>
.avatar {
    max-width: 150px;
    max-height: 150px;
}
</style>
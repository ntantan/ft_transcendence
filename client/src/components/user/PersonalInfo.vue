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
            rules: [
                (v: string) => !!v || "Required",
                (v: string) => v.length <= 20 || "Must be less than 20 characters",
                (v: string) => v.length >= 3 || "Must be more than 3 characters",
                (v: string) => /^[a-zA-Z0-9_]*$/.test(v) || "Only letters, numbers and underscores allowed",
                //https://regexr.com/
            ],
        };
    },

    methods: {
        async updateAvatar(): Promise<void> {
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

        getAvatar(): string {
            if (this.userStore.user.avatar.startsWith("https://cdn.intra.42.fr/")) {
                return this.userStore.user.avatar;
            }
            return this.URL + this.userStore.user.avatar;
        },

        isInputValid(): boolean {
            return this.tmpName.length <= 20 && this.tmpName.length >= 3 && /^[a-zA-Z0-9_]*$/.test(this.tmpName);
        },

        async changeUsername(): Promise<void> {
            if (!this.isInputValid()) {
                return;
            }
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

        cancelEdit(): void {
            this.nameEdit = false;
            this.tmpName = "";
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
                <v-form @submit.prevent="changeUsername">
                    <v-text-field label="New username" v-model="tmpName" :rules="rules"
                        @keydown.enter.prevent="changeUsername"></v-text-field>
                    <v-btn color="primary" type="submit">Save</v-btn>
                    <v-btn color="warning" @click="cancelEdit">Cancel</v-btn>
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
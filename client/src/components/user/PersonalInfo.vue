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
            uploaded: null,
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
                userStore.updateAvatar(data.avatar);
            this.uploaded = null;
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
            const actualName = this.userStore.user.username;
            const newName = this.tmpName;
            this.userStore.user.username = newName;
            this.tmpName = "";
            await axios.patch("http://localhost:3000/users/" + this.userStore.user.id, {
                username: newName
            }, {
                withCredentials: true
            }).then(response => {
                this.userStore.user.username = this.newName;
            }).catch((error) => {
                if (error.response.status === 400) {
                    alert("Username already exists");
                }
                this.userStore.user.username = actualName;
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
    <v-container>
        <v-row justify="center">
            <v-col cols="auto">
                <v-avatar size="150" rounded="0">
                    <img :src="getAvatar()" class="avatar" />
                </v-avatar>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="4">
                <v-file-input label="Upload file within 10MB" id="avatar" chips color="deep-purple-accent-4" counter
                    :show-size=true density="compact" variant="underlined" v-model="uploaded">
                </v-file-input>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-btn v-if="uploaded" color="primary" size="small" @click="updateAvatar">Change avatar</v-btn>
        </v-row>
        <v-row justify="center">
            <v-col cols="6">
                <v-card v-show="!nameEdit" title="Username" elevation="0">
                    <template v-slot:subtitle>
                        {{ userStore.user.username }}
                    </template>
                    <template v-slot:append>
                        <v-btn variant="text" icon="mdi-chevron-left" @click.stop="nameEdit = !nameEdit">Edit</v-btn>
                    </template>
                </v-card>
                <v-card v-show="nameEdit" elevation="0">
                    <v-card-title>
                        Please type your new username
                    </v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="changeUsername">
                            <v-text-field label="New username" v-model="tmpName" :rules="rules"
                                @keydown.enter.prevent="changeUsername" density="compact"
                                variant="underlined"></v-text-field>
                            <v-row justify="center">
                                <v-btn color="primary" type="submit" size="small">Save</v-btn>
                                <v-btn color="warning" @click="cancelEdit" size="small">Cancel</v-btn>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="6">
                <v-card title="Level" :subtitle="userStore.user.level.toString()" elevation="0"></v-card>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="6">
                <v-card title="Status" :subtitle="userStore.user.status" elevation="0"></v-card>
            </v-col>
        </v-row>

    </v-container>
</template>
<style>
.avatar {
    max-width: 150px;
    max-height: 150px;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
    name: "Friends",

    data() {
        return {
            userStore,
            URL: "http://localhost:3000/users/avatar/",
            friends: [],
        };
    },

    async mounted() {
        this.friends = await this.getFriends();
    },

    watch: {
        async userStore() {
            this.friends = await this.getFriends();
        },
    },
    computed: {
    },

    methods: {
        async deleteFriend(userId: number) {
            console.log("remove friend", userId);
            const res = await fetch("http://localhost:3000/users/" + userStore.user.id + "/deleteFriend/" + userId, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.error) {
                console.log(data.error);
                return;
            }
            userStore.updateUser(data);
            this.friends = await this.getFriends();
        },
        async sendDm(userId: number) {
            console.log("send dm", userId);
        },
        async seeStats(userId: number) {
            console.log("see stats", userId);
        },
        getAvatar(avatar: string): string {
            if (avatar.startsWith("https://cdn.intra.42.fr/")) {
                return avatar;
            }
            return this.URL + avatar;
        },
        async block(userId: number) {
            console.log("block", userId);
            const res = await fetch("http://localhost:3000/users/" + userStore.user.id + "/block/" + userId, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.error) {
                console.log(data.error);
                return;
            }
            userStore.updateUser(data);
            this.friends = await this.getFriends();
        },
        async getFriends(): Promise<any[]> {
            const friends = userStore.user.friends;
            if (friends === undefined) {
                return [];
            }
            console.log(`friends length = ${friends.length}`);
            let friendsList = [];
            for (let i = 0; i < friends.length; i++) {
                const friend = await fetch(
                    "http://localhost:3000/users/" + friends[i].userId,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                if (friend !== undefined) {
                    const data = await friend.json();
                    friendsList.push(data);
                }
            }
            return friendsList;
        },

    },
});
</script>

<template>
    <v-card>
        <v-card-title>
            <h2>Friends</h2>
        </v-card-title>
        <v-container fluid v-show="friends">
            <v-row dense>
                <v-col cols="12" v-for="friend in friends">
                    <v-card color="#5F9EA0" theme="dark">
                        <div class="d-flex flex-no-wrap justify-space-between">
                            <div>
                                <v-card-title class="text-h5">
                                    {{ friend.username }}
                                </v-card-title>
                                <v-card-subtitle>
                                    {{ friend.status }}
                                </v-card-subtitle>
                                <v-card-subtitle>
                                    Level {{ friend.level }}
                                </v-card-subtitle>
                                <v-spacer></v-spacer>
                                <v-card-actions>
                                    <v-btn size="small" variant="text" title="Remove from friend" icon="mdi-delete"
                                        @click="deleteFriend(friend.id)"></v-btn>
                                    <v-btn :href="`/user/${friend.id}`" size="small" variant="text" title="See stats"
                                        icon="mdi-scoreboard" @click="seeStats(friend.id)"></v-btn>
                                    <v-btn size="small" variant="text" title="Block user" icon="mdi-block-helper"
                                        @click="block(friend.id)"></v-btn>
                                </v-card-actions>
                            </div>
                            <v-avatar size="150" rounded="0">
                                <v-img :src="getAvatar(friend.avatar)"></v-img>
                            </v-avatar>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-container></v-card>
</template>
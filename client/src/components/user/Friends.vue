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
            search: "",
            users: [],
            foundUsers: [],
            rules: [
                (v: string) => /^[a-zA-Z0-9_]*$/.test(v) || "Only letters, numbers and underscores allowed",
                //https://regexr.com/
            ],
        };
    },

    async mounted() {
        this.friends = await this.getFriends();
        this.users = await this.getUsers();
    },

    watch: {
        async userStore() {
            this.friends = await this.getFriends();
        },
    },
    computed: {
    },

    methods: {
        async addFriend(userId: number) {
            const res = await fetch("http://localhost:3000/users/" + userStore.user.id + "/addFriend/" + userId, {
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
            this.foundUsers = [];
        },
        async deleteFriend(userId: number) {
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
        async getUsers(): Promise<any[]> {
            const users = await fetch("http://localhost:3000/users", {
                method: "GET",
                credentials: "include",
            });
            const data = await users.json();
            return data;
        },
        searchUser(): void {
            this.foundUsers = [];
            if (this.search === "") {
                return;
            }
            for (let i = 0; i < this.users.length; i++) {
                if (this.users[i].username.includes(this.search)) {
                    this.foundUsers.push(this.users[i]);
                }
            }
            this.search = "";
        },
        isBlocked(userId: number): boolean {
            const blocked = userStore.user.blocked;
            if (blocked === undefined) {
                return false;
            }
            for (let i = 0; i < blocked.length; i++) {
                if (blocked[i].userId === userId) {
                    return true;
                }
            }
            return false;
        },
        async unblockUser(userId: number) {
            const res = await fetch("http://localhost:3000/users/" + userStore.user.id + "/unblock/" + userId, {
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
            this.foundUsers = [];
        },
    },
});
</script>

<template>
    <v-card>
        <v-card-title>
            <h2>Friends</h2>
        </v-card-title>
        <v-container>
            <v-col cols="6">
                <v-form>
                    <v-text-field label="Search user with username" v-model="search" append-inner-icon="mdi-magnify"
                        single-line variant="underlined" @click:append-inner="searchUser"
                        @keydown.enter.prevent="searchUser" :rules="rules"></v-text-field>
                </v-form>
                <v-card v-if="foundUsers" flat="true">
                    <v-row dense>
                        <v-col cols="12" v-for="foundUser in foundUsers">
                            <v-card>
                                <div class="d-flex flex-no-wrap justify-space-between">
                                <span class="userSpan">
                                <v-avatar start>
                                    <v-img :src="getAvatar(foundUser.avatar)"></v-img>
                                </v-avatar>
                                {{ foundUser.username }}</span>
                                <span class="userSpan">
                                <v-btn v-if="isBlocked(foundUser.id)" variant="text" size="small" title="Unblock user"
                                        icon="mdi-lock-open-check-outline" @click="unblockUser(foundUser.id)"></v-btn>
                                <v-btn v-else size="small" variant="text" title="Add to friend" icon="mdi-account-plus"
                                        @click="addFriend(foundUser.id)"></v-btn>
                                <v-btn :href="`/user/${foundUser.id}`" variant="text" size="small" title="See stats"
                                        icon="mdi-scoreboard"></v-btn>
                                <v-btn variant="text" size="small" title="Block user" icon="mdi-cancel"
                                        @click="block(foundUser.id)"></v-btn>
                                </span>
                            </div>
                            </v-card>
                            <!-- <v-card color="#B0E0E6" class="mx-auto" >                             
                                <v-card-title class="text">
                                    {{ foundUser.username }}
                                </v-card-title>
                                <v-avatar size="50">
                                    <v-img :src="getAvatar(foundUser.avatar)"></v-img>
                                </v-avatar>
                                <v-card-actions>
                                    <v-btn v-if="isBlocked(foundUser.id)" size="small" title="Unblock user"
                                        icon="mdi-lock-open-check-outline" @click="unblockUser(foundUser.id)"></v-btn>
                                    <v-btn v-else size="small" variant="text" title="Add to friend" icon="mdi-account-plus"
                                        @click="addFriend(foundUser.id)"></v-btn>
                                    <v-btn :href="`/user/${foundUser.id}`" size="small" title="See stats"
                                        icon="mdi-scoreboard"></v-btn>
                                    <v-btn size="small" title="Block user" icon="mdi-cancel"
                                        @click="block(foundUser.id)"></v-btn>
                                </v-card-actions>
                            </v-card> -->
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-container>
        <v-container fluid v-show="friends">
            <v-row dense>
                <v-col cols="6" v-for="friend in friends">
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
                                    <v-btn size="small" variant="text" title="Remove from friend" icon="mdi-account-minus"
                                        @click="deleteFriend(friend.id)"></v-btn>
                                    <v-btn :href="`/user/${friend.id}`" size="small" variant="text" title="See stats"
                                        icon="mdi-scoreboard"></v-btn>
                                    <v-btn size="small" variant="text" title="Block user" icon="mdi-cancel"
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
        </v-container>
    </v-card>
</template>
<style>
.userSpan {
    width: auto;
    text-align: center;
    align-items: center;
}
</style>
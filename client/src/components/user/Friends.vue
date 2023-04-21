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
      friendsName: [],
      friendsStatus: [],
      friendsLevel: [],
      friendsAvatar: [],
    };
  },

  async mounted() {
    this.friends = await this.getFriends();
  },

  watch: {
    userStore() {
      this.friends = this.getFriends();
    },
  },
  computed: {
  },

  methods: {
    async removeFriend(userId: number) {
        console.log("remove friend", userId);
    },
    async sendDm(userId: number) {
        console.log("send dm", userId);
    },
    async seeStats(userId: number) {
        console.log("see stats", userId);
    },
    getAvatar(avatar : string) : string {
        if (avatar.startsWith("https://cdn.intra.42.fr/")) {
            return avatar;
        }
        return this.URL + avatar;
    },
    async block(userId: number) {
        console.log("block", userId);
        // TODO : add new route to block user
        // const res = await fetch("http://localhost:3000/users/" + userStore.user.id, {
        //     method: "PATCH",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         blocked: true,
        //     }),
        // });
        // const data = await res.json();
        // if (data.error) {
        //     console.log(data.error);
        //     return;
        // }
        // if (data.blocked)
        //     this.userStore.updateBlocked(data.blocked);
    },
    async getFriends() : Promise<any[]> {
        const friends = userStore.user.friends;
        console.log(`friends length = ${friends.length}`);
        let friendsList = [];
        this.friendsName = [];
        this.friendsStatus = [];
        this.friendsLevel = [];
        this.friendsAvatar = [];
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
                this.friendsName.push(data.username);
                this.friendsStatus.push(data.status);
                this.friendsLevel.push(data.level);
                this.friendsAvatar.push(data.avatar);
            }
        }
        return friendsList;
    },

  },
});
</script>

<template>
    <v-container fluid v-show="friends">
        <v-row dense>
                <v-col
                cols="12"
                v-for="friend in friends"
            >
                <v-card color="#4682B4" theme="dark">
                    <div class="d-flex flex-no-wrap justify-space-between">
                        <div>
                            <v-card-title class="text-h5">
                                {{ friend.username }}
                            </v-card-title>
                            <v-card-subtitle >
                                {{ friend.status }}
                            </v-card-subtitle>
                            <v-card-subtitle>
                                Level {{ friend.level }}
                            </v-card-subtitle>
                            <v-spacer></v-spacer>
                            <v-card-actions>
                                <v-btn size="small" variant="text" icon="mdi-delete" @click="removeFriend(friend.id)"></v-btn>
                                <v-btn size="small" variant="text" icon="mdi-send" @click="sendDm(friend.id)"></v-btn>
                                <v-btn size="small" variant="text" icon="mdi-scoreboard" @click="seeStats(friend.id)"></v-btn>
                                <v-btn size="small" variant="text" icon="mdi-block-helper" @click="block(friend.id)"></v-btn>
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
</template>
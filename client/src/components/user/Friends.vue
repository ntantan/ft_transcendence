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

  mounted() {
    this.friends = this.getFriends();
  },

  watch: {
    userStore() {
      this.friends = this.getFriends();
    },
  },
  computed: {
  },

  methods: {
    removeFriend(userId: number) {
        console.log("remove friend", userId);
    },
    sendDm(userId: number) {
        console.log("send dm", userId);
    },
    seeStats(userId: number) {
        console.log("see stats", userId);
    },
    getAvatar(avatar : string) : string {
        if (avatar.startsWith("https://cdn.intra.42.fr/")) {
            return avatar;
        }
        return this.URL + avatar;
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
            if (friend) {
                const data = await friend.json();
                friendsList.push(data);
                this.friendsName.push(data.username);
                this.friendsStatus.push(data.status);
                this.friendsLevel.push(data.level);
                this.friendsAvatar.push(data.avatar);
            }
        }
        console.log(friendsList);
        console.log(friendsList[0].username, friendsList[0].status, friendsList[0].level);
        return friendsList;
    },
  },
});
</script>

<template>
    <v-container fluid>
        <v-row dense>
                <v-col
                cols="12"
            >
                <v-card color="#4682B4" theme="dark">
                    <div class="d-flex flex-no-wrap justify-space-between">
                        <div>
                            <v-card-title class="text-h5" v-for="name in friendsName">
                                {{ name }}
                            </v-card-title>
                            <v-card-subtitle v-for="status in friendsStatus">
                                {{ status }}
                            </v-card-subtitle>
                            <v-card-subtitle v-for="level in friendsLevel">
                                Level {{ level }}
                            </v-card-subtitle>
                            <v-spacer></v-spacer>
                            <v-card-actions>
                                <v-btn size="small" variant="text" icon="mdi-delete" @click="removeFriend(item.id)"></v-btn>
                                <v-btn size="small" variant="text" icon="mdi-send" @click="sendDm(item.id)"></v-btn>
                                <v-btn size="small" variant="text" icon="mdi-scoreboard" @click="seeStats(item.id)"></v-btn>
                            </v-card-actions>
                        </div>
                        <v-avatar size="150" rounded="0">
                            <v-img v-for="avatar in friendsAvatar" :src="getAvatar(avatar)"></v-img>
                        </v-avatar>
                    </div>
                </v-card>
            </v-col>

        </v-row>
    </v-container>
</template>
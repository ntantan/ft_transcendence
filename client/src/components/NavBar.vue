<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  //   name: "NavBar",

  data() {
    return {
      value: "game",
    };
  },
});
</script>

<template>
  <v-bottom-navigation v-model="value" grow>
    <v-btn value="home" to="/">
      <span>Home</span>
      <v-icon>mdi-home-account</v-icon>
    </v-btn>

    <v-btn value="chat" to="/chat">
      <span>Chat</span>
      <v-icon>mdi-forum</v-icon>
    </v-btn>

    <v-btn value="game" to="/game">
      <span>Game</span>
      <v-icon>mdi-gamepad</v-icon>
    </v-btn>

    <v-btn value="user" to="/user">
      <span>User</span>
      <v-icon>mdi-account</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

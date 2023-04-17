<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from '@/stores/user';
import PersonalInfo from '../components/user/PersonalInfo.vue';

export default defineComponent({
 
  name: 'UserView',

  components: {
    PersonalInfo,
    // TwoFactorAuth,
    // Friends,
    // Stats,
    // MatchHistory,
  },

  data() {
    return {
      selected: PersonalInfo,
      drawer: true,
      rail: true,
      URL: "http://localhost:3000/users/avatar/",
    };
  },

  computed: {
    user() {
      return userStore.user;
    },
    username() {
      return this.user.username;
    },
    avatar() {
      return this.user.avatar;
    }, 
  },
  
  methods: {
    getAvatar() {
            if (this.avatar.startsWith("https://cdn.intra.42.fr/")) {
                return this.avatar;
            }
            return this.URL + this.avatar;
    }
  },
  mounted() {

  },
});
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
      
      <v-list nav>
        <v-list-item
          :prepend-avatar="getAvatar()"
          :title="username"
          nav
        >
          <template v-slot:append>
            <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>

        <v-divider></v-divider>

          <v-list-item prepend-icon="mdi-account" title="Personal info" value="personalInfo"></v-list-item>
          <v-list-item prepend-icon="mdi-two-factor-authentication" title="Two-factor auth" value="twoFactorAuth"></v-list-item>
          <v-list-item prepend-icon="mdi-account-heart" title="Friends" value="friends"></v-list-item>
          <v-list-item prepend-icon="mdi-scoreboard" title="My stats" value="stats"></v-list-item>
          <v-list-item prepend-icon="mdi-history" title="Match history" value="matchHistory"></v-list-item>
      </v-list>
      </v-navigation-drawer>

      <v-main class="main">
        <v-container>
          <v-row>
            <v-col>
              <component :is="selected"></component>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>

<style>
  .main {
    height : 500px;
  }
</style>
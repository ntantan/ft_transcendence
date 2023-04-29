<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
  //   name: "BannerBar",

  data() {
    return {
      avatar: {
        size: "50",
      },
	  userStore,
    };
  },
});
</script>

<template>
    <v-container class="container">
      <v-row wrap>
        <v-col cols="3" class="d-flex justify-center">
          <v-avatar v-bind:size="avatar.size">
            <v-img
              alt="sojung_avatar"
              src="https://cdn.intra.42.fr/users/a3674d7384ae3edfac534ceeabb1aef0/sojung.jpg"
            >
            </v-img>
          </v-avatar>
          <v-avatar v-bind:size="avatar.size">
            <v-img
              alt="rsung_avatar"
              src="https://cdn.intra.42.fr/users/ba2257c4069c6ffcc719ea8eb4c1982a/rsung.jpg"
            >
            </v-img>
          </v-avatar>
          <v-avatar v-bind:size="avatar.size">
            <v-img
              alt="ntan_avatar"
              src="https://cdn.intra.42.fr/users/8f7adc12be07b21efa36f6853643989f/ntan.jpg"
            >
            </v-img>
          </v-avatar>
          <v-avatar v-bind:size="avatar.size">
            <v-img
              alt="recarlie_avatar"
              src="https://cdn.intra.42.fr/users/9d05cca6bc6620a14cd050125e5e7d9e/recarlie.jpg"
            >
            </v-img>
          </v-avatar>
        </v-col>

        <v-col cols="6" class="d-flex justify-center">
			<div class="transponder">
				ft_transcendence created by
				<div class="word">
					<span>sojung</span>
					<span>rsung</span>
					<span>ntan</span>
          <span>recarlie</span>
					<span>42.</span>
				</div>
			</div>
        </v-col>

        <v-col cols="3" class="d-flex justify-center">
          <v-btn v-if="!this.userStore.authenticated" color="primary" class="button" to="/login">Login</v-btn>
		  <v-btn v-if="this.userStore.authenticated" color="primary" class="button" to="/login">Logged as {{ userStore.user.username }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
</template>

<style>

.transponder {
	position: absolute;
	font-size: 1.6em;
	font-family: sans-serif;
	padding-right: 2em;
}

.word {
  display: inline-block;
  font-weight: bolder;
}

.word span {
  position: absolute;
  top: 0;
  /* overflow: hidden; */
  animation: animate 15s linear infinite;
  opacity: 0;
}

.word span:nth-child(1) {
  animation-delay: 0s;
}
.word span:nth-child(2) {
  animation-delay: 3s;
}
.word span:nth-child(3) {
  animation-delay: 6s;
}
.word span:nth-child(4) {
  animation-delay: 9s;
}
.word span:nth-child(5) {
  animation-delay: 12s;
}

@keyframes animate {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  2% {
    opacity: 1;
    transform: translateY(0px);
  }
  18% {
    opacity: 1;
    transform: translateY(0px);
  }
  20% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 0;
    transform: translateY(50px);
  }
}


</style>

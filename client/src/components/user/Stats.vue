<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";
import gsap from 'gsap';
import MatchHistory from "@/components/user/MatchHistory.vue"

export default defineComponent({
	name: "Stats",

	components: {
		MatchHistory,
	},

	data() {
		return {
			avatar: {
			size: "50",
			},
			userStore,
			circular_level: 0,
			circular_winrate: 0,
		};
	},

	mounted() {
		const previous_level = (this.userStore.user.level - 1) * 3 - (this.userStore.user.win * 2 + this.userStore.user.lose);
		const next_level = this.userStore.user.level * 3;
		gsap.to(this, { duration: 0.3, circular_level: (previous_level / next_level * 100) || 0});
		gsap.to(this, { duration: 0.3, circular_winrate: this.userStore.user.win / (this.userStore.user.win + this.userStore.user.lose) * 100 || 0})
	},

	computed: {
		getLevelProgress() {
			const previous_level = (this.userStore.user.level - 1) * 3 - (this.userStore.user.win * 2 + this.userStore.user.lose);
			const next_level = this.userStore.user.level * 3;
			return (previous_level / next_level * 100);
		},

		getWinRate() {
			return (this.userStore.user.win / (this.userStore.user.win + this.userStore.user.lose) * 100);
		},
	},
});
</script>

<template>
	<v-container class="d-flex justify-center align-center">
    <v-card class="w-75 pa-3">

		<h1 class="d-flex justify-center align-center">{{ this.userStore.user.username + "'s stats" }}</h1>

		<h2 class="d-flex justify-center align-center">Level</h2>
		<div class="d-flex justify-center align-center">
			<v-progress-circular :model-value="circular_level" :size="100" :width="8" color="primary">
				{{ this.userStore.user.level }}
			</v-progress-circular>
		</div>

		<h2 class="d-flex justify-center align-center mt-8">Winrate</h2>
		<div class="d-flex justify-center align-center">
			<div v-motion-slide-right :delay="1000">
				<div class="d-flex justify-center">
					<h4>Win</h4>
				</div>
				<div class="d-flex justify-center">
					<h3>{{ this.userStore.user.win }}</h3>
				</div>
			</div>
			<v-progress-circular :model-value="circular_winrate" :size="100" :width="8" color="primary" 
				class="mx-5 ">
				{{ getWinRate + "%" }}
			</v-progress-circular>

			<div v-motion-slide-left :delay="1000">
				<div class="d-flex justify-center">
					<h4>Lose</h4>
				</div>
				<div class="d-flex justify-center">
					<h3>{{ this.userStore.user.lose }}</h3>
				</div>
			</div>
		</div>
	</v-card>
	</v-container>
</template>

<style scoped>
.winrate {
	display: flex;
	margin: 2em 2em 2em 2em;
}

</style>
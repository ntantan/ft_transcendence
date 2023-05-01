<script lang="ts">
import { defineComponent } from "vue";

// Components
import HelloWorld from "../components/HelloWorld.vue";
import { mdiTableTennis } from '@mdi/js';

export default defineComponent({
  
	data() {
		return {
			sides: ['icons', 'technos'],
			current_side: 'icons',
		}
	},

	computed: {
	},

  methods: {
    goto(refName) {
        var element = this.$refs[refName];
        var top = element.offsetTop;
        window.scrollTo(0, top);
    },

	switchSide() {
		if (this.current_side == 'icons')
			this.current_side = this.sides[1];
		else if (this.current_side == 'technos')
			this.current_side = this.sides[0];
	},
},
});
</script>

<template>
  <!-- <hello-world /> -->
	<div v-if="this.current_side == 'icons'">
		<div class="container">
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="0"
				>
				<v-icon color="primary" size="100">mdi-table-tennis</v-icon>
			</div>
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="400"
				>
				<v-icon color="primary" size="100">mdi-chat</v-icon>
			</div>
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="800"
				>
				<v-icon color="primary" size="100">mdi-lock-check</v-icon>
			</div>
		</div>

		<div class="container">
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="0"
				>
				<h1>Fun</h1>
			</div>
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="400"
				>
				<h1>Social</h1>
			</div>
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="800"
				>
				<h1>Secured</h1>
			</div>
		</div>

		<div v-motion-pop>
		<v-container class="d-flex justify-center align-center w-100 mt-5">
			<v-btn
			color="primary"
			prepend-icon="mdi-vuetify"
			stacked
			tonal
			@click="switchSide()"
			>See our technos</v-btn>
		</v-container>
		</div>

		<div class="spam"
			v-motion
			:initial="{
				x: -200,
				opacity: 0,
			}"
			:enter="{
				x: 0,
				opacity: 1,
				transition: {
				repeat: Infinity,
				repeatType: 'reverse',
				repeatDelay: 9000,
				duration: 1000,
				},
			}"
			:delay="5000"
			>
			<div class="d-flex justify-center align-center ma-2">
				<v-icon href="https://www.youtube.com/watch?v=dNQs_Bef_V8&ab_channel=Taescuro." color="primary" class="mr-2">mdi-table-tennis</v-icon>
				<p>"お前はもう死んでいる"</p>
			</div>
		</div>

		<div class="spam"
			v-motion
			:initial="{
				x: -200,
				opacity: 0,
			}"
			:enter="{
				x: 0,
				opacity: 1,
				transition: {
				repeat: Infinity,
				repeatType: 'reverse',
				repeatDelay: 6000,
				duration: 1000,
				},
			}"
			:delay="3000"
			>
			<div class="d-flex justify-center align-center ma-2">
				<v-icon color="primary" class="mr-2">mdi-table-tennis</v-icon>
				"Jungle dif."
			</div>
		</div>

		<div class="spam"
			v-motion
			:initial="{
				x: -200,
				opacity: 0,
			}"
			:enter="{
				x: 0,
				opacity: 1,
				transition: {
				repeat: Infinity,
				repeatType: 'reverse',
				repeatDelay: 7000,
				duration: 1000,
				},
			}"
			:delay="1000"
			>
			<div class="d-flex justify-center align-center ma-2">
				<v-icon color="primary" class="mr-2">mdi-table-tennis</v-icon>
				"Hey ! Wanna make a game ?"
			</div>
		</div>
	</div>

	<div v-if="this.current_side == 'technos'">
		<div class="container">
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="0"
				>
				<v-img
					height="150"
					src="https://vuejs.org/images/logo.png"
				></v-img>
			</div>
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="400"
				>
				<v-img
					height="150"
					src="https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg"
				></v-img>
			</div>
			<div
				class="target" 
				v-motion
				:initial="{opacity: 0, y: 100}"
				:enter="{opacity: 1, y: 0}"
				:delay="800"
				:leave="{opacity: 1, y: 0}"
				>
				<v-img
					height="150"
					src="https://www.postgresql.org/media/img/about/press/elephant.png"
				></v-img>
			</div>
		</div>

		<div class="container">
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="0"
				>
				<h1>VueJS</h1>
			</div>
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="400"
				>
				<h1>NestJS</h1>
			</div>
			<div
				class="target-text" 
				v-motion
				:initial="{opacity: 0, y: -100}"
				:enter="{opacity: 1, y: 0}"
				:delay="800"
				>
				<h1>PostgreSQL</h1>
			</div>
		</div>

		<div v-motion-pop>
		<v-container class="d-flex justify-center align-center w-100 mt-5">
			<v-btn
			color="primary"
			prepend-icon="mdi-vuetify"
			stacked
			tonal
			@click="switchSide()"
			>See our features</v-btn>
		</v-container>
		</div>
	</div>


</template>

<style>

.spam {
	top: 0;
	width: max-content;
	height: 50px;
	margin: 0.5em 3em auto 3em;
	background: #ffffff;
	border-radius: 10px;
	border: solid;
	border-color: rgb(142, 142, 142);
	font-weight: bold;
	display: flex;
	justify-content: center;
	align-items: center;
}

.container {
	display: flex;
}

.target {
	width: 250px;
	height: 250px;
	margin: 3em 3em auto 3em;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #ffffff;
	border-radius: 10px;
	border: solid;
	border-color: rgb(142, 142, 142);
	font-weight: bold;
}

.target-text {
	width: 250px;
	height: 50px;
	margin: 3em 3em auto 3em;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #ffffff;
	font-weight: bold;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { userStore } from '@/stores/user';
import axios from "axios";

const localhost = import.meta.env.VITE_LOCALHOST;
const login_url = `http://localhost:3000/auth/login`;

export default defineComponent ({
	
	data() 
	{
		return {
			userStore,
		};
	},

	methods: 
	{
		submitLogin()
		{
			const url = login_url;
			window.open("http://localhost:3000/auth/login");
			setTimeout(() => {location.reload()}, 1000);
		},

		submitLogout()
		{
			const url = login_url;
			window.open("http://localhost:3000/auth/logout");
			setTimeout(() => {location.reload()}, 1000);
		},
	},
});
</script>


<template>
	<v-row justify="center">
		<v-col class="pa-8" cols="auto">
			<v-card class="pa-8" width="500" elevation="3">
				<div v-if="!this.userStore.authenticated" class="justify-center align-center justify-item">
					<v-row justify="center">
						<v-card-subtitle>
							You need to login to enter our website
						</v-card-subtitle> 
					</v-row>

					<v-row justify="center" class="pa-4">
						<v-btn color="primary" @click="submitLogin()">Sign in with 42</v-btn>
					</v-row>
				</div>

				<div v-if="this.userStore.authenticated" class="fill-height align-center justify-center">
						<v-row justify="center">
							<v-card-subtitle>
								You are logged as {{ userStore.user.username }}
							</v-card-subtitle>
						</v-row>

						<v-row justify="center" class="pa-4">
							<v-btn color="red" @click="submitLogout()">Sign out</v-btn>
						</v-row>
				</div>

			</v-card>
		</v-col>
	</v-row>
</template>

<style>
</style>
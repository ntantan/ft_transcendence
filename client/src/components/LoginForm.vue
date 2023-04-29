<script lang="ts">
import { defineComponent } from 'vue';
import { userStore } from '@/stores/user';
import axios from "axios";
import TwoFactorAuthInput from './user/TwoFactorAuthInput.vue';

const localhost = import.meta.env.VITE_LOCALHOST;
const login_url = `http://localhost:3000/auth/login`;

export default defineComponent ({
	
	components: {
		TwoFactorAuthInput,
	},
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
			console.log(this.userStore.user.two_fa);
			window.open("http://localhost:3000/auth/login");
			setTimeout(() => {location.reload()}, 1000);
		},

		submitLogout()
		{
			const url = login_url;
			window.open("http://localhost:3000/auth/logout");
			setTimeout(() => {location.reload()}, 1000);
		},

		cancelTwoFactorAuth()
		{
			this.userStore.twoFactorAuthenticated = false;
			this.userStore.authenticated = false;
		},

		verified() 
		{
			this.userStore.twoFactorAuthenticated = true;
		},
	},
});
</script>


<template>
<v-container class="d-flex h-75">
	<v-row justify="center" align="center">
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

				<div v-if="this.userStore.authenticated && this.userStore.twoFactorAuthenticated" class="fill-height align-center justify-center">
						<v-row justify="center">
							<v-card-subtitle>
								You are logged as {{ userStore.user.username }}
							</v-card-subtitle>
						</v-row>

						<v-row justify="center" class="pa-4">
							<v-btn color="red" @click="submitLogout()">Sign out</v-btn>
						</v-row>
				</div>

				<div v-if="this.userStore.authenticated && !this.userStore.twoFactorAuthenticated" class="fill-height align-center justify-center">
					<component is="twoFactorAuthInput" @cancel="cancelTwoFactorAuth" @verified="verified" />
				</div>

			</v-card>
		</v-col>
	</v-row>
</v-container>
</template>

<style>
</style>
<script lang="ts">
import { defineComponent } from 'vue';
import { userStore } from '@/stores/user';
import axios from "axios";
import TwoFactorAuthInput from './user/TwoFactorAuthInput.vue';

const localhost = import.meta.env.VITE_LOCALHOST;
const login_url = `http://localhost:3000/auth/login`;

export default defineComponent({

	components: {
		TwoFactorAuthInput,
	},
	data() {
		return {
			userStore,
		};
	},

	computed: {
		isTwoFactorAuthenticated(): boolean {
			if (userStore.user.two_fa === true) {
				return userStore.user.two_fa_logged === true ? true : false;
			} else {
				return true;
			}
		}
	},

	methods:
	{
		submitLogin() {
			const url = login_url;
			window.open("http://localhost:3000/auth/login");
			setTimeout(() => { location.reload() }, 1000);
		},

		submitLogout() {
			const url = login_url;
			window.open("http://localhost:3000/auth/logout");
			setTimeout(() => { location.reload() }, 1000);
		},

		async cancelTwoFactorAuth(): Promise<void> {
			userStore.authenticated = false;
			const res = await fetch("http://localhost:3000/users/" + this.userStore.user.id, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "Offline", two_fa_logged: false }),
			});
			// const response = await axios.patch("http://localhost:3000/users/" + this.userStore.user.id, { status: "Offline" }, { withCredentials: true })
			// 	.then((response) => {
			// 		userStore.user.two_fa_logged = false;
			// 		userStore.user = response.data;
			// 		console.log("wha?");
			// 	})
			// 	.catch((error) => {
			// 		console.error(error.response);
			// 	});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			this.userStore.updateUser(data);
		},

		async verified() {
			this.userStore.user.two_fa_logged = true;
			const res = await fetch("http://localhost:3000/users/" + this.userStore.user.id, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "Online", two_fa_logged: true }),
			});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			this.userStore.updateUser(data);
		},
	},
});
</script>


<template>
	<v-row justify="center">
		<v-col class="pa-8" cols="auto">
			<v-card class="pa-8" width="500" elevation="3">
				<div v-if="!userStore.authenticated" class="justify-center align-center justify-item">
					<v-row justify="center">
						<v-card-subtitle>
							You need to login to enter our website
						</v-card-subtitle>
					</v-row>

					<v-row justify="center" class="pa-4">
						<v-btn color="primary" @click="submitLogin()">Sign in with 42</v-btn>
					</v-row>
				</div>

				<div v-if="userStore.authenticated && isTwoFactorAuthenticated"
					class="fill-height align-center justify-center">
					<v-row justify="center">
						<v-card-subtitle>
							You are logged as {{ userStore.user.username }}
						</v-card-subtitle>
					</v-row>

					<v-row justify="center" class="pa-4">
						<v-btn color="red" @click="submitLogout()">Sign out</v-btn>
					</v-row>
				</div>

				<div v-if="userStore.authenticated && !isTwoFactorAuthenticated"
					class="fill-height align-center justify-center">
					<component is="twoFactorAuthInput" @cancel="cancelTwoFactorAuth" @verified="verified"></component>
				</div>

			</v-card>
		</v-col>
	</v-row>
</template>

<style></style>
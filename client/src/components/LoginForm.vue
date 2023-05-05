<script lang="ts">
import { defineComponent } from 'vue';
import { userStore } from '@/stores/user';
import TwoFactorAuthInput from './user/TwoFactorAuthInput.vue';
import axios from "axios";

const login_url = `http://localhost:3000/auth/login`;

export default defineComponent({

	components: {
		TwoFactorAuthInput,
	},

	data() {
		return {
			userStore,
			isFirstTime: userStore.user.firstLogin,
			tmpName: "",
			nameEdit: false,
			rules: [
				(v: string) => !!v || "Required",
				(v: string) => v.length <= 20 || "Must be less than 20 characters",
				(v: string) => v.length >= 3 || "Must be more than 3 characters",
				(v: string) => /^[a-zA-Z0-9_]*$/.test(v) || "Only letters, numbers and underscores allowed",
				//https://regexr.com/
			],
			URL: "http://localhost:3000/users/avatar/",
		};
	},

	mounted() {
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

	watch: {
		async isFirstTime() {
			await this.closeFirstTimePrompt();
		}
	},

	methods:
	{
		async submitLogin() {
			const url = login_url;
			window.open("http://localhost:3000/auth/login");
			//setTimeout(() => { location.reload() }, 1000);
			setTimeout(async () => {
				const response = await axios.get("http://localhost:3000/auth/route_guard", { withCredentials: true })
					.then((response) => {
						userStore.updateUser(response.data);
						console.log("heool?");
					})
					.catch((error) => {
						console.error(error.response);
					});
				location.reload();
			}, 1000);

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

		async updateAvatar(): Promise<void> {
			const file = (document.getElementById("avatar") as HTMLInputElement).files[0];
			if (file == null) {
				return;
			}
			const formData = new FormData();
			formData.append("avatar", file);
			const res = await fetch("http://localhost:3000/users/avatar/" + userStore.user.id, {
				method: "POST",
				credentials: "include",
				body: formData,
			});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			if (data.avatar)
				userStore.updateAvatar(data.avatar);
		},

		getAvatar(): string {
			if (this.userStore.user.avatar.startsWith("https://cdn.intra.42.fr/")) {
				return this.userStore.user.avatar;
			}
			return this.URL + this.userStore.user.avatar;
		},

		isInputValid(): boolean {
			return this.tmpName.length <= 20 && this.tmpName.length >= 3 && /^[a-zA-Z0-9_]*$/.test(this.tmpName);
		},

		async changeUsername(): Promise<void> {
			if (!this.isInputValid()) {
				return;
			}
			const actualName = this.userStore.user.username;
			const newName = this.tmpName;
			this.userStore.user.username = newName;
			this.tmpName = "";
			this.nameEdit = false;
			await axios.patch("http://localhost:3000/users/" + this.userStore.user.id, {
				username: newName
			}, {
				withCredentials: true
			}).then(response => {
				this.userStore.user.username = this.newName;
			}).catch((error) => {
				if (error.response.status === 400) {
					alert("Username already exists");
				}
				this.userStore.user.username = actualName;
			});
		},

		async closeFirstTimePrompt() {
			this.isFirstTime = false;
			const res = await fetch("http://localhost:3000/users/" + this.userStore.user.id, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ firstLogin: false }),
			});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			this.userStore.updateUser(data);
		},
		cancelEdit(): void {
			this.nameEdit = false;
			this.tmpName = "";
		},
	},
});
</script>


<template>
	<v-container class="d-flex h-75">
		<v-row justify="center" align="center">
			<v-col class="pa-8" cols="auto">
				<v-card class="pa-8" width="500" elevation="3">
					<div v-if="!userStore.authenticated && !isFirstTime" class="justify-center align-center justify-item">
						<v-row justify="center">
							<v-card-subtitle>
								You need to login to enter our website
							</v-card-subtitle>
						</v-row>

						<v-row justify="center" class="pa-4">
							<v-btn color="primary" @click="submitLogin()">Sign in with 42</v-btn>
						</v-row>
					</div>


					<div v-if="userStore.authenticated && isTwoFactorAuthenticated && !isFirstTime"
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

					<div v-if="userStore.authenticated && !isTwoFactorAuthenticated && !isFirstTime"
						class="fill-height align-center justify-center">
						<component is="twoFactorAuthInput" @cancel="cancelTwoFactorAuth" @verified="verified"></component>
					</div>
				</v-card>
				<v-card>
					<div v-if="userStore.authenticated && isTwoFactorAuthenticated && isFirstTime"
						class="fill-height align-center justify-center">
						<v-row justify="center">
							<v-dialog v-model="isFirstTime" width="1000">
								<v-card>
									<v-row justify="center">
										<v-card-title class="welcomeMessage">
											Welcome, {{ userStore.user.username }}!
										</v-card-title>
									</v-row>
									<v-row justify="center">
										<v-avatar size="150">
											<img :src="getAvatar()" class="avatar" />
										</v-avatar>
									</v-row>
									<v-row justify="center">
										<v-col cols="6">
											<v-file-input label="Upload file within 10MB" id="avatar" chips
												color="deep-purple-accent-4" counter :show-size=true density="compact">
											</v-file-input>
										</v-col>
									</v-row>
									<v-row justify="center">
										<v-btn color="primary" size="small" @click="updateAvatar">Change avatar</v-btn>
									</v-row>
									<v-row justify="center">
										<v-col cols="6">
											<v-card v-show="!nameEdit" title="Your username" elevation="0">
												<template v-slot:subtitle>
													{{ userStore.user.username }}
												</template>
												<template v-slot:append>
													<v-btn variant="text" @click.stop="nameEdit = !nameEdit">Edit</v-btn>
												</template>
											</v-card>
											<v-card v-show="nameEdit" elevation="0">
												<v-card-title>
													Please type your new username
												</v-card-title>
												<v-card-text>
													<v-form @submit.prevent="changeUsername">
														<v-text-field label="New username" v-model="tmpName" :rules="rules"
															@keydown.enter.prevent="changeUsername"
															density="compact"></v-text-field>
														<v-row justify="center">
															<v-btn color="primary" type="submit" size="small">Save</v-btn>
															<v-btn color="warning" @click="cancelEdit"
																size="small">Cancel</v-btn>
														</v-row>
													</v-form>
												</v-card-text>
											</v-card>
										</v-col>
									</v-row>
									<v-card-actions>
										<v-btn color="primary" block @click="isFirstTime = false">Close</v-btn>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</v-row>
					</div>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<style>
.welcomeMessage {
	font-size: 30px;
	margin: 20px;
	font-family: "roboto";
}
</style>
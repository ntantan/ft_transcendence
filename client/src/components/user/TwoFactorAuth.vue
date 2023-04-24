<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";
import QRCode from "qrcode";
import { authenticator } from "otplib";

export default defineComponent({
	name: "TwoFactorAuth",

	data() {
		return {
			userStore,
			enable: userStore.user.two_fa,
			secret: "",
			userQRCode: "",
		};
	},
	watch: {
		enable: async function (newValue, oldValue) {
			if (newValue !== oldValue) {
				await this.updateTwoFa(newValue);
				if (newValue === true) {
					await this.onEnableTwoFa();
				} else {
					this.secret = "";
					this.userQRCode = "";
				}
			}
		},
	},
	methods: {
		async updateTwoFa(newValue: boolean) {
			// change the two_fa value in the database
			const res = await fetch("http://localhost:3000/users/" + userStore.user.id, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ two_fa: newValue }),
			});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			// update userStore
			this.userStore.updateUser(data);
		},
		async onEnableTwoFa() {
			this.secret = await this.generateSecret();
			this.userQRCode = await QRCode.toDataURL(this.getAuthenticatorURI(this.secret));
		},
		async generateSecret(): Promise<string> {
			// TODO: generate, save the secret key in the database and return it
			const secret = authenticator.generateSecret();
			const res = await fetch("http://localhost:3000/users/" + userStore.user.id, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ secret: secret }),
			});
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
			}
			return secret;
		},
		getAuthenticatorURI(secret: string): string {
			// Generate an authenticator URI that can be used to set up a two-factor authentication app
			// The URI follows the format: otpauth://totp/{issuer}:{label}?secret={secret}&issuer={issuer}
			const issuer = "Transcendence";
			const label = userStore.user.username;
			return `otpauth://totp/${issuer}:${encodeURIComponent(label)}?secret=${secret}&issuer=${issuer}`;
		},
	},
});
</script>

<template>
	<v-card height="350">
		<v-card-title>
			<h2>Two Factor Authentication</h2>
		</v-card-title>
		<v-container>
			<v-row>
				<v-col>
					<v-switch v-model="enable" color="indigo" inset>{{ enable ? "Disable" : "Enable" }} Two-Factor
						Authentication </v-switch>
					<div v-if="userQRCode">
						<img :src="userQRCode" alt="QR Code">
					</div>
				</v-col>
			</v-row>
		</v-container>
	</v-card>
</template>

<style></style>

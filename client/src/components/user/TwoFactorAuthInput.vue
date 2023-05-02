<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
	name: "TwoFactorAuthInput",

	data() {
		return {
			userStore,
			code: "",
			rules: [
				(v: string) => !!v || "Required",
				(v: string) => v.length === 6 || "Must be 6 digits",
				async (v: string) => await this.verifyCode() || "Invalid code",
			],
		};
	},

	methods: {
		async verifyCode(): Promise<boolean> {
			const res = await fetch("http://localhost:3000/auth/" + userStore.user.id + "/verify2fa", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code: this.code }),
			});
			const data = await res.json();
			if (data.verified === true) {
				this.$emit("verified", "");
			}
			return data.verified;
		},
		emitCancel() {
			this.$emit("cancel", "");
		},
	},
});
</script>

<template>
	<v-card>
		<v-card-text>
			Type the code from your authenticator app
		</v-card-text>
		<v-form @submit.prevent="verifyCode">
			<v-text-field v-model="code" :rules="rules" label="OTP" placeholder="Your OTP" clearable></v-text-field>
			<div class="d-flex flex-column justify-center">
				<v-btn color="indigo" type="submit">Verify</v-btn>
				<v-btn color="warning" @click="emitCancel">Cancel</v-btn>
			</div>
		</v-form>
	</v-card>
</template>
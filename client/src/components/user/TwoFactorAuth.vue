<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";

export default defineComponent({
	name: "TwoFactorAuth",

	data() {
		return {
			userStore,
			enable: 'no', // userstore.user.enable2FA
		};
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
					<v-switch v-model="enable" color="indigo" true-value="yes" false-value="no" :label="`enable 2FA: ${enable}`" inset></v-switch>
				</v-col>
			</v-row>
		</v-container>
	</v-card>
</template>

<style></style>

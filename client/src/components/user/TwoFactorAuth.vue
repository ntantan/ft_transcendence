<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@/stores/user";
import QRCode from "qrcode";
import TwoFactorAuthInput from "./TwoFactorAuthInput.vue";

export default defineComponent({
    name: "TwoFactorAuth",

    components: {
        TwoFactorAuthInput,
    },

    data() {
        return {
            userStore,
            enable: userStore.user.two_fa,
            secret: "",
            userQRCode: "",
            dialog: false,
            isValid: false,
        };
    },
    watch: {
        enable: async function (newValue, oldValue) {
            if (newValue === true) {
                await this.onEnableTwoFa();
            }
            else {
                this.secret = "";
                this.userQRCode = "";
                this.isValid = false;
                this.userStore.user.two_fa = false;
                await this.updateTwoFa(false);
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
                body: JSON.stringify({ two_fa: newValue, two_fa_logged: newValue }),
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
            const res = await fetch("http://localhost:3000/auth/" + userStore.user.id + "/2faSecret", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (!data.secret) {
                console.log("error generating secret");
                return "";
            }
            return data.secret;
        },
        getAuthenticatorURI(secret: string): string {
            // Generate an authenticator URI that can be used to set up a two-factor authentication app
            // The URI follows the format: otpauth://totp/{issuer}:{label}?secret={secret}&issuer={issuer}
            const issuer = "Transcendence";
            const label = userStore.user.username;
            return `otpauth://totp/${issuer}:${encodeURIComponent(label)}?secret=${secret}&issuer=${issuer}`;
        },
        async updateData() {
            this.isValid = true;
            this.dialog = false;
            this.userQRCode = "";
            console.log("verified");
            this.userStore.user.two_fa = true;
            await this.updateTwoFa(true);
        },
        cancelEnable() {
            this.dialog = false;
            this.userQRCode = "";
            this.enable = false;
        },
    },
});
</script>

<template>
    <v-card height="600">
        <v-card-title>
            <h2>Two Factor Authentication</h2>
        </v-card-title>
        <v-container>
            <v-row>
                <v-col>
                    <v-switch v-model="enable" color="indigo" inset>{{ enable ? "Disable" : "Enable" }} Two-Factor
                        Authentication </v-switch>
                </v-col>
            </v-row>
            <v-row>
                <div v-if="userQRCode && !userStore.user.two_fa">
                    <v-card flat="true">
                        <v-row>
                            <v-col>
                                <v-card-title>Scan this QR code with your authenticator app.</v-card-title>
                                <v-card-subtitle>(Ex. Google Authenticator, Authy etc.)</v-card-subtitle>
                                <v-avatar size="200" rounded="0"><v-img :src="userQRCode" alt="QR Code"></v-img></v-avatar>
                            </v-col>
                            <v-col align-self="center">
                                <div class="text-center">
                                    <v-dialog v-model="dialog" width="auto">
                                        <template v-slot:activator="{ props }">
                                            <v-btn color="indigo" v-bind="props">
                                                Next
                                            </v-btn>
                                        </template>
                                        <component is="TwoFactorAuthInput" @cancel="cancelEnable" @verified="updateData">
                                        </component>
                                    </v-dialog>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card>
                </div>
                <div v-show="userStore.user.two_fa">
                    <v-alert type="success" title="Two Factor Authentication is enabled."
                        text="You will be asked to enter a code from your authenticator app when you login."></v-alert>
                </div>
                <div v-show="!userStore.user.two_fa && !userQRCode">
                    <v-alert type="warning" title="Two Factor Authentication is not enabled."
                        text="You will not be asked to enter a code from your authenticator app when you login."></v-alert>
                </div>
            </v-row>
        </v-container>
    </v-card>
</template>

<style></style>

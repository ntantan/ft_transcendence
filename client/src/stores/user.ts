import { reactive } from "vue";

export const userStore = reactive({
	authenticated: false,
	user: {},
	updateUserName(newUserName: string) {
		userStore.user.username = newUserName;
	},
	updateAvatar(newAvatar: string) {
		userStore.user.avatar = newAvatar;
	},
})
import { reactive } from "vue";

export const userStore = reactive({
	authenticated: false,
	user: {},
	updateUser(data) {
		userStore.user = data;
	},
	updateUserName(newUserName: string) {
		userStore.user.username = newUserName;
	},
	updateAvatar(newAvatar: string) {
		userStore.user.avatar = newAvatar;
	},
	updateFriends(newFriends: any) {
		userStore.user.friends = newFriends;
	}
})
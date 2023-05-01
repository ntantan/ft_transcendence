import { authenticator } from 'otplib';
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
import ChatView from "../views/ChatView.vue";
import UserView from "../views/UserView.vue";
import LoginView from "../views/LoginView.vue";
import LeaderboardView from "../views/LeaderboardView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import CustomGameView from "../views/CustomGameView.vue";
import axios from "axios";
import { userStore } from "@/stores/user";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
			meta: {
				title: "Home"
			},
		},
		{
			path: "/game",
			name: "game",
			component: GameView,
			meta: {
				title: "Game"
			},
		},
		{
			path: "/game/custom",
			name: "custom_game",
			component: CustomGameView,
			meta: {
				title: "Game"
			},
		},
		{
			path: "/chat",
			name: "chat",
			component: ChatView,
			meta: {
				title: "Chat"
			},
		},
		{
			path: "/user",
			name: "user",
			component: UserView,
			meta: {
				title: "User"
			},
		},
		{
			path: "/user/:id",
			name: "user_profile",
			component: UserProfileView,
			meta: {
				title: "User Profile"
			},
		},
		{
			path: "/login",
			name: "login",
			component: LoginView,
			meta: {
				title: "Login"
			},
		},
		{
			path: "/leaderboard",
			name: "leaderboard",
			component: LeaderboardView,
			meta: {
				title: "Leaderboard"
			},
		}
	],
});

router.beforeEach(async (to, from) => {
	const response = await axios.get("http://localhost:3000/auth/route_guard", { withCredentials: true })
		.then((response) => {
			userStore.authenticated = true;
			userStore.user = response.data;
			if ((response.data.two_fa && !response.data.two_fa_enabled) && to.name !== 'user') {
				return ({ name: "login" })
			}
		})
		.catch((error) => {
			userStore.authenticated = false;
			// window.alert("You need to be logged to do that");
			console.error(error.response);
		})
	if (!userStore.authenticated && to.name !== 'login') {
		return ({ name: "login" })
	}

});

export default router;

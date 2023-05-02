<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';

const HISTORY_URL = "http://localhost:3000/history";

export default defineComponent({

	data() {
		return {
			dialogm1: '',
      		dialog: false,
			history: null,
		};
	},

	mounted() {
		this.fetchData();
	},

	watch: {
		history: 'fetchData',
	},

	methods: {
		async fetchData() {
			axios.get("http://localhost:3000/history", {withCredentials: true})
				.then((response) => {
					this.history = response.data;
				})
				.catch((error) => {
					console.log(error);
				})
		},

		formatedDate(str_date: string)
		{
			// let options = {year: "numeric", month: "long", day: "numeric", hours: "24"}
			const date = new Date(str_date);
			return (date.toLocaleString("fr", {hour12: false}));
		}
	},

	computed: {
	}
});

</script>


<template>

<v-dialog
	v-model="dialog"
	scrollable
	width="auto"
>
	<template v-slot:activator="{ props }">
	<v-btn
		v-bind="props"
	>
		Show History
	</v-btn>
	</template>
	<v-card>

		<v-card-title>Match History</v-card-title>

		<v-divider></v-divider>

		<v-card-text style="height: 800px;">
			<v-list>
				<v-list-item
					v-for="item in history"
					:key="item.id"
				>
					<v-card>
						<template v-slot:title>
							{{ item.winner }}
						</template>

						<template v-slot:subtitle>
							<h3>{{ item.gamemod }}</h3>
							{{ item.player1 }} vs {{ item.player2 }}
						</template>

						<template v-slot:text>
							<span>{{ formatedDate(item.date) }}</span>
						</template>
					</v-card>
				</v-list-item>
			</v-list>
		</v-card-text>

		<v-divider></v-divider>

		<v-card-actions>
			<v-btn
			color="blue-darken-1"
			variant="text"
			@click="dialog = false"
			>
			Close
			</v-btn>
		</v-card-actions>

	</v-card>
</v-dialog>

</template>

<style>
</style>
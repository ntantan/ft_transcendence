<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "../stores/game"
import router from "@/router";

export default defineComponent({

	data() {
		return {
			context: {},
			width: 640,
			height: 480,
			cssWidth: '640px',
			cssHeight: '480px',
	
			ratioHeight: 1,
			ratioWidth: 1,

			selectText: 'light',

			field: undefined,
			ball: undefined,
			racket: undefined,
			racket2: undefined,

			gameStore: useGameStore(),
		};
	},

	created() {
		var myFont = new FontFace("myFont", "url(src/assets/PressStart2P-Regular.ttf)");
		myFont.load().then(function(font) {
			document.fonts.add(font);
			console.log("font loaded");
		});

		this.retro = new Image();
		this.retro.src = 'src/assets/retro.png';

		this.ball = new Image();
		this.ball.src = 'src/assets/ball-xs.png';

		this.racket = new Image();
		this.racket.src = 'src/assets/racket.png';

		this.racket2 = new Image();
		this.racket2.src = 'src/assets/racket2.png';
	},

	mounted() {
		this.context = this.$refs.game.getContext("2d");

		this.$nextTick(() => {
			window.addEventListener("resize", this.resize_canvas);
			this.resize_canvas();
		})
		
		// update game positions
		this.gameStore.socket.on("clear", () => {
			this.context.clearRect(0, 0, this.width, this.height);
		})

		this.gameStore.socket.on("startGame", (data) => {
			this.context.clearRect(0, 0, this.width, this.height);
			
			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.font = "bold " + this.width / 15 + "px myFont";
				this.context.fillText("5", this.width / 2, this.height / 2);
			}, 0);

			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.fillText("4", this.width / 2, this.height / 2);
			}, 1000);

			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.fillText("3", this.width / 2, this.height / 2);
			}, 2000);

			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.fillText("2", this.width / 2, this.height / 2);
			}, 3000);

			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
				this.context.fillText("1", this.width / 2, this.height / 2);
			}, 4000);
		});

		this.gameStore.socket.on("endGame", (data) => {
			this.context.clearRect(0, 0, this.width, this.height);
			this.context.fillText(data.endStatus, 100, this.height / 2);

			setTimeout(() => {
				this.context.clearRect(0, 0, this.width, this.height);
			}, 4000);
		});

		this.gameStore.socket.on("position", (data) => {
			this.context.clearRect(0, 0, this.width, this.height);

			if (this.selectText == "3d")
			{
				this.context.drawImage(this.retro, 0 , 0, this.width, this.height);
				
				this.context.beginPath();
				const ball_x = this.width * 0.33 + data.ball_x * this.ratioWidth * (320 / 960);
				const ball_y = this.height * 0.3 + data.ball_y * this.ratioHeight * (260 / 640) - data.ball_x * this.ratioHeight * 0.05;
				this.context.arc(ball_x, ball_y, 5, 0, 2 * Math.PI);
				this.context.fillStyle = "white";
				this.context.fill();
				this.context.stroke();

				const p1_x = this.width * 0.328 + data.p1_x * (320 / 960);
				const p1_y = this.height * 0.3 + data.p1_y * this.ratioHeight * 0.42;
				this.context.drawImage(this.racket, p1_x, p1_y, 15 * this.ratioWidth * 0.3, 65 * this.ratioHeight * 0.4);

				const p2_x = this.width * 0.656 - data.p2_y * 0.015;
				const p2_y = this.height * 0.23 + data.p2_y * this.ratioHeight * 0.39;
				this.context.drawImage(this.racket2, p2_x, p2_y, 15 * this.ratioWidth * 0.3, 65 * this.ratioHeight * 0.4);
			}
			else // if "light" or "dark"
			{
				// background
				this.setCanvasBackgroundColor();
				this.context.fillRect(0, 0, this.width, this.height);
				
				// dotted line
				this.setCanvasObjectColor();
				this.context.beginPath();
				this.context.setLineDash([15, 18]);
				for (let i = 0; i < 6; i++)
				{
					const offset = i - 2;
					this.context.moveTo(this.width / 2 + offset, 0);
					this.context.lineTo(this.width / 2 + offset, this.height);
				}
				this.context.stroke();

				// middle bar for game mod 2
				this.context.fillRect(data.obj1_x * this.ratioWidth, data.obj1_y * this.ratioHeight, data.obj1_width * this.ratioWidth, data.obj1_height * this.ratioHeight);
				
				// power text for game mod 3
				if (data.power)
				{
					this.context.fillStyle = "rgba(150, 150, 150, 0.2)";
					this.context.fillText(data.power, (this.width / 2 - this.width * data.power.length / 30), this.height);
					this.setCanvasObjectColor();
				}

				// ball and rackets
				this.context.fillRect(data.p1_x, data.p1_y * this.ratioHeight, data.racket_width * this.ratioWidth, data.racket_height * this.ratioHeight);
				this.context.fillRect(data.p2_x * this.ratioWidth, data.p2_y * this.ratioHeight, data.racket_width * this.ratioWidth, data.racket_height * this.ratioHeight);
				this.context.fillRect(data.ball_x * this.ratioWidth, data.ball_y * this.ratioHeight, data.ball_width * this.ratioWidth, data.ball_height * this.ratioHeight);
		
				// scores
				this.context.fillText(data.p1_score.toString(10), (this.width / 2) - (this.width / 15) * 2, this.height / 6);
				this.context.fillText(data.p2_score.toString(10), (this.width / 2) + (this.width / 15), this.height / 6);
			}
		});
	},

	methods: {

		setCanvasBackgroundColor()
		{
			if (this.selectText == "light")
				this.context.fillStyle = "rgba(255, 255, 255, 1)";
			else if (this.selectText == "dark")
				this.context.fillStyle = "rgba(0, 0, 0, 1)";
		},

		setCanvasObjectColor()
		{
			let color;
			if (this.selectText == "light")
			{
				this.context.font = "bold " + this.width / 15 + "px myFont";
				color = "rgba(0, 0, 0, 1)";
			}
			else if (this.selectText == "dark")
			{
				this.context.font = "bold " + this.width / 15 + "px myFont";
				color = "rgba(255, 255, 255, 1)";
			}

			this.context.strokeStyle = color;
			this.context.fillStyle = color;
		},

		resize_canvas()
		{
			if (window.innerWidth < (640 / 0.75))
				this.width = 640;
			else if (window.innerWidth > 1600)
				this.width = 1600 * 0.75
			else
				this.width = window.innerWidth * 0.75;

			this.height = this.width * (2 / 3);
			this.ratioHeight = this.height / 480;
			this.ratioWidth = this.width / 640;
			this.cssHeight = this.height.toString() + "px";
			this.cssWidth = this.width.toString() + "px";
		},

		draw_num_delay(num: number, delay: number)
		{
			setTimeout(() => {
				this.context.clearRect(0, 0, 640, 480);
				this.context.fillText(num.toString(10), 640 / 2, 480 / 2);
			}, delay);
		},
		
		move(direction: string) {
			// if (this.gameStore.inGame)
			// {
				const roomName = this.gameStore.currentRoom;
				this.gameStore.socket.emit("move", { direction, roomName });
			// }
		},

		test() {
			this.gameStore.socket.emit('test');
		},
	},
});
</script>

<template>
	<!-- Vuetify method to center element in a flexbox -->
	<v-row wrap>
        <v-col class="d-flex justify-center">
			<h1 v-if="this.gameStore.inGame == 1">Player 1</h1>
			<h1 v-else-if="this.gameStore.inGame == 2">Player 2</h1>
			<h1 v-else>Spectator</h1>
		</v-col>
	</v-row> 

	<!-- html css method to center element in a flexbox -->
	<div class="container">
		<canvas class="game" ref="game" v-bind:width="width" v-bind:height="height"></canvas>
		<input  class="keyinput" @keydown.down="move('down')" readOnly="true" @keydown.up="move('up')"/>
	</div>


	<v-row wrap>
        <v-col class="d-flex justify-center">
			<v-btn-toggle v-model="selectText" rounded="0" color="blue-darken-3" group mandatory>
				<v-btn value="light">
					Light
				</v-btn>

				<v-btn value="dark">
					Dark
				</v-btn>

				<v-btn value="3d">
					3D
				</v-btn>
			</v-btn-toggle>
		</v-col>
	</v-row> 
</template>

<style>

.h1 {
	justify-content: center;
}

.container {
	display: flex;
	align-items: center;
	justify-content: center;
}

.game {
	border: 1px solid black;
}

.keyinput {
	position: absolute; 
	width: v-bind(cssWidth);
	height: v-bind(cssHeight);
}

</style>
export class Game3
{
	game_width: number;
	game_height: number;

	racket_width: number;
	racket_height: number;

	ball_width: number;
	ball_height: number;

	p1_x: number;
	p1_y: number;

	p2_x: number;
	p2_y: number;

	ball_x: number;
	ball_y: number;

	ball_vx: number;
	ball_vy: number;

	movespeed: number;
	additional_movespeed: number;

	p1_score: number;
	p2_score: number;

	power: string;
	random: number;

	constructor() 
	{
		this.game_width = 640;
		this.game_height = 480;
		this.racket_height = 60;
		this.racket_width = 15;
		this.ball_height = 10;
		this.ball_width = 10;
		this.p1_x = 0;
		this.p1_y = this.game_height / 2;
		this.p2_x = this.game_width - this.racket_width;
		this.p2_y = this.game_height / 2;
		this.ball_x = this.game_width / 2 - this.ball_width / 2;
		this.ball_y = this.game_height / 2 - this.ball_height / 2;
		this.ball_vx = this.randomDirection();
		this.ball_vy = this.randomDirection() / 3;
		this.movespeed = 10;
		this.p1_score = 0;
		this.p2_score = 0;
		this.power = "Normal";
		this.random = 1;
	}

	p1_moveup()
	{
		if (this.p1_y >= this.movespeed)
			this.p1_y -= this.movespeed;
	}

	p1_movedown()
	{
		if (this.p1_y + this.racket_height < this.game_height)
			this.p1_y += this.movespeed;
	}

	p2_moveup()
	{
		if (this.p2_y >= this.movespeed)
			this.p2_y -= this.movespeed;
	}

	p2_movedown()
	{
		if (this.p2_y + this.racket_height < this.game_height)
			this.p2_y += this.movespeed;
	}

	ia_move()
	{
		// const mid_p1_y = this.p1_y + this.racket_height / 2;
		// const mid_p2_y = this.p2_y + this.racket_height / 2;
		this.movespeed = 5;
		if (this.p1_y + this.racket_height < this.ball_y)
			this.p1_movedown();
		else if (this.p1_y > this.ball_y)
			this.p1_moveup();
		if (this.p2_y + this.racket_height < this.ball_y)
			this.p2_movedown();
		else if (this.p2_y > this.ball_y)
			this.p2_moveup();
	}


	change_mod()
	{
		// Default values
		this.racket_height = 60;
		this.racket_width = 15;
		this.ball_height = 10;
		this.ball_width = 10;
		this.movespeed = 10;
		this.p2_x = this.game_width - this.racket_width;

		this.random = Math.floor(Math.random() * 4) + 1;
		if (this.random == 1)
		{
			this.power = "Normal";
		}
		else if (this.random == 2)
		{
			this.power = "Big Racket";
			this.racket_height = 100;
			this.racket_width = 30;
			this.p2_x = this.game_width - this.racket_width;
		}
		else if (this.random == 3)
		{
			this.power = "Player Speed Up";
			this.movespeed = 30;
		}
		else if (this.random == 4)
		{
			this.power = "Big Ball";
			this.ball_height = 30;
			this.ball_width = 30;
		}
	}

	ball_move()
	{
		// Make the ball bounce up and down
		if (this.ball_y + this.ball_vy < 0 || this.ball_y + this.ball_vy > this.game_height - this.ball_height)
			this.ball_vy = -(this.ball_vy);

		// Make the ball bounce on p1 racket
		if (this.ball_x <= this.p1_x + this.racket_width
		&&	(this.ball_y >= this.p1_y || this.ball_y + this.ball_height >= this.p1_y)
		&&	this.ball_y <= this.p1_y + this.racket_height)
		{
			if (this.ball_vx < 20)
				this.ball_vx = -(this.ball_vx + this.ball_vx / 20);
			else
				this.ball_vx = -(this.ball_vx);

			if (this.ball_y <= this.p1_y + 2 * (this.racket_height / 5))
				this.ball_vy = -(((this.p1_y + this.racket_height / 2) - this.ball_y) / 8);
			else if (this.ball_y >= this.p1_y + 2 * (this.racket_height / 5))
				this.ball_vy = (this.ball_y - (this.p1_y + this.racket_height / 2)) / 8;
			else
				this.ball_vy = 0;
		}

		// Make the ball bounce on p2 racket
		if (this.ball_x + this.ball_width >= this.p2_x
		&&	(this.ball_y >= this.p2_y ||  this.ball_y + this.ball_height >= this.p2_y)
		&&	this.ball_y <= this.p2_y + this.racket_height)
		{
			if (this.ball_vx < 20)
				this.ball_vx = -(this.ball_vx + this.ball_vx / 20);
			else
				this.ball_vx = -(this.ball_vx);

			if (this.ball_y <= this.p2_y + 2 * (this.racket_height / 5))
				this.ball_vy = -(((this.p2_y + this.racket_height / 2) - this.ball_y) / 6);
			else if (this.ball_y >= this.p2_y + 2 * (this.racket_height / 5))
				this.ball_vy = (this.ball_y - (this.p2_y + this.racket_height / 2)) / 6;
			else
				this.ball_vy = 0;
		}
		
		// Update ball pos with his direction
		this.ball_x += this.ball_vx;
		this.ball_y += this.ball_vy;

		// Score point when ball touch right or left border
		if (this.ball_x <= 0 || this.ball_x >= this.game_width)
		{
			if (this.ball_x <= 0)
				this.p2_score += 1;
			else
				this.p1_score += 1;
			this.ball_x = this.game_width / 2 - this.ball_width / 2;
			this.ball_y = this.game_height / 2 - this.ball_height / 2;
			this.ball_vx = 0;
			this.ball_vy = 0;
			this.change_mod();
			setTimeout( () => {
				this.ball_vx = this.randomDirection();
				this.ball_vy = this.randomDirection();
			}, 3000);

			const game_status = this.check_game_status();
			if (game_status)
				return (game_status);
		}

		return (null);
	}


	check_game_status()
	{
		if (this.p1_score >= 2)
			return ("1");
		if (this.p2_score >= 2)
			return ("2");
	}

	randomDirection() {
		if (Math.random() > 0.5)
			return (Math.random() + 1);
		else
			return ((Math.random() + 1) * -1);
	}
}
interface Point {
	x: number;
	y: number;
}

type Direction = "up" | "down" | "right" | "left";

interface Renderble {
	render: (ctx: CanvasRenderingContext2D) => void;
}

interface Sprite {
	parts: Point[];
}

interface Food extends Sprite, Renderble {
	color: string;
}

interface Snake extends Sprite, Renderble {
	isHead: (index: number) => boolean;
	headColor: string;
	bodyColor: string;
	direction: Direction;
}

interface Game {
	isRunning: boolean;
	startBtn: HTMLButtonElement;
	stopBtn: HTMLButtonElement;
}

function handleKeyDown(e: KeyboardEvent) {
	const direction = snake.direction;
	switch (e.key) {
		case "w":
			if (direction !== "down") snake.direction = "up";
			break;
		case "s":
			if (direction !== "up") snake.direction = "down";
			break;
		case "a":
			if (direction !== "right") snake.direction = "left";
			break;
		case "d":
			if (direction !== "left") snake.direction = "right";
			break;
	}
}

function start() {
	if (!game.isRunning) {
		game = { ...game, isRunning: true };
		intervalId = setInterval(() => update(ctx), tick);
		window.addEventListener("keydown", (e) => handleKeyDown(e));
		console.log("game start");
	}
}

function stop() {
	if (game.isRunning) {
		clearInterval(intervalId);
		game = { ...game, isRunning: false };
		console.log("game stop");
	}
}

function update(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	const head = { ...snake.parts[0] };

	switch (snake.direction) {
		case "up":
			head.y -= 1;
			break;
		case "down":
			head.y += 1;
			break;
		case "left":
			head.x -= 1;
			break;
		case "right":
			head.x += 1;
			break;
	}

	snake.parts.unshift(head);
	snake.parts.pop();

	food.render(ctx);
	snake.render(ctx);
}

function draw(
	part: Point,
	ctx: CanvasRenderingContext2D,
	color: string,
	blockSize = BLOCK_SIZE,
) {
	const x = part.x * blockSize;
	const y = part.y * blockSize;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const CANVAS_SIZE = document.getElementById("snake-game")?.clientWidth as number;
const BLOCK_SIZE = 10;
const fps = 15;
// fpsは1秒間に処理する回数なので 1s = 1000ms => 1000 / fps
const tick = 1000 / fps;
let intervalId = 0;

let game: Game = {
	isRunning: false,
	startBtn: document.getElementById("start") as HTMLButtonElement,
	stopBtn: document.getElementById("stop") as HTMLButtonElement,
};

const food: Food = {
	parts: [
		{
			x: Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)),
			y: Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)),
		},
	],
	color: "orange",
	render: (ctx) => {
		food.parts.forEach((part) => draw(part, ctx, food.color));
	},
};

const snake: Snake = {
	parts: [
		{ x: 2, y: 0 },
		{ x: 1, y: 0 },
		{ x: 0, y: 0 },
	],
	isHead: (index) => index === 0,
	headColor: "red",
	bodyColor: "white",
	direction: "right",
	render: (ctx) => {
		snake.parts.forEach((part, index) => {
			snake.isHead(index)
				? draw(part, ctx, snake.headColor)
				: draw(part, ctx, snake.bodyColor);
		});
	},
};

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

food.render(ctx);
snake.render(ctx);

game.startBtn.addEventListener("click", () => start());
game.stopBtn.addEventListener("click", () => stop());

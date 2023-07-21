interface Point {
	x: number;
	y: number;
}

interface Renderble {
	render: (ctx: CanvasRenderingContext2D) => void;
}

interface Sprite {
	parts: SpritePart[];
}

interface SpritePart extends Point {}

interface Food extends Sprite, Renderble {
	color: string;
}

interface Snake extends Sprite, Renderble {
	isHead: (index: number) => boolean;
	headColor: string;
	bodyColor: string;
}

interface Game {
	isRunning: boolean;
	startBtn: HTMLButtonElement;
	stopBtn: HTMLButtonElement;
}

function start() {
	if (!game.isRunning) {
		game = { ...game, isRunning: true };
		rafId = requestAnimationFrame(() => update(ctx));
		console.log("game start");
	}
}

function stop() {
	if (game.isRunning) {
		cancelAnimationFrame(rafId);
		game = { ...game, isRunning: false };
		console.log("game stop");
	}
}

function update(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
	food.render(ctx);
	snake.render(ctx);

	rafId = requestAnimationFrame(() => update(ctx));
}

function draw(
	part: SpritePart,
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
const ctx = canvas.getContext("2d")!;
const CANVAS_SIZE = document.getElementById("snake-game")?.clientWidth!;
const BLOCK_SIZE = 10;
let rafId = 0;

let game: Game = {
	isRunning: false,
	startBtn: document.getElementById("start")! as HTMLButtonElement,
	stopBtn: document.getElementById("stop")! as HTMLButtonElement,
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

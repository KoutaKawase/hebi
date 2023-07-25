import "the-new-css-reset/css/reset.css";

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
	score: number;
	startBtn: HTMLButtonElement;
	stopBtn: HTMLButtonElement;
	scoreElem: HTMLParagraphElement;
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
		intervalId = setInterval(() => update(), tick);
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

function moveSnake(snake: Point[], direction: Direction): Point[] {
	const snakeHead = { ...snake[0] };

	switch (direction) {
		case "up":
			snakeHead.y -= 1;
			break;
		case "down":
			snakeHead.y += 1;
			break;
		case "left":
			snakeHead.x -= 1;
			break;
		case "right":
			snakeHead.x += 1;
			break;
	}

	const copied = [...snake];
	copied.unshift(snakeHead);
	copied.pop();
	return copied;
}

function hasWallCollision(head: Point): boolean {
	const { x, y } = head;
	const WALL_MAX = CANVAS_SIZE / BLOCK_SIZE;

	return x < 0 || x >= WALL_MAX || y < 0 || y >= WALL_MAX;
}

// スネークの頭が自身のボディと接触したかどうか
function hasSnakeBodyCollision(snake: Point[]): boolean {
	const head = snake[0];
	const bodyParts = snake.slice(1);
	return bodyParts.some((body) => head.x === body.x && head.y === body.y);
}

function isFoodEaten(head: Point, food: Point): boolean {
	return head.x === food.x && head.y === food.y;
}

function boostSnakeGrowth(snake: Point[]): Point[] {
	const copiedLast = snake.at(-1) as Point;
	// 毎フレームごとに一番最後がpopされて蛇が進むので最後と同じボディをコピーして２つ用意することで消えるはずだった最後尾が片方だけ
	// 消えて増えたような表現にできる
	return [...snake, copiedLast];
}

function update() {
	ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	snake.parts = moveSnake(snake.parts, snake.direction);

	if (isFoodEaten(snake.parts[0], food.parts[0])) {
		snake.parts = boostSnakeGrowth(snake.parts);
		food.parts[0] = createRandomFoodPoint();

		const score = game.score + 100;
		game = { ...game, score };
		game.scoreElem.textContent = `${game.score}点`;
	}

	if (hasWallCollision(snake.parts[0]) || hasSnakeBodyCollision(snake.parts))
		stop();

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

function createRandomFoodPoint(): Point {
	return {
		x: Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)),
		y: Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)),
	};
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const CANVAS_SIZE = document.getElementById("snake-game")
	?.clientWidth as number;
const BLOCK_SIZE = 10;
const fps = 15;
// fpsは1秒間に処理する回数なので 1s = 1000ms => 1000 / fps
const tick = 1000 / fps;
let intervalId = 0;

let game: Game = {
	isRunning: false,
	score: 0,
	startBtn: document.getElementById("start") as HTMLButtonElement,
	stopBtn: document.getElementById("stop") as HTMLButtonElement,
	scoreElem: document.getElementById("score-point") as HTMLParagraphElement,
};

const food: Food = {
	parts: [createRandomFoodPoint()],
	color: "orange",
	render: (ctx) => {
		food.parts.forEach((part) => draw(part, ctx, food.color));
	},
};

const snake: Snake = {
	parts: [
		{ x: 3, y: 0 },
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

game.scoreElem.textContent = `${game.score}点`;
game.startBtn.addEventListener("click", () => start());
game.stopBtn.addEventListener("click", () => stop());

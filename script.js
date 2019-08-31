const context = document.getElementById('canvas').getContext('2d');

context.scale(25, 25);

const piece = {
	location: { x: 0, y: 0 },
	tetromino: null,
};

let points = 0;

const tetrominoArray = [
	[
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 0, 0],
	],
	[
		[0, 2, 0],
		[0, 2, 0],
		[2, 2, 0],
	],
	[
		[0, 3, 0],
		[0, 3, 0],
		[0, 3, 3],
	],
	[
		[4, 4],
		[4, 4],
	],
	[
		[0, 5, 5],
		[5, 5, 0],
		[0, 0, 0],
	],
	[
		[0, 6, 0],
		[6, 6, 6],
		[0, 0, 0],
	],
	[
		[7, 7, 0],
		[0, 7, 7],
		[0, 0, 0],
	]
];

const colorArray = [
	'#dcec64',
	'#2aa198',
	'#6c71c4',
	'#cb4b16',
	'#b58900',
	'#859900',
	'#d33682',
	'#dc322f',
];

const color = () => {
	context.fillStyle = '#dcec64';
	context.fillRect(0, 0, 250, 450);
	colorMatrix(field, { x: 0, y: 0 });
	colorMatrix(piece.tetromino, piece.location);
};

const colorMatrix = (matrix, location) => {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value > 0) {
				context.fillStyle = colorArray[value];
				context.fillRect(x + location.x, y + location.y, 1, 1);
			}
		});
	});
};

const displayPoints = () => {
	document.querySelector('#points').innerText = points;
};

let framesSinceDrop = 0;
const framesPerDrop = 10;

const eachFrame = () => {
	framesSinceDrop++;
	if (framesSinceDrop > framesPerDrop) {
		moveDown();
	}
	color();
};

const gameOver = () => {
	field.forEach(row => row.fill(0));
	points = 0;
	displayPoints();
};

const hitBottom = () => {
	piece.location.y--;
	merge(field, piece);
	insertTetromino();
	inspect();
	displayPoints();
};

const insertTetromino = () => {
	piece.tetromino = newTetromino();
	piece.location.y = 0;
	piece.location.x = 4;
	if (overlap(field, piece)) {
		gameOver();
	}
};

const inspect = () => {
	let rowCount = 1;
	outer: for (let y = 17; y > 0; y--) {
		for (let x = 0; x < 10; x++) {
			if (field[y][x] === 0) {
				continue outer;
			}
		}

		const row = field.splice(y, 1)[0].fill(0);
		field.unshift(row);
		y++;

		points += rowCount * 100;
		rowCount++;
	}
};

const merge = (field, piece) => {
	piece.tetromino.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value > 0) {
				field[y + piece.location.y][x + piece.location.x] = value;
			}
		});
	});
};

const moveDown = () => {
	piece.location.y++;
	if (overlap(field, piece)) {
		hitBottom();
	}
	framesSinceDrop = 0;
};

const moveSideways = direction => {
	piece.location.x += direction;
	if (overlap(field, piece)) {
		piece.location.x -= direction;
	}
};

const newField = () => {
	const field = [];
	for (y = 0; y < 18; y++) {
		field.push(new Array(10).fill(0));
	}
	return field;
}

const newTetromino = () => {
	const random = Math.floor(Math.random() * 7);
	return tetrominoArray[random];
};

const overlap = (field, piece) => {
	const t = piece.tetromino;
	const loc = piece.location;
	let tx = 0;
	let ty = 0;
	for (let y = 0; y < t.length; y++) {
		for (let x = 0; x < t[y].length; x++) {
			tx = loc.x + x;
			ty = loc.y + y;
			if (t[y][x] > 0) {
				if (tx < 0 || tx > 9 || ty < 0 || ty > 17) {
					return true;
				} else if (field[ty][tx] > 0) {
					return true;
				}
			}
		}
	}
};

const dodgeArray = [1, -1, 2, -2, 3, -3];

const turn = () => {
	const location = piece.location.x;
	let index = 0;
	turnClockwise(piece.tetromino);
	while (overlap(field, piece)) {
		piece.location.x = location;
		piece.location.x += dodgeArray[index];
		index++;
		if (index > 5) {
			turnCounter(piece.tetromino);
			piece.location.x = location;
			return;
		}
	}
};

const slam = () => {
	while (!overlap(field, piece)) {
		piece.location.y++;
	}
	hitBottom();
	framesSinceDrop = 0;
};

const transpose = tetromino => {
	const transposed = tetromino[0].map((col, i) => {
		return tetromino.map(row => {
			return row[i];
		})
	});
	for (let y = 0; y < tetromino.length; y++) {
		for (let x = 0; x < tetromino[y].length; x++) {
			tetromino[y][x] = transposed[y][x];
		}
	}
};

const turnClockwise = tetromino => {
	transpose(tetromino);
	tetromino.forEach(row => row.reverse());
};

const turnCounter = tetromino => {
	transpose(tetromino);
	tetromino.reverse();
};

document.addEventListener('keydown', event => {
	if (event.key === 'ArrowLeft') {
		moveSideways(-1);
	} else if (event.key === 'ArrowRight') {
		moveSideways(1);
	} else if (event.key === 'ArrowDown') {
		moveDown();
	} else if (event.key === 'ArrowUp') {
		turn();
	} else if (event.key === '/') {
		slam();
	}
});

const field = newField();

displayPoints();

insertTetromino();

setInterval(eachFrame, 1000 / 30);
// select elements
const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');


// select cvs
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');

// add a border
cvs.style.border = '2px solid #fff';

// mobile adaptaytion
if (document.documentElement.clientWidth < 400) {
    cvs.width = 360;
    cvs.height = 360;
}

// game vars
const FPS = 1000/20;
let loop;
const squareSize = 20;
let gameStarted = false;

// cvs dimentions
const width = cvs.width, 
      height = cvs.height;

// number of vertical/horisontal squares
const horisontalSq = width / squareSize,
      verticalSq = height / squareSize;

// game colors
let boardColor = '#000000',
    headColor = '#FFF',
    bodyColor = '#999';

// directions
let currentDirection = '';
let directionsQueue = [];
const directions = {
    RIGHT: 'ArrowRight',
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown'
};

// draw Board
function drawBoard() {
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, width, height);
}

//  draw Square
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * squareSize,
        y * squareSize, 
        squareSize, 
        squareSize
    );

    ctx.strokeStyle = boardColor;
    ctx.strokeRect(
      x * squareSize,
      y * squareSize,
      squareSize,
      squareSize
    );
}


// snake
let snake = [
    {x: 2, y: 0},
    {x: 1, y: 0},
    {x: 0, y: 0}
];
function drawSnake() {
    snake.forEach((square, index) => {
        const color = index == 0 ? headColor : bodyColor; 
        drawSquare(square.x, square.y, color);
    });
}
function moveSnake() {
    if(!gameStarted) {return;}
    // get head position
    const head = {...snake[0]};

    // consume the directions
    if(directionsQueue.length) {
        currentDirection = directionsQueue.shift();
    }

    // change head position
    switch(currentDirection) {
        case directions.RIGHT:
            head.x += 1;
            break;
        case directions.LEFT:
            head.x -= 1;
            break;
        case directions.UP:
            head.y -= 1;
            break;
        case directions.DOWN:
            head.y += 1;
            break;
    }

    if(hasEatenFood()) {
        food = createFood();
    } else {
        snake.pop();
    }
    // unshift new head
    snake.unshift(head);
}
function hasEatenFood() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// keydown event
document.addEventListener('keydown', (e) => {
    const newDirection = e.key;
    setDirection(newDirection);
});
function setDirection(newDirection) {
    const oldDirection = currentDirection;
    if(
        newDirection === directions.LEFT &&
        oldDirection !== directions.RIGHT ||

        newDirection === directions.RIGHT &&
        oldDirection !== directions.LEFT ||

        newDirection === directions.UP &&
        oldDirection !== directions.DOWN ||

        newDirection === directions.DOWN &&
        oldDirection !== directions.UP

    ) {
        if(!gameStarted) {
            gameStarted = true;
            loop = setInterval(frame, FPS);
        }
        directionsQueue.push(newDirection);
    }
}

// mobile events
let startPoint={};
let nowPoint;
let ldelay;
document.addEventListener('touchstart', function(event) {
    event.stopPropagation();
    startPoint.x = event.changedTouches[0].pageX;
    startPoint.y = event.changedTouches[0].pageY;
    ldelay = new Date();
}, false);
document.addEventListener('touchend', function(event) {
    var pdelay=new Date();
    nowPoint=event.changedTouches[0];
    var xAbs = Math.abs(startPoint.x - nowPoint.pageX);
    var yAbs = Math.abs(startPoint.y - nowPoint.pageY);
    if ((xAbs > 20 || yAbs > 20) && (pdelay.getTime() - ldelay.getTime()) < 200) {
        if (xAbs > yAbs) {
            if (nowPoint.pageX < startPoint.x){setDirection('ArrowLeft');}
            else{setDirection('ArrowRight');}
        }
        else {
            if (nowPoint.pageY < startPoint.y){setDirection('ArrowUp');}
            else{setDirection('ArrowDown');}
        }
    }
}, false);
      
// food
let food = createFood();
function createFood() {
    let food = {
        x: Math.floor(Math.random() * horisontalSq),
        y: Math.floor(Math.random() * verticalSq)
    };
    while(snake.some(square => square.x == food.x && square.y == food.y)) {
        food = {
            x: Math.floor(Math.random() * horisontalSq),
            y: Math.floor(Math.random() * verticalSq)
        };
    }
    return food;
}
function drawFood() {
    drawSquare(food.x, food.y, '#F95700');
}

// score
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
const initialSnakeLength = snake.length;
function renderScore() {
    score = snake.length - initialSnakeLength;
    scoreEl.innerHTML = `⭐ ${score}`;
    highScoreEl.innerHTML = `🏆 ${highScore}`;
}

// hit wall
function hitWall() {
    const head = snake[0];
    return (
        head.x < 0 || head.y < 0 || head.x >= horisontalSq || head.y >= verticalSq 
    );
}

// hit self
function hitSelf() {
    const snakeBody = [...snake];
    const head = snakeBody.shift();

    return snakeBody.some(square => square.x === head.x && square.y === head.y);
}

// game over
let isGameOver = false;
function gameOver() {
    // select scores in a game over screen
    const scoreEl = document.querySelector('.game-over-score .current');
    const highScoreEl = document.querySelector('.game-over-score .high');
    // calc high score
    highScore = Math.max(score, highScore);
    localStorage.setItem('highScore', highScore);
    
    // update scores
    scoreEl.innerHTML = `⭐ ${score}`;
    highScoreEl.innerHTML = `🏆 ${highScore}`;


    gameOverEl.classList.remove('hide');

    isGameOver = true;
}

function frame() {
    drawBoard();
    drawFood();
    moveSnake();
    drawSnake();
    renderScore();

    if(hitWall() || hitSelf()) {
        clearInterval(loop);
        gameOver();
    }
}
frame();


// restart the game
playAgainBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', (e) => {
    if (isGameOver && (e.code === 'Enter' || e.code === 'Escape')) {
        restartGame();
    }
});

function restartGame() {
    // reset snake lenght and position
    snake = [
        {x: 2, y: 0},
        {x: 1, y: 0},
        {x: 0, y: 0}
    ];
    // reset directions
    currentDirection = '';
    directionsQueue = [];

    // hide game over screen
    gameOverEl.classList.add('hide');

    // is game started
    gameStarted = false;

    isGameOver = false;

    // re-draw everything
    food = createFood();
    frame();
}



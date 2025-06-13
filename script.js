// Snake Game with HTML5 Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
const GRID_SIZE = 20;
let snake = [{x: 9 * box, y: 10 * box}];
let direction = 'RIGHT';

// Food always spawns inside the grid and not on the snake
function getRandomFoodPosition() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE) * box,
            y: Math.floor(Math.random() * GRID_SIZE) * box
        };
    } while (collision(pos, snake));
    return pos;
}
let food = getRandomFoodPosition();

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameOver = false;
let speed = 200;
let game = null;
let started = false;
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');
let brokeHighScore = false;

// Responsive canvas for high-DPI screens and mobile
function resizeCanvas() {
    // Always use a size that's a multiple of box and fits the screen
    let size = Math.min(window.innerWidth, window.innerHeight, 400);
    size = Math.floor(size / box) * box;
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Prevent scrolling/zooming on mobile when swiping on canvas or controls
['touchstart', 'touchmove', 'touchend'].forEach(evt => {
    document.body.addEventListener(evt, function(e) {
        if (e.target === canvas || (e.target.classList && e.target.classList.contains('mobile-btn'))) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Show/hide mobile controls based on device
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
window.addEventListener('DOMContentLoaded', () => {
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
        mobileControls.style.display = isTouchDevice() ? 'flex' : 'none';
    }
});

document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;

document.addEventListener('keydown', function(e) {
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
        const startMsg = document.getElementById('startMsg');
        if (startMsg && startMsg.style.display !== 'none') {
            startMsg.style.display = 'none';
        }
        if (!started || gameOver) {
            snake = [{x: 9 * box, y: 10 * box}];
            direction = 'RIGHT';
            food = getRandomFoodPosition();
            score = 0;
            gameOver = false;
            speed = 200;
            brokeHighScore = false;
            started = true;
            document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;
            clearInterval(game);
            game = setInterval(draw, speed);
            if (startMsg) {
                startMsg.innerText = "Press any arrow key to start";
                startMsg.style.display = 'none';
            }
        }
        dir(e);
    }
});

// Mobile controls
function mobileDir(dirKey) {
    const e = {key: dirKey};
    const startMsg = document.getElementById('startMsg');
    if (startMsg && startMsg.style.display !== 'none') {
        startMsg.style.display = 'none';
    }
    if (!started || gameOver) {
        snake = [{x: 9 * box, y: 10 * box}];
        direction = 'RIGHT';
        food = getRandomFoodPosition();
        score = 0;
        gameOver = false;
        speed = 200;
        brokeHighScore = false;
        started = true;
        document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;
        clearInterval(game);
        game = setInterval(draw, speed);
        if (startMsg) {
            startMsg.innerText = "Press any arrow key to start";
            startMsg.style.display = 'none';
        }
    }
    dir(e);
}
document.getElementById('btnUp').addEventListener('touchstart', e => { e.preventDefault(); mobileDir('ArrowUp'); });
document.getElementById('btnDown').addEventListener('touchstart', e => { e.preventDefault(); mobileDir('ArrowDown'); });
document.getElementById('btnLeft').addEventListener('touchstart', e => { e.preventDefault(); mobileDir('ArrowLeft'); });
document.getElementById('btnRight').addEventListener('touchstart', e => { e.preventDefault(); mobileDir('ArrowRight'); });
document.getElementById('btnUp').addEventListener('mousedown', e => { e.preventDefault(); mobileDir('ArrowUp'); });
document.getElementById('btnDown').addEventListener('mousedown', e => { e.preventDefault(); mobileDir('ArrowDown'); });
document.getElementById('btnLeft').addEventListener('mousedown', e => { e.preventDefault(); mobileDir('ArrowLeft'); });
document.getElementById('btnRight').addEventListener('mousedown', e => { e.preventDefault(); mobileDir('ArrowRight'); });

function dir(e) {
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
}

function increaseSpeed() {
    clearInterval(game);
    speed = Math.max(50, 200 - score * 10);
    game = setInterval(draw, speed);
}

function popScoreEffect() {
    const scoreDiv = document.getElementById('score');
    scoreDiv.classList.add('satisfy');
    setTimeout(() => scoreDiv.classList.remove('satisfy'), 350);
}

function highScoreEffect() {
    const scoreDiv = document.getElementById('score');
    scoreDiv.classList.add('highscore-anim');
    setTimeout(() => scoreDiv.classList.remove('highscore-anim'), 1000);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake with animated body curve based on direction
    for (let i = 0; i < snake.length; i++) {
        let segment = snake[i];

        // Head
        if (i === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(segment.x + box / 2, segment.y + box / 2, box / 2, 0, 2 * Math.PI);
            ctx.fillStyle = "#3c3";
            ctx.shadowColor = "#0f0";
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Eyes (forward facing)
            ctx.fillStyle = "#111";
            let eyeOffset = box * 0.18;
            let eyeX1 = segment.x + box / 2 + (direction === 'LEFT' ? -eyeOffset : direction === 'RIGHT' ? eyeOffset : -eyeOffset);
            let eyeY1 = segment.y + box / 2 + (direction === 'UP' ? -eyeOffset : direction === 'DOWN' ? eyeOffset : -eyeOffset);
            let eyeX2 = segment.x + box / 2 + (direction === 'LEFT' ? -eyeOffset : direction === 'RIGHT' ? eyeOffset : eyeOffset);
            let eyeY2 = segment.y + box / 2 + (direction === 'UP' ? -eyeOffset : direction === 'DOWN' ? eyeOffset : eyeOffset);
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 2.5, 0, 2 * Math.PI);
            ctx.arc(eyeX2, eyeY2, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            // Nostrils
            ctx.fillStyle = "#191";
            ctx.beginPath();
            ctx.arc(segment.x + box / 2 - 3, segment.y + box / 2 + 6, 1, 0, 2 * Math.PI);
            ctx.arc(segment.x + box / 2 + 3, segment.y + box / 2 + 6, 1, 0, 2 * Math.PI);
            ctx.fill();

            // Forked tongue
            if (!gameOver && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = "#f44";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                let tx = segment.x + box / 2 + (direction === 'LEFT' ? -box / 1.5 : direction === 'RIGHT' ? box / 1.5 : 0);
                let ty = segment.y + box / 2 + (direction === 'UP' ? -box / 1.5 : direction === 'DOWN' ? box / 1.5 : 0);
                ctx.moveTo(segment.x + box / 2, segment.y + box / 2);
                ctx.lineTo(tx, ty);
                // Fork
                if (direction === 'LEFT' || direction === 'RIGHT') {
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx, ty - 4);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx, ty + 4);
                } else {
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx - 4, ty);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx + 4, ty);
                }
                ctx.stroke();
            }
            ctx.restore();
        }
        // Body with curve animation
        else {
            ctx.save();

            let prev = snake[i - 1];
            let next = snake[i + 1] || segment;

            let dxPrev = segment.x - prev.x;
            let dyPrev = segment.y - prev.y;
            let dxNext = next.x - segment.x;
            let dyNext = next.y - segment.y;

            let anglePrev = Math.atan2(dyPrev, dxPrev);
            let angleNext = Math.atan2(dyNext, dxNext);
            let midAngle = (anglePrev + angleNext) / 2;

            let wave = Math.sin(Date.now() / 120 + i) * 4 * (i % 2 === 0 ? 1 : -1);

            let cx = segment.x + box / 2 + Math.cos(midAngle + Math.PI / 2) * wave;
            let cy = segment.y + box / 2 + Math.sin(midAngle + Math.PI / 2) * wave;

            ctx.beginPath();
            ctx.ellipse(
                cx,
                cy,
                box / 2.15,
                box / 2.5,
                midAngle,
                0,
                2 * Math.PI
            );
            let grad = ctx.createRadialGradient(
                cx, cy, box / 4,
                cx, cy, box / 2
            );
            grad.addColorStop(0, "#6f6");
            grad.addColorStop(1, "#191");
            ctx.fillStyle = grad;
            ctx.globalAlpha = i === snake.length - 1 ? 0.7 : 1;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // Draw food as a glowing, pulsing circle
    ctx.save();
    ctx.shadowColor = "#f00";
    ctx.shadowBlur = 18 + 8 * Math.abs(Math.sin(Date.now()/300));
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2 + 2 * Math.abs(Math.sin(Date.now()/300)), 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    if (!started) return;

    // Move snake
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === 'LEFT') headX -= box;
    if (direction === 'UP') headY -= box;
    if (direction === 'RIGHT') headX += box;
    if (direction === 'DOWN') headY += box;

    // WRAP-AROUND LOGIC (NO WALLS)
    if (headX < 0) headX = (GRID_SIZE - 1) * box;
    if (headX >= box * GRID_SIZE) headX = 0;
    if (headY < 0) headY = (GRID_SIZE - 1) * box;
    if (headY >= box * GRID_SIZE) headY = 0;

    // Check collision with self only
    if (collision({x: headX, y: headY}, snake)) {
        clearInterval(game);
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEffect();
        }
        document.getElementById('score').innerText = `Game Over! Final Score: ${score} | High: ${highScore}`;
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        brokeHighScore = false;
        started = false;
        const startMsg = document.getElementById('startMsg');
        if (startMsg) {
            startMsg.innerText = "Press any arrow key to start playing again";
            startMsg.style.display = '';
        }
        return;
    }

    // Check if snake eats food
    if (headX === food.x && headY === food.y) {
        score++;
        document.getElementById('score').innerText = `Score: ${score} | High: ${highScore}`;
        popScoreEffect();
        eatSound.currentTime = 0;
        eatSound.play();
        if (score > highScore && !brokeHighScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEffect();
            brokeHighScore = true;
        }
        food = getRandomFoodPosition();
        increaseSpeed();
    } else {
        snake.pop();
    }

    snake.unshift({x: headX, y: headY});
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

document.getElementById('resetBtn').onclick = function() {
    snake = [{x: 9 * box, y: 10 * box}];
    direction = 'RIGHT';
    food = getRandomFoodPosition();
    score = 0;
    gameOver = false;
    speed = 200;
    brokeHighScore = false;
    started = false;
    document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;
    clearInterval(game);

    const startMsg = document.getElementById('startMsg');
    if (startMsg) {
        startMsg.innerText = "Press any arrow key to start";
        startMsg.style.display = '';
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Snake Game with HTML5 Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
let snake = [{x: 9 * box, y: 10 * box}];
let direction = 'RIGHT';
let food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameOver = false;
let speed = 200; // Start slow
let game = null;
let started = false;
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');
let brokeHighScore = false;

document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;

document.addEventListener('keydown', function(e) {
    // Allow arrow keys to start or restart the game
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
        const startMsg = document.getElementById('startMsg');
        if (startMsg && startMsg.style.display !== 'none') {
            startMsg.style.display = 'none';
        }
        if (!started || gameOver) {
            // Reset everything if game is over or not started
            snake = [{x: 9 * box, y: 10 * box}];
            direction = 'RIGHT';
            food = {
                x: Math.floor(Math.random() * 20) * box,
                y: Math.floor(Math.random() * 20) * box
            };
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
    // Simulate keydown for mobile
    const e = {key: dirKey};
    const startMsg = document.getElementById('startMsg');
    if (startMsg && startMsg.style.display !== 'none') {
        startMsg.style.display = 'none';
    }
    if (!started || gameOver) {
        snake = [{x: 9 * box, y: 10 * box}];
        direction = 'RIGHT';
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
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

// Also support mouse click for mobile buttons (for emulators)
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
    speed = Math.max(50, 200 - score * 10); // Speed up as score increases
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

    // Draw snake with rounded corners and gradient
    for (let i = 0; i < snake.length; i++) {
        let segment = snake[i];
        let grad = ctx.createLinearGradient(segment.x, segment.y, segment.x + box, segment.y + box);
        grad.addColorStop(0, i === 0 ? '#0f0' : '#fff');
        grad.addColorStop(1, '#222');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(segment.x + 4, segment.y);
        ctx.lineTo(segment.x + box - 4, segment.y);
        ctx.quadraticCurveTo(segment.x + box, segment.y, segment.x + box, segment.y + 4);
        ctx.lineTo(segment.x + box, segment.y + box - 4);
        ctx.quadraticCurveTo(segment.x + box, segment.y + box, segment.x + box - 4, segment.y + box);
        ctx.lineTo(segment.x + 4, segment.y + box);
        ctx.quadraticCurveTo(segment.x, segment.y + box, segment.x, segment.y + box - 4);
        ctx.lineTo(segment.x, segment.y + 4);
        ctx.quadraticCurveTo(segment.x, segment.y, segment.x + 4, segment.y);
        ctx.closePath();
        ctx.shadowColor = "#0f0";
        ctx.shadowBlur = i === 0 ? 14 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw eyes on the head
        if (i === 0) {
            ctx.fillStyle = '#000';
            let eyeOffsetX = direction === 'LEFT' ? 4 : direction === 'RIGHT' ? 12 : 4;
            let eyeOffsetY = direction === 'UP' ? 4 : direction === 'DOWN' ? 12 : 4;
            ctx.beginPath();
            ctx.arc(segment.x + eyeOffsetX, segment.y + eyeOffsetY, 2, 0, 2 * Math.PI);
            ctx.arc(segment.x + box - eyeOffsetX, segment.y + eyeOffsetY, 2, 0, 2 * Math.PI);
            ctx.fill();

            // Animate tongue flick
            if (!gameOver && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = "#f44";
                ctx.lineWidth = 2;
                ctx.beginPath();
                let tx = segment.x + box / 2 + (direction === 'LEFT' ? -8 : direction === 'RIGHT' ? 8 : 0);
                let ty = segment.y + box / 2 + (direction === 'UP' ? -8 : direction === 'DOWN' ? 8 : 0);
                ctx.moveTo(segment.x + box / 2, segment.y + box / 2);
                ctx.lineTo(tx, ty);
                ctx.stroke();
                ctx.lineWidth = 1;
            }
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

    // Don't move until started
    if (!started) return;

    // Move snake
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === 'LEFT') headX -= box;
    if (direction === 'UP') headY -= box;
    if (direction === 'RIGHT') headX += box;
    if (direction === 'DOWN') headY += box;

    // Check collision with walls or self
    if (
        headX < 0 || headX >= canvas.width ||
        headY < 0 || headY >= canvas.height ||
        collision({x: headX, y: headY}, snake)
    ) {
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
        // Show the restart message
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
        // Animate high score if just broken
        if (score > highScore && !brokeHighScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEffect();
            brokeHighScore = true;
        }
        // Make sure food doesn't spawn on the snake
        do {
            food = {
                x: Math.floor(Math.random() * 20) * box,
                y: Math.floor(Math.random() * 20) * box
            };
        } while (collision(food, snake));
        increaseSpeed(); // Speed up as score increases
    } else {
        snake.pop();
    }

    // Add new head
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

// Reset button logic
document.getElementById('resetBtn').onclick = function() {
    // Reset all game state as if the page was just opened (except high score)
    snake = [{x: 9 * box, y: 10 * box}];
    direction = 'RIGHT';
    food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
    score = 0;
    gameOver = false;
    speed = 200;
    brokeHighScore = false;
    started = false;
    document.getElementById('score').innerText = `Score: 0 | High: ${highScore}`;
    clearInterval(game);

    // Show the initial start message
    const startMsg = document.getElementById('startMsg');
    if (startMsg) {
        startMsg.innerText = "Press any arrow key to start";
        startMsg.style.display = '';
    }

    // Optionally, clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

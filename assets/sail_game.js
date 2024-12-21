// Advanced Sailing Game with Top-Down Realistic Physics
// A sophisticated sailing game with precise dynamics for gybing, tacking, and wind interaction.

// HTML Elements
const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
gameContainer.style.position = 'fixed';
gameContainer.style.top = '0';
gameContainer.style.left = '0';
gameContainer.style.width = '100%';
gameContainer.style.height = '100%';
gameContainer.style.zIndex = '1000';
gameContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
gameContainer.style.display = 'none';
document.body.appendChild(gameContainer);

const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gameContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Game Variables
let boat = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 30,
    angle: 0,
    speed: 0,
    maxSpeed: 4,
    turnSpeed: 0.02,
    sailAngle: Math.PI / 6, // Initial sail angle
    rudderAngle: 0, // Controls steering
    lastGybeTack: null,
    inIrons: false, // Stuck facing into the wind
};
let wind = {
    direction: Math.PI / 3, // Wind direction in radians
    speed: 2.5, // Wind speed
    animation: []
};
let stars = [];
let keys = { w: false, a: false, s: false, d: false };
let gameActive = false;

// Helper Functions
function drawBoat() {
    ctx.save();
    ctx.translate(boat.x, boat.y);
    ctx.rotate(boat.angle);

    // Draw hull (pixel-style)
    ctx.fillStyle = '#555'; // Hull color
    ctx.beginPath();
    ctx.moveTo(0, -boat.height); // Bow
    ctx.lineTo(-boat.width / 2, boat.height / 2); // Stern left
    ctx.lineTo(boat.width / 2, boat.height / 2); // Stern right
    ctx.closePath();
    ctx.fill();

    // Draw deck
    ctx.fillStyle = '#888'; // Deck color
    ctx.fillRect(-boat.width / 4, -boat.height / 4, boat.width / 2, boat.height / 2);

    // Draw sail (pixel-style)
    ctx.fillStyle = 'white'; // Sail color
    ctx.beginPath();
    ctx.moveTo(0, -boat.height); // Mast base
    ctx.lineTo(
        boat.height * 1.5 * Math.sin(boat.sailAngle),
        -boat.height * 1.5 * Math.cos(boat.sailAngle)
    ); // Sail tip
    ctx.lineTo(0, -boat.height / 2); // Back to mast base
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawWindArrow() {
    const arrowLength = 60;
    const arrowX = canvas.width - 100;
    const arrowY = 50;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(wind.direction);

    // Draw arrow
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(arrowLength, 0);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowLength, 0);
    ctx.lineTo(arrowLength - 10, -5);
    ctx.lineTo(arrowLength - 10, 5);
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();

    ctx.restore();
}

function spawnStars() {
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
        });
    }
}

function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function moveStars() {
    stars.forEach(star => {
        star.x -= wind.speed * Math.cos(wind.direction) * 0.5;
        star.y -= wind.speed * Math.sin(wind.direction) * 0.5;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
}

function applyWind() {
    const apparentWind = wind.direction - boat.angle; // Relative wind direction
    const sailEffect = Math.cos(apparentWind - boat.sailAngle);

    if (Math.abs(apparentWind) < Math.PI / 4) {
        boat.inIrons = true;
        boat.speed = 0; // Stuck in irons
        displayFeedback('In Irons! Turn to catch the wind.');
    } else {
        boat.inIrons = false;
        boat.speed = wind.speed * sailEffect * 0.5;
    }

    boat.x += boat.speed * Math.cos(boat.angle);
    boat.y += boat.speed * Math.sin(boat.angle);

    if (boat.x < 0) boat.x = canvas.width;
    if (boat.x > canvas.width) boat.x = 0;
    if (boat.y < 0) boat.y = canvas.height;
    if (boat.y > canvas.height) boat.y = 0;
}

function displayFeedback(message) {
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText(message, canvas.width / 2 - 100, 50);
}

function updateWind() {
    if (Math.random() < 0.01) {
        wind.direction += (Math.random() - 0.5) * Math.PI / 8; // Slight random shifts
        wind.speed = 1 + Math.random() * 2;
    }
    if (wind.animation.length < 30) {
        wind.animation.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }
}

function drawWindIndicator() {
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Wind: ${(wind.direction * 180 / Math.PI).toFixed(1)}°`, 10, 30);
    ctx.fillText(`Speed: ${wind.speed.toFixed(1)}`, 10, 50);
}

function handleBoatMovement() {
    if (keys.a) {
        boat.angle -= boat.turnSpeed;
    } else if (keys.d) {
        boat.angle += boat.turnSpeed;
    }

    if (keys.w) {
        boat.sailAngle -= 0.02; // Open sail
        if (boat.sailAngle < 0) boat.sailAngle = 0;
    } else if (keys.s) {
        boat.sailAngle += 0.02; // Close sail
        if (boat.sailAngle > Math.PI / 2) boat.sailAngle = Math.PI / 2;
    }

    boat.x += boat.speed * Math.cos(boat.angle);
    boat.y += boat.speed * Math.sin(boat.angle);

    if (boat.x < 0) boat.x = canvas.width;
    if (boat.x > canvas.width) boat.x = 0;
    if (boat.y < 0) boat.y = canvas.height;
    if (boat.y > canvas.height) boat.y = 0;
}

// Player Input
window.addEventListener('keydown', e => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', e => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

// Game Loop
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw elements
    updateWind();
    moveStars();
    applyWind();
    handleBoatMovement();

    drawStars();
    drawWindArrow();
    drawBoat();
    drawWindIndicator();

    requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    gameContainer.style.display = 'block';
    boat.x = canvas.width / 2;
    boat.y = canvas.height / 2;
    spawnStars();
    gameActive = true;
    gameLoop();
}

// Exit Game
function exitGame() {
    gameContainer.style.display = 'none';
    stars = [];
    wind.animation = [];
    gameActive = false;
}

// Easter Egg Trigger
window.addEventListener('keydown', e => {
    if (e.key === 'g') startGame();
});

// Exit Trigger
gameContainer.addEventListener('click', exitGame);

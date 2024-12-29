// Dithered Sailing Tutorial Game
// A lightweight educational sailing game with retro aesthetics

// Remove export default and just declare the class
class SailingGame {
    constructor() {
        try {
            console.log('SailingGame constructor called...');

            // Initialize game state first
            this.gameState = {
                active: false,
                tutorial: true,
                tutorialStep: 0,
                score: 0
            };

            // Initialize boat properties before using them
            this.boat = {
                x: 0,
                y: 0,
                angle: 0,
                sailAngle: 0,
                speed: 0,
                maxSpeed: 5,
                size: 20,
                turning: 0,
                adjustingSail: 0
            };

            // Initialize wind after boat
            this.wind = {
                angle: Math.PI / 4,
                speed: 2,
                particles: []
            };

            // Setup canvas and context
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            // Now setup the game with everything initialized
            this.setupGame();
            this.setupEventListeners();
            this.startGameLoop(); // Make sure game loop is running
            // Don't start game loop until explicitly started
            this.gameState.active = false;
        } catch(e) {
            console.error('Error in SailingGame constructor:', e);
            throw e;
        }
    }

    setupGame() {
        console.log('Setting up game elements...');
        // Create and style container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(27, 58, 75, 0.95);
            display: none;
            font-family: 'Inter', sans-serif;
        `;

        // Setup canvas
        this.canvas.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `;
        this.resizeCanvas();
        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.generateWindParticles();
        console.log('Game elements setup complete.');
    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        this.canvas.width = size;
        this.canvas.height = size;
        this.resetBoatPosition();
        console.log('Canvas resized to:', size);
    }

    resetBoatPosition() {
        this.boat.x = this.canvas.width / 2;
        this.boat.y = this.canvas.height / 2;
        console.log('Boat position reset to center:', this.boat.x, this.boat.y);
    }

    generateWindParticles() {
        this.wind.particles = [];
        for (let i = 0; i < 100; i++) {
            this.wind.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1
            });
        }
        console.log('Wind particles generated:', this.wind.particles.length);
    }

    drawDitheredCircle(x, y, radius, density = 0.3) {
        const points = Math.floor(radius * radius * Math.PI * density);
        for (let i = 0; i < points; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            this.ctx.fillRect(px, py, 1, 1);
        }
    }

    drawBoat() {
        console.log('Drawing boat at position:', this.boat.x, this.boat.y);
        this.ctx.save();
        this.ctx.translate(this.boat.x, this.boat.y);
        this.ctx.rotate(this.boat.angle);

        // Hull
        this.ctx.fillStyle = '#fff';
        this.drawDitheredCircle(0, 0, this.boat.size, 0.8);

        // Sail
        const sailLength = this.boat.size * 1.5;
        const sailEnd = {
            x: Math.sin(this.boat.sailAngle) * sailLength,
            y: -Math.cos(this.boat.sailAngle) * sailLength
        };
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(sailEnd.x, sailEnd.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawWindParticles() {
        console.log('Rendering wind particles...');
        this.ctx.fillStyle = '#ffffff33';
        for (const particle of this.wind.particles) {
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

            particle.x += Math.cos(this.wind.angle) * particle.speed;
            particle.y += Math.sin(this.wind.angle) * particle.speed;

            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        }
    }

    updateBoatPhysics() {
        console.log('Boat position before update:', this.boat.x, this.boat.y);
        // Calculate relative angles
        const windRelativeAngle = ((this.wind.angle - this.boat.angle + Math.PI) % (Math.PI * 2)) - Math.PI;
        const sailRelativeAngle = ((this.boat.sailAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
        
        // Calculate effective wind force
        const windForce = Math.cos(windRelativeAngle - sailRelativeAngle);
        const targetSpeed = this.wind.speed * Math.abs(windForce) * 0.8;

        // Smooth speed changes
        this.boat.speed += (targetSpeed - this.boat.speed) * 0.1;
        
        // Apply movement
        this.boat.x += Math.cos(this.boat.angle) * this.boat.speed;
        this.boat.y += Math.sin(this.boat.angle) * this.boat.speed;

        console.log('Boat position after update:', this.boat.x, this.boat.y);

        // Wrap around screen
        this.boat.x = (this.boat.x + this.canvas.width) % this.canvas.width;
        this.boat.y = (this.boat.y + this.canvas.height) % this.canvas.height;

        // Update turning
        if (this.boat.turning !== 0) {
            this.boat.angle += this.boat.turning * 0.05;
        }

        // Update sail
        if (this.boat.adjustingSail !== 0) {
            this.boat.sailAngle += this.boat.adjustingSail * 0.05;
            this.boat.sailAngle = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.boat.sailAngle));
        }
    }

    gameLoop() {
        if (!this.gameState.active) return;

        console.log('Game loop running...'); // Log every game loop iteration

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Properly clears the canvas

        // Draw background and wind particles
        this.ctx.fillStyle = '#002b36'; // Debug solid color for visibility
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWindParticles();

        // Update and draw the boat
        this.updateBoatPhysics();
        this.drawBoat();

        // Draw UI elements
        this.drawCompass();
        this.drawTutorial();

        // Request next animation frame
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        console.log('Starting game...');
        this.container.style.display = 'block';
        this.resetBoatPosition();
        this.generateWindParticles();
        this.gameState.active = true;
        this.gameState.tutorial = true;
        this.gameState.tutorialStep = 0;
        requestAnimationFrame(() => this.gameLoop());  // Ensure game loop starts
        console.log('Game state activated:', this.gameState);
    }

    stop() {
        console.log('Stopping game...');
        this.container.style.display = 'none';
        this.gameState.active = false;
    }

    startGameLoop() {
        console.log('Starting game loop...');
        this.gameLoop();
    }

    drawCompass() {
        console.log('Drawing compass...');
        const radius = 30;
        const cx = this.canvas.width - radius - 20;
        const cy = radius + 20;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        
        // Compass circle
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Wind direction
        this.ctx.rotate(this.wind.angle);
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius);
        this.ctx.lineTo(0, radius);
        this.ctx.stroke();

        // Boat direction
        this.ctx.rotate(this.boat.angle - this.wind.angle);
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius * 0.7);
        this.ctx.lineTo(0, radius * 0.7);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawTutorial() {
        if (!this.gameState.tutorial) return;

        console.log('Rendering tutorial step:', this.gameState.tutorialStep);
        const messages = [
            "Welcome to Sailing! Press SPACE to start",
            "Use A/D to turn the boat",
            "Use W/S to adjust the sail",
            "Try to catch the wind! Watch the compass",
            "Stay in the sweet spot for speed",
            "You're ready to sail! Press SPACE to start racing"
        ];

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px "Inter"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            messages[this.gameState.tutorialStep],
            this.canvas.width / 2,
            this.canvas.height - 40
        );
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.gameState.active && e.key.toLowerCase() === 'g') {
                this.start();
                return;
            }
            
            if (!this.gameState.active) return;
            
            switch(e.key.toLowerCase()) {
                case 'a': this.boat.turning = -1; break;
                case 'd': this.boat.turning = 1; break;
                case 'w': this.boat.adjustingSail = -1; break;
                case 's': this.boat.adjustingSail = 1; break;
                case ' ':
                    if (this.gameState.tutorial) {
                        this.gameState.tutorialStep++;
                        if (this.gameState.tutorialStep >= 6) {
                            this.gameState.tutorial = false;
                        }
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'a': if (this.boat.turning === -1) this.boat.turning = 0; break;
                case 'd': if (this.boat.turning === 1) this.boat.turning = 0; break;
                case 'w': if (this.boat.adjustingSail === -1) this.boat.adjustingSail = 0; break;
                case 's': if (this.boat.adjustingSail === 1) this.boat.adjustingSail = 0; break;
            }
        });

        window.addEventListener('resize', () => this.resizeCanvas());

        // Exit game on click outside canvas
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.stop();
        });
    }
}

// Add global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.message);
});

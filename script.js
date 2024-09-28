const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particleArray = [];
let adjustX = 5;
let adjustY = 10;

// Scaling factors based on screen size
const scaleFactor = window.innerWidth / 800; // Assume 800px as base width
const textFontSize = 15 * scaleFactor; // Scale font size
const particleSize = 0.8 * scaleFactor; // Scale particle size

// handle mouse
const mouse = {
    x: null,
    y: null,
    radius: 25 * scaleFactor // Scale radius for touch interaction
};

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// handle touch events
canvas.addEventListener('touchstart', function(event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', function(event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
});

canvas.addEventListener('touchend', function() {
    mouse.x = null;
    mouse.y = null;
});

ctx.fillStyle = 'white';
ctx.font = `${textFontSize}px Verdana`; // Dynamically adjust font size
ctx.fillText('Archiology', 10, 30);
const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = particleSize; // Scale particle size
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 40) + 5;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function init() {
    particleArray = [];
    for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x + adjustX;
                let positionY = y + adjustY;
                particleArray.push(new Particle(positionX * 3.5 * scaleFactor, positionY * 3.5 * scaleFactor)); // Scale particle positions
            }
        }
    }
}

init();
console.log(particleArray);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].draw();
        particleArray[i].update();
    }

    requestAnimationFrame(animate);
}
animate();

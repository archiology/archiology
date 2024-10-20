window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d', {
        willReadFrequently: true
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Define the Particle class
    class Particle {
        constructor(effect, x, y, color) {
            this.effect = effect;
            this.x = Math.random() * this.effect.canvasWidth;
            this.y = this.effect.canvasHeight;
            this.color = color;
            this.originX = x;
            this.originY = y;
            this.size = this.effect.gap;
            this.dx = 0;
            this.dy = 0;
            this.vx = 0;
            this.vy = 0;
            this.force = 0;
            this.angle = 0;
            this.distance = 0;
                // change mouse
            this.friction = Math.random() * 0.6 + 0.15;
            this.ease = Math.random() * 0.1 + 0.005;
        }

        draw() {
            this.effect.context.fillStyle = this.color;
            this.effect.context.fillRect(this.x, this.y, this.size, this.size);
        }

        update() {
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;
            this.force = -this.effect.mouse.radius / this.distance;
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);

            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        }
    }

    // Define the Effect class
    class Effect {
        constructor(context, canvasWidth, canvasHeight) {
            this.context = context;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
                // Define text location
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 4;
            this.fontSize = 70;
            this.lineHeight = this.fontSize * 1.1;
            this.maxTextWidth = this.canvasWidth * 0.8;
            this.textInput = document.getElementById('textInput');
            this.verticalOffset = 0;

            this.textInput.addEventListener('keyup', (e) => {
                if (e.key !== ' ') {
                    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                    this.wrapText(e.target.value);
                }
            });

            // particle text
            this.particles = [];
            this.gap = 1;
            this.mouse = {
                radius: 20000,
                x: 0,
                y: 0
            };

            window.addEventListener('mousemove', e => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
            
            // handle touch events
            canvas.addEventListener('touchstart', (event) => {
                this.mouse.x = event.touches[0].clientX;
                this.mouse.y = event.touches[0].clientY;
            });

            canvas.addEventListener('touchmove', (event) => {
                this.mouse.x = event.touches[0].clientX;
                this.mouse.y = event.touches[0].clientY;
            });

            canvas.addEventListener('touchend', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
// Define the text 
wrapText(text) {
    const gradient = this.context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
    gradient.addColorStop(0.3, 'blue');
    gradient.addColorStop(0.4, 'magenta');
    gradient.addColorStop(0.5, 'yellow');
    this.context.fillStyle = gradient;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';  // Use 'middle' for vertical centering
    this.context.lineWidth = 3;
    this.context.strokeStyle = 'orange';
    this.context.font = this.fontSize + 'px Helvetica';

    let linesArray = [];
    let words = text.split(' ');
    let lineCounter = 0;
    let line = '';

    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        // Only break if the testLine exceeds maxTextWidth
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
            linesArray[lineCounter] = line.trim(); // Store current line
            line = words[i] + ' ';  // Start new line with the current word
            lineCounter++;
        } else {
            line = testLine;
        }
    }
    linesArray[lineCounter] = line.trim(); // Add last line

    let textHeight = this.lineHeight * (lineCounter + 1);  // Total height of the text block
    let y = this.canvasHeight / 3 - textHeight / 1.5;  // Center vertically

    linesArray.forEach((el, index) => {
        // Use textX and dynamic Y positioning to center each line vertically
        this.context.fillText(el, this.textX, y + (index * this.lineHeight));
    });

    this.convertToParticles(); // Convert the new text into particles
}


        convertToParticles() {
            this.particles = [];
            const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            for (let y = 0; y < this.canvasHeight; y += this.gap) {
                for (let x = 0; x < this.canvasWidth; x += this.gap) {
                    const index = (y * this.canvasWidth + x) * 4;
                    const alpha = pixels[index + 3];
                    if (alpha > 0) {
                        const red = pixels[index];
                        const green = pixels[index + 1];
                        const blue = pixels[index + 2];
                        const color = `rgb(${red}, ${green}, ${blue})`;
                        this.particles.push(new Particle(this, x, y, color));
                    }
                }
            }
            console.log(this.particles);
        }

        render() {
            this.particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
        }

        resize(width, height) {
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.textX = this.canvasWidth / 2;
            this.textY = this.canvasHeight / 4;
            this.maxTextWidth = this.canvasWidth * 0.8;
        }
    }

    const effect = new Effect(ctx, canvas.width, canvas.height);
    effect.wrapText('Archiology.');
    effect.render();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.render();
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', function(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        effect.resize(canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
        effect.wrapText(effect.textInput.value || 'Archiology.'); // Wrap text again after resizing
    });
    
      // Prevent scrolling on touchmove
    window.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, { passive: false });

    // Prevent scrolling on mouse wheel (if desired)
    window.addEventListener('wheel', function (e) {
        e.preventDefault();
    }, { passive: false });

    // Prevent scrolling on spacebar and arrow keys
    window.addEventListener('keydown', function (e) {
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
            e.preventDefault();
        }
    });

});

class Transition {
    constructor() {
        this.canvas = document.getElementById('transition-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    animate(callback) {
        const circles = [];
        const maxRadius = Math.sqrt(this.width * this.width + this.height * this.height);
        let currentRadius = 0;
        const speed = 15;

        const animate = () => {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // 繪製魔法圓圈
            currentRadius += speed;
            circles.push({
                x: this.width / 2,
                y: this.height / 2,
                radius: currentRadius,
                alpha: 0.5
            });

            for (let i = circles.length - 1; i >= 0; i--) {
                const circle = circles[i];
                circle.alpha *= 0.95;

                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(230, 201, 168, ${circle.alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                if (circle.alpha < 0.01) {
                    circles.splice(i, 1);
                }
            }

            if (currentRadius < maxRadius) {
                requestAnimationFrame(animate);
            } else {
                this.canvas.style.display = 'none';
                if (callback) callback();
            }
        };

        this.canvas.style.display = 'block';
        animate();
    }
}

// 在頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.transition = new Transition();
}); 
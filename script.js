class Asteriod {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        const size = [60, 70, 80, 90, 100];
        const randomIndex = Math.floor(Math.random() * size.length);
        this.width = size[randomIndex];
        this.height = size[randomIndex];
        this.speed_x = 0;
        this.speed_y = 0;
        this.image = document.getElementById('asteriod');
        if (Math.random() < 0.5) {
            this.x = Math.random() * this.game.width;
            this.y = Math.random() < 0.5 ? 0 : this.game.height;
        }
        else {
            this.x = Math.random() < 0.5 ? 0 : this.game.width;
            this.y = Math.random() * this.game.height;
        }
        this.speed_x = Math.random() * 6 - 3;
        this.speed_y = Math.random() * 6 - 3;
    }
    draw(context) {
        context.strokeRect(this.x, this.y, this.width, this.height)
        context.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    update() {
        this.x += this.speed_x;
        this.y += this.speed_y;
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;
        this.width = 120;
        this.height = 40;
        this.image = document.getElementById('player');
        this.speed = 3;
    }

    update(direction) {
        this.collisionDetection();
        if (direction.includes("ArrowRight")) this.x = this.x + this.speed;
        else if (direction.includes("ArrowLeft")) this.x = this.x - this.speed;
        else if (direction.includes("ArrowUp")) this.y = this.y - this.speed;
        else if (direction.includes("ArrowDown")) this.y = this.y + this.speed;
    }

    draw(context) {
        context.strokeStyle = "gray";
        context.strokeRect(this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height)
        context.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height)
    }
    collisionDetection() {
        this.game.asteroids.forEach(ast => {
            if (
                (ast.x < this.x - this.width * 0.5 + this.width) &&
                (ast.x + ast.width > this.x - this.width * 0.5) &&
                (ast.y < this.y - this.height * 0.5 + this.height) &&
                (ast.y + ast.height > this.y - this.height * 0.5)
            ) {
                this.game.gameOver = true;
            }
        });
    }
}


class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.player = new Player(this);
        this.asteroids = [];
        this.createAsteroids();
        this.arrows = [];
        this.aTimer = 0;
        this.aInterval = 250;
        this.gameOver = false;
        this.currentTime = 0;

        window.addEventListener("keydown", (e) => {
            const key = e.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if ((key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown") && this.arrows.indexOf(key) === -1) {
                this.arrows.push(key);
            }
        })
        window.addEventListener("keyup", (e) => {
            const key = e.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
            if ((key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown")) {
                this.arrows.splice(this.arrows.indexOf(key), 1);
            }
        })

        window.addEventListener("resize", () => {
            this.canvas.width = this.window.innerWidth;
            this.canvas.height = this.window.innerHeight;
        })
    }

    render(context, deltaTime) {
        this.currentTime += deltaTime;

        this.player.draw(context);

        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw(context);
            this.asteroids[i].update();
            if (this.asteroids[i].x < 0 - this.asteroids[i].width || this.asteroids[i].x > this.width ||
                this.asteroids[i].y < 0 - this.asteroids[i].height || this.asteroids[i].y > this.height) {
                this.asteroids.splice(i, 1);
                i--;
            }
        }
        if (!this.gameOver) {
            if (this.aTimer < this.aInterval) {
                this.aTimer += deltaTime;
            }
            else {
                this.aTimer = 0;
                this.asteroids.push(new Asteriod(this))
            }
        }
        this.drawText(context);
    }

    update() {
        this.player.update(this.arrows);
    }

    createAsteroids() {
        for (let i = 0; i < 15; i++) {
            this.asteroids.push(new Asteriod(this));
        }
    }

    drawText(context) {
        context.save();
        context.font = '30px Impact';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillStyle = "white";
        context.shadowColor = "black";
        context.shadowBlur = 10;
        context.fillText('Best time: ' + formatTime(localStorage.bestTime ? 0 : localStorage.bestTime), 20, 10)
        context.fillText('Time: ' + formatTime(this.currentTime), 20, 50)

        if (this.gameOver) {
            if (!localStorage.bestTime || this.currentTime > localStorage.bestTime) {
                localStorage.bestTime = this.currentTime
            }
            context.textAlign = 'center';
            context.font = '60px Impact';
            context.fillStyle = "red";
            context.shadowColor = "gray";
            context.shadowBlur = 8;
            context.fillText("GAME OVER", this.width * 0.5, this.height * 0.5)
        }
        context.restore();
    }

}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = this.window.innerWidth;
    canvas.height = this.window.innerHeight;

    const game = new Game(canvas);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.render(ctx, deltaTime);
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    this.requestAnimationFrame(animate);
});

function formatTime(ms) {
    const min = Math.floor(ms / (60 * 1000));
    const sec = Math.floor((ms % (60 * 1000)) / 1000);
    const msec = (ms % 1000);
    const formattedMinutes = min.toString().padStart(2, '0');
    const formattedSeconds = sec.toString().padStart(2, '0');
    const formattedMilliseconds = msec.toString().padStart(3, '0').slice(0, 3);

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}
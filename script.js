class Asteriod {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        const size = [60, 70, 80, 90, 100]; //possible asteroid sizes
        const randomIndex = Math.floor(Math.random() * size.length); //choose size randomly
        this.width = size[randomIndex]; //initialize size
        this.height = size[randomIndex];
        this.speed_x = 0;
        this.speed_y = 0;
        this.image = document.getElementById('asteriod'); //fetch the asteroid image
        //randomly choose asteroid initial position
        if (Math.random() < 0.5) { //in 50% of the cases
            this.x = Math.random() * this.game.width; //set it random horizontally
            this.y = Math.random() < 0.5 ? 0 : this.game.height; //in 50% of cases set it to top (0) or bottom (height)
        }
        else {
            this.x = Math.random() < 0.5 ? 0 : this.game.width; //in 50% of cases set it left (0) or right (width)
            this.y = Math.random() * this.game.height; //set the point somewhere vertically
        }
        this.speed_x = Math.random() * 6 - 3; //random number between -3 and 3
        this.speed_y = Math.random() * 6 - 3;
    }
    draw(context) {
        context.strokeRect(this.x, this.y, this.width, this.height) //draw rectangle that represents the object collider
        context.drawImage(this.image, this.x, this.y, this.width, this.height) //draw the object
    }

    update() {
        //update position based on speed
        this.x += this.speed_x;
        this.y += this.speed_y;
    }
}

class Player {
    constructor(game) {
        this.game = game;
        //set player to the center of the canvas
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;

        //initialize size
        this.width = 120;
        this.height = 40;

        this.image = document.getElementById('player'); //get player image
        this.speed = 3; //initialize speed
    }

    update(direction) {
        this.collisionDetection(); //detect collision
        //change direction of player based on pressed keys
        if (direction.includes("ArrowRight")) this.x = this.x + this.speed; //move right 
        else if (direction.includes("ArrowLeft")) this.x = this.x - this.speed; //move left
        else if (direction.includes("ArrowUp")) this.y = this.y - this.speed; //move up
        else if (direction.includes("ArrowDown")) this.y = this.y + this.speed; //move down
    }

    draw(context) {
        context.strokeStyle = "gray";
        context.strokeRect(this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height) //draw object collider
        context.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height) //draw the player
    }
    collisionDetection() {
        this.game.asteroids.forEach(ast => { //check position for each asteroid currently visible on canvas
            if (
                (ast.x < this.x - this.width * 0.5 + this.width) &&
                (ast.x + ast.width > this.x - this.width * 0.5) &&
                (ast.y < this.y - this.height * 0.5 + this.height) &&
                (ast.y + ast.height > this.y - this.height * 0.5)
            ) { //all conditions have to be met for the objects to collide
                this.game.gameOver = true; //if collided -> game over
            }
        });
    }
}


class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.player = new Player(this); //create Player
        this.asteroids = []; //holds all created asteroids that are within canvas
        this.createAsteroids(); //create 15 asteroids at the begging of the game
        this.arrows = []; //keeps track of currently pushed keys(arrows)
        this.aTimer = 0; //keeps track of time passed after creating last asteroid
        this.aInterval = 250; //in miliseconds, how often is new asteroid created 
        this.gameOver = false;
        this.currentTime = 0; //keeps track of time passed since the game started

        window.addEventListener("keydown", (e) => { //listens for user input (pressed down keys)
            const key = e.key;
            if ((key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown") && this.arrows.indexOf(key) === -1) {
                this.arrows.push(key); //add pushed key to arrows array
            }
        })
        window.addEventListener("keyup", (e) => {
            const key = e.key;
            if ((key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown")) {
                this.arrows.splice(this.arrows.indexOf(key), 1); //remove key from arrows array after key up 
            }
        })
    }

    render(context, deltaTime) {
        this.currentTime += deltaTime; //keep track of time passed

        this.player.draw(context); //draw player object

        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw(context); //draw asteroid
            this.asteroids[i].update(); //update asteroid position based on speed
            //if asteroids are out of the canvas remove them from asteroids array
            if (this.asteroids[i].x < 0 - this.asteroids[i].width || this.asteroids[i].x > this.width ||
                this.asteroids[i].y < 0 - this.asteroids[i].height || this.asteroids[i].y > this.height) {
                this.asteroids.splice(i, 1);
                i--;
            }
        }
        if (!this.gameOver) {
            if (this.aTimer < this.aInterval) {
                this.aTimer += deltaTime; //time that has passed since creating new asteroid
            }
            else {
                //if 250ms passed reset timer and create new asteroid
                this.aTimer = 0;
                this.asteroids.push(new Asteriod(this))
            }
        }
        this.drawText(context); //draw time text
    }

    update() {
        this.player.update(this.arrows); //update player position based on user input keys
    }

    //create 15 asteroids on game start
    createAsteroids() {
        for (let i = 0; i < 15; i++) {
            this.asteroids.push(new Asteriod(this));
        }
    }

    drawText(context) {
        context.save(); //all context styles are applied only to text
        context.font = '30px Impact';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillStyle = "white";
        context.shadowColor = "black";
        context.shadowBlur = 10;
        context.fillText('Best time: ' + formatTime(localStorage.bestTime === undefined ? 0 : localStorage.bestTime), 20, 10)
        context.fillText('Time: ' + formatTime(this.currentTime), 20, 50)

        if (this.gameOver) {
            if (!localStorage.bestTime || this.currentTime > localStorage.bestTime) {
                //update best time after game over
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

    const border = 3;
    canvas.width = this.window.innerWidth - 2 * border;
    canvas.height = this.window.innerHeight - 2 * border;

    const game = new Game(canvas);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime; //time between two frames
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(); //calls update method from game that updates player position
        game.render(ctx, deltaTime); //render all the other objects in the game
        if (!game.gameOver) requestAnimationFrame(animate); //if game over stop animation
        else {
            setTimeout(() => {
                location.reload(); //restart web application after 5 seconds
            }, 5000);
        }
    }
    this.requestAnimationFrame(animate); //start game loop
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
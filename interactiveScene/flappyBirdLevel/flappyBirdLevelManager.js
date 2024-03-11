import { MonoBehaviour } from "../sketch.js";

export default class FlappyBirdLevelManager{
    constructor(p5Var, gameEngine, levelName){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.levelName = levelName;
    }

    Start(){

        // Set the background image for the game
        this.gameEngine.setBackground(this.gameEngine.imageSystem.getImage("flappyBirdBackground"), this.p5.createVector(2560,1440));

        // // Create a bird game object
        // let bird = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(400, 400), "Bird");
        
        // // Add an animator component to the bird
        // bird.addAnimator();
        // // Create animations for the bird
        // bird.animator.createAnimation("default", "birdIdle", 8, 0.4, 10)
        // bird.animator.createAnimation("flap", this.gameEngine.imageSystem.getImage("birdFlap"), 7, 0.4, 15)
        // // Transition to the default animation
        // bird.animator.transition("default")

        // // Add a tag to the bird
        // bird.addTag("FlappyBird");

        // // Add a rigid body component to the bird
        // bird.addRigidBody(3, 1, 0);
        // bird.rigidBody.gravityScale = 0.05;
        // // Add a circle collider to the bird
        // bird.addCircleCollider(43, false, true, this.p5.createVector(53, 42));

        // // Add a script component to the bird
        // bird.addScript("birdScript");
        // this.p5.saveJSON(bird.serialize(), "bird.json");

        // Create a ground zone game object
        let groundZone = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(0, this.gameEngine.screenHeight - 270 * this.gameEngine.screenHeight/1380), "GroundZone");
        // Add a rigid body component to the ground zone
        groundZone.addRigidBody(10000000, 0, 0);
        groundZone.rigidBody.gravityScale = 0;
        // Add a box collider to the ground zone
        groundZone.addBoxCollider(this.p5.createVector(this.gameEngine.screenWidth, this.gameEngine.screenHeight), false, true);
        // Add a script component to the ground zone
        groundZone.addScript("groundZoneScript");

        // Add the bird and ground zone to the level
        this.gameEngine.addObjectsToLevel(this.levelName, [groundZone]);

        // Create a score text button
        this.scoreTxt = this.p5.createButton("Score: 0");
        this.scoreTxt.position(0, 0);
        this.scoreTxt.style("font-size", "32px");
        this.scoreTxt.style("background-color", "transparent");
        this.scoreTxt.style("border", "none");
        this.scoreTxt.style("color", "white");
        this.scoreTxt.style("font-family", "Pixelo, Arial, sans-serif");

        this.highScoreTxt = null;
        this.retryBtn = null;
        this.backToMenuBtn = null;

        this.gameOver = false;

        this.spawnRate = 0.22;
        this.uniquePipeId = 0;
        this.score = 0;
        this.timeSinceLastPipe = 1000 * 1/this.spawnRate;
        this.runTime = 0;

        this.pipeSpeed = -8;

        // Event handler for increasing the score
        this.gameEngine.onEvent("increaseFlappyScore", () => {
            this.score += 1;
            this.scoreTxt.html("Score: " + String(this.score));
            this.scoreTxt.value("Score: " + String(this.score));
        });

        // Event handler for game over
        this.gameEngine.onEvent("flappyGameOver", () => {
            if (this.gameOver) return;

            // Stop the background scrolling
            this.gameEngine.backgroundScrollSpeed = 0;

            // Update the score text style
            this.scoreTxt.style("font-size", String(64 * this.gameEngine.screenHeight / 1440) + "px");
            this.scoreTxt.style("color", "#fca146");
            this.scoreTxt.style("text-shadow", "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white");
            this.scoreTxt.position(this.gameEngine.screenWidth / 2 - this.scoreTxt.size().width/2, this.gameEngine.screenHeight / 2 - 100 * this.gameEngine.screenHeight / 1440);

            // Get the high score from local storage
            let highScore = this.p5.getItem("flappyHighScore");

            // Update the high score if necessary
            if (highScore === null || this.score > highScore){
                this.p5.storeItem("flappyHighScore", this.score);
                highScore = this.score;
            }

            // Create a high score text button
            if (highScore !== null){
                this.highScoreTxt = this.p5.createButton("High Score: " + String(highScore));
                this.highScoreTxt.style("font-size", String(64 * this.gameEngine.screenHeight / 1440) + "px");
                this.highScoreTxt.style("background-color", "transparent");
                this.highScoreTxt.style("color", "#fca146");
                this.highScoreTxt.style("text-shadow", "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white");
                this.highScoreTxt.style("font-family", "Pixelo, Arial, sans-serif");
                this.highScoreTxt.style("border", "none");
                this.highScoreTxt.position(this.gameEngine.screenWidth / 2 - this.highScoreTxt.size().width/2, this.gameEngine.screenHeight / 2 - 250 * this.gameEngine.screenHeight / 1440);
            }

            // Create a game over game object
            let flappyGameOver = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(this.gameEngine.screenWidth / 2, this.gameEngine.screenHeight / 2 - 400 * this.gameEngine.screenHeight / 1440), "FlappyGameOver");
            flappyGameOver.addSpriteRenderer(this.gameEngine.imageSystem.getImage("flappyGameOver"), this.p5.createVector(192*3 * this.gameEngine.screenHeight / 1440, 42*3 * this.gameEngine.screenHeight / 1440));

            // Add the game over game object to the level
            this.gameEngine.addObjectsToLevel(this.levelName, [flappyGameOver]);
            this.gameOver = true;

            // Create a retry button
            this.retryBtn = this.p5.createButton("Retry");
            this.retryBtn.style("font-size", String(64 * this.gameEngine.screenHeight / 1440) + "px");
            this.retryBtn.style("background-color", "transparent");
            this.retryBtn.style("color", "#fca146");
            this.retryBtn.style("font-family", "Pixelo, Arial, sans-serif");
            this.retryBtn.style("border", "none");
            this.retryBtn.style("text-shadow", "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white");
            this.retryBtn.position(this.gameEngine.screenWidth / 2 - this.retryBtn.size().width/2, this.gameEngine.screenHeight / 2 + 150 * this.gameEngine.screenHeight / 1440);

            // Create a back to menu button
            this.backToMenuBtn = this.p5.createButton("Menu");
            this.backToMenuBtn.style("font-size", String(64 * this.gameEngine.screenHeight / 1440) + "px");
            this.backToMenuBtn.style("background-color", "transparent");
            this.backToMenuBtn.style("color", "#fca146");
            this.backToMenuBtn.style("font-family", "Pixelo, Arial, sans-serif");
            this.backToMenuBtn.style("border", "none");
            this.backToMenuBtn.style("text-shadow", "-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white");
            this.backToMenuBtn.position(this.gameEngine.screenWidth / 2 - this.backToMenuBtn.size().width/2, this.gameEngine.screenHeight / 2 + 250 * this.gameEngine.screenHeight / 1440);

            // Event handler for retry button click
            this.retryBtn.mousePressed(() => {
                this.gameEngine.loadLevel("flappyBird", "flappyBirdLevelManager");
            });

            // Event handler for back to menu button click
            this.backToMenuBtn.mousePressed(() => {
                this.gameEngine.loadLevel("titleScreen", "titleLevelManager");
            });
        });

        
    }

    Update(){
        // Check if the game is over, if so, return and do not execute the rest of the code
        if (this.gameOver) return;

        // Update the runtime and the time since last speed increase
        this.runTime += this.p5.deltaTime;
        this.timeSinceLastSpeedIncrease += this.p5.deltaTime;

        // Update the time since last pipe spawn
        this.timeSinceLastPipe += this.p5.deltaTime;
        // Check if it's time to spawn a new pipe
        if (this.timeSinceLastPipe > 1000 * 1/this.spawnRate){
            // Reset the time since last pipe spawn
            this.timeSinceLastPipe = 0;
            // Spawn a new pipe with a gap size and relative Y position
            this.spawnPipe(Math.max(350 - this.runTime / 500, 240), this.p5.random(15, 65) / 100)
        }

        // Calculate the spawn rate based on the score
        this.spawnRate = Math.min(0.37, 0.22 + this.score / 500);

        // Update the background scroll speed
        this.gameEngine.backgroundScrollSpeed = this.pipeSpeed;
    }

    spawnPipe(gap, relativeY){
        // Increment the unique pipe ID
        this.uniquePipeId += 1;
        // Create an upper pipe game object
        let upperPipe = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(this.gameEngine.screenWidth + 100, 0), "UpperPipe" + String(this.uniquePipeId));

        const pipeScale = 0.7;
        const pipeYSize = 2000*pipeScale;

        // Add an animator component to the upper pipe
        upperPipe.addAnimator();
        // Create an animation for the upper pipe
        upperPipe.animator.createAnimation("default", this.gameEngine.imageSystem.getImage("upperPipe"), 1, pipeScale, 1)
        // Set the animation offset for the upper pipe
        upperPipe.animator.animations["default"].animationOffset = this.p5.createVector(-210, -pipeYSize + this.gameEngine.screenHeight*relativeY - gap/2);
        // Transition to the default animation
        upperPipe.animator.transition("default")

        // Add a rigid body component to the upper pipe
        upperPipe.addRigidBody(10000000, 1, 0);
        upperPipe.rigidBody.gravityScale = 0;
        // Add a box collider to the upper pipe
        upperPipe.addBoxCollider(this.p5.createVector(280, this.gameEngine.screenHeight*relativeY - gap/2), false, true);
        // Add a script component to the upper pipe
        upperPipe.addScript("pipeScript");

        // Create a lower pipe game object
        let lowerPipe = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(this.gameEngine.screenWidth + 100, Math.min(this.gameEngine.screenHeight*relativeY + gap/2, this.gameEngine.screenHeight - 300 * this.gameEngine.screenHeight / 1440)), "LowerPipe" + String(this.uniquePipeId));

        // Add an animator component to the lower pipe
        lowerPipe.addAnimator();
        // Create an animation for the lower pipe
        lowerPipe.animator.createAnimation("default", this.gameEngine.imageSystem.getImage("lowerPipe"), 1, pipeScale, 1)
        // Set the animation offset for the lower pipe
        lowerPipe.animator.animations["default"].animationOffset = this.p5.createVector(-210, 0);
        // Transition to the default animation
        lowerPipe.animator.transition("default")

        // Add a rigid body component to the lower pipe
        lowerPipe.addRigidBody(10000000, 1, 0);
        lowerPipe.rigidBody.gravityScale = 0;
        // Add a box collider to the lower pipe
        lowerPipe.addBoxCollider(this.p5.createVector(280, (this.gameEngine.screenHeight - 290 * this.gameEngine.screenHeight / 1440) - (this.gameEngine.screenHeight*relativeY + gap/2)), false, true);
        // Add a script component to the lower pipe
        lowerPipe.addScript("pipeScript");

        // Set the velocity of the lower and upper pipes
        lowerPipe.rigidBody.Velocity.x = this.pipeSpeed;
        upperPipe.rigidBody.Velocity.x = this.pipeSpeed;

        // Create a score zone game object
        let scoreZone = new MonoBehaviour.GameObject(this.gameEngine, this.p5.createVector(this.gameEngine.screenWidth + 100, 0), "ScoreZone" + String(this.uniquePipeId));
        // Add a rigid body component to the score zone
        scoreZone.addRigidBody(10000000, 0, 0);
        scoreZone.rigidBody.gravityScale = 0;
        // Add a box collider to the score zone
        scoreZone.addBoxCollider(this.p5.createVector(80, this.gameEngine.screenHeight), true, true, this.p5.createVector(100, 0));
        // Add a script component to the score zone
        scoreZone.addScript("scoreZoneScript");
        // Set the velocity of the score zone
        scoreZone.rigidBody.Velocity.x = this.pipeSpeed;

        // Add the upper pipe, lower pipe, and score zone to the level
        this.gameEngine.addObjectsToLevel(this.levelName, [upperPipe, lowerPipe, scoreZone]);
    }

    End(){
        // Remove UI elements
        this.scoreTxt.remove();
        this.highScoreTxt.remove();
        this.retryBtn.remove();
        this.backToMenuBtn.remove();
    }
}

import { MonoBehaviour } from "../sketch.js";

export default class TitleLevelManager{
    constructor(p5Var, gameEngine, levelName){
        this.p5 = p5Var;
        this.gameEngine = gameEngine;
        this.levelName = levelName;
    }

    Start(){
        // Create Molten button
        this.moltenBtn = this.p5.createButton("")
        this.moltenBtn.position(0, 200);
        this.moltenBtn.size(400, 400);
        this.moltenBtn.style("opacity", "0");
        this.moltenBtn.mousePressed(() => {
            setTimeout(() => {
            // wait 250ms to load the page
            this.gameEngine.loadLevel("glowFire", "glowLevelManager");
            }, 250);

        });

        // Create Flappy Bird button
        this.flappyBtn = this.p5.createButton("")
        this.flappyBtn.position(800, 200);
        this.flappyBtn.size(400, 400);
        this.flappyBtn.style("opacity", "0");
        this.flappyBtn.mousePressed(() => {
            setTimeout(() => {
            // wait 250ms to load the page
            this.gameEngine.loadLevel("flappyBird", "flappyBirdLevelManager");
            }, 250);

        });

        // Create Snake Game button
        this.snakeGameBtn = this.p5.createButton("")
        this.snakeGameBtn.position(0, 800);
        this.snakeGameBtn.size(400, 400);
        this.snakeGameBtn.style("opacity", "0");
        this.snakeGameBtn.mousePressed(() => {
            setTimeout(() => {
            // wait 250ms to load the page
            this.gameEngine.loadLevel("snakeGame", "snakeGameLevelManager");
            }, 250);

        });

        this.gameEngine.addCameraToLevel(this.levelName, null);

        //this.gameEngine.saveCurrentLevel();
    }

    Update(){
        
    }

    End(){
        // Enable automatic canvas resizing
        this.gameEngine.resizeToFit = true;
        this.gameEngine.setCanvasHeight(this.p5.windowHeight);
        this.gameEngine.setCanvasWidth(this.p5.windowWidth);

        // Remove any dom elements created
        this.moltenBtn.remove();
        this.flappyBtn.remove();
        this.snakeGameBtn.remove();
    }

  }

  
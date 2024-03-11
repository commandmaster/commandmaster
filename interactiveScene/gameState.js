import { MonoBehaviour } from "./sketch.js";

export default class GameState{
    constructor(p5Var, gameEngine){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
    }

    Preload(){
        // Load Scripts and Images
        this.gameEngine.scriptSystem.loadScript("playerScript", "./moltenLevel/playerScript.js")
        this.gameEngine.scriptSystem.loadScript("enemyScript", "./moltenLevel/enemyScript.js")
        this.gameEngine.scriptSystem.loadScript("enemySpawnerScript", "./moltenLevel/enemySpawnerScript.js")
        this.gameEngine.scriptSystem.loadScript("lavaFloor", "./moltenLevel/lavaFloor.js")
        this.gameEngine.scriptSystem.loadScript("glowLevelManager", "./moltenLevel/glowLevelManager.js")
        this.gameEngine.scriptSystem.loadScript("titleLevelManager", "./titleLevel/titleLevelManager.js")
        this.gameEngine.scriptSystem.loadScript("moltenGameOverManager", "./moltenGameOverLevel/moltenGameOverManager.js")
        this.gameEngine.scriptSystem.loadScript("flappyBirdLevelManager", "./flappyBirdLevel/flappyBirdLevelManager.js")
        this.gameEngine.scriptSystem.loadScript("birdScript", "./flappyBirdLevel/birdScript.js")
        this.gameEngine.scriptSystem.loadScript("pipeScript", "./flappyBirdLevel/pipeScript.js")
        this.gameEngine.scriptSystem.loadScript("scoreZoneScript", "./flappyBirdLevel/scoreZoneScript.js")
        this.gameEngine.scriptSystem.loadScript("groundZoneScript", "./flappyBirdLevel/groundScript.js")
        this.gameEngine.scriptSystem.loadScript("snakeGameLevelManager", "./snakeLevel/snakeGameLevelManager.js")

        

        this.gameEngine.imageSystem.addImage("MoltenLogo", "./images/MoltenPursuit.png");
        this.gameEngine.imageSystem.addImage("mainTitle", "./images/mainGameTitle.png");
        this.gameEngine.imageSystem.addImage("moltenEndScreen", "./images/endScreenMolten.png");
        this.gameEngine.imageSystem.addImage("flappyBirdLogo", "./images/flappyBirdLogo.png");
        this.gameEngine.imageSystem.addImage("flappyBirdBackground", "./images/flappyBackgroundV3.png");
        this.gameEngine.imageSystem.addImage("upperPipe", "./images/upperPipe.png");
        this.gameEngine.imageSystem.addImage("lowerPipe", "./images/lowerPipe.png");
        this.gameEngine.imageSystem.addImage("flappyGameOver", "./images/flappyGameOver.png");
        this.gameEngine.imageSystem.addImage("snakeGameLogo", "./images/snakeGameLogo.png");

        this.gameEngine.imageSystem.addImage("birdIdle", "./images/flappyBirdIdleSheet.png");
        this.gameEngine.imageSystem.addImage("birdFlap", "./images/flappyJumpSheet.png");

        this.gameEngine.inputSystem.addKeyboardInput("menu", "m", "bool");
        this.gameEngine.inputSystem.addBindToKeyboardInput("menu", 77);
    }

    Setup(){
        // Load Title Screen
        this.gameEngine.loadLevel("titleScreen", "titleLevelManager");
        
        

        window.addEventListener("resize", () => {
          // To prevent unintended behavior, reload the page on resize
          location.reload();
        });

    }

    Start(){
      // Runs at the start of the game
    }

    Update(){
      // Runs every frame

      if (this.gameEngine.inputSystem.getInputDown("menu")){
        this.gameEngine.loadLevel("titleScreen", "titleLevelManager");
      }
    }

  }

  
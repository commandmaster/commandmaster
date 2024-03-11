import { MonoBehaviour } from "../sketch.js";

export default class EnemySpawner{
    constructor(p5Var, gameEngine, gameObject){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.gameObject = gameObject;
    }

    Start(){
        this.uniqueEnemyId = 0; // Initialize the unique enemy ID, used to make sure that each enemy has a unique name
        this.runTime = 0; // Initialize the runtime
        this.playerPosition = this.gameEngine.gameObjects["player1"].transform.Position; // Get the position of the player object
        this.currentChunk = this.p5.createVector(0, 0); // Initialize the current chunk vector
        this.lastChunk = this.p5.createVector(0, 0); // Initialize the last chunk vector
        this.loadedChunks = {}; // Initialize the loaded chunks object   
        this.loadChunks(this.currentChunk); // Load the chunks for the current chunk vector
    }

    Update(){
        this.runTime += this.p5.deltaTime; // Update the runtime

        this.currentChunk = this.getChunk(); // Get the current chunk vector based on the player's position

        if (this.currentChunk.x != this.lastChunk.x || this.currentChunk.y != this.lastChunk.y){
            this.lastChunk = this.currentChunk; // Update the last chunk vector
            this.loadChunks(this.currentChunk); // Load the chunks for the current chunk vector

        } 
    }

    // Calculate the current chunk based on the player's position
    getChunk(){
        return {x:Math.floor(this.playerPosition.x / 5000), y:Math.floor(this.playerPosition.y / 5000)}
    }

    // Load the chunks surrounding the current chunk
    loadChunks(chunk){
        for (let i = 0; i <= 4; i++){
            for (let j = 0; j <= 4; j++){
                this.loadChunk(this.p5.createVector(chunk.x - 2 + i, chunk.y - 2 + j))
            }
        }   
    }

    // Load a specific chunk if it hasn't been loaded yet and if it's above the player's position
    loadChunk(chunk){
        if (this.loadedChunks[chunk] == undefined && chunk.y < 0){
            const interval = 12;
            const decreseDensity = this.runTime / ((1/interval) * 1000000000);
            // Spawn enemies within the chunk based on density and range
            this.spawnEnemys(Math.max(0.000002 - decreseDensity, 0.000001), Math.max(0.0000025 - decreseDensity, 0.0000014), this.p5.createVector(chunk.x * 5000, chunk.x * 5000 + 5000), this.p5.createVector(chunk.y * 5000, chunk.y * 5000 + 5000))
            this.loadedChunks[chunk] = true;
        }
    }

    // Spawn an enemy at a given position with specified properties
    spawnEnemy(pos, radius, color, health, name){
        const enemy = new MonoBehaviour.GameObject(this.gameEngine, pos, name)
        enemy.addRigidBody(1000000, 0.5)
        enemy.addCircleCollider(radius, false, false, this.p5.createVector(0,0), "enemy")
        enemy.rigidBody.gravityScale = 0;
        enemy.addSpriteRenderer("circle", radius*2, color, true, color)
        enemy.addScript("enemyScript");
        enemy.addTag("enemy")
        this.gameEngine.addObjectsToLevel(this.gameEngine.currentLevel, [enemy])
    }

    // Spawn enemies within a given density range and range of positions
    spawnEnemys(densityLower, densityUpper, rangeX, rangeY){
        for (let i = 0; i < (Math.abs(rangeX.x - rangeX.y)) * (Math.abs(rangeY.x - rangeY.y)) * this.p5.random(densityLower, densityUpper); i++){
            this.uniqueEnemyId += 1;
            this.spawnEnemy(this.p5.createVector(this.p5.random(rangeX.x, rangeX.y), this.p5.random(rangeY.x, rangeY.y)), 25, this.p5.color(255, 0, 0), 5, String(this.uniqueEnemyId))
        }
    }
  
  }

  
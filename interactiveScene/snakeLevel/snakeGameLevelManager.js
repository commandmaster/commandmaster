import { MonoBehaviour } from "../sketch.js";

export default class SnakeGameLevelManager{
    constructor(p5Var, gameEngine, levelName){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.levelName = levelName;
    }

    Start(){
      this.gameOver = false;
      this.dificultyChosen = false;

      this.squareSize = Math.max(25 * this.gameEngine.screenHeight/1440, 8);
      this.spacing = 3 * this.gameEngine.screenHeight/1440;
      this.startingPos = this.p5.createVector(0, 0);
      this.pieceQueue = 0;
      
      this.pieces = [];
      this.direction = this.p5.createVector(1, 0);
      this.dificulty = 1; 
      
      // Create a vector for the end position of the grid based on the screen size
      this.endPos = this.p5.createVector(Math.min(this.gameEngine.screenWidth, this.gameEngine.screenHeight), Math.min(this.gameEngine.screenWidth, this.gameEngine.screenHeight));       
      
      this.timeSinceLastMove = 0;

      this.gameEngine.inputSystem.addKeyboardInput('snakeUp', 'w', 'bool') // Add a keyboard input for the snake to go up
      this.gameEngine.inputSystem.addKeyboardInput('snakeDown', 's', 'bool') // Add a keyboard input for the snake to go down
      this.gameEngine.inputSystem.addKeyboardInput('snakeLeft', 'a', 'bool') // Add a keyboard input for the snake to go left
      this.gameEngine.inputSystem.addKeyboardInput('snakeRight', 'd', 'bool') // Add a keyboard input for the snake to go right
      this.gameEngine.inputSystem.addKeyboardInput('restart', 'r', 'bool') // Add a keyboard input to restart the game

      this.gameEngine.inputSystem.addBindToKeyboardInput('snakeUp', 38) // Add a keyboard bind for the snake to go up
      this.gameEngine.inputSystem.addBindToKeyboardInput('snakeDown', 40) // Add a keyboard bind for the snake to go down
      this.gameEngine.inputSystem.addBindToKeyboardInput('snakeLeft', 37) // Add a keyboard bind for the snake to go left
      this.gameEngine.inputSystem.addBindToKeyboardInput('snakeRight', 39) // Add a keyboard bind for the snake to go right
      this.gameEngine.inputSystem.addBindToKeyboardInput('restart', 82) // Add a keyboard bind to restart the game

      this.gameEngine.inputSystem.addKeyboardInput('menu', 'm', 'bool') // Add a keyboard input to go back to the menu
      this.gameEngine.inputSystem.addBindToKeyboardInput('menu', 77) // Add a keyboard bind to go back to the menu

      // initialize the grid
      this.grid = [];
      let indexX = 0; 

      // create the grid using a nested for loop to create a 2d array
      for (let i = this.startingPos.x; i < this.endPos.x - this.squareSize; i += this.squareSize + this.spacing) {
        this.grid.push([]);
        let indexY = 0; 
        for (let j = this.startingPos.y; j < this.endPos.y - this.squareSize; j += this.squareSize + this.spacing) {
          
          if (j > (this.endPos.y - this.squareSize) - (this.squareSize + this.spacing) || j < this.startingPos.y + this.squareSize + this.spacing || i > (this.endPos.x - this.squareSize) - (this.squareSize + this.spacing) || i < this.startingPos.x + this.squareSize + this.spacing){
            this.grid[indexX].push(1);
            // Set walls to 1
          }


          else{
            this.grid[indexX].push(0);
            // Set empty spaces to 0
          }
          
          indexY++; 
        }

        indexX++; 
      }
      
      // set the starting score to 3
      this.score = 3;

      // add the starting pieces to the snake
      this.pieces.push({x: 3, y: 3, direction: this.p5.createVector(1, 0)});
      this.pieces.push({x: 2, y: 3, direction: this.p5.createVector(1, 0)});
      this.pieces.push({x: 1, y: 3, direction: this.p5.createVector(1, 0)});
      
      // spawn the apples
      this.spawnApple();
      this.spawnApple();
      this.spawnApple();
      
      // create the score text
      // the score text is a html button becuase it's formated more easily then text
      this.scoreTxt = this.p5.createButton("Score: " + this.score);
      this.scoreTxt.position(25, 25);
      this.scoreTxt.style("font-size", String(48 * this.gameEngine.screenHeight/1440) + "px");
      this.scoreTxt.style("font-family", "Pixelo, Arial");
      this.scoreTxt.style("background-color", "transparent");
      this.scoreTxt.style("border", "none");
      this.scoreTxt.style("color", "#00ff00");
      this.scoreTxt.style("outline", "none");
      this.scoreTxt.style("z-index", "1000");
    }

    Update(){
      // if the dificulty has not been chosen then prompt the user to choose a dificulty
      if (!this.dificultyChosen){
        while (true){
          let dificulty = prompt("Choose a dificulty between 1 and 3");
          if (dificulty === "1" || dificulty === "2" || dificulty === "3"){
            this.dificulty = Number(dificulty);
            this.dificultyChosen = true;
            break;
          }
        }
        return;
      }

      // if the game is over then prompt the user to restart or go back to the menu
      if (this.gameOver){
        if (!this.gOverTxt || !this.restTxt || !this.scoreTxt){
          this.gOverTxt = this.p5.createButton("Game Over");
          this.gOverTxt.style("font-size", String(256 * this.gameEngine.screenHeight/1440) + "px");
          this.gOverTxt.style("font-family", "Pixelo, Arial");
          this.gOverTxt.size(this.gameEngine.screenWidth, this.gOverTxt.size().height)
          this.gOverTxt.position(this.gameEngine.screenWidth/2 - this.gOverTxt.size().width/2, this.gameEngine.screenHeight/2 - 750 * this.gameEngine.screenHeight/1440);
          this.gOverTxt.style("background-color", "transparent");
          this.gOverTxt.style("border", "none");
          this.gOverTxt.style("color", "#00ff00");
          this.gOverTxt.style("outline", "none");
          this.gOverTxt.style("z-index", "1000");

          this.restTxt = this.p5.createButton("Press R to restart");
          this.restTxt.style("font-size", String(64 * this.gameEngine.screenHeight/1440) + "px");
          this.restTxt.size(this.gameEngine.screenWidth, this.restTxt.size().height)
          this.restTxt.style("font-family", "Pixelo, Arial");
          this.restTxt.position(this.gameEngine.screenWidth/2 - this.restTxt.size().width/2, this.gameEngine.screenHeight/2 - 250 * this.gameEngine.screenHeight/1440);
          this.restTxt.style("background-color", "transparent");
          this.restTxt.style("border", "none");
          this.restTxt.style("color", "#00ff00");
          this.restTxt.style("outline", "none");
          this.restTxt.style("z-index", "1000");

          this.menuTxt = this.p5.createButton("Press M to go back to the menu");
          this.menuTxt.style("font-size", String(64 * this.gameEngine.screenHeight/1440) + "px");
          this.menuTxt.size(this.gameEngine.screenWidth, this.menuTxt.size().height)
          this.menuTxt.style("font-family", "Pixelo, Arial");
          this.menuTxt.position(this.gameEngine.screenWidth/2 - this.menuTxt.size().width/2, this.gameEngine.screenHeight/2 - 100 * this.gameEngine.screenHeight/1440);
          this.menuTxt.style("background-color", "transparent");
          this.menuTxt.style("border", "none");
          this.menuTxt.style("color", "#00ff00");
          this.menuTxt.style("outline", "none");
          this.menuTxt.style("z-index", "1000");
        }

        // if the high score is null then set it to the current score
        if (this.p5.getItem("snakeHighScore") === null){
          this.p5.storeItem("snakeHighScore", this.score);
        }

        // if the current score is greater then the high score then set the high score to the current score
        else if (this.score > Number(this.p5.getItem("snakeHighScore"))){
          this.p5.storeItem("snakeHighScore", this.score);
        }

        // set the score text to the current score and the high score
        this.scoreTxt.value("Score " + String(this.score) + " High Score " + this.p5.getItem("snakeHighScore"));
        this.scoreTxt.html("Score " + String(this.score) + " High Score " + this.p5.getItem("snakeHighScore"));
        this.scoreTxt.position(this.gameEngine.screenWidth/2 - this.scoreTxt.size().width/2, this.gameEngine.screenHeight/2 + 100  * this.gameEngine.screenHeight/1440);

        // if the restart button is pressed then restart the game
        if (this.gameEngine.inputSystem.getInputDown("restart")){
          this.gameEngine.loadLevel("snakeGameLevel", "snakeGameLevelManager");
        }

        // if the menu button is pressed then go back to the menu
        if (this.gameEngine.inputSystem.getInputDown("menu")){
          this.gameEngine.loadLevel("titleScreen", "titleLevelManager");
        }
        
        return;
      }
        
      
      // increase the time since the last move
      this.timeSinceLastMove += this.p5.deltaTime;

      if (!this.gameOver){
        // Set the direction of the snake based on the input
        
        if (this.gameEngine.inputSystem.getInputDown("snakeUp")){
          if (this.pieces[0].direction.y !== 1){
            this.direction = this.p5.createVector(0, -1);
          }

        }

        if (this.gameEngine.inputSystem.getInputDown("snakeDown")){
            if (this.pieces[0].direction.y !== -1){
              this.direction = this.p5.createVector(0, 1);
            }

        }

        if (this.gameEngine.inputSystem.getInputDown("snakeLeft")){
            if (this.pieces[0].direction.x !== 1){
              this.direction = this.p5.createVector(-1, 0);
            }

        }

        if (this.gameEngine.inputSystem.getInputDown("snakeRight")){
            if (this.pieces[0].direction.x !== -1){
              this.direction = this.p5.createVector(1, 0);
            } 

        }

        // if the time since the last move is greater then 200 then move the snake
        if (this.timeSinceLastMove > 200){
          if (this.pieceQueue > 0){
            this.createPiece()
            this.pieceQueue--;
          }

          this.timeSinceLastMove = 0;
          this.updatePieces(); // update the pieces
        }
      }

      
      
      // draw the grid
      this.drawGrid();

      // update the score text
      this.scoreTxt.value("Score " + String(this.score));
      this.scoreTxt.html("Score " + String(this.score));
    }

    updatePieces(){
      this.grid[this.pieces[this.pieces.length - 1].x][this.pieces[this.pieces.length - 1].y] = 0;
      // Set the grid cell at the last piece's position to 0 (empty)

      for (let i = this.pieces.length - 1; i >= 0; i--) {
        if (i > 0){
          this.pieces[i].x = this.pieces[i - 1].x;
          this.pieces[i].y = this.pieces[i - 1].y;
          this.pieces[i].direction = this.pieces[i - 1].direction; // set the direction of each piece to the direction of the previous piece
          this.grid[this.pieces[i].x][this.pieces[i].y] = 3;
          // Move each piece to the position of the previous piece
          // Set the grid cell at the new position to 3 (representing the snake body)
        }

        else if (i === 0){
          this.pieces[i].x += this.direction.x;
          this.pieces[i].y += this.direction.y;
          this.pieces[i].direction = this.direction;

          if (this.grid[this.pieces[i].x][this.pieces[i].y] === 1){
            console.log("Game Over");
            this.gameOver = true;
            return;
            // If the head of the snake collides with a grid cell containing 1 (representing the snake's own body), end the game
          }

          else if (this.grid[this.pieces[i].x][this.pieces[i].y] === 2){
            this.score += 4 - this.dificulty;
            this.grid[this.pieces[i].x][this.pieces[i].y] = 3;
            // If the head of the snake collides with a grid cell containing 2 (representing an apple), increase the score and set the cell to 3 (representing the snake body)

            this.pieceQueue += 4 - this.dificulty;
            // Increase the pieceQueue by the difference between 4 and the difficulty level
            // the pieceQueue adds a piece to the snake every time the snake moves until it reaches 0

            this.spawnApple();
            // Spawn a new apple on the grid
          }

          else if (this.grid[this.pieces[i].x][this.pieces[i].y] === 3){
            this.gameOver = true;
            console.log("Game Over");
            return;
            // If the head of the snake collides with a grid cell containing 3 (representing the snake body), end the game
          }

          else if (this.grid[this.pieces[i].x][this.pieces[i].y] === 0){
            this.grid[this.pieces[i].x][this.pieces[i].y] = 3;
            // Set the grid cell at the new position to 3 (representing the snake body)
          }
        }
      }
    
    }

    createPiece(){
      this.pieces.push({x:this.pieces[this.pieces.length - 1].x - this.pieces[this.pieces.length - 1].direction.x, y:this.pieces[this.pieces.length - 1].y - this.pieces[this.pieces.length - 1].direction.y, direction: this.pieces[this.pieces.length - 1].direction});
    }

    spawnApple(){
      // spawn an apple on the grid at a random position
      // if the position is already occupied then try again
      let x = Math.floor(Math.random() * this.grid.length);
      let y = Math.floor(Math.random() * this.grid[0].length);
      if (this.grid[x][y] === 0){
        this.grid[x][y] = 2;
      }

      else{
        this.spawnApple();
      }
    }


    drawGrid(){
      // draw the grid

      this.p5.push();
      this.p5.noStroke();
      for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {
          if (this.grid[i][j] === 1){
            // Draw a white square for snake body
            this.p5.drawingContext.shadowBlur = 17;
            this.p5.drawingContext.shadowColor = this.p5.color(255, 255, 255);
            this.p5.fill(255, 255, 255);
            this.p5.rect(i * (this.squareSize + this.spacing), j * (this.squareSize + this.spacing), this.squareSize, this.squareSize);
          }

          else if (this.grid[i][j] === 3){
            // Draw a green square for snake head
            this.p5.drawingContext.shadowBlur = 12;
            this.p5.drawingContext.shadowColor = this.p5.color(0, 255, 0);
            this.p5.fill(0, 255, 0);
            this.p5.rect(i * (this.squareSize + this.spacing), j * (this.squareSize + this.spacing), this.squareSize, this.squareSize);
          }

          else if (this.grid[i][j] === 2){
            // Draw a red square for apple
            this.p5.drawingContext.shadowBlur = 17;
            this.p5.drawingContext.shadowColor = this.p5.color(255, 0, 0);
            this.p5.fill(255, 0, 0);
            this.p5.rect(i * (this.squareSize + this.spacing), j * (this.squareSize + this.spacing), this.squareSize, this.squareSize);
          }
        }
      }

      this.p5.pop();
    }
  

    End(){
      // remove the html elements
      this.scoreTxt.remove();
      this.gOverTxt.remove();
      this.restTxt.remove();
      this.menuTxt.remove();
    }

    
  }



  
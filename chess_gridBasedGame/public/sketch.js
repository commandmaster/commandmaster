// Bennett Friesen
// 4/30/2024
// 2d Array Assignment - Chess

// Extra for Experts:
// OOP - I used object oriented programming to create a chess game with a chess board, pieces, and a game history class
// Networking - I used socket.io to create a multiplayer chess game
// AI - I created an AI that can play chess using the minimax algorithm with alpha-beta pruning (based on a known algorithm and an implementation by Sebastian Lague on youtube)
// UI - I created a Dynamic UI system that can be used to create UI elements and widgets
// Custom p5js camera addon with dynaimic zoom and resize functionality
// p5js instance mode, backed js, node, chat system with content moderation and chat history as well as a chat window
// backened room system for multiplayer games allowing for more than one game to be played at once



let gameBoard;
let p5Camera;


let uiHandler = new UIHandler();



const localSketch = function(p){
  p.preload = () => {
    gameBoard = new ChessBoard(p);
  }

  p.setup = () => {
    
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();


    p5Camera = new P5Camera(p, {x: 0, y: 0}, gameBoard.squareSize * gameBoard.boardSize / 2, gameBoard.squareSize * gameBoard.boardSize / 2, 1, 0);
    p5Camera.ShouldResizeWindow(true);
    
  }


  p.draw = () => {
    p.noStroke();
    p.background(150);
    

    // Start the camera loop
    p5Camera.LoopStart();
    p5Camera.ZoomToFit(gameBoard.squareSize * gameBoard.boardSize, gameBoard.squareSize * gameBoard.boardSize, 0);
  
    // Update the game board
    gameBoard.Update();
    
    // End the camera loop
    p5Camera.LoopEnd();
  
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }


}

const loadingSketch = function(p) {
  p.setup = () => {
    
    // Create a canvas with the size of the window
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();

    // Function for sine wave animation
    function sineWaveAnimation(uiElement, height, speed){
      // Add custom behavior to the UI element
      uiElement.addCustomBehavior((uiElement) => {
      // Update the y position of the UI element using a sine wave
      uiElement.y = uiElement.elementOptions.y + Math.sin(p.frameCount / (1/speed)) * height - height;
      });
    }


    // Add loadScreen widget to uiHandler
    uiHandler.AddWidget('loadScreen', new UIWidget(p));
    
    const pixelFont = new UIFont(p, 'fonts/pixelFont.otf');

    // Create chessText UI element
    const chessText = new UIText(p, uiHandler.Get('loadScreen'), {x: 0, y: -450, anchor: 'center', text:'Chess', textSize: 70, placeMode: 'center', font: pixelFont});
    sineWaveAnimation(chessText, 15, 0.035);

    // Create localTxt UI element
    const localTxt = new UIText(p, uiHandler.Get('loadScreen'), {x: -130, y: -155, anchor: 'center', text:'Local 2 Player', textSize: 40, placeMode: 'center', font: pixelFont});
    const localButton = new UIButton(p, uiHandler.Get('loadScreen'), {x: 130, y: -150, width: 50, height: 50, anchor: 'center', placeMode: 'center'});
    sineWaveAnimation(localTxt, 8, 0.035);
    sineWaveAnimation(localButton, 8, 0.035);

    // Create multiplayerTxt UI element
    const multiplayerTxt = new UIText(p, uiHandler.Get('loadScreen'), {x: -130, y: -55, anchor: 'center', text:'Multiplayer', textSize: 40, placeMode: 'center', font: pixelFont});
    // Create multiplayerButton UI element
    const multiplayerButton = new UIButton(p, uiHandler.Get('loadScreen'), {x: 130, y: -50, width: 50, height: 50, anchor: 'center', placeMode: 'center'});
    // Apply sine wave animation to multiplayerTxt
    sineWaveAnimation(multiplayerTxt, 8, 0.035);
    // Apply sine wave animation to multiplayerButton
    sineWaveAnimation(multiplayerButton, 8, 0.035);

    // Create AIText UI element
    const AIText = new UIText(p, uiHandler.Get('loadScreen'), {x: -130, y: 55, anchor: 'center', text:'AI', textSize: 40, placeMode: 'center', font: pixelFont});
    // Create AIButton UI element
    const AIButton = new UIButton(p, uiHandler.Get('loadScreen'), {x: 130, y: 50, width: 50, height: 50, anchor: 'center', placeMode: 'center'});
    // Apply sine wave animation to AIText
    sineWaveAnimation(AIText, 8, 0.035);
    // Apply sine wave animation to AIButton
    sineWaveAnimation(AIButton, 8, 0.035);

    // Add click event handler for localButton
    localButton.onClick = () => {
      uiHandler.HideAllWidgets();

      gameWindowSketch = new p5(localSketch);
      p.remove();
    }

    multiplayerButton.onClick = () => {
      uiHandler.HideAllWidgets();

      // Create a new instance of MultiplayerSketch and assign it to gameWindowSketch
      gameWindowSketch = new p5(MultiplayerSketch);
      p.remove();
    }

    AIButton.onClick = () => {
      uiHandler.HideAllWidgets();

      // Create a new instance of AISketch and assign it to gameWindowSketch
      gameWindowSketch = new p5(AISketch);
      p.remove();
    }


    // Set the 'loadScreen' widget as the active widget
    uiHandler.SetActiveWidget('loadScreen');
  }


  p.draw = () => {
    p.noStroke();
    p.background(150);
    
  
    uiHandler.Update();

   

  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }


}


let networkManager;
let chatWindow;

let mpChessBoard;

const MultiplayerSketch = function(p){
  p.preload = () => {
    networkManager = new NetworkManager(p);
    mpChessBoard = new MPChessBoard(p);
  }

  p.setup = () => {
    // Create a canvas with the size of the window
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();

    const windowX = p.windowWidth - 300;
    const windowY = 30;
    // Create a chat window
    chatWindow = new ChatBox(p, windowX, windowY, 300, p.windowHeight - windowY);

    // Create a camera with initial position and zoom level
    p5Camera = new P5Camera(p, {x: 0, y: 0}, mpChessBoard.squareSize * mpChessBoard.boardSize / 2, mpChessBoard.squareSize * mpChessBoard.boardSize / 2, 1, 0);

  }

  p.draw = () => {
    p.background(150);

    
    networkManager.Update();
    chatWindow.Update();

    p5Camera.LoopStart();
    p5Camera.ZoomToFit(mpChessBoard.squareSize * mpChessBoard.boardSize, mpChessBoard.squareSize * mpChessBoard.boardSize, 0);
  
    mpChessBoard.Update();
    
    p5Camera.LoopEnd();
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }
}

let aiChessBoard;
const AISketch = function(p){
  p.preload = () => {
    aiChessBoard = new AIChessBoard(p);
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();

    p5Camera = new P5Camera(p, {x: 0, y: 0}, aiChessBoard.squareSize * aiChessBoard.boardSize / 2, aiChessBoard.squareSize * aiChessBoard.boardSize / 2, 1, 0);
  }

  p.draw = () => {
    p.background(150);


    p5Camera.LoopStart();
    p5Camera.ZoomToFit(aiChessBoard.squareSize * aiChessBoard.boardSize, aiChessBoard.squareSize * aiChessBoard.boardSize, 0);

    aiChessBoard.Update();
    p5Camera.LoopEnd();
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }
}


class NetworkManager{
  constructor(p5){
    this.p5 = p5;
    this.socket = io.connect();

    this.client = new Client(p5, this.socket);

    this.socket.on('serverStartUp', (data) => {
      location.reload();
    });

    this.socket.on('ping', (data, callback) => {
      callback('pong');
    });
  }

  Update(){
    this.client.Update();
  }

}

class Client{
  constructor(p5, socket){
    this.socket = socket;
    this.id = socket.id;
    this.name = '';
    this.p5 = p5;

    this.socket.on('setName', (name) => {
      this.name = name;
      console.log('name set to', `"${name}"`);


      if (this.nameButton){
        this.nameButton.value(this.name);
      }

      else{
        this.nameButton = this.p5.createInput(this.name);
        this.nameButton.value(this.name);

        this.nameButton.style('font-size', '20px');
        this.nameButton.style('position', 'absolute');
        this.nameButton.style('top', '0px');
        this.nameButton.style('right', '0px');
        this.nameButton.style('background', 'transparent');
        this.nameButton.style('border', 'none');
        this.nameButton.style('color', 'black');
        this.nameButton.style('z-index', '100');

        this.nameButton.position(this.p5.windowWidth - 300, 0)

        this.nameButton.changed(() => {
          this.name = this.nameButton.value();
          this.socket.emit('setName', this.name);
        });
      }

      
      
    });

    
  }

  Update(){
    // show player list on tab press
    if (this.p5.keyIsDown(71)){
      this.socket.emit('getPlayerList', '', (data) => {
        const playerNames = data.players;
        const pings = data.pings;

        if (this.playerListWindow){
          this.playerListWindow.remove();
        }

        this.playerListWindow = this.p5.createDiv();
        this.playerListWindow.size(600, 400);
        this.playerListWindow.position(this.p5.windowWidth/2 - 300, 30);
        this.playerListWindow.style('border', 'none');
        this.playerListWindow.style('overflow-y', 'hidden');
        this.playerListWindow.style('overflow-x', 'hidden');
        this.playerListWindow.style('z-index', '100');
        this.playerListWindow.style('padding', '10px');
        this.playerListWindow.style('font-size', '20px');
        this.playerListWindow.style('position', 'absolute');
        
        this.playerListWindow.style('background', 'rgba(240, 240, 240, 0.7)');


        for (let i = 0; i < playerNames.length; i++){
          
          const text = playerNames[i] + " - " + pings[i].toFixed(2) + "ms";
          let player = this.p5.createP(text);
          player.style('font-size', '20px');
          player.style('font-family', 'Arial');
          
          player.style('color', playerNames[i] === this.name ? 'blue' : 'black');

          player.style('margin', '10px');
          this.playerListWindow.child(player);
        }
          
      });
    }

    else if (this.playerListWindow){
      this.playerListWindow.remove();
    }
  }

}


class ChatBox{
  constructor(p5, x, y, w, h){
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.messages = [];

    this.isVisibile = true;

    this.maxMessagesOnScreen = 12;

    this.hideChatButton = this.p5.createButton('Hide Chat');
    this.hideChatButton.size(100, 20);
    this.hideChatButton.position(this.x + 10, this.y + this.h - 60);
    this.hideChatButton.mousePressed(() => {
      this.hidden = !this.hidden;
      this.hideChatButton.html(this.hidden ? 'Hide Chat': 'Show Chat');
    });

    
    this.inputBox = this.p5.createInput();
    this.inputBox.position(this.x + 10, this.y + this.h - 30);
    this.inputBox.size(this.w - 20, 20);
    this.inputBox.style('font-size', '20px');
    this.inputBox.style('position', 'absolute');
    this.inputBox.style('bottom', '0px');
    this.inputBox.style('background', 'transparent');
    this.inputBox.style('border', '1px solid black');
    this.inputBox.style('color', 'black');
    this.inputBox.style('z-index', '100');

    networkManager.socket.on('chatMessage', (message) => {
      console.log('new chat', message);

      // add newline characters to the message if it is too long
      for (let j = 0; j < message.message.length; j++){
        if (j === 0){
          message.message = '\n' + message.message;
          continue;
        }

        if (j % 30 === 0){
          if (message.message[j] !== ' '){
            for (let k = j; k > 0; k--){
              if (message.message[k] === ' '){
                message.message = message.message.substring(0, k) + '\n' + message.message.substring(k, message.message.length);
                break;
              }
            }
          }
          else{
            message.message = message.message.substring(0, j) + '\n' + message.message.substring(j, message.message.length);
          }
         
        }
      }

      this.AddMessage(message);
    });

  }

  AddMessage(message){
    this.messages.push(message);
  }

  SetMessages(messages){
    this.messages = messages;
  }

  Show(){
    if (!this.isVisibile){
      return;
    }
    
    const transparentColor = this.p5.color(240, 240, 240, 200);

    this.p5.fill(transparentColor);

    console.log(this.x, this.y, this.w, this.h);
    this.p5.rect(this.x, this.y, this.w, this.h);

    let yCounter = this.y + 20; // start at 20 to give some padding
    for (let i = this.messages.length - this.maxMessagesOnScreen; i < this.messages.length; i++){
      if (i < 0){
        continue;
      }

      const bottomMargin = 75;
      if (yCounter > this.h - bottomMargin){
        this.messages.shift(); // remove the first message
        continue;
      }

      this.p5.textSize(20);
      this.p5.fill(0);

      const maxLength = 25;
      let name = this.messages[i].name.length > maxLength ? this.messages[i].name.substring(0, maxLength) : this.messages[i].name; // truncate the name if it is too long

      const splitText = this.messages[i].message.split(/\n/g); // split the message by newline characters

      this.p5.push();

      this.p5.textFont('Arial');
      if (this.messages[i].name === "Server"){
        // Set text style and fill color for server messages
        this.p5.textStyle(this.p5.BOLD);
        this.p5.fill("red");
        name = "SERVER"
      }

      else{
        this.p5.fill(this.messages[i].name === networkManager.client.name ? "blue" : "red");
      }

      this.p5.text(`${name}:`, this.x + 5, yCounter);  // draw the name of the player


      this.p5.textStyle(this.p5.NORMAL);
      this.p5.fill(this.messages[i].name === "Server" ? "red": "black"); // set the fill color for the message
      for (let j = 0; j < splitText.length; j++){
        this.p5.text(`${splitText[j]}`, this.x + 5, yCounter); // draw the message
        yCounter += 25;
      }

      this.p5.pop();

  
      yCounter += 10;
    }
  }

  Update(){
    this.Show();
    this.inputBox.changed(() => {
      networkManager.socket.emit('chatMessage', this.inputBox.value()); // send the message to the server
      this.inputBox.value('');
    });
  }

  set hidden(isHidden){
    this.isVisibile = isHidden;
    if (this.isVisibile){
      this.inputBox.show();
    }

    else{
      this.inputBox.hide()
    }
    
  }

  get hidden(){
    return this.isVisibile; // return the opposite of isVisibile
  }
}










class PieceRenderer{
  constructor(p5){
    this.p5 = p5;

    this.images = {};
    this.pieces = {}

  }

  Preload(){
    this.images[PieceTypes.types.white_pawn] = this.p5.loadImage('images/white_pawn.svg');
    this.images[PieceTypes.types.white_rook] = this.p5.loadImage('images/white_rook.svg');
    this.images[PieceTypes.types.white_knight] = this.p5.loadImage('images/white_knight.svg');
    this.images[PieceTypes.types.white_bishop] = this.p5.loadImage('images/white_bishop.svg');
    this.images[PieceTypes.types.white_queen] = this.p5.loadImage('images/white_queen.svg');
    this.images[PieceTypes.types.white_king] = this.p5.loadImage('images/white_king.svg');

    this.images[PieceTypes.types.black_pawn] = this.p5.loadImage('images/black_pawn.svg');
    this.images[PieceTypes.types.black_rook] = this.p5.loadImage('images/black_rook.svg');
    this.images[PieceTypes.types.black_knight] = this.p5.loadImage('images/black_knight.svg');
    this.images[PieceTypes.types.black_bishop] = this.p5.loadImage('images/black_bishop.svg');
    this.images[PieceTypes.types.black_queen] = this.p5.loadImage('images/black_queen.svg');
    this.images[PieceTypes.types.black_king] = this.p5.loadImage('images/black_king.svg');


  }

  DrawPieces(gameGrid, boardSize, squareSize){
    this.p5.push();
    this.p5.imageMode(this.p5.CENTER);
    
   
    for (let i = 0; i < boardSize; i++){
      for (let j = 0; j < boardSize; j++){
      
      if (gameGrid[j][i] !== PieceTypes.types.empty){
        this.p5.push();
    
        const img = this.images[gameGrid[j][i]];
    
        const piecePosition = {x: i * squareSize, y: j * squareSize};

        // Draw the image of the piece at the specified position
        this.p5.copy(img, 0, 0, img.width, img.height, piecePosition.x, piecePosition.y, squareSize, squareSize);
        this.p5.pop();
      }
      
    }
  }


    this.p5.pop();

  }

  
}

class AI{
  // Get the best move for the AI
  // Using the minimax algorithm with alpha-beta pruning (followed a  video by Sebastian Lague on youtube for this implementation)
  static GetBestMove(grid, depth, side, gameHistory){
    const legalMoves = Action.GetAllLegalMoves(grid, side);
    let bestMove = {score: -Infinity, grid: null, piece: null, i: null, j: null, h: null, k: null};

    for (let i = 0; i < legalMoves.length; i++){
      const newGrid = Action.MovePiece(legalMoves[i].piece, structuredClone(grid), legalMoves[i].i, legalMoves[i].j, legalMoves[i].h, legalMoves[i].k, gameHistory);
      let evaluate = AI.minimax(newGrid, depth - 1, -Infinity, Infinity, side === 'white' ? false : true);


      if (side === 'black') evaluate *= -1;

      if (legalMoves[i].piece === PieceTypes.types.white_pawn || legalMoves[i].piece === PieceTypes.types.black_pawn){
        evaluate += 0.1;
      }

      if (legalMoves[i].j > 3 && legalMoves[i].j < 5){
        evaluate += 0.1;
      }

      if (evaluate > bestMove.score){
        bestMove.score = evaluate;
        bestMove.grid = newGrid;
        bestMove.piece = legalMoves[i].piece;
        bestMove.i = legalMoves[i].i;
        bestMove.j = legalMoves[i].j;
        bestMove.h = legalMoves[i].h;
        bestMove.k = legalMoves[i].k;
      }
    }

    return bestMove;
  } 

  
  // Minimax algorithm with alpha-beta pruning (recursive function)
  static minimax(grid, depth, alpha, beta, maximizingPlayer){
    if (depth === 0){
      return AI.EvaluateMaterial(grid);
    }

    if (maximizingPlayer){
      let maxEval = -Infinity;
      const legalMoves = Action.GetAllLegalMoves(grid, 'white');

      for (let i = 0; i < legalMoves.length; i++){
        const newGrid = Action.MovePiece(legalMoves[i].piece, structuredClone(grid), legalMoves[i].i, legalMoves[i].j, legalMoves[i].h, legalMoves[i].k, new GameHistory(grid));
        const evaluate = AI.minimax(newGrid, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluate);
        alpha = Math.max(alpha, evaluate);
        if (beta <= alpha){
          break;
        }
      }

      return maxEval;
    }

    else{
      let minEval = Infinity;
      const legalMoves = Action.GetAllLegalMoves(grid, 'black');

      for (let i = 0; i < legalMoves.length; i++){
        const newGrid = Action.MovePiece(legalMoves[i].piece, structuredClone(grid), legalMoves[i].i, legalMoves[i].j, legalMoves[i].h, legalMoves[i].k, new GameHistory(grid));
        const evaluate = AI.minimax(newGrid, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluate);
        beta = Math.min(beta, evaluate);
        if (beta <= alpha){
          break;
        }
      }

      return minEval;
    }
  }



  static EvaluateMaterial(grid){
    const materialValues = {
      // Define material values for each piece type
      [PieceTypes.types.white_pawn]: 1,
      [PieceTypes.types.white_rook]: 5,
      [PieceTypes.types.white_knight]: 3,
      [PieceTypes.types.white_bishop]: 3,
      [PieceTypes.types.white_queen]: 9,
      [PieceTypes.types.white_king]: 1000,
      [PieceTypes.types.black_pawn]: -1,
      [PieceTypes.types.black_rook]: -5,
      [PieceTypes.types.black_knight]: -3,
      [PieceTypes.types.black_bishop]: -3,
      [PieceTypes.types.black_queen]: -9,
      [PieceTypes.types.black_king]: -1000,
    }

    let score = 0;
    for (let i = 0; i < grid.length; i++){
      for (let j = 0; j < grid[i].length; j++){
        if (grid[i][j] === PieceTypes.types.empty){
          continue;
        }

        // Add the material value of the piece to the score
        score += materialValues[grid[i][j]];
      }
    }

    return score;

  }
}


class AIChessBoard{
  constructor(p5){
    this.p5 = p5; // Store the p5 instance for drawing functions
    this.board = []; // Initialize an empty board array
    this.boardSize = 8; // Set the board size to 8
    this.squareSize = 80; // Set the size of each square on the board

    this.#createBoard(); // Call the private method to create the board
    this.gameGrid = new GameGrid(); // Create a new game grid
    this.gameHistory = new GameHistory(this.gameGrid.grid); // Create a new game history object
    
    this.renderer = new PieceRenderer(p5); // Create a new piece renderer
    
    this.renderer.Preload(); // Preload the piece images

    this.turn = 'white'; // Set the initial turn to white
  }

  #createBoard(){
    let toggle = true;
    for (let i = 0; i < this.boardSize; i++){
      toggle = !toggle;
      this.board.push([]);
      for (let j = 0; j < this.boardSize; j++){
      // Alternate between 0 and 1 to create a checkerboard pattern
      this.board[i].push(toggle ? 0 : 1);
      toggle = !toggle;
      }
      
    }
  }

  #drawBoard(){
    this.p5.push();

    // Draw the board
    for (let i = 0; i < this.boardSize; i++){
      for (let j = 0; j < this.boardSize; j++){
      // Set the fill color based on the value in the board array
      this.p5.fill(this.board[i][j] === 1 ? this.p5.color(255) : this.p5.color(0, 100, 0));
      // Draw a rectangle for each square on the board
      this.p5.rect(i * this.squareSize, j * this.squareSize, this.squareSize, this.squareSize);
      }
    }

    this.p5.pop();
  }

  #drawPieces(){
    this.renderer.DrawPieces(this.gameGrid.grid, this.boardSize, this.squareSize);
  }

  #aiMove(){
    // Get the best move for the AI
    // Using the minimax algorithm with alpha-beta pruning (followed a video by Sebastian Lague on youtube for this implementation)
    const move = AI.GetBestMove(this.gameGrid.grid, 3, 'black', this.gameHistory);
    console.log(move);
    this.gameGrid.grid = move.grid;
    this.gameHistory.AddMove({piece: move.piece, board: this.gameGrid.grid});

  }

  Update(){
    this.#drawBoard();
    this.#drawPieces();

    function compareBoards(board1, board2){
      if (board1.length !== board2.length || board1[0].length !== board2[0].length){
        return false;
      }

      for (let i = 0; i < board1.length; i++){
        for (let j = 0; j < board1[i].length; j++){
          if (board1[i][j] !== board2[i][j]){
            return false;
          }
        }
      }

      return true;
    }

    if (this.turn === 'black'){
      this.#aiMove();
      this.turn = 'white';
    }
    

    else{
      if (this.p5.mouseIsPressed && this.selectedPiece === null){
        this.selectedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);
      }
  
      else if (!this.p5.mouseIsPressed && this.selectedPiece !== null){
        const clickedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);
        
        if (clickedPiece.i < 0 || clickedPiece.i >= this.boardSize || clickedPiece.j < 0 || clickedPiece.j >= this.boardSize){
          this.selectedPiece = null;
          return;
        }
  
        if (this.selectedPiece === null || this.selectedPiece === undefined){
          return;
        }
        
        if (this.selectedPiece.piece > 6){
          this.selectedPiece = null;
          return;
        }

        
        // Move the selected piece to the clicked position
        const newGrid = Action.MovePiece(this.selectedPiece.piece, structuredClone(this.gameGrid.grid), this.selectedPiece.j, this.selectedPiece.i, clickedPiece.j, clickedPiece.i, this.gameHistory);
        
        // Check if the move resulted in a different board configuration
        if (!compareBoards(newGrid, this.gameGrid.grid)){
          console.log(this.selectedPiece.piece);
          this.gameGrid.grid = newGrid;
          this.turn = this.turn === 'white' ? 'black' : 'white';
        }
        
        // Check if the clicked position contains the selected piece
        if (this.gameGrid.grid[clickedPiece.j][clickedPiece.i] === this.selectedPiece.piece){
          // Add the move to the game history
          this.gameHistory.AddMove({piece: this.selectedPiece.piece, board: this.gameGrid.grid});
        }
        
        // Reset the selected piece
        this.selectedPiece = null;
      }
    
    }
  }
}

class MPChessBoard{
  #myTurn = false;

  constructor(p5){
    this.p5 = p5;
    this.board = [];
    this.boardSize = 8;
    this.squareSize = 80;

    this.gameGrid = new GameGrid();
    this.gameHistory = new GameHistory(this.gameGrid.grid);

    this.renderer = new PieceRenderer(p5);
    this.renderer.Preload();

    this.socket = networkManager.socket;


    this.socket.on('getGameId', (data, callback) => {
      // Get the game id from the session storage
      // Used to reconnect to the game if the page is refreshed

      const gameId = sessionStorage.getItem('gameId');

      callback(gameId);
    });

    this.socket.on('createBoard', (data) => {
      const side = data.side;

      this.side = side;
      this.opponentSide = side === 'white' ? 'black' : 'white';

      this.gameGrid.grid = data.board;


      sessionStorage.setItem('gameId', data.gameId);

      this.#createBoard(); // Create the game board
    });

    this.socket.on('takeTurn', (data) => { 
      console.log('opponent turn');

      this.gameGrid.grid = data.board;

      if (data.side === this.side){
      console.log('my turn');
      this.#takeTurn(); // Take the turn
      }
    });
  }

  #createBoard(){
    let toggle = true;
    for (let i = 0; i < this.boardSize; i++){
      toggle = !toggle;
      this.board.push([]);
      for (let j = 0; j < this.boardSize; j++){
        this.board[i].push(toggle ? 0 : 1);
        toggle = !toggle;
      }
      
    }
  }

  #drawBoard(){
    
    this.p5.push();

    for (let i = 0; i < this.boardSize; i++){
      for (let j = 0; j < this.boardSize; j++){
        this.p5.fill(this.board[i][j] === 1 ? this.p5.color(255) : this.p5.color(0, 100, 0));
        this.p5.rect(i * this.squareSize, j * this.squareSize, this.squareSize, this.squareSize);
      }
    }

    this.p5.pop();
  }

  #takeTurn(){
    this.#myTurn = true;
  }

  Update(){
    if (this.board.length === 0) return;
    this.#drawBoard();

   
    const flippedGrid = structuredClone(this.gameGrid.grid);

    // Reverse the grid if the player is black
    if (this.side === 'black') flippedGrid.reverse();

    // Reverse the rows of the grid if the player is black
    if (this.side === 'black'){
      for (let i = 0; i < flippedGrid.length; i++){
        flippedGrid[i].reverse();
      }
    }
    
    // Draw the pieces on the board
    this.renderer.DrawPieces(flippedGrid, this.boardSize, this.squareSize);

    // Check if it is the player's turn and don't do anything if it is not
    if (!this.#myTurn) return;

    function compareBoards(board1, board2){
      if (board1.length !== board2.length || board1[0].length !== board2[0].length){
        return false;
      }

      for (let i = 0; i < board1.length; i++){
        for (let j = 0; j < board1[i].length; j++){
          if (board1[i][j] !== board2[i][j]){
            return false;
          }
        }
      }

      return true;
    }
    
    if (this.p5.mouseIsPressed && this.selectedPiece === null){
      this.selectedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);
    }

    else if (!this.p5.mouseIsPressed && this.selectedPiece !== null){
      const clickedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);

      //reverse the selcted piece if the player is black
      if (this.side === 'black' && this.selectedPiece !== null && this.selectedPiece !== undefined){
        this.selectedPiece.i = this.boardSize - 1 - this.selectedPiece.i;
        this.selectedPiece.j = this.boardSize - 1 - this.selectedPiece.j;

        clickedPiece.i = this.boardSize - 1 - clickedPiece.i;
        clickedPiece.j = this.boardSize - 1 - clickedPiece.j;

        this.selectedPiece.piece = this.gameGrid.grid[this.selectedPiece.j][this.selectedPiece.i];
      }


      

      if (clickedPiece.i < 0 || clickedPiece.i >= this.boardSize || clickedPiece.j < 0 || clickedPiece.j >= this.boardSize){
        this.selectedPiece = null;
        return;
      }

      if (this.selectedPiece === null || this.selectedPiece === undefined){
        this.selectedPiece = null;
        return;
      }

      if (this.selectedPiece.piece > 6 && this.side === 'white'){
        this.selectedPiece = null;
        return;
      }

      else if (this.selectedPiece.piece < 7 && this.side === 'black'){
        this.selectedPiece = null;
        return;
      }
      
      

      // Move the selected piece to the clicked position
      const newGrid = Action.MovePiece(this.selectedPiece.piece, structuredClone(this.gameGrid.grid), this.selectedPiece.j, this.selectedPiece.i, clickedPiece.j, clickedPiece.i, this.gameHistory);
      if (!compareBoards(newGrid, this.gameGrid.grid)){
        // Send the move to the server
        this.gameGrid.grid = newGrid;
        
        if (this.gameGrid.grid[clickedPiece.j][clickedPiece.i] === this.selectedPiece.piece){
          this.gameHistory.AddMove({piece: this.selectedPiece.piece, board: this.gameGrid.grid});
        }
        
        const gridClone = structuredClone(this.gameGrid.grid);
        this.socket.emit('endTurn', {board: gridClone, i: this.selectedPiece.i, j: this.selectedPiece.j, h: clickedPiece.j, k: clickedPiece.i, piece: this.selectedPiece.piece});
        
      
        this.#myTurn = false;
      }

      if (Action.CheckMate(structuredClone(this.gameGrid.grid), this.selectedPiece.piece, this.selectedPiece.j, this.selectedPiece.i, clickedPiece.j, clickedPiece.i)){
        //checkmate screen

        const checkmateScreen = this.p5.createP('Checkmate');
        checkmateScreen.style('font-size', '50px');
        checkmateScreen.style('position', 'absolute');
        checkmateScreen.style('top', '50%');
        checkmateScreen.style('left', '50%');
        checkmateScreen.style('transform', 'translate(-50%, -50%)');
        checkmateScreen.style('color', 'red');
        checkmateScreen.style('z-index', '100');
      }
      
      this.selectedPiece = null;
      
    }

  }


}

class ChessBoard{
  constructor(p5){
    this.p5 = p5;
    this.board = [];
    this.boardSize = 8;
    this.squareSize = 80;

    this.turn = 'white';
    

    this.#createBoard();
    this.gameGrid = new GameGrid();
    this.gameHistory = new GameHistory(this.gameGrid.grid);
    
    this.renderer = new PieceRenderer(p5);
    
    this.renderer.Preload();


  }

  #createBoard(){
    let toggle = true;
    for (let i = 0; i < this.boardSize; i++){
      toggle = !toggle;
      this.board.push([]);
      for (let j = 0; j < this.boardSize; j++){
        this.board[i].push(toggle ? 0 : 1);
        toggle = !toggle;
      }
      
    }
  }


  #drawBoard(){
    this.p5.push();

    for (let i = 0; i < this.boardSize; i++){
      for (let j = 0; j < this.boardSize; j++){
        this.p5.fill(this.board[i][j] === 1 ? this.p5.color(255) : this.p5.color(0, 100, 0));
        this.p5.rect(i * this.squareSize, j * this.squareSize, this.squareSize, this.squareSize);
      }
    }

    this.p5.pop();
  }

  #drawPieces(){
    this.renderer.DrawPieces(this.gameGrid.grid, this.boardSize, this.squareSize);
  }

  Update(){
    this.#drawBoard();
    this.#drawPieces();

    function compareBoards(board1, board2){
      if (board1.length !== board2.length || board1[0].length !== board2[0].length){
        return false;
      }

      for (let i = 0; i < board1.length; i++){
        for (let j = 0; j < board1[i].length; j++){
          if (board1[i][j] !== board2[i][j]){
            return false;
          }
        }
      }

      return true;
    }
    
    if (this.p5.mouseIsPressed && this.selectedPiece === null){
      this.selectedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);
    }

    else if (!this.p5.mouseIsPressed && this.selectedPiece !== null){
      const clickedPiece = this.gameGrid.getClickedPiece(this.p5.mouseX, this.p5.mouseY);
      
      if (this.selectedPiece !== null && this.selectedPiece !== undefined){
        // Check if the selected piece is the same color as the current turn
        if (this.turn === 'white' && this.selectedPiece.piece > 6){
          this.selectedPiece = null;
          return;
        }

        else if (this.turn === 'black' && this.selectedPiece.piece < 7){
          // Check if the selected piece is the same color as the current turn
          this.selectedPiece = null;
          return;
        }
      }

      if (clickedPiece.i < 0 || clickedPiece.i >= this.boardSize || clickedPiece.j < 0 || clickedPiece.j >= this.boardSize){
        // Check if the clicked position is within the board
        this.selectedPiece = null;
        return;
      }

      if (this.selectedPiece === null || this.selectedPiece === undefined){
        return;
      }
      
      const newGrid = Action.MovePiece(this.selectedPiece.piece, structuredClone(this.gameGrid.grid), this.selectedPiece.j, this.selectedPiece.i, clickedPiece.j, clickedPiece.i, this.gameHistory);
      if (!compareBoards(newGrid, this.gameGrid.grid)){
        this.gameGrid.grid = newGrid;
        this.turn = this.turn === 'white' ? 'black' : 'white';
      }

      if (Action.CheckMate(structuredClone(this.gameGrid.grid), this.selectedPiece.piece, this.selectedPiece.j, this.selectedPiece.i, clickedPiece.j, clickedPiece.i)){
        // Create a checkmate screen

        //checkmate screen

        const checkmateScreen = this.p5.createP('Checkmate');
        checkmateScreen.style('font-size', '50px');
        checkmateScreen.style('position', 'absolute');
        checkmateScreen.style('top', '50%');
        checkmateScreen.style('left', '50%');
        checkmateScreen.style('transform', 'translate(-50%, -50%)');
        checkmateScreen.style('color', 'red');
        checkmateScreen.style('z-index', '100');


      }
      

      if (this.gameGrid.grid[clickedPiece.j][clickedPiece.i] === this.selectedPiece.piece){
        this.gameHistory.AddMove({piece: this.selectedPiece.piece, board: this.gameGrid.grid});
        
      }
      
      
      this.selectedPiece = null;
    }
  }
}


class GameGrid{
  constructor(){
    this.grid = [];
    this.size = 8;
    
    this.pieceTypes = PieceTypes.types;

    this.#populateGrid();
  }

  #populateGrid(){
    const ee = this.pieceTypes.empty;

    const wp = this.pieceTypes.white_pawn;
    const wr = this.pieceTypes.white_rook;
    const wk = this.pieceTypes.white_knight;
    const wb = this.pieceTypes.white_bishop;
    const wq = this.pieceTypes.white_queen;
    const wK = this.pieceTypes.white_king;

    const bp = this.pieceTypes.black_pawn;
    const br = this.pieceTypes.black_rook;
    const bk = this.pieceTypes.black_knight;
    const bb = this.pieceTypes.black_bishop;
    const bq = this.pieceTypes.black_queen;
    const bK = this.pieceTypes.black_king;

    

    this.grid = [
      [br, bk, bb, bq, bK, bb, bk, br],
      [bp, bp, bp, bp, bp, bp, bp, bp],
      [ee, ee, ee, ee, ee, ee, ee, ee],
      [ee, ee, ee, ee, ee, ee, ee, ee],
      [ee, ee, ee, ee, ee, ee, ee, ee],
      [ee, ee, ee, ee, ee, ee, ee, ee],
      [wp, wp, wp, wp, wp, wp, wp, wp],
      [wr, wk, wb, wq, wK, wb, wk, wr]
    ];
  }

  getClickedPiece(x, y){
    // Get the piece at the clicked position

    const worldPos = p5Camera.ScreenToWorld(x, y);
    const squareSize = 80;

    const i = Math.floor(worldPos.x / squareSize);
    const j = Math.floor(worldPos.y / squareSize);

    return {i, j, piece: this.grid[j][i]};
  }


}







let gameWindowSketch;
window.addEventListener('load', () => {
  gameWindowSketch = new p5(loadingSketch);

});





























const express = require('express');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');

const {Action,
    GameHistory,
    PieceTypes,
    GeneralRules,
    PieceRules} = require('./rules.js');


const app = express();
const port = 3000;
const localIP = '0.0.0.0'

app.use(express.static('public'));

const server = app.listen(port, localIP, () => {
    console.log(`Server is running on port ${port}`);
});


const socket = require('socket.io');
const io = socket(server);






class Room{
    constructor(id, io){
        this.id = id; // Unique identifier for the room
        this.io = io; // Socket.io instance
        this.clients = {}; // Object to store connected clients

        this.chat = new Chat(this); // Create a new Chat instance for the room
        this.game = new Game(this); // Create a new Game instance for the room
    }

    AddClient(client){
        this.clients[client.id] = client;
        client.socket.on('getPlayerList', (data, callback) => {
            callback({
            players: Object.values(this.clients).map((client) => client.name), // Get the names of all connected clients
            playerCount: Object.values(this.clients).length, // Get the total number of connected clients
            pings: Object.values(this.clients).map((client) => client.ping) // Get the ping values of all connected clients
            });
        });
        this.chat.addClient(client); // Add the client to the chat
        this.game.setupClient(client); // Setup the client for the game
    }

    reconnectClient(client, gameId){
        this.clients[client.id] = client;
        client.socket.on('getPlayerList', (data, callback) => {
            callback({
            players: Object.values(this.clients).map((client) => client.name), // Get the names of all connected clients
            playerCount: Object.values(this.clients).length, // Get the total number of connected clients
            pings: Object.values(this.clients).map((client) => client.ping) // Get the ping values of all connected clients
            });
        });
        this.chat.addClient(client); // Add the client to the chat
        this.game.reconnectClient(client, gameId); // Reconnect the client to the game with the specified gameId
    }

    RemoveClient(client){
        // Disconnect the client from the game
        this.game.disconnect(client);

        // Remove the client from the chat
        this.chat.removeClient(client);

        // Delete the client from the clients object
        delete this.clients[client.id];
    }

    Update(){
        
        for (let client in this.clients){
            this.clients[client].getPing();
        }

        this.game.Update();
    }
}

class ServerNetworkManager{
    constructor(io){
        this.io = io;

        setTimeout(() => {
            // Reset all already connected clients
            this.io.sockets.emit('serverStartUp', 'reset');
        }, 1000);


        this.clients = {};
        this.rooms = {};

        this.maxRoomSize = 2;

        setInterval(() => {
            this.Update();
        }, 1000/5);
    }

    async connection(socket){
        console.log('New connection', socket.id);
 
        // Function to get the game ID
        function getGameId(timeout = 1000){
            let reconnectGameId = null;

            return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(reconnectGameId);
            }, timeout);

            // Emit 'getGameId' event to server
            socket.emit('getGameId', {}, (response) => {
                if (response === null || response === undefined || response === ''){
                return;
                }

                reconnectGameId = response;

                resolve(reconnectGameId);
            });
            });
        }

        // Get the game ID with a timeout of 500 milliseconds
        let reconnectGameId = await getGameId(500);
           

        // Loop through the rooms to find the matching game ID
        for (const room in this.rooms){
            if (this.rooms[room].game.gameId === reconnectGameId && this.rooms[room].clients.length < this.maxRoomSize){
            
                const backendClient = new BackendClient(socket.id, socket, this.rooms[room]);

                socket.join(this.rooms[room].id);
                this.clients[socket.id] = backendClient;
                this.rooms[room].reconnectClient(backendClient, reconnectGameId);
                

                console.log(reconnectGameId, 'reconnecting', room, this.rooms[room].game.gameId);

                return;
            }
        }


        if (Object.keys(this.clients).length % this.maxRoomSize === 0){
            const room = new Room('room' + Object.keys(this.rooms).length, this.io);
            this.rooms[room.id] = room;
        }

        const backendClient = new BackendClient(socket.id, socket, this.rooms[Object.keys(this.rooms)[Object.keys(this.rooms).length - 1]]);
        this.clients[socket.id] = backendClient;

        

        
        
        this.rooms[Object.keys(this.rooms)[Object.keys(this.rooms).length - 1]].AddClient(backendClient);
        socket.join(this.rooms[Object.keys(this.rooms)[Object.keys(this.rooms).length - 1]].id);
    } 

    disconnection(socket){
        console.log('Disconnected', socket.id);

        const room = this.clients[socket.id].room;

        const chatHistory = room.chat.messageTrackers[socket.id].chatHistory;
        this.rooms[room.id].RemoveClient(this.clients[socket.id]);

        if (room.clients.length === 0){ 
            delete this.rooms[room.id];
            console.log(this.rooms)
        }

        //save chat history to txt file

        // format chat history
        let chatString = '';
        chatHistory.forEach((chat) => {
            chatString += `${((chat.time)/1000).toFixed(2)}s - ${chat.name} (${chat.id}): "${chat.message}"\n`;
        });
        fs.appendFile(path.join(__dirname, 'contentModeration/userChatHistory.txt'), chatString, (err) => {
            if (err){
                console.error(err);
                return;
            }
        });

        delete this.clients[socket.id];
    }

    Update(){
        for (let room in this.rooms){
            this.rooms[room].Update();
        }
    }
}

class BackendClient{
    constructor(id, socket, room){
        this.id = id;
        this.socket = socket;
        this.room = room;

        this.maxNameLength = 25;

        this.name = 'Player_' + crypto.randomUUID();
        this.name.length > this.maxNameLength ? this.name = this.name.substring(0, this.maxNameLength) : this.name = this.name;

        this.socket.emit('setName', this.name);

        this.socket.on('setName', (name) => {
            //check if name matches any other client name
            const names = Object.values(this.room.clients).map((client) => client.name);

            name = name.trim();
            if (name.length > 0 && !names.includes(name) && name !== 'Server' && name.length <= this.maxNameLength){
                this.name = name;
            }

            else{
                this.socket.emit('setName', this.name);
            }

            const newName = this.name.replaceAll(/\s/g, '_');
            if (newName !== this.name){
                this.name = newName;
                this.socket.emit('setName', this.name);
            }


        });

        this.ping = 0;

    }

    getPing(){
        const start = performance.now();
        this.socket.emit('ping', performance.now(), (err, data) => {
           this.ping = performance.now() - start;
        });
    }
}

class Game{
    constructor(room){
        this.room = room;
        this.gameGrid = new GameGrid(8, 8);

        this.gameHistory = new GameHistory();

        this.turn = 'white';

        this.gameId = crypto.randomUUID();

        this.sides = ['black', 'white'];

        this.players = {};
    }   

    reconnectClient(client){
        // Determine the side of the client based on the existing players
        const side = Object.values(this.players).includes('white') ? 'black' : 'white';
        this.players[client.id] = side;
           
        // Emit the 'createBoard' event to the client with the side and game board
        client.socket.emit('createBoard', {side, board: this.gameGrid.grid, gameId: this.gameId});

        console.log(this.turn)
        // Emit the 'takeTurn' event to all clients in the room with the current game board and turn side
        this.room.io.to(this.room.id).emit('takeTurn', {board: this.gameGrid.grid, side: this.turn});

        
        client.socket.on('endTurn', (data) => {
            try{

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


                const i = data.i;
                const j = data.j;
                const h = data.h;
                const k = data.k;

                const board = data.board;
                const piece = data.piece;


                if (compareBoards(board, Action.MovePiece(piece, this.gameGrid.grid, i, j, h, k, this.gameHistory))){

                    console.log('Invalid move');

                    //return;
                }


                if (Action.CheckMate(board, piece, i, j, h, k)){
                    console.log('Checkmate');
                }


                this.gameGrid.grid = board;
                this.gameHistory.AddMove({piece, board})

                this.turn = this.turn === 'white' ? 'black' : 'white';
                this.room.io.to(this.room.id).emit('takeTurn', {board, side: this.turn});
            }

            catch(e){
                console.log('Invalid move')
                console.error(e);
                console.log('------------')
            }
        });
            
        
    }

    setupClient(client){
        console.log('Setting up client', client.id);

        const side = this.sides.pop();
        client.socket.emit('createBoard', {side, board: this.gameGrid.grid, gameId: this.gameId});

        this.players[client.id] = side;
    
        
        if (Object.keys(this.room.clients).length === 2){
            this.room.io.to(this.room.id).emit('takeTurn', {board: this.gameGrid.grid, side: this.turn});
        }

        client.socket.on('endTurn', (data) => {
            try{

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


                const i = data.i;
                const j = data.j;
                const h = data.h;
                const k = data.k;

                const board = data.board;
                const piece = data.piece;


                if (compareBoards(board, Action.MovePiece(piece, this.gameGrid.grid, i, j, h, k, this.gameHistory))){

                    console.log('Invalid move');

                    return;
                }


                if (Action.CheckMate(board, piece, i, j, h, k)){
                    console.log('Checkmate');
                }


                this.gameGrid.grid = board;
                this.gameHistory.AddMove({piece, board})

                this.turn = this.turn === 'white' ? 'black' : 'white';
                this.room.io.to(this.room.id).emit('takeTurn', {board, side: this.turn});
            }

            catch(e){
                console.log('Invalid move')
                console.error(e);
                console.log('------------')
            }
        });

    

    }

    disconnect(client){
        // Check the side of the client and add it back to the available sides
        if (this.players[client.id] === 'white'){
            this.sides.push('white');
        }

        else{
            this.sides.push('black');
        }

        // Remove the client from the players list
        delete this.players[client.id];
    }

    Update(){

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
  
  
  
  }
  



class ChatTracker{
    constructor(id, room, name){
        this.id = id;
        this.room = room;
        this.name = name;

        this.lastChatTime = null;
        this.chats = {}

        this.chatHistory = [];
        
        this.maxMessageFrequency = 15; // messages per minute
        this.maxMessageLength = 150;
        this.timeoutDuration = 1000 * 15; // 15 seconds (in milliseconds)
        
        this.isTimedOut = false;
    }

    newChat(message){
        return new Promise((resolve, reject) => {
            if (this.isTimedOut){
                return;
            }
    
            this.chatHistory.push({id:this.id, name:this.name, message, time: performance.now()});
    
            this.lastChatTime = performance.now();
            this.chats[this.lastChatTime] = message;
    
            let shouldTimeout = false;
    
    
            // Check if the user has typed too many messages in the last minute
            let messageCount = 0;
            for (let chat in this.chats){
                const MINUTE = 60000; // milliseconds
                if (this.lastChatTime - chat < MINUTE){
                    messageCount++;
                }
            }
    
            if (messageCount > this.maxMessageFrequency){
                shouldTimeout = true;
            }
    
    
            // Check if the message is too long
            if (message.length > this.maxMessageLength){
                shouldTimeout = true;
            }
    
    
    
            if (shouldTimeout){
                this.timeout();
                resolve(true);
            }

            else{
                // content moderation
                fs.readFile(path.join(__dirname, 'contentModeration/youtubeBannedWords.txt'), 'utf8', (err, data) => {
                    if (err){
                        console.error(err);
                        return;
                    }
        
                    const badWords = new Set(data.split(','));
                    const messageWords = message.split(' ');
        
                    for (let word of messageWords){
                        if (badWords.has(word)){
                            this.timeout();
                            resolve(true);
                            return;
                        }
                    }
                    
                    resolve(false);
                });
            }
            
        });
    }

    timeout(){
        // Emit a chat message to all clients in the room indicating that the user has been timed out
        this.room.io.to(this.room.id).emit('chatMessage', {
            name: 'Server',
            id: 'server',
            message: `${this.name} has been timed out for ${this.timeoutDuration / 1000} seconds`
        });

        // Set the 'isTimedOut' flag to true
        this.isTimedOut = true;

        // After the timeout duration, reset the lastChatTime, chats, and isTimedOut properties
        setTimeout(() => {
            this.lastChatTime = null;
            this.chats = {};
            this.isTimedOut = false;
        }, this.timeoutDuration);

       
    }

}

class Chat{
    constructor(room){
        this.room = room;
        this.messages = []


        this.messageTrackers = {};

        Object.values(this.room.clients).forEach((client) => {
            this.addClient(client);
        });
    }

    addClient(client){
        this.messageTrackers[client.id] = new ChatTracker(client.id, this.room, client.name);
        
        client.socket.on('chatMessage', (message) => {
            this.messageTrackers[client.id].name = client.name;
                
            
            this.messageTrackers[client.id].newChat(message).then((timedOut) => {
                if (timedOut){
                    return;
                }
                
                this.messages.push({
                    name: client.name,
                    id: client.id,
                    message: message
                });

                

                this.room.io.to(this.room.id).emit('chatMessage', {
                    name: client.name,
                    id: client.id,
                    message: message
                });
            });


 

            
        });
    }

    removeClient(client){
        client.socket.removeAllListeners('chatMessage');
        delete this.messageTrackers[client.id];
    }

}







const serverNetworkManager = new ServerNetworkManager(io);

io.on('connection', (socket) => {
    serverNetworkManager.connection(socket);

    socket.on('disconnect', () => {
        serverNetworkManager.disconnection(socket);
    });
});


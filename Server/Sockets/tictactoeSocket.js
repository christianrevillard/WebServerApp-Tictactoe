// some stuff to extract to a twoPlayersGame/turnGame base class?
var serverController = require('../../CreanvasNodeModule/ServerController');

var games = [];

// called only for the first of all users
var startApplication = function(socketName) {

	var tictactoe = exports.applicationSocket = socketName;

	console.log('Setting up tictactoe socket ');
	
	// called for each user
	tictactoe.on('connection', function(socket){
		console.log('user connected: ' + socket.id);
				
		socket.on('disconnect', function(){
			
			console.log('user disconnected');});
  
		socket.on('joinGame', function()
		{
			if (games.length == 0 || games[games.length-1].playerO)
			{			
				console.log('Starting a game' );
				games.push(new TicTacToeGame(tictactoe, socket, 'game' + games.length));
			}
			else
			{			
				console.log('Joining a game' );
				games[games.length-1].join(socket);
			}
			
			socket.on('disconnect', function(){
				games[games.length-1].controller.applicationInstanceBroadcast(
					socket, 'textMessage', {message:'He has left !'});
			});
		});
	});
};

var TicTacToeGame = function(tictactoe, socket, gameName){
	var game = this;
	
	this.controller = new serverController.Controller(tictactoe, gameName, true)
	this.controller.addSocket(socket);	
	this.playerX = socket.id;	
	this.controller.emitToSocket(socket.id, 'textMessage', {message:'New game, you are X'});

	this.blockedX = false;
	this.blockedO = true;

	this.ondropX = function(dropzone, dropped){ 
		game.blockedX = true; 
		game.blockedO = false;
		game.controller.applicationInstanceEmit('textMessage',  {message:'X has played !'});
		game.controller.emitToSocket(game.playerO, 'textMessage',  {message:'Your turn !'});
		game.currentPlayer.position.y = 325;
		game.checkWin('X');
	};

	this.ondropO = function(dropzone, dropped){ 
		game.blockedO = true; 
		game.blockedX = false;
		game.controller.applicationInstanceEmit('textMessage',  {message:'O has played !'});
		game.controller.emitToSocket(game.playerX, 'textMessage',  {message:'Your turn !'});
		game.currentPlayer.position.y = 150;
		game.checkWin('O');
	};


	this.controller.addAxeAlignedBox({
		name: 'Xsource',
		clientType: 'X',
		left:0,
		right:700,
		top:0,
		bottom:20,
		position: {x: 600, y: 150, angle: Math.PI / 4},
		duplicable: {"generatorCount":3, "isBlocked":function(element, originSocketId){return game.blockedX || originSocketId != game.playerX;}},
		droppable: {onDrop: game.ondropX},
		moving: {speed: {angle:Math.PI / 16}}
	});

	this.currentPlayer = this.controller.addElement ({
		name: 'currentPlayer',
		clientType: 'currentPlayer',
		box: { width:150, height:150},
		position: {x: 600, y: 150, z:-100}
	});

	var tttCase = function(x,y)
	{
		return game.controller.addElement({
				name: 'case(' + x + ',' + y + ')',
				clientType: 'case',
				box: {width:150, height:150, top:0, left:0 },
				position: {x: 100 + x*150, y: 100 + y*150, z:-100 },			
				dropZone: {dropX: 100 + x*150, dropY: 100 + y*150, availableSpots:1 } 
		});
	};
					
	this.cases = [];

	for (var i = 0; i<3; i++)
	{		
		this.cases[i] = [];
		for (var j = 0; j<3; j++)
		{
			this.cases[i][j] = tttCase(i,j);			
		}
	}
};

TicTacToeGame.prototype.checkWin = function(typeName){
	var played = [];
	
	for (var i = 0; i<3; i++) { for (var j = 0; j<3; j++) {		
		if (this.cases[i][j].dropZone.droppedElements.length>0 && this.cases[i][j].dropZone.droppedElements[0].clientType == typeName)
		{
			played.push({i:i, j:j, dropped: this.cases[i][j].dropZone.droppedElements[0]});
		}
	}}
	
	if (played.length<3) return;				
	
	if ((played[0].i-played[1].i)*(played[0].j-played[2].j) == (played[0].j-played[1].j)*(played[0].i-played[2].i))
	{
		if (typeName == 'O')
		{
		for(var k=0; k<3; k++)
		{
			played[k].dropped.controller.addElement
			({
				name: 'winner',
				clientType: 'currentPlayer',
				box: {width:150, height:150},
				position: {x: played[k].dropped.position.x, y: played[k].dropped.position.y, z:-50}
			});
		}
		}
		else
		{
			for(var k=0; k<3; k++)
			{
				played[k].dropped.clientType = 'XWin';
			}
			
		}
		this.currentPlayer.y = typeName=='X'?150:325;
		this.controller.applicationInstanceEmit('textMessage',  {message:typeName + ' has won !!!'});
		this.blockedX = true;
		this.blockedO = true;
	}
};

TicTacToeGame.prototype.join = function(socket){	
	var game = this;
	
	this.controller.addSocket(socket);
	this.controller.applicationInstanceBroadcast(socket, 'textMessage', {message:'O has joined'});
	this.controller.emitToSocket(socket.id, 'textMessage', {message:'New game, you are O'});
	this.playerO = socket.id;

	this.controller.elements.forEach(function(e){ 
		// force Update
		e.previousClientData  = null;
	});
	
	this.controller.addAxeAlignedBox({
		name: 'Osource',
		clientType: 'O',
		left:0,
		right:700,
		top:0,
		bottom:20,
		position:  {x: 600, y: 325, scale : {x: 0.8, y: 1.2}},			
		duplicable: {"generatorCount":3, "isBlocked":function(element, originSocketId){return game.blockedO || originSocketId != game.playerO;}},
		droppable:  {onDrop: game.ondropO},
		moving: {},
/*		customTimer: {
		  	  "time": 50, //ms
			  "action": function()
			  {				  
				  if (this.scale.x>=1.2)
				  {
					  this.moving.scaleSpeed.x = -0.6;
					  this.moving.scaleSpeed.y = +0.6;
				 }
				  else if (this.scale.x<=0.8)
				  {
					  this.moving.scaleSpeed.x = 0.6;
					  this.moving.scaleSpeed.y = -0.6;
				  }
			  }		
		}*/
	});
};

exports.startApplication = startApplication;
exports.applicationSocket = null;
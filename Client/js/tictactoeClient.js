// todo:
// edges on addDrawing, not add element=>easier to shift drawing !

// Game details handled by Node server
// controls: isBlocked, drop-event, game win/lose
// All hanlding on server
// client
// -- get info on new locations
// -- draws elements
// -- send user events to server.
// CreanvasMOdule under parallel development here...
// Register element through socket, let the server work, get the updates sometimes...
// Is background an element in full right?

var CreTictactoe = CreTictactoe || {};

CreTictactoe.onload = function ()
{		
	var socket = 
		window.location.href.indexOf('rhcloud.com')>-1?
	    io("http://nodejs-creweb.rhcloud.com:8000/tictactoeOnline/tictactoeSocket"):
		io("/tictactoeOnline/tictactoeSocket");
	 		
	var theCanvas = document.getElementById('theCanvas');
	var txtArea = document.getElementById('txtArea');

	var controller = new CreJs.CreanvasNodeClient.NodeJsController({
		"nodeSocket":socket,
		"lengthScale":1,
		"canvas":theCanvas
		//"log": new CreJs.Crelog.Logger().logMessage,
		});

	controller.addBackground(
		function (context) {
			context.strokeStyle = "#000";
			context.fillStyle = "#666";
			context.fillRect(0,0,700,500);
			var gradient = context.createLinearGradient(100,100,600,400);
			gradient.addColorStop(0.0,"#EEE");
			gradient.addColorStop(1.0,"#999");				
			context.fillStyle = gradient;
			context.fillRect(25,25,450,450);
			context.fillRect(525,75,150,150);
			context.fillRect(525,250,150,150);				
			context.moveTo(25+150,25);
			context.lineTo(25+150,25+450);
			context.moveTo(25+300,25);
			context.lineTo(25+300,25+450);
			context.moveTo(25,25+150);
			context.lineTo(25+450,25+150);
			context.moveTo(25,25+300);
			context.lineTo(25+450,25+300);
			context.lineWidth=4;
			context.lineCap='round';
			context.stroke();
		});

	controller.addElementType(
		"currentPlayer",
		function (context) {
			var gradient = context.createLinearGradient(25,25,525,325);
			gradient.addColorStop(0.0,"#FF0");
			gradient.addColorStop(1.0,"#BBB");					
			context.fillStyle = gradient;
			context.fillRect(-75,-75,150,150);
		},
		{width:150, height:150}		
	);
			
	controller.addElementType(
		"X",
		function (context) {
			var color1, color2;
			if (this.dropZone)
			{
				color1 =  "#D22";
				color2= "#600";
			}
			else
				{
				color1 = "#F44";
				color2= "#900";
			}
			context.lineCap='round';
			context.lineWidth=40;
			context.moveTo(-50,-50);
			context.bezierCurveTo(50,0,0,50,50,50);
			context.moveTo(-50,50);
			context.bezierCurveTo(-20,0,30, -25, 50, -50);
			var gradient = context.createLinearGradient(-45,-30,55,60);
			gradient.addColorStop(0.0,color1);
			gradient.addColorStop(1.0,color2);
			context.strokeStyle = gradient;
			context.stroke();
			context.moveTo(-50,-50);
			context.lineTo(50,-50);
			context.moveTo(50,50);
			context.lineTo(-50,50);
			
			context.arc(0,0,50,0,2*Math.PI);
		},
		{width:150, height:150}		
	);
	
	controller.addElementType(
			"XWin",
			function (context) {
				context.lineCap='round';
				context.lineWidth=40;
				context.moveTo(-50,-50);
				context.bezierCurveTo(50,0,0,50,50,50);
				context.moveTo(-50,50);
				context.bezierCurveTo(-20,0,30, -25, 50, -50);
				var gradient = context.createLinearGradient(-45,-30,55,60);
				gradient.addColorStop(0.0,"#FF0");
				gradient.addColorStop(1.0,"#BBB");					
				context.strokeStyle = gradient;
				context.stroke();
				context.moveTo(-50,-50);
				context.lineTo(50,-50);
				context.moveTo(50,50);
				context.lineTo(-50,50);
				
				context.arc(0,0,50,0,2*Math.PI);
			}
		);


	controller.addElementType(
		'O',
		function (context) {
			var color1, color2;
			if (this.dropZone)
			{
				color1 = "#88F";
				color2= "#FFF";
			}
			else
			{
				color1 =  "#AAF";
				color2= "#DDD";
			}
			context.arc(0,0,50,0,2*Math.PI);
			var gradient = context.createRadialGradient(0,0,45,-10,-5,3);
			gradient.addColorStop(0.0,color1);
			gradient.addColorStop(1.0,color2);
			context.fillStyle = gradient;
			context.fill();
		},
		{width:150, height:150}		
	);

	controller.addElementType(
		'case',
		function (context) {
			// 99% transparent!
			context.fillStyle ="rgba(0,0,0,0.01)"; 
			context.fillRect(-70,-70,140,140);
		},
		{width:150, height:150}		
	);
	
	controller.addElementType(
		'resetButton',
		function (context) {
			context.arc(0,0,25,0,2*Math.PI);
			var gradient = context.createRadialGradient(0,0,25,-10,-5,5);
			gradient.addColorStop(0.0,"#00F");
			gradient.addColorStop(0.5,"#FFF");
			gradient.addColorStop(1.0,"#F00");
			context.fillStyle = gradient;
			context.fill();
		},
		{width:150, height:150}				
	);

	var textMessage = '';
	
	controller.displayMessage = function (ctx){
		ctx.font="30px Verdana";
		// Create gradient
		var gradient=ctx.createLinearGradient(0,0,ctx.canvas.width,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");
		// Fill with gradient
		ctx.fillStyle=gradient;
		ctx.fillText(textMessage,10,90);					
	};
	
	controller.onTextMessage = function(messageData)
	{
		textMessage +='             ' + messageData['message'];

		var messageInterval;
		if (!messageInterval)
		{
			messageInterval = setInterval(
					function(){ 
						textMessage = textMessage.slice(1);
						if (textMessage.length == 0 )
							clearInterval(messageInterval)
					},100);
		}		
	};
	
	
	// fix Galaxy Chrome scrolling bug
	document.addEventListener(
		"touchmove", function touchHandlerDummy(e)
		{
		    e.preventDefault();
		    return false;
		},
		false);	
	
	// start or join, to handle on server...
	socket.emit('joinGame','');
};
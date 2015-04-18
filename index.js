var server = require('cre-nodejs-server');

var handlers = [];

handlers = server.addDefaultHandlers(
  handlers,                           // only defaults
  'TicTacToeOnline/Client/html/tictactoeClient.html' // Start page
);

server.server.start(
  require('path').resolve(__dirname), // root 
  handlers
);

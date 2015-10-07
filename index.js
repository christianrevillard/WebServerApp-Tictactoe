var server = require('cre-nodejs-server');

server.start({
  pageHeader: 'Lib/Client/html/commonHeader.html',
  rootDirectory: require('path').resolve(__dirname), 
  routes: [{ route: "/", handler: server.clientFileHandler('TicTacToeOnline/Client/html/tictactoeClient.html') }],
  sockets: ['/TicTacToeOnline/Server/tictactoeSocket']
});

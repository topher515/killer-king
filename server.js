
var 
  gameport        = process.env.PORT || 4004,
  app             = require('express')(),
  http            = require('http').Server(app),
  UUID            = require('node-uuid'),
  io              = require('socket.io')(http),
  _               = require('lodash'),
  verbose         = false

;



var players = {};


app.get( '/', function( req, res ){ 
  res.sendFile( __dirname + '/index.html' );
});

app.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
  var file = req.params[0]; 

    //For debugging, we can track what files are requested.
  if(verbose) console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
  res.sendFile( __dirname + '/' + file );

}); //app.get *


http.listen(4004, function(){
  console.log('listening on *:4004');
});



io.on('connection', function (client) {
  
  var playerId = _.uniqueId();

  client.playerId = playerId;

  players[playerId] = { 
    id: playerId
  }

    //tell the player they connected, giving them their id
  client.emit('onconnected', { id: client.playerId } );

    //Useful to know when someone connects
  console.log('\t socket.io:: player ' + playerId + ' connected');
  
  // When this client disconnects
  client.on('disconnect', function () {
      //Useful to know when someone disconnects
    console.log('\t socket.io:: client disconnected ' + playerId );

  }); 

  client.on('mystate', function(data) {
    
    _.extend(players[playerId], data);

  });

}); 


setInterval(function() {

  io.sockets.emit('perception', {
    isPartial: false,
    players: players,
  })

}, 50);




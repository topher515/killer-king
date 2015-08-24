
var 
  gameport        = process.env.PORT || 4004,
  app             = require('express')(),
  http            = require('http').Server(app),
  UUID            = require('node-uuid'),
  io              = require('socket.io')(http),
  _               = require('lodash'),
  p2              = require('p2'),
  kkphys          = require('./phys.js'),
  verbose         = false

;



var playerDatas = {};



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







var level = new kkphys.Level();



io.on('connection', function (client) {
  

  var player = new Player({ id:_.uniqueIq(), position:[50, 60] })


  console.log('\t Player ' + player.id + ' connected');

    //tell the player they connected, giving them their id
  client.emit('onconnected', player.serialize());
  
  client.on('disconnect', function () {
    console.log('\t Player ' + player.id + ' quit');

    player.destroy();

    io.sockets.emit('quit.player', { id: player.id });

  }); 

  client.on('action', function(data) {
    
    player.doAction(data);

  });

}); 




// Calc phyics
setInterval(function() {
  kkphys.world.step(10/60);

}, 100);


// Emit world state
setInterval(function() {

  io.sockets.emit('perception', {
    players: _.map(players, function(p) { return p.serialize(); } ,
  });

}, 250);




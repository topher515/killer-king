

   var 
    gameport        = process.env.PORT || 4004,

    app             = require('express')(),
    http            = require('http').Server(app),
    UUID            = require('node-uuid'),
    io              = require('socket.io')(http),

    verbose         = false
  ;



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
    
      //Generate a new UUID, looks something like 
      //5b2ca132-64bd-4513-99da-90e838ca47d1
      //and store this on their socket/connection
    client.userid = UUID();

      //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

      //Useful to know when someone connects
    console.log('\t socket.io:: player ' + client.userid + ' connected');
    
      //When this client disconnects
    client.on('disconnect', function () {

        //Useful to know when someone disconnects
      console.log('\t socket.io:: client disconnected ' + client.userid );

    }); 
   
  }); 
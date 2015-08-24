
//This is all that needs
var socket = io();

var game = new Phaser.Game(400, 300, Phaser.AUTO, '', { preload: preload, create: create, update: update });



var playerCollisionGroup = game.physics.p2.createCollisionGroup();
var platformsCollisionGroup = game.physics.p2.createCollisionGroup();

var players = {};
var myPlayer;
var myId;

var platforms;
var cursors;

var score = 0;
var scoreText;

var timer;

var created = Deferred();


var isMaster = false;






// function createPlayer(data) {
//     // The player and its settings
    

//     //  We need to enable physics on the player
//     game.physics.arcade.enable(player);

//     //  Player physics properties. Give the little guy a slight bounce.
//     player.body.bounce.y = 0.2;
//     player.body.gravity.y = 400;
//     player.body.collideWorldBounds = true;   
    
//     //  Our two animations, walking left and right.


//     player.setCollisionGroup(playerCollisionGroup);

//     if (data) {
//       updatePlayerState(player, data);
//     } 

//     return player;
// }




function updatePlayerFromAction(player, action) {
  if (action.go === 'left') {
    player.body.velocity.x = -150;

  } else if (action.go === 'right') {
    player.body.velocity.x = 150;

  } else {
    player.body.velocity.x = 0;
  }
}


function updatePlayerState(player, data) {
  player.body.x = _.isNumber(data.x) ? data.x : player.body.x;
  player.body.y = _.isNumber(data.y) ? data.y : player.body.y;
  _.extend(player.body.acceleration, data.acceleration);
  _.extend(player.body.velocity, data.velocity);

}


function getPlayerState(player) {
  var data = {
    x: player.body.x,
    y: player.body.y,
    acceleration:{
      x: player.body.acceleration.x,
      y: player.body.acceleration.y,
    },
    velocity: {
      x: player.body.velocity.x,
      y: player.body.velocity.y,
    }
  };
  return data;
}


function collectStar (player, star) {
    
  // Removes the star from the screen
  star.kill();

  //  Add and update the score
  score += 10;
  scoreText.text = 'Score: ' + score;

}


socket.on('onconnected', function( data ) {

  created.done(function() {
    //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
    console.log('Connected successfully to the socket.io server. My playerId is ' + data.id );
    console.log('Master == ' + data.isMaster);
    isMaster = data.isMaster;
    myId = data.id;
    myPlayer = players[myId] = createPlayer();    
  });

});



function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

}


function create() {

  //// Create world

  kkphys.setupDefaultPlatformBodies();

  //  We're going to be using physics, so enable the Arcade Physics system
  // game.physics.startSystem(Phaser.Physics.ARCADE);
  // game.physics.startSystem(Phaser.Physics.P2JS);
  // game.physics.p2.setImpactEvents(true);
  // game.physics.p2.restitution = 0.8;
  // game.physics.p2.updateBoundsCollisionGroup();

  //  A simple background for our game
  game.add.sprite(0, 0, 'sky');




  players = game.add.group();
  // players.enableBody = true;
  // platforms.physicsBodyType = Phaser.Physics.P2JS;


  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();
  // platforms.enableBody = true;
  // platforms.physicsBodyType = Phaser.Physics.P2JS;


  // function makePlatform(platform) {
  //   platform.body.immovable = true;
  //   platofmr.body.setRectangle(400, 32);
  //   platform.body.setCollisionGroup(platformsCollisionGroup);
  //   platform.body.collides([platformsCollisionGroup, playerCollisionGroup]);
  //   return platform;
  // }

  // var ground = makePlatform(platforms.create(0, game.world.height - 32, 'ground'));
  // //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  // // ground.scale.setTo(2, 2);
  // makePlatform(platforms.create(200, 200, 'ground'));
  // makePlatform(platforms.create(-100, 105, 'ground'));




  //  The score
  // scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //  Our controls.
  cursors = game.input.keyboard.createCursorKeys();


  created.resolve();

  timer = game.time.create();

  timer.loop(50, function() {
    if (myPlayer) {
      socket.emit('mystate', getPlayerState(myPlayer));
    }
  });

  timer.start();


  socket.on('quit.player', function(data) {

    if (!players[data.id]) {
      return;
    }

    players[data.id].destroy();
    delete players[data.id];

  });



  socket.on('perception', function(data) {

    var isPartial = data.isPartial;
    var at = data.at;

    _.each(data.players, function(playerData, playerId) {

      if (playerId === myId) {
        return; // Don't update yourself
      }

      delete playerData.acceleration;

      if (players[playerId]) {
        updatePlayerState(players[playerId], playerData);

      } else {
        players[playerId] = createPlayer(playerData);
      }
    });

  });

}



function update() {


  _.each(players, function(player) {

    // Collide

    game.physics.arcade.collide(player, platforms);

    // Animate

    if (player.body.velocity.x < 0) {
      player.animations.play('left');

    } else if (player.body.velocity.x > 0) {
      player.animations.play('right');

    } else {
      player.animations.stop();
      player.frame = 4;
    }

  });


  var action;

  if (cursors.left.isDown) {

    action = {
      go: 'left',
      time: game.time.time,
    };

    // updatePlayerState(myPlayer, { velocity: { x: -150 }});

  } else if (cursors.right.isDown) {

    action = {
      go: 'right',
      time: game.time.time,
    };

    // updatePlayerState(myPlayer, { velocity: { x: 150 }});

  } else {

    action = {
      go: 'stop',
      time: game.time.time
    };


  }

  updatePlayerFromAction(myPlayer, action);

  socket.emit('action', action);


  
  //  Allow the player to jump if they are touching the ground.
  // if (cursors.up.isDown && myPlayer.body.touching.down)
  // {
  //   updatePlayerState(myPlayer, { velocity:{ y: -250 }});
  // }

}

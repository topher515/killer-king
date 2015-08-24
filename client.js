
//This is all that needs
var socket = io();

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });


var players = {};
var myPlayer;
var myId;

var platforms;
var cursors;

var score = 0;
var scoreText;

var timer;



var isMaster = false;


function createPlayer(data) {
    // The player and its settings
    var player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;   
    
    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);  

    if (data) {
      updatePlayerState(player, data);
    } 

    return player;
}


function updatePlayerState(player, data) {
  player.body.x = data.x ? data.x : player.body.x;
  player.body.y = data.y ? data.y : player.body.y;
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
  //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
  console.log('Connected successfully to the socket.io server. My playerId is ' + data.id );
  console.log('Master == ' + data.isMaster);
  isMaster = data.isMaster;
  myId = data.id;
  myPlayer = players[myId] = createPlayer();
});


socket.on('perception', function(data) {

  var isPartial = data.isPartial;
  var at = data.at;

  _.each(data.players, function(playerData, playerId) {

    if (playerId === myId) {
      return; // Don't update yourself
    }

    if (players[playerId]) {
      updatePlayerState(players[playerId], playerData);

    } else {
      players[playerId] = createPlayer(playerData);
    }
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

  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  A simple background for our game
  game.add.sprite(0, 0, 'sky');

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();
  platforms.enableBody = true;

  // Here we create the ground.
  var ground = platforms.create(0, game.world.height - 64, 'ground');
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;

  //  Now let's create two ledges
  var ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;

  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;



  myPlayer = createPlayer();


  //  The score
  scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //  Our controls.
  cursors = game.input.keyboard.createCursorKeys();


  timer = game.time.create();

  timer.loop(50, function() {
    if (myPlayer) {
      socket.emit('mystate', getPlayerState(myPlayer));
    }
  });

  timer.start();

}

function update() {


  _.each(players, function(player) {
    game.physics.arcade.collide(player, platforms);
  });


  //  Reset the players velocity (movement)
  myPlayer.body.velocity.x = 0;


  if (cursors.left.isDown)
  {
      //  Move to the left
      myPlayer.body.velocity.x = -150;

      myPlayer.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
      //  Move to the right
      myPlayer.body.velocity.x = 150;

      myPlayer.animations.play('right');
  }
  else
  {
      //  Stand still
      myPlayer.animations.stop();

      myPlayer.frame = 4;
  }
  
  //  Allow the player to jump if they are touching the ground.
  if (cursors.up.isDown && myPlayer.body.touching.down)
  {
      myPlayer.body.velocity.y = -350;
  }

}

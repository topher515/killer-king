 (function() {

  var socket = io();
  var game = new Phaser.Game(400, 300, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  var cursors;


  var myPlayer;


  var Player = function(attrs) {

    kkphys.Player.call(this, attrs);

    this.sprite = game.add.sprite(attrs.position[0], attrs.position[1], 'dude');

    this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);

    this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);  
  };
  Player.prototype.render = function() {
    if (this.body.velocity[0] < 0) {
      this.sprite.animations.play('left');

    } else if (this.body.velocity[0] > 0) {
      this.sprite.animations.play('right');

    } else {
      this.sprite.animations.stop();
      this.sprite.frame = 4;
    }    
  };
  Player.prototype.destroy = function() {
    this.sprite.destroy();
    delete this.players[this.id];
    kkphys.Player.prototype.destroy.call(this);
  };


  var Platform = function(attrs) {

    this.sprite = game.add.sprite(attrs.position[0], attrs.position[1], 'ground');

    kkphys.Platform.call(this);

  };


  var Level = function() {
    kkphys.Level.call(this);
  };


  function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

  }


  function create() {

    new Level();  
    cursors = game.input.keyboard.createCursorKeys();

    socket.on('onconnected', function(playerData) {
      myPlayer = new Player(playerData);
    });

    // socker.on('perception',)

  }


  function update() {

    _.each(players, function(player) {

      player.render();

    });


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

    myPlayer.doAction(action);
    socket.emit('action', action);

  }



 }());
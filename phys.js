(function() {

  var kkphys = {};

  var world = kkphys.world = new p2.World(); //Default gravity?


  var platforms = [];
  var players = {};

  // kkphys.makeRectBody = function(attrs) {

  // }

  // kkphys.makePlayerBody = function() {
  //   var player = kkphys.makeRectBody({ width: 32, height: 32, x: 32, y: 100, mass:1 });
  //   players.push(player);
  //   return player;
  // }

  // kkphys.makePlatformBody = function(attrs) {
  //   var platform = kkphys.makeRectBody({ width: 400, height: 32, x: attrs.x, y: attrs.y, mass:0 });
  //   platforms.push(platform);
  //   return platform;
  // }


  // kkphys.setupDefaultPlatformBodies = function() {

  //   return [
  //     kkphys.makePlatformBody({ x:0 y:100 }),
  //     kkphys.makePlatformBody({ x:50 y:50 }),
  //   ];

  // }



  var Player = kkphys.Player = function(attrs) {

    this.id = attrs.id;
    players[this.id] = this;

    var boxShape = new p2.Box({ width: 32, height: 48 });
    var boxBody = new p2.Body({
      mass: attrs.mass,
      position: attrs.position,
      angularVelocity:1
    });
    boxBody.addShape(boxShape);

    world.addBody(boxBody);
    
    this.body = boxBody;

  };
  Player.prototype.doAction = function(action) {
    if (action.go === 'left') {
      this.body.velocity[0] = -150;

    } else if (action.go === 'right') {
      this.body.velocity[0] = 150;

    } else if (action.go === 'jump') {
      this.body.velocity[1] = 350;

    } else {
      this.body.velocity[0] = 0;

    }
  };
  Player.prototype.serialize = function() {
    return {
      id: this.id,
      position: this.position,
    };
  };
  Player.prototype.deserialize = function(data) {
    this.position = data.position;
  };
  Player.prototype.destory = function() {

  };




  var Platform = kkphys.Platform = function(attrs) {
    var boxShape = new p2.Box({ width: 400, height: 32 });
    var boxBody = new p2.Body({
      mass: attrs.mass,
      position: attrs.position,
      angularVelocity:1
    });
    boxBody.addShape(boxShape);

    world.addBody(boxBody);
    
    this.body = boxBody;  
    platforms.push(this);  
  };




  var Level = kkphys.Level = function(options) {

    new Platform({ position:[100,100] });
    new Platform({ position:[150,100] });

  };




  if (module.exports) {
    module.exports = kkphys;
  } else if (window) {
    window.kkphys = kkphys;
  }


}());
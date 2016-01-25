var game = new Phaser.Game(800, 600, Phaser.AUTO, 'katjump', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('player_one', 'img/player_one.png');
    game.load.image('player_two', 'img/player_two.png');
    game.load.image('platform', 'img/platform.png');
    game.load.image('fire', 'img/fire.png');
}

// constants
var PLAYER_ONE = 0,
    PLAYER_TWO = 1;


var players;
var platforms;
var fire;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.gravity.y = 250;

    players = game.add.group();

    var p1 = new Player(game, 0, 0, PLAYER_ONE);
    players.add(p1);

    var p2 = new Player(game, 0, 0, PLAYER_TWO);
    players.add(p2);

    platforms = new World(game);

    fire = game.add.sprite(0, 0, 'fire');
    game.physics.arcade.enable(fire);

    fire.y = game.height - fire.height;
    fire.body.allowGravity = false;
    fire.body.immovable = true;
}

function update() {
    game.physics.arcade.collide(players, platforms);
    game.physics.arcade.overlap(players, fire, function(f, p) {
        p.kill();
    });
}

function Player(game, x, y, id) {
    this.id = id;
    var sprite = 'player_one';
    if (this.id == PLAYER_TWO) {
        sprite = 'player_two';
    }

    Phaser.Sprite.call(this, game, x, y, sprite);
    game.physics.enable(this);

    this.jumpTime = 0;

    this.controls = this._generateMovement();
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    this.body.velocity.x = 0;

    if (this.controls.right.isDown) {
        this.body.velocity.x = 200;
    }

    if (this.controls.left.isDown) {
        this.body.velocity.x = -200;
    }

    if (this.controls.up.isDown && (this.body.touching.down || this.body.onFloor()) && game.time.now > this.jumpTime) {
        this.body.velocity.y = -300;
        this.jumpTime = game.time.now + 750;
    }
};

Player.prototype._generateMovement = function() {
    var keys = game.input.keyboard.createCursorKeys();
    if (this.id == PLAYER_TWO) {
        console.log('p2');
        keys = game.input.keyboard.addKeys({
            'up': Phaser.KeyCode.W,
            'down': Phaser.KeyCode.S,
            'right': Phaser.KeyCode.D,
            'left': Phaser.KeyCode.A
        });

        console.log(keys);
    }

    return keys;
}

function World(game) {
    Phaser.Group.call(this, game);

    this.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 5; i++) {
        this.create(game.rnd.between(0, game.width), game.rnd.between(0, game.height), 'platform');
    }

    this.setAll('body.allowGravity', false);
    this.setAll('body.immovable', true);
}

World.prototype = Object.create(Phaser.Group.prototype);
World.prototype.constructor = World;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'katjump', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('player_one', 'img/player_one.png');
    game.load.image('platform', 'img/platform.png');
}

var playerOne;
var platforms;
var cursors;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.gravity.y = 250;

    playerOne = new Player(game, 0, 0);
    game.add.existing(playerOne);

    platforms = game.add.physicsGroup();

    for (var i = 0; i < 5; i++) {
        var p = platforms.create(game.rnd.between(0, game.width), game.rnd.between(0, game.height), 'platform');
    }

    platforms.setAll('body.allowGravity', false);
    platforms.setAll('body.immovable', true);

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    game.physics.arcade.collide(playerOne, platforms);
}

function Player(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'player_one');
    game.physics.enable(this);

    this.jumpTime = 0;
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    this.body.velocity.x = 0;

    if (cursors.right.isDown) {
        this.body.velocity.x = 200;
    }

    if (cursors.left.isDown) {
        this.body.velocity.x = -200;
    }

    if (cursors.up.isDown && (this.body.touching.down || this.body.onFloor()) && game.time.now > this.jumpTime) {
        this.body.velocity.y = -300;
        this.jumpTime = game.time.now + 750;
    }
};

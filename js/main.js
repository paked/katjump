var game = new Phaser.Game(800, 600, Phaser.AUTO, 'katjump', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('player_one', 'img/player_one.png');
    game.load.image('platform', 'img/platform.png');
}

var playerOne;
var platforms;
var cursors;

var jumpTime = 0;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.gravity.y = 250;

    playerOne = game.add.sprite(0, 0, 'player_one');
    game.physics.enable(playerOne);

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

    playerOne.body.velocity.x = 0;

    if (cursors.right.isDown) {
        playerOne.body.velocity.x = 200;
    }

    if (cursors.left.isDown) {
        playerOne.body.velocity.x = -200;
    }

    if (cursors.up.isDown && (playerOne.body.touching.down || playerOne.body.onFloor()) && game.time.now > jumpTime) {
        playerOne.body.velocity.y = -300;
        jumpTime = game.time.now + 750;
    }
}

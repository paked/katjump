var game = new Phaser.Game(800, 600, Phaser.AUTO, 'katjump', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('player_one', 'img/player_one.png');
    game.load.image('player_two', 'img/player_two.png');
    game.load.image('platform', 'img/platform.png');
    game.load.image('platform_short', 'img/platform_short.png');
    game.load.image('fire', 'img/fire.png');
}

// Constants
var START_X_OFFSET = 128,
    START_Y_OFFSET = 256

var PLAYER_ONE = 0,
    PLAYER_TWO = 1;

var PLATFORM_NORMAL = 0,
    PLATFORM_SHORT = 1;

var BEGINNING_STATE = 0,
    BATTLING_STATE = 1,
    MAHEM_STATE = 2,
    WAITING_STATE = 3;

// Globals
var players;
var platforms;
var fire;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.gravity.y = 250;

    players = game.add.group();

    var p1 = new Player(game, START_X_OFFSET, 0, PLAYER_ONE);
    players.add(p1);

    var p2 = new Player(game, game.width - START_X_OFFSET, 0, PLAYER_TWO);
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
    if (this.id == PLAYER_ONE) {
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

    this.setAll('body.allowGravity', false);
    this.setAll('body.immovable', true);

    this.currentState = BEGINNING_STATE;
}

World.prototype = Object.create(Phaser.Group.prototype);
World.prototype.constructor = World;

World.prototype.update = function() {
    Phaser.Group.prototype.update.call(this);

    switch(this.currentState) {
    // Create a platform underneath each player.
    case BEGINNING_STATE:
        // For player one (right side)
        var p1 = new Platform(game, START_X_OFFSET, START_Y_OFFSET, PLATFORM_SHORT);
        this.add(p1);

        // For player two (left side)
        var p2 = new Platform(game, game.width - START_X_OFFSET, START_Y_OFFSET, PLATFORM_SHORT);
        this.add(p2);
       
        game.time.events.add(Phaser.Timer.SECOND * 4, function() {
            p1.despawn();
            p2.despawn();

            this.currentState = BATTLING_STATE;
        }, this);

        // Set timers to go to battling state. Meanwhile go to limbo.
        this.currentState = WAITING_STATE;
        break;
    case BATTLING_STATE:
        var p = new Platform(game, 0, game.rnd.integerInRange(64, game.height - 100), PLATFORM_NORMAL);
        if (game.rnd.frac() < 0.5) {
            p.body.velocity.x = 100;
            p.x = -p.width/2;
        } else {
            p.body.velocity.x = -100;
            p.x = game.width + p.width/2;
        }

        if (game.physics.arcade.overlap(p, this)) {
            break;
        }

        this.add(p);

        game.time.events.add((Phaser.Timer.SECOND * 5) * game.rnd.frac(), function() {
            this.currentState = BATTLING_STATE;
        }, this);

        this.currentState = WAITING_STATE;
        break;
    case MAHEM_STATE:
        break;
    case WAITING_STATE:
        // Do nothing, waiting for timer to trigger.
        break;
    default:
        console.log('shit happened!');
    };
};

function Platform(game, x, y, type) {
    var sprite = 'platform';
    if (type == PLATFORM_SHORT) {
        sprite = 'platform_short';
    }

    Phaser.Sprite.call(this, game, x, y, sprite);
    game.physics.enable(this);

    this.body.allowGravity = false;
    this.body.immovable = true;
    this.anchor.x = 0.5;

    this.body.checkCollision.any = false;
    this.body.checkCollision.down = false;
    this.body.checkCollision.right = false;
    this.body.checkCollision.left = false;

    console.log(this.body.checkCollision);
}

Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;

Platform.prototype.despawn = function() {
    game.add.tween(this).to( { alpha: 0.1 }, 2000, Phaser.Easing.Linear.None, true).
        onComplete.
        add(function() {
            this.kill();
        }, this);
};

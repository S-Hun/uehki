var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var time = 0;
var score = 0;
var monsters;
var control = 0;
var cooldown1 = 0;
var cooldown2 = 0;
var pos = 1;
var gameOver = false;

function preload ()
{
    this.load.image('sky', 'bg.png');
    this.load.image('ground', 'ground.png');
    this.load.spritesheet('dude', 'character1.png', { frameWidth: 32, frameHeight: 56 });
    this.load.spritesheet('skill', 'skill.png', { frameWidth: 51, frameHeight: 56 });
    this.load.spritesheet('shift', 'skill2.png', { frameWidth: 37, frameHeight: 56 });
    this.load.image('monster', 'monster.png');
}

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    skill = this.physics.add.sprite(100, 400, 'skill');
    player = this.physics.add.sprite(100, 400, 'dude');
    skill.setGravityY(-800);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'shift',
        frames: [ { key: 'shift', frame: 0 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'skill',
        frames: this.anims.generateFrameNumbers('skill', { start: 0, end: 4 }),
        frameRate: 10,
        repeate: -1
    })

    cursors = this.input.keyboard.createCursorKeys();

    monsters = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    endText = this.add.text(200, 100, '', { fontSize: '64px', fill: '#000' });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, monsters, hit, null, this);
    this.physics.add.collider(monsters, platforms);
    this.physics.add.collider(skill, monsters, kill, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    time += 1;
    if(control > time){
        player.setVelocityX(0);
    }
    else if (cursors.shift.isDown && cooldown1 < time  && player.body.touching.down)
    {
        control = time + 30;
        cooldown1 = time + 100;
        skill.enableBody(true, skill.x, skill.y, true, true);
        skill.x = player.x + pos * 80;
        skill.y = player.y;
        skill.anims.play('skill');
        player.anims.play('shift');
    }
    else if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('turn');
        pos = -1;
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('turn');
        pos = 1;
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-600);
    }

    if (cooldown2 < time){
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = monsters.create(x, 16, 'monster');
        bomb.setBounceX(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocityX(Phaser.Math.Between(-200, 200), 80);

        cooldown2 = time + 110;
    }
}

function kill(skill, monster)
{
    skill.disableBody(true, true);
    monster.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);
}

function hit(player, monster)
{
    endText.setText('Game Over');

    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
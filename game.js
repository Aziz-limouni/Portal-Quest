const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },   // normal for the player
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let portal;
let gameWon = false;
let player;
let crystals;
let cursors;
let score = 0;
let scoreText;
let winText;
let bg;
let ground;
let hasKey = false;

function preload(){
    this.load.image('ground','assets/ground.png');
    this.load.image('crystal','assets/bleu-crystal.png');
    this.load.image('player','assets/my‑hero.png');
    this.load.image('bg','assets/background.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.image('background2', 'assets/background2.png');
    this.load.image('ground2', 'assets/ground2.png');
    this.load.image('key', 'assets/key.png');
    this.load.image('portal', 'assets/portal.png');
}

function create(){

    // put the background first so it sits beneath everything
    bg = this.add.image(400, 250, 'bg')
        .setDisplaySize(800, 500)
        .setScrollFactor(0);

    ground = this.physics.add.staticGroup();
    ground.create(400, 500, 'ground')       // centre of screen
      .setScale(2, 1)                   // double width only
      .setOrigin(0.5, 1)                // centre the sprite
      .refreshBody();

    player = this.physics.add.sprite(100,400,'player')
             .setScale(0.15);
    player.body.setSize(player.width, player.height); 
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player,ground);

    crystals = this.physics.add.group();
    

    // spawn function called by the timer
    const spawnCrystal = (x) => {
        const c = crystals.create(x, 0, 'crystal');
        c.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
        c.setScale(0.4);

        c.body.setAllowGravity(false);     // keep player gravity normal
        c.setVelocityY(100);              // faster than 20
    };

    // schedule six crystals, 300 ms apart
    for (let i = 0; i < 6; i++) {
        this.time.addEvent({
            delay: 1000 * i,          // 1000 ms = 1 s gap
            callback: () => spawnCrystal(100 + 120 * i),
            callbackScope: this
        });
    }

    this.physics.add.collider(crystals, ground);
    this.physics.add.overlap(player, crystals, collectCrystal, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    // debug listener
    this.input.keyboard.on('keydown-UP', () => {
        console.log('up pressed, touching.down=', player.body.touching.down);
    });

    scoreText = this.add.text(16,16,'Score: 0',{
        fontSize:'24px',
        fill:'#fff'
    });

    this.input.keyboard.on('keydown-UP', () => console.log('up pressed'));
}

function update(){

    if (cursors.left.isDown)  player.setVelocityX(-160);
    else if (cursors.right.isDown) player.setVelocityX(160);
    else player.setVelocityX(0);

    // JUMP FIX
    if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-330);
    }

    if (cursors.down.isDown) {
        // crouch
    }
}

function collectCrystal(player, crystal){

    crystal.disableBody(true,true);

    score +=10;
    scoreText.setText('Score: ' + score);

    
    if(crystals.countActive(true) === 0){

        winText = this.add.text(300,200,'YOU WIN!',{
            fontSize:'48px',
            fill:'#00ff00'
        });

        gameWon = true;

        
        if(!portal){
            portal = this.physics.add.staticSprite(760,420,'portal')
                          .setScale(0.2)
                          .refreshBody();

            this.physics.add.overlap(player, portal, enterNextRoom, null, this);
        }
    }
}

function enterNextRoom(){

    if(!gameWon) return;

    this.cameras.main.fade(500);

    this.time.delayedCall(500, ()=>{

        bg.setTexture('background2');

        // remove old ground, the new chamber will have its own platforms
        ground.clear(true, true);

        if(winText) winText.destroy();

        // reset scene
        player.setPosition(100,400);

        // remove crystals
        crystals.clear(true,true);

        // new challenge text
        const t1 = this.add.text(250,100,'NEW CHALLENGE!',{
            fontSize:'40px',
            fill:'#ffff00'
        });

        const t2 = this.add.text(200,160,'Jump on 4 platforms to get the key',{
            fontSize:'22px',
            fill:'#ffffff'
        });

        this.time.delayedCall(1000, () => {
            t1.destroy();
            t2.destroy();
        });

        // platforms
        const platforms = this.physics.add.staticGroup();

        platforms.create(200,440,'ground2').setScale(0.5).refreshBody();
        platforms.create(350,360,'ground2').setScale(0.5).refreshBody();
        platforms.create(500,280,'ground2').setScale(0.5).refreshBody();
        platforms.create(650,200,'ground2').setScale(0.5).refreshBody();
        platforms.create(420,120,'ground2').setScale(0.5).refreshBody();

        this.physics.add.collider(player, platforms);

        // key
        const key = this.physics.add.sprite(420,40,'key')
                .setScale(0.17);

        key.body.setAllowGravity(false);

        this.physics.add.overlap(player, key, collectTheKey, null, this);

        const finalPortal = this.physics.add.staticSprite(760, 420, 'portal')
            .setScale(0.2)
            .refreshBody();

        this.physics.add.overlap(player, finalPortal, tryEnterFinalPortal, null, this);

        this.cameras.main.fadeIn(500);

    });

}

function collectTheKey(player, key) {
    key.disableBody(true, true);
    hasKey = true;
}

function tryEnterFinalPortal() {
    if (hasKey) {
        this.add.text(300, 220, 'FINAL WIN!', {
            fontSize: '48px',
            fill: '#00ff00'
        });
        player.body.enable = false;
        player.setVelocity(0);
    } else {
        const closeText = this.add.text(350, 220, 'CLOSE', {
            fontSize: '48px',
            fill: '#ff0000'
        });
        player.setVelocityX(-50); // Push player back
        this.time.delayedCall(1000, () => {
            closeText.destroy();
        });
    }
}
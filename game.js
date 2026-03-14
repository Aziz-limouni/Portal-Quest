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
let hasFinalKey = false;
let hasKey = false;
let ladders;
let finalKey;
let onLadder = false;

function preload(){
    this.load.image('ground','assets/ground.png');
    this.load.image('crystal','assets/bleu-crystal.png');
    this.load.image('player','assets/my‑hero.png');
    this.load.image('bg','assets/background.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.image('background2', 'assets/background2.png');
    this.load.image('ground2', 'assets/ground2.png');
    this.load.image('finalKey', 'assets/finalKey.png');
    this.load.image('key', 'assets/key.png');
    this.load.image('background3', 'assets/background3.png');
    this.load.image('ladder', 'assets/ladder.png');
    this.load.image('trophy', 'assets/trophy.png');
    this.load.image('ground3', 'assets/ground3.png');
    this.load.image('coin', 'assets/coin.png');
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

    // Horizontal movement is the same whether on a ladder or not
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    const isJumping = player.body.velocity.y < -100;

    // Vertical movement depends on whether we are on a ladder
    if (onLadder && !player.body.blocked.down && !isJumping) {
        player.body.setAllowGravity(false); // Stick to the ladder

        if (cursors.up.isDown) {
            player.setVelocityY(-330); // Climb up
        } else if (cursors.down.isDown) {
            player.setVelocityY(150); // Climb down
        } else {
            player.setVelocityY(0); // Stop on the ladder
        }
    } else {
        player.body.setAllowGravity(true); // Fall normally
        // Normal jump
        if (cursors.up.isDown && player.body.blocked.down) {
            player.setVelocityY(-330);
        }
    }

    // Reset the ladder flag each frame. It will be set to true by the overlap callback if needed.
    onLadder = false;
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
            portal = this.physics.add.staticSprite(760,460,'portal')
                          .setScale(0.25)
                          .refreshBody();

            this.physics.add.overlap(player, portal, enterNextRoom, null, this);
        }
    }
}

function enterNextRoom(){

    if(!gameWon) return;

    this.cameras.main.fade(500);

    this.time.delayedCall(500, ()=>{

        bg.setTexture('background2').setDisplaySize(800, 500);

        // remove old ground, the new chamber will have its own platforms
        ground.clear(true, true);

        // Destroy the previous portal so it doesn't linger
        if(portal) portal.destroy();

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
        ground.create(200,440,'ground2').setScale(0.5).refreshBody();
        const p = ground.create(350,360,'ground2').setScale(0.5).refreshBody();
        p.body.checkCollision.down = false;
        p.body.checkCollision.left = false;
        p.body.checkCollision.right = false;
        ground.create(500,280,'ground2').setScale(0.5).refreshBody();
        ground.create(650,200,'ground2').setScale(0.5).refreshBody();
        ground.create(420,120,'ground2').setScale(0.5).refreshBody();
     
         // Create ladders
         ladders = this.physics.add.staticGroup();

         // A tall ladder going up to the platform 
        ladders.create(300, 420, 'ladder').setScale(0.5, 0.8).refreshBody();
        this.physics.add.overlap(player, ladders, () => { onLadder = true; }, null, this);

        // key
        const key = this.physics.add.sprite(420,40,'key')
                .setScale(0.17);

        key.body.setAllowGravity(false);

        this.physics.add.overlap(player, key, collectTheKey, null, this);

        portal = this.physics.add.staticSprite(760, 460, 'portal')
            .setScale(0.25)
            .refreshBody();

        this.physics.add.overlap(player, portal, tryEnterFinalPortal, null, this);

        this.cameras.main.fadeIn(500);

    });

}

function collectTheKey(player, key) {
    key.disableBody(true, true);
    hasKey = true;    
}

function tryEnterFinalPortal() {
    if (hasKey) {
        this.cameras.main.fade(500);
        this.time.delayedCall(500, enterFinalChamber, [], this);
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

function enterFinalChamber() {
    // Setup for the final chamber with ladders
    bg.setTexture('background3').setDisplaySize(800, 500);
    if (portal) portal.destroy(); // Remove the portal from the previous room
    ground.clear(true, true); // remove old platforms from previous chamber
    player.setPosition(100, 400);

    // Create new platforms for the final chamber
    // We use 'ground' (green) as requested ("gran")
    
    ground.create(500, 350, 'ground3').setScale(0.5).refreshBody();
    ground.create(120, 150, 'ground3').setScale(0.5).refreshBody();
    ground.create(210, 250, 'ground3').setScale(0.5).refreshBody();
    ground.create(650, 180, 'ground3').setScale(0.5).refreshBody();

    // Create ladders
    ladders = this.physics.add.staticGroup();
    // A tall ladder going up to the platform at y=250
    ladders.create(300, 350, 'ladder').setScale(0.5, 1).refreshBody();
    // A shorter ladder going up to the platform at y=180
    ladders.create(550, 265, 'ladder').setScale(0.5, 1).refreshBody();

    // When player overlaps with a ladder, set the onLadder flag to true for the update loop
    this.physics.add.overlap(player, ladders, () => { onLadder = true; }, null, this);

    // Create the final trophy to win the game
    const trophy = this.physics.add.staticSprite(650, 120, 'trophy').setScale(0.4).refreshBody();
    this.physics.add.overlap(player, trophy, finalWin, null, this);  
    finalKey = this.physics.add.sprite(120, 100,'finalKey').setScale(0.17) 
    finalKey.body.setAllowGravity(false);

    this.physics.add.overlap(player, finalKey, collectFinalKey, null, this);
    this.cameras.main.fadeIn(500);
}

function collectFinalKey(player, finalKey) {
    finalKey.disableBody(true, true);
    hasFinalKey = true;
}

function finalWin(player, trophy) {
    if (!hasFinalKey) {
        const text = this.add.text(250, 220, 'You need a final key!', { // Add the text
            fontSize: '35px',
            fill: '#ff0000'
        });

        this.tweens.add({
            targets: text,
            alpha: 0, // Make it disappear
            duration: 1000
        }); // Fade duration in milliseconds
    } else {

        trophy.disableBody(true, true);
        const coin = this.physics.add.sprite(420, 250, 'coin');
        coin.body.setAllowGravity(false);
        this.tweens.add({
            targets: coin,
            y: trophy.y - 90, // Move up
            duration: 1000
        });

    this.add.text(200, 220, 'CONGRATULATIONS!', {
        fontSize: '48px',
        fill: '#ffff00'
    });
    this.add.text(250, 280, 'You are a true explorer!', {
        fontSize: '24px',
        fill: '#ffffff'
    });
}
}
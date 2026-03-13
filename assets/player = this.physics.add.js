player = this.physics.add.sprite(100,400,'player');
player.setBounce(0.2);
player.setCollideWorldBounds(true);
player.setScale(0.5);           // shrink to 50% of original

if (cursors.left.isDown)  player.setVelocityX(-160);
else if (cursors.right.isDown) player.setVelocityX(160);
else player.setVelocityX(0);

if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
}
console.log("actors!! ")

//class player extends Phaser.Physics.Arcade.Sprite {
class player extends Actor {
  constructor(scene, x, y, texture, frame) {
    console.log("act 0", texture, frame)
    super(scene, x, y, texture, frame);
    this.dead = 0;
    this.direction = 0;
    this.isInvulnerable = false;
    console.log("2")
    this.scene = scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    //this.body.setCollideWorldBounds(true);
    this.setSize(this.width/2, 2*this.height/3, true);
    this.setOffset(this.width/4, this.height/3);

    this.arrows = scene.physics.add.group();
    this.arrows.enableBody = true;
    this.arrows.physicsBodyType = Phaser.Physics.ARCADE;
    for (var i = 0; i < 50; i++){
        var arrow = this.arrows.create(-10, -10, 'arrow');
        arrow.setScale(0.2);
        arrow.body.setSize(10, 10);
        arrow.setActive(false);
        arrow.setVisible(false);
    }

    this.has_bow = true;
    this.move_enable = true;
    this.attack_enable = true;
    this.facing = [0, 1];
    console.log("animation");
    this.create_animations(texture);
    this.walkEnable = 1;
  }

  create_animations(texture){
    this.anims.create({
        key: 'walk_up',
        frames: this.anims.generateFrameNumbers(texture, {start: 104, end: 112}),
        frameRate: 20,
        repeat: -1
        });
    this.anims.create({
        key: 'walk_left',
        frames: this.anims.generateFrameNumbers(texture, {start: 117, end: 125}),
        frameRate: 20,
        repeat: -1
        });
    this.anims.create({
        key: 'walk_down',
        frames: this.anims.generateFrameNumbers(texture, {start: 130, end: 138}),
        frameRate: 20,
        repeat: -1
        });
    this.anims.create({
        key: 'walk_right',
        frames: this.anims.generateFrameNumbers(texture, {start: 143, end: 151}),
        frameRate: 20,
        repeat: -1
        });

    this.anims.create({
        key: 'attack_up',
        frames: this.anims.generateFrameNumbers(texture, {start: 208, end: 220}),
        frameRate: 30,
        repeat: 0
        });
    this.anims.create({
        key: 'attack_left',
        frames: this.anims.generateFrameNumbers(texture, {start: 221, end: 233}),
        frameRate: 30,
        repeat: 0
        });
    this.anims.create({
        key: 'attack_down',
        frames: this.anims.generateFrameNumbers(texture, {start: 234, end: 246}),
        frameRate: 30,
        repeat: 0
        });
    this.anims.create({
        key: 'attack_right',
        frames: this.anims.generateFrameNumbers(texture, {start: 247, end: 259}),
        frameRate: 30,
        repeat: 0
        });

    this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers(texture, {start: 260, end: 265}),
        frameRate: 20,
        repeat: 0
        });    
  }

  set_player_velocity() {
    if (this.walkEnable == 1) {
        // velocidade horizontal
        let velocityX = 0;
        if (this.scene.keyD?.isDown) {
            velocityX += 210;
        }
        if (this.scene.keyA?.isDown) {
            velocityX -= 210;
        }

        // velocidade vertical
        let velocityY = 0;
        if (this.scene.keyW.isDown) {
            velocityY -= 210;
        }
        if (this.scene.keyS.isDown) {
            velocityY += 210;
        }

        // normaliza o vetor de velocidade diagonal
        if (velocityX !== 0 && velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            const scaleFactor = 210 / length;
            velocityX *= scaleFactor;
            velocityY *= scaleFactor;
        }

        this.setVelocityX(velocityX);
        this.setVelocityY(velocityY);
    }
}

  set_walk_animation(){
    if (this.body.velocity.x > 0){
      this.anims.play('walk_right', true);
      this.facing = [1, 0];
      this.direction = 0;
    }
    else if (this.body.velocity.x < 0){
      this.anims.play('walk_left', true);
      this.facing = [-1, 0];      
      this.direction = 1;
    }
    else if (this.body.velocity.y > 0){
      this.anims.play('walk_down', true);
      this.facing = [0, 1];
      this.direction = 2;
    }
    else if (this.body.velocity.y < 0){
      this.anims.play('walk_up', true);
      this.facing = [0, -1];
      this.direction = 3;
    }
    else{
      this.anims.stop();
    }
  }

  create_dialog(){
    if (this.scene.keySpace?.isDown) {
      if (this.dialog.isActive){

        this.dialog.nextDlg()
      }
      else
      {
        this.create_dialog = true;
      }
    }
  }

  attack(){ 
    //console.log('attack', this.facing, this.arrows.countActive(false));
    this.attack_enable = false;
    this.move_enable = false;
    this.on('animationcomplete', this.re_enable);
      if (this.facing[0] == 1)
        this.anims.play('attack_right');
      else if (this.facing[0] == -1)
        this.anims.play('attack_left');
      else if (this.facing[1] == 1)
        this.anims.play('attack_down');
      else
        this.anims.play('attack_up');

  }

  re_enable(){
    this.removeListener('animationcomplete');
    this.attack_enable = true;
    this.move_enable = true;

    var arrow = this.arrows.getFirstDead(false);
    if (arrow){
        var vx = this.facing[0] * 100
        var vy = this.facing[1] * 100

        arrow.body.reset(this.x, this.y);
        arrow.setActive(true);
        arrow.setVisible(true);

        arrow.setVelocityX(vx);
        arrow.setVelocityY(vy);
        var ang = 0;
        var pi = Phaser.Math.PI2/2;
        if (this.facing[0] == 1)
          ang = 0.5;
        else if (this.facing[0] == -1)
          ang = -0.5;
        else if  (this.facing[1] == 1)
           ang = 1;
        console.log(ang, this.facing);
        arrow.rotation = ang*pi;
    }


  }

  preUpdate (time, delta)
  {
    super.preUpdate(time, delta);

    if (this.move_enable){
      this.set_player_velocity();
      this.set_walk_animation();
    }
    else{
      this.setVelocityX(0); 
      this.setVelocityY(0); 
    }

    if (this.scene.keySPACE.isDown && this.attack_enable && this.has_bow) {
      this.attack();
    }
    if(this.hp == 0){
      this.die();
    }
  }

  die(){
    console.log('a')
    this.attack_enable = false;
    console.log('b')
    this.move_enable = false;
    console.log('c')
    this.body.enable=false;
    //console.log(this.scene.gameOver)
    //this.on('animationcomplete', this.scene.gameOver, this.scene);
    console.log('e')
    if(this.dead == 0){
      this.anims.play('die',true);
      this.dead = 1;
    }

  }

}


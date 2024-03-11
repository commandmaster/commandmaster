import { MonoBehaviour } from "../sketch.js";

export default class Player extends MonoBehaviour{
    constructor(p5Var, gameEngine, gameObject){
      super(p5Var, gameEngine, gameObject);
    }

    Start(){
      this.chargeStartPos = this.p5.createVector(0, 0);
      this.charge = 0;

      this.shots = 1;

      this.gameEngine.inputSystem.addKeyboardInput('SuperBounce', 'space', 'bool')
      this.bounceStarted = false;
      this.bounceFrameRange = 20;
      this.bounceFrameCounter = 0;
      this.hitTimeout = 0;
      this.afterBounce = false;
      this.bounceHit = false;
      this.timeHeldDown = 0;


      this.gameEngine.particleSystem.createNewParticle({
        name: "bloodParticle",
        lifeSpan: 0.1,
        color: this.p5.color(255, 0, 0),
        opacity: 1,
        shouldFade: true,
        shape: "circle",
        sizeRange: this.p5.createVector(5, 8),
        hasGravity: false,
        gravityScale: 0.007,
        hasWind: false,
        windScale: 0,
        windDirection: this.p5.createVector(1, 0),
        glow: true
      });
      
      this.gameEngine.particleSystem.createNewParticleEmitter({
        name: "bloodEmitter",
        particleName: "bloodParticle",
        radius: 50,
        spawnRate: 1,
        densityRange: this.p5.createVector(1, 1.3),
        triggerDelay: 0,
        emitterLifeSpan: 0.2,
        trigger: "OnLoop",
        followObject: null,
        followObjectOffset: this.p5.createVector(0, 0),
        xVelRange: this.p5.createVector(-10, 10),
        yVelRange: this.p5.createVector(-10, 10)
  
      });


      // this.gameEngine.particleSystem.createNewParticle({
      //   name: "trailParticle",
      //   lifeSpan: 0.1,
      //   color: this.p5.color(255, 255, 255),
      //   opacity: 0,
      //   shouldFade: false,
      //   shape: "circle",
      //   sizeRange: this.p5.createVector(3, 6),
      //   hasGravity: false,
      //   gravityScale: 0.007,
      //   hasWind: false,
      //   windScale: 0,
      //   windDirection: this.p5.createVector(1, 0),
      //   glow: true
      // });
      
      // this.gameEngine.particleSystem.createNewParticleEmitter({
      //   name: "trailEmitter",
      //   particleName: "trailParticle",
      //   radius: 7,
      //   spawnRate: 15,
      //   densityRange: this.p5.createVector(0.7, 0.8),
      //   triggerDelay: 0.1,
      //   emitterLifeSpan: 0.1,
      //   trigger: "OnLoop",
      //   followObject: this.gameObject,
      //   followObjectOffset: this.p5.createVector(0, 0),
      //   xVelRange: this.p5.createVector(-5,5),
      //   yVelRange: this.p5.createVector(-5,5)
  
      // });
      
      
    }

    Update(){

      for (const collider of this.gameObject.colliders[0].collidingWith){
        if (collider.gameObject.hasTag("enemy")){
            this.shots = 1;
            this.gameEngine.broadCastEvent("increaseScore");
        }

        if (collider.gameObject.hasTag("lava")){
          if (!this.gameOver){
            this.gameOver = true;
            this.gameEngine.loadLevel("endScreen", "moltenGameOverManager");
            console.log("Game Over");
            return;
          }
         
        }
      }

      

      if (this.p5.mouseIsPressed === true && this.p5.mouseButton === this.p5.LEFT && this.p5.mouseButton !== this.p5.RIGHT && this.shots > 0 && this.timeHeldDown < 2000) {
        this.drawChargeUp(50);
        this.gameObject.rigidBody.applyDrag(0.05);
        this.timeHeldDown += this.p5.deltaTime;
        
        
      }

      else if (this.p5.mouseIsPressed === true && this.p5.mouseButton === this.p5.RIGHT){
        this.charge = 0;
        this.gameObject.rigidBody.applyDrag(0.18, true);
        
      }

      else{

        if (this.charge > 0 ) {
          if (this.timeHeldDown < 2000){
            this.shoot(Math.min(this.charge * 0.1 * 1440/this.gameEngine.screenHeight, 50));
          }

          this.charge = 0;
          this.shots = 0;
          this.timeHeldDown = 0;
        }



        
        
      }

      if (this.gameEngine.inputSystem.getInputDown('SuperBounce')){
        this.bounceStarted = true;
      }

      if (this.bounceStarted){
        this.bounceFrameCounter++;

        if (this.bounceFrameCounter > this.bounceFrameRange || this.bounceHit){
          if (this.bounceHit){
            this.gameObject.rigidBody.addForce(this.p5.createVector(0, -1), 25);
          }

          else{
            // pentitalize the player for not hitting anything
            if (this.gameObject.rigidBody.Velocity.y < 0){
              this.gameObject.rigidBody.Velocity.y = 0;
            }
            
            this.gameObject.rigidBody.addForce(this.p5.createVector(0, 1), 30);
            this.gameObject.rigidBody.applyDrag(1, true);
          }

          this.bounceStarted = false;
          this.bounceFrameCounter = 0;
          this.bounceHit = false;

          
        }

      }




      this.hitTimeout++;

      if (this.hitTimeout > this.bounceFrameRange/2){
        this.bounceHit = false;
      }   

      for (const collider of this.gameObject.colliders[0].collidingWith){
        if (collider.gameObject.hasTag("enemy")){
          this.gameObject.rigidBody.Velocity.y = 0;

          this.bounceHit = true;
          this.hitTimeout = 0;
          
          this.gameObject.rigidBody.addForce(this.p5.createVector(0, -1), 10);

          
          
          this.gameEngine.particleSystem.spawnEmitter("bloodEmitter", collider.gameObject.transform.Position);
        }
    }
      
    }

    drawChargeUp(startOffset){
      const dir = MonoBehaviour.cameraToMouseDirection(this.gameEngine.mainCamera, this.gameEngine.screenWidth, this.gameEngine.screenHeight)

      let colorR = this.p5.map(this.timeHeldDown, 0, 2000, 0, 255); 
      let colorG = this.p5.map(this.timeHeldDown, 0, 2000, 255, 0); 
      let colorB = 0; 
      let strokeW = this.p5.map(this.timeHeldDown, 0, 2000, 4, 1); 

      this.p5.push();
      this.p5.drawingContext.shadowBlur = 20;
      
      this.p5.drawingContext.shadowColor = this.p5.color(colorR, colorG, colorB);
      this.p5.strokeWeight(strokeW);
      this.p5.stroke(this.p5.color(colorR, colorG, colorB));
      this.p5.line(this.gameEngine.mainCamera.position.x + startOffset * dir.x, this.gameEngine.mainCamera.position.y + startOffset * dir.y, this.p5.mouseX, this.p5.mouseY);
      this.charge = this.p5.dist(this.gameEngine.mainCamera.position.x + startOffset * dir.x, this.gameEngine.mainCamera.position.y + startOffset * dir.y, this.p5.mouseX, this.p5.mouseY);
      this.charge = this.p5.min(this.charge, 500);
      this.p5.pop();
    }

    shoot(speed){
      this.shots--;
      const dir = MonoBehaviour.cameraToMouseDirection(this.gameEngine.mainCamera, this.gameEngine.screenWidth, this.gameEngine.screenHeight)
      this.gameObject.rigidBody.addForce(dir, speed);
    }

  }

  
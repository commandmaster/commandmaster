// Mini Game - Interactive Scene
// Bennett Friesen
// 2/29/2024
//
// Extra for Experts:
// I built a game engine from scratch using p5.js. I also created documentation for the game engine located at https://commandmaster.github.io/EngineDocs/ (the engine is still in development).
// I also used p5js to add html document elements to the game.
// You can ignore the engine code if you would like and just look at the code located in the game state and other scripts. Here is where you will find the code I used to actually develop the games you can play.


let preloadDone = false;
let globalP5;



/**
 * Waits for a condition to be met.
 * @param {Function} condition - The condition to wait for.
 * @returns {Promise} A promise that resolves when the condition is met.
 */
function waitForCondition(condition) {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (condition()) {
        clearInterval(intervalId);
        resolve();
      }
    }, 100);
  });
}


let myGameEngine;
let game = function(p){
  globalP5 = p;

  p.preload = async function(){
    myGameEngine = new GameEngine("./gameState.js");

    setTimeout(() => {
      preloadDone = true;
    }, 1000);
  };

  p.setup = function(){
    myGameEngine.Setup(60, true, 800, 800);
  }

  p.draw = function(){
    myGameEngine.update();
    

  };
  
}






class GameObject {
  /**
   * Represents a game object in the game engine.
   * @constructor
   * @param {GameEngine} gameEngine - The game engine instance.
   * @param {p5.Vector} [initPos=globalP5.createVector(0,0)] - The initial position of the game object.
   * @param {string} [name=null] - The name of the game object.
   * @param {string} [levelName=null] - The name of the level.
   */
  
  constructor(gameEngine, initPos=globalP5.createVector(0,0), name=null, levelName=null) {
    this.transform = new Transform(initPos, 0, globalP5.createVector(1,1));
    
    this.gameEngine = gameEngine;
    this.Started = false;

    this.scriptNames = [];
    
    const length = Object.keys(this.gameEngine.gameObjects).length;
    
    
    let objectName = String(length);
    

    if (name !== null){
      objectName = name;
    }

    this.name = objectName;

    this.ignoreCulling = false;
    
    this.gameEngine.gameObjects[objectName] = this;
    
    
    this.tags = []
    
    this.collidingWith = []
    
    // List of possible Components
    this.scripts = {};
    this.spriteRenderer = null;
    this.rigidBody = null; 
    this.animator = null;
    this.boxCollider = null;
    this.circleCollider = null;
    this.platformerPlayerController = null;
    this.topDownPlayerController = null;
    
    this.components = [this.platformerPlayerController, this.topDownPlayerController, this.rigidBody, 
                      this.animator, this.boxCollider, this.circleCollider, this.spriteRenderer];
    
    this.colliders = []
  }
  
  /**
   * Deletes the current object.
   */
  delete() {
    this.scripts = {};
    delete this.gameEngine.gameObjects[this.name];
    delete this.gameEngine.currentLevelObjects[this.name];
  }


  /**
   * Rotates the object by the specified angle in degrees.
   * @param {number} angleInDegrees - The angle in degrees to rotate the object.
   */
  rotateObject(angleInDegrees){
    globalP5.push();
    globalP5.translate(this.transform.Position.x, this.transform.Position.y)
    globalP5.rotate(angleInDegrees)
    globalP5.rectMode(CENTER)
    globalP5.pop()
  }
  
  
  /**
   * Adds a tag to the list of tags.
   * @param {string} tag - The tag to be added.
   */
  addTag(tag){
    this.tags.push(tag)
  }
  
  /**
   * Checks if the given tag exists in the tags array.
   * @param {string} tag - The tag to check.
   * @returns {boolean} - True if the tag exists, false otherwise.
   */
  hasTag(tag){
    if (this.tags.includes(tag)){
        return true;
        } return false;
  }
  
  
  /**
   * Adds a script to the game object.
   * 
   * @param {string} scriptName - The name of the script to add.
   * note: the scirpt must be loaded in the game engine before it can be added to a game object.
   */
  addScript(scriptName){
    const script = this.gameEngine.scriptSystem.getScript(scriptName)
    const scriptInstance = new script.default(globalP5, this.gameEngine, this);
    this.scripts[scriptName] = scriptInstance;

    if (!this.scriptNames.includes(scriptName)){
      this.scriptNames.push(scriptName);
    }
  }

  
  /**
   * Adds a sprite renderer to the sketch.
   * @param {Image} img - The image to be rendered as a sprite.
   * @param {p5.Vector} imgSize - The size of the image in pixels. Defaults to null.
   * @param {string} spriteColor - The color of the sprite. Defaults to null.
   * @param {boolean} glow - Whether the sprite should have a glow effect. Defaults to false.
   * @param {string} glowColor - The color of the glow effect. Defaults to null.
   */
  addSpriteRenderer(img, imgSize=null, spriteColor=null, glow=false, glowColor=null){
    this.spriteRenderer = new SpriteRenderer(this, img, imgSize, spriteColor, glow, glowColor);
  }
  
  /**
   * Adds a rigid body to the object.
   * @param {number} mass - The mass of the rigid body.
   * @param {number} bounce - The bounce factor of the rigid body.
   * @param {number} [drag=0.02] - The drag coefficient of the rigid body.
   */
  addRigidBody(mass, bounce, drag=0.02){
    this.rigidBody = new RigidBody(this, mass, bounce, drag);
  }
  
  /**
   * Adds an animator to the sketch.
   */
  addAnimator(){
    this.animator = new Animator(this);
  }
  
  /**
   * Adds a box collider to the sketch.
   * @param {p5.Vector} colliderSize - The size of the collider.
   * @param {boolean} [isTrigger=false] - Whether the collider is a trigger.
   * @param {boolean} [isContinuous=false] - Whether the collider is continuous.
   * @param {p5.Vector} [colliderOffset=globalP5.createVector(0,0)] - The offset of the collider.
   * @param {string} [tag=null] - The tag associated with the collider.
   */
  addBoxCollider(colliderSize, isTrigger=false, isContinuous=false, colliderOffset=globalP5.createVector(0,0), tag=null){
    const boxCollider = new BoxCollider(this, colliderSize, isTrigger, isContinuous, colliderOffset);
    
    if (tag !== null){
      boxCollider.addTag(tag);  
        }
    
    this.colliders.push(boxCollider);
  }
  
  /**
   * Adds a circle collider to the sketch.
   * @param {number} colliderRadius - The radius of the collider.
   * @param {boolean} [isTrigger=false] - Whether the collider is a trigger or not.
   * @param {boolean} [isContinuous=false] - Whether the collider is continuous or not.
   * @param {p5.Vector} [colliderOffset=globalP5.createVector(0,0)] - The offset of the collider.
   * @param {string} [tag=null] - The tag associated with the collider.
   */
  addCircleCollider(colliderRadius, isTrigger=false, isContinuous=false, colliderOffset=globalP5.createVector(0,0), tag=null){
    const circleCollider = new CircleCollider(this, colliderRadius, isTrigger, isContinuous, colliderOffset);
    
    if (tag !== null){
       circleCollider.addTag(tag);  
        }
    
    this.colliders.push(circleCollider)
  }
  
  /**
   * Adds a platformer player controller to the object.
   * @param {number} accelerationScale - The scale factor for acceleration.
   * @param {number} deccelerationScale - The scale factor for deceleration.
   * @param {number} maxSpeed - The maximum speed of the player.
   * @param {number} jumpPower - The power of the player's jump.
   * @param {number} [airControl=1] - The control factor for movement in the air. Defaults to 1.
   */
  addPlatformerPlayerController(accelerationScale, deccelerationScale, maxSpeed, jumpPower, airControl=1){
    this.platformerPlayerController = new PlatformerPlayerController(this.rigidBody, accelerationScale, deccelerationScale, maxSpeed, jumpPower, airControl);
  }
  
  /**
   * Adds a top-down player controller to the object.
   * @param {number} accelerationScale - The scale factor for player acceleration.
   * @param {number} deccelerationScale - The scale factor for player deceleration.
   * @param {number} maxSpeed - The maximum speed for the player.
   * @param {number} [horizontalBias=1] - The bias for horizontal movement.
   */
  addTopDownPlayerController(accelerationScale, deccelerationScale, maxSpeed, horizontalBias=1){
    this.topDownPlayerController = new TopDownPlayerController(this.rigidBody, accelerationScale, deccelerationScale, maxSpeed, horizontalBias)

  }
  
  
  
  /**
   * Updates the components of the game every frame, called in the game engine update method.
   */
  updateComponents(){
    if (this.Started === false){
      this.Started = true;

      for (const script in this.scripts){
        this.scripts[script].Start();
      }
    }


    this.components = [this.platformerPlayerController, this.topDownPlayerController, this.rigidBody];
    
  
    
    for (const component of this.components) {
      if (component !== null){
        component.update();    
        }
      
      
      for (const collider of this.colliders){
        collider.update()
      }
      
    
    }

    for (const script in this.scripts){
      this.scripts[script].Update()
    }
  
  
  }
  
  
  
  /**
   * Renders the components of the game object every frame, 
   * called in the game engine update method after the components have been updated.
   */
  renderComponents(){
    if (this.spriteRenderer !== null){
        this.spriteRenderer.update()
        }
    
    if (this.animator !== null){
        this.animator.update()
        }
    
    
    
    for (const collider of this.colliders){
      collider.collidingWith = []
      if (this.gameEngine.debug){
        collider.showCollider()  
          }
      
      
    }
    
  }

  static deserialize(gameEngine, {transform, name, tags, ignoreCulling, colliders, spriteRenderer, rigidBody, animator, scriptNames, platformerPlayerController, topDownPlayerController}){
    const gameObject = new GameObject(gameEngine, transform.Position, name);
    gameObject.transform = Transform.deserialize(transform);
    gameObject.name = name;
    gameObject.tags = tags;
    gameObject.ignoreCulling = ignoreCulling;
    gameObject.spriteRenderer = spriteRenderer !== null ? SpriteRenderer.deserialize(gameObject, spriteRenderer) : null;
    gameObject.rigidBody = rigidBody !== null ? RigidBody.deserialize(gameObject, rigidBody) : null;
    gameObject.animator = animator !== null ? Animator.deserialize(gameObject, animator) : null;
    gameObject.scriptNames = scriptNames;
    gameObject.platformerPlayerController = platformerPlayerController !== null ? PlatformerPlayerController.deserialize(gameObject.rigidBody, platformerPlayerController) : null;
    gameObject.topDownPlayerController = topDownPlayerController !== null ? TopDownPlayerController.deserialize(gameObject.rigidBody, topDownPlayerController) : null;

    for (const collider of colliders){
      if (collider.colliderType === "rect"){
        gameObject.addBoxCollider(collider.colliderSize, collider.isTrigger, collider.isContinuous, collider.colliderOffset, collider.tag);
      }

      else if (collider.colliderType === "circle"){
        gameObject.addCircleCollider(collider.colliderRadius, collider.isTrigger, collider.isContinuous, collider.colliderOffset, collider.tag);
      }
    }

    for (const scriptName of scriptNames){
      gameObject.addScript(scriptName);
    }

    return gameObject;
  }

  serialize(){
    return {
      transform: this.transform.serialize(),
      name: this.name,
      tags: this.tags,
      ignoreCulling: this.ignoreCulling,
      colliders: this.colliders.map(collider => collider.serialize()),
      spriteRenderer: this.spriteRenderer === null ? null : this.spriteRenderer.serialize(),
      rigidBody: this.rigidBody === null ? null : this.rigidBody.serialize(),
      animator: this.animator === null ? null : this.animator.serialize(),
      scriptNames: this.scriptNames,
      platformerPlayerController: this.platformerPlayerController === null ? null : this.platformerPlayerController.serialize(),
      topDownPlayerController: this.topDownPlayerController === null ? null : this.topDownPlayerController.serialize()
    };
  }
}






class InputSystem{
  // For the gameEngine class
  
  /**
   * Represents a constructor.
   * @constructor
   */
  constructor(){
    this.keycodes = {
      'a': 65,
      'b': 66,
      'c': 67,
      'd': 68,
      'e': 69,
      'f': 70,
      'g': 71,
      'h': 72,
      'i': 73,
      'j': 74,
      'k': 75,
      'l': 76,
      'm': 77,
      'n': 78,
      'o': 79,
      'p': 80,
      'q': 81,
      'r': 82,
      's': 83,
      't': 84,
      'u': 85,
      'v': 86,
      'w': 87,
      'x': 88,
      'y': 89,
      'z': 90,
      'space': 32, 
      'ctrl': 17
    };
    
    this.inputs = {}
  }

  /**
   * Adds a mouse input to the inputs object.
   * @param {string} inputName - The name of the input.
   * @param {string} mouseButton - The mouse button associated with the input.
   */
  addMouseInput(inputName, mouseButton){
      this.inputs[inputName] = {"inputFormat":"mouse", "inputKey": mouseButton, "inputType": "bool"};
  }

  /**
   * Adds a keyboard input to the sketch.
   * @param {string} inputName - The name of the input.
   * @param {string | number} inputKey - The key associated with the input.
   * @param {string} [inputType="bool"] - The type of the input (default is "bool").
   */
  addKeyboardInput(inputName, inputKey, inputType="bool"){
    if (typeof inputKey === 'string'){
      this.inputs[inputName] = {"inputFormat":"key", "inputKey": [this.keycodes[inputKey]], "inputType": inputType, "alreadyPressed": false};

    } else{
      this.inputs[inputName] = {"inputFormat":"key", "inputKey": [inputKey], "inputType": inputType, "alreadyPressed": false};
    }
     
  }

  /**
   * Adds a keyboard input binding for the specified input name and key.
   * @param {string} inputName - The name of the input.
   * @param {string|number} inputKey - The key to bind to the input. Can be either a string representing a key code or a number representing a key code.
   */
  addBindToKeyboardInput(inputName, inputKey){
    if (typeof inputKey === 'string'){
      this.inputs[inputName].inputKey.push(this.keycodes[inputKey]);
    }

    else{
      this.inputs[inputName].inputKey.push(inputKey);
    }
    
  }
  
  
  /**
   * Retrieves the input value for the specified input name.
   * @param {string} inputName - The name of the input.
   * @returns {boolean} - True if the input is active, false otherwise.
   */
  getInput(inputName){
    if (globalP5.keyIsPressed ){
      
      if (this.inputs.hasOwnProperty(inputName) && this.inputs[inputName].inputFormat === "key") {
        for (const keycode of this.inputs[inputName].inputKey){
            if (globalP5.keyIsDown(keycode)){
                
                return true;

                
                }
        }
      }
      
    }
    
    if (globalP5.mouseIsPressed){
      if (this.inputs.hasOwnProperty(inputName) && this.inputs[inputName].inputFormat === "mouse") {
        if (globalP5.mouseButton === this.inputs[inputName].inputKey){
          return true;
        }
      }
      return false;
    }

  }
  
  
  /**
   * Retrieves the status of a specific input key.
   * @param {string} inputName - The name of the input key.
   * @returns {boolean} - True if the input key is currently pressed, false otherwise.
   */
  getInputDown(inputName){
      let oneDown = false;
      let alreadyPressedKey;
      if (this.inputs.hasOwnProperty(inputName)) {
        alreadyPressedKey = this.inputs[inputName].alreadyPressed;
        for (const keycode of this.inputs[inputName].inputKey){
            if (globalP5.keyIsDown(keycode)){
              oneDown = true;
              this.inputs[inputName].alreadyPressed = true;
              
                
            } 


        }

        

        
      }

      if (oneDown){
        this.inputs[inputName].alreadyPressed = true;
      }

      else{
        this.inputs[inputName].alreadyPressed = false;
      }
      
      if (!alreadyPressedKey && oneDown){
        return true;
      }
  }
  
  
}



class Camera {
  /**
   * Constructs a new Camera object.
   * @param {Object} objectToFollow - The object that the camera will follow.
   * @param {number} screenWidth - The width of the screen.
   * @param {number} screenHeight - The height of the screen.
   * @param {p5.Vector} [cameraOffset=globalP5.createVector(0,100)] - The offset of the camera from the object being followed.
   */
  constructor(objectToFollow, screenWidth, screenHeight, cameraOffset=globalP5.createVector(0,100)) {
    
    this.offSetValue = cameraOffset;

    this.objectToFollow = objectToFollow;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    cameraOffset = globalP5.createVector(cameraOffset.x * this.screenWidth / 2560, cameraOffset.y * this.screenHeight / 1440)
    this.cameraOffset = cameraOffset;

    this.position = globalP5.createVector(this.objectToFollow.gameEngine.screenWidth/2 + this.cameraOffset.x, this.objectToFollow.gameEngine.screenHeight/2 + this.cameraOffset.y);
  }

  /**
   * Updates the camera position based on the object to follow.
   */
  update() {
    this.screenWidth = this.objectToFollow.gameEngine.screenWidth;
    this.screenHeight = this.objectToFollow.gameEngine.screenHeight;

    const cameraOffset = globalP5.createVector(this.offSetValue.x * this.screenWidth / 2560, this.offSetValue.y * this.screenHeight / 1440)
    this.cameraOffset = cameraOffset;


    this.position = globalP5.createVector(this.objectToFollow.gameEngine.screenWidth/2 + this.cameraOffset.x, this.objectToFollow.gameEngine.screenHeight/2 + this.cameraOffset.y);
    

    // Calculate the camera's position based on the object position
    this.targetX = this.objectToFollow.transform.Position.x - this.screenWidth / 2;
    this.targetY = this.objectToFollow.transform.Position.y - this.screenHeight / 2;
    
    const scaleFactor = Math.min(globalP5.width / 2560, globalP5.height / 1440);

    globalP5.translate((globalP5.width / 2 + this.cameraOffset.x), (globalP5.height / 2 + this.cameraOffset.y));
    globalP5.scale(scaleFactor, scaleFactor);
    globalP5.translate(-(globalP5.width / 2 + this.cameraOffset.x), -(globalP5.height / 2 + this.cameraOffset.y));

    // Translate the canvas to the camera position
    globalP5.translate(-this.targetX + this.cameraOffset.x, -this.targetY + this.cameraOffset.y);
    
    
    
  }
}





class SpriteRenderer {
  /**
   * Creates a new instance of the class.
   * @param {GameObject} gameObject - The game object associated with the sprite.
   * @param {Image} img - The image used for the sprite.
   * @param {p5.Vector} imgSize - The size of the image (optional).
   * @param {P5ColorObject} spriteColor - The color of the sprite (optional).
   * @param {boolean} glow - Indicates if the sprite should have a glow effect (optional).
   * @param {P5ColorObject} glowColor - The color of the glow effect (optional).
   */
  constructor(gameObject, img, imgSize=null, spriteColor=null, glow=false, glowColor=null){
    this.gameObject = gameObject;
    this.imgSize = imgSize;
    this.img = img;
    this.spriteColor = spriteColor;
    this.imageOffset = globalP5.createVector(0, 0);
    this.flip = true
    this.glow = glow;
    this.glowColor = glowColor;

    this.imgName = null;
  }
  
  
  /**
   * Updates the game object's visual representation based on its properties.
   */
  update(){ 
    const angleInDegrees = this.gameObject.transform.Rotation 
    globalP5.push();
    
    if (typeof this.img !== "string"){
        globalP5.translate(this.gameObject.transform.Position.x + this.imageOffset.x , this.gameObject.transform.Position.y + this.imageOffset.y)
        }
    
    else{
        globalP5.translate(this.gameObject.transform.Position.x + this.imageOffset.x, this.gameObject.transform.Position.y + this.imageOffset.y)
        }
    
    
    globalP5.rotate(angleInDegrees)
    globalP5.rectMode(globalP5.CORNER)
    globalP5.imageMode(globalP5.CENTER)
    
    globalP5.noStroke()
    if (typeof this.img !== "string"){
       if (this.flip){
           globalP5.push()
           globalP5.scale(-1, 1)
           }
      
      
       if (this.imgSize !== null){
        globalP5.scale(-1, 1)
        
        globalP5.image(this.img, 0 , 0, this.imgSize.x, this.imgSize.y)
        } else{
          globalP5.image(this.img, 0, 0)
        } 
      
      if (this.flip){
           globalP5.pop();
           }
        
    } 
      
      
    else {
      globalP5.push()
      if (this.img === "circle"){
        globalP5.fill(this.spriteColor);
        
        if (this.glow){
          globalP5.drawingContext.shadowBlur = 23;
          globalP5.drawingContext.shadowColor = globalP5.color(this.glowColor);
        }

        globalP5.circle(0, 0, this.imgSize)
      }
      
      else if (this.img === "rect" || this.img === "rectangle"){
        globalP5.fill(this.spriteColor);
        
        if (this.glow){
          globalP5.drawingContext.shadowBlur = 23;
          globalP5.drawingContext.shadowColor = globalP5.color(this.glowColor);
        }
        globalP5.rect(0, 0, this.imgSize.x, this.imgSize.y)
      }
      globalP5.pop()    
    }
    
    
    
    globalP5.pop();
  }

  serialize(){
    return {
      "imgName": this.imgName,
      imgSize: this.imgSize,
      spriteColor: this.spriteColor,
      imageOffset: this.imageOffset,
      flip: this.flip,
      glow: this.glow,
      glowColor: this.glowColor
    };
  }

  static deserialize(gameObject, {imgName, imgSize, spriteColor, imageOffset, flip, glow, glowColor}){
    const img = gameObject.gameEngine.imageSystem.getImage(imgName);
    const spriteRenderer = new SpriteRenderer(gameObject, img, imgSize, spriteColor, imageOffset, flip, glow, glowColor);
    spriteRenderer.imgName = imgName;

    return spriteRenderer;
  }
}


class Transform{
  constructor(Position, Rotation, Scale){
    this.Position = Position;
    this.Rotation = Rotation;
    this.Scale = Scale;
  }

  serialize(){
    return {
      Position: this.Position,
      Rotation: this.Rotation,
      Scale: this.Scale
    };
  }
  

  static deserialize({Position, Rotation, Scale}){
    Position = globalP5.createVector(Position.x, Position.y);
    Scale = globalP5.createVector(Scale.x, Scale.y);
    
    return new Transform(Position, Rotation, Scale);
  }
}

class RigidBody {
  /**
   * Creates a new instance of the GameObject class.
   * @param {GameObject} gameObject - The game object associated with the physics body.
   * @param {number} mass - The mass of the physics body.
   * @param {number} bounce - The bounce factor of the physics body.
   * @param {number} drag - The drag coefficient of the physics body.
   */
  constructor(gameObject, mass, bounce, drag){
    this.gameObject = gameObject;
    this.Velocity = globalP5.createVector(0,0)
    
    this.mass = mass;
    this.inverseMass = 1/mass;
    this.bounce = bounce;
    this.drag = drag;
    
    this.gravityScale = 0.02;
    
    this.maxSpeed = 10000000000;
  }
  
  /**
   * Applies a force to the object.
   * @param {p5.Vector} directionVector - The direction of the force.
   * @param {number} Magnitude - The magnitude of the force.
   */
  addForce(directionVector, Magnitude){
    this.acceleration = directionVector.mult(Magnitude).div(this.mass)
    
    if (globalP5.abs(this.Velocity.mag()) < this.maxSpeed){
        this.Velocity.add(this.acceleration.copy())
    } 
  }
  
  /**
   * Applies drag to the object's velocity.
   * @param {number} drag - The drag coefficient.
   * @param {boolean} [ignoreVertival=false] - Whether to ignore vertical drag.
   * @param {boolean} [ignoreHorizontal=false] - Whether to ignore horizontal drag.
   */
  applyDrag(drag, ignoreVertival=false, ignoreHorizontal=false){
    const dragMagnitude = this.Velocity.copy().mag() * drag;
    const dragDirection = this.Velocity.copy().normalize().mult(-1);

    if (ignoreVertival){
      this.addForce(globalP5.createVector(dragDirection.x, 0), dragMagnitude);
    }

    else if(ignoreHorizontal){
      this.addForce(globalP5.createVector(0, dragDirection.y), dragMagnitude);
    }

    else{
      this.addForce(dragDirection, dragMagnitude);
    }
    
  }
  
  /**
   * Applies gravity to the object.
   */
  applyGravity(){
    this.addForce(globalP5.createVector(0, 1), 9.8 * this.mass * this.gravityScale);
  }
  
  /**
   * Updates the game object's position based on velocity, gravity, and drag.
   */
  update() {
   
    

    
    this.applyDrag(this.drag);
    this.applyGravity();
    this.gameObject.transform.Position.add(this.Velocity.copy());
    
    
      
  }

  serialize(){
    return {
      mass: this.mass,
      bounce: this.bounce,
      drag: this.drag,
      gravityScale: this.gravityScale,
      maxSpeed: this.maxSpeed
    };
  }

  static deserialize(gameObject, {mass, bounce, drag, gravityScale, maxSpeed}){
    const rigidBody = new RigidBody(gameObject, mass, bounce, drag);
    rigidBody.gravityScale = gravityScale;
    rigidBody.maxSpeed = maxSpeed;
    return rigidBody;
  }
}


class TopDownPlayerController{
  /**
   * Constructs a new instance of the class.
   * @param {RigidBody} rigidBody - The rigid body associated with the object.
   * @param {number} accelerationScale - The scale factor for acceleration.
   * @param {number} deccelerationScale - The scale factor for deceleration.
   * @param {number} maxSpeed - The maximum speed of the object.
   * @param {number} horizontalBias - The horizontal bias of the object (optional).
   * @deprecated This class is deprecated and will be removed in future versions of the game engine.
   */
  constructor(rigidBody, accelerationScale, deccelerationScale, maxSpeed, horizontalBias=1){
    this.rigidBody = rigidBody;
    this.accelerationScale = accelerationScale;
    this.deccelerationScale = deccelerationScale;
    
    this.horizontalBias = horizontalBias;
    
    this.maxSpeed = maxSpeed;
    
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Up', 'w', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Down', 's', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Right', 'd', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Left', 'a', 'bool')
    
  }
  
  /**
   * Updates the object's movement based on user input.
   */
  update(){
    
    
    
    let accelerationScale = this.accelerationScale;
    let deccelerationScale = this.deccelerationScale;
    
    
    
    
    if (this.rigidBody.Velocity.x < this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Right')){
      this.rigidBody.addForce(globalP5.createVector(1,0), this.maxSpeed * accelerationScale);
    }
    
    else if (this.rigidBody.Velocity.x > -1 * this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Left')){
      this.rigidBody.addForce(globalP5.createVector(-1,0), this.maxSpeed * accelerationScale);
    } else{
      // Stopping speed / horizontal drag
      if (!this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Left') && !this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Right')){
         this.rigidBody.addForce(globalP5.createVector(this.rigidBody.Velocity.x * -1, 0), deccelerationScale * this.rigidBody.mass); 
          }
      
    }
    
    
    if (this.rigidBody.Velocity.y > -1 * this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Up')){
      this.rigidBody.addForce(globalP5.createVector(0,-1), this.maxSpeed * accelerationScale);
    }
    
    else if (this.rigidBody.Velocity.y < this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Down')){
      this.rigidBody.addForce(globalP5.createVector(0,1), this.maxSpeed * accelerationScale);
    } else{
      // Stopping speed / vertical drag
      if (!this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Up') && !this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Down')){
         this.rigidBody.addForce(globalP5.createVector(0, this.rigidBody.Velocity.y * -1), deccelerationScale * this.rigidBody.mass); 
          }
    }
    
    
    // flip the sprite depening on which direction on the x-axis they are moving in
    if(this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Right')){
      if (this.rigidBody.gameObject.spriteRenderer !== null){
        //this.rigidBody.gameObject.spriteRenderer.flip = false;
          }
      
      else if (this.rigidBody.gameObject.animator !== null){
        //this.rigidBody.gameObject.animator.flip = false;         
               }
       
       }
    else if (this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Left')){
      if (this.rigidBody.gameObject.spriteRenderer !== null){
        //this.rigidBody.gameObject.spriteRenderer.flip = true;
      }
      
      
      else if (this.rigidBody.gameObject.animator !== null){
        //this.rigidBody.gameObject.animator.flip = true;
               }
      }
  }

  serialize(){
    return {
      accelerationScale: this.accelerationScale,
      deccelerationScale: this.deccelerationScale,
      maxSpeed: this.maxSpeed,
      horizontalBias: this.horizontalBias
    };
  }

  static deserialize(rigidBody, {accelerationScale, deccelerationScale, maxSpeed, horizontalBias}){
    return new TopDownPlayerController(rigidBody, accelerationScale, deccelerationScale, maxSpeed, horizontalBias);
  }
}


class PlatformerPlayerController{
  /**
   * Constructs a new instance of the class.
   * @param {RigidBody} rigidBody - The rigid body associated with the object.
   * @param {number} accelerationScale - The scale factor for acceleration.
   * @param {number} deccelerationScale - The scale factor for deceleration.
   * @param {number} maxSpeed - The maximum speed of the object.
   * @param {number} jumpPower - The power of the object's jump.
   * @param {number} airControl - The air control factor of the object. (optional)
   * @deprecated This class is deprecated and will be removed in future versions of the game engine.
   */
  constructor(rigidBody, accelerationScale, deccelerationScale, maxSpeed, jumpPower, airControl=1){
    this.rigidBody = rigidBody;
    this.accelerationScale = accelerationScale;
    this.deccelerationScale = deccelerationScale;
    
    
    
    this.maxSpeed = maxSpeed;
    this.jumpPower = jumpPower;
    this.airControl = airControl;
    
    this.timeWarpLocation = null;
    
    this.canJump = true;
    this.jumps = 1
    
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Jump', 'space', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Right', 'd', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('Left', 'a', 'bool')
    this.rigidBody.gameObject.gameEngine.inputSystem.addKeyboardInput('TimeWarp', 'f', 'bool')
  }
  
  /**
   * Updates the state of the object.
   */
  update(){
    
    this.isGrounded = false;
    
    
    for (const collider of this.rigidBody.gameObject.colliders[0].collidingWith){
      
      const object = collider.gameObject;
      if (object.hasTag('Ground')){
          this.isGrounded = true;
          this.jumps = 1;

          }
    }
    
    let accelerationScale;
    let deccelerationScale;
    if (!this.isGrounded){
        accelerationScale = this.accelerationScale * this.airControl;
        deccelerationScale = this.deccelerationScale * this.airControl / 5;
        } else{
          accelerationScale = this.accelerationScale;
          deccelerationScale = this.deccelerationScale
        }
    
    
    if (this.rigidBody.gameObject.gameEngine.inputSystem.getInputDown('TimeWarp')){
      
      if (this.timeWarpLocation === null){
        this.timeWarpLocation = this.rigidBody.gameObject.transform.Position.copy()
          } 
      
      else{
        this.rigidBody.gameObject.transform.Position = this.timeWarpLocation
        this.timeWarpLocation = null;
      }
        
        }
    
    
    if (this.rigidBody.Velocity.x < this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Right')){
      this.rigidBody.addForce(globalP5.createVector(1,0), this.maxSpeed * accelerationScale);
    }
    
    else if (this.rigidBody.Velocity.x > -1 * this.maxSpeed && this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Left')){
      this.rigidBody.addForce(globalP5.createVector(-1,0), this.maxSpeed * accelerationScale);
    } else{
      // Stopping speed / horizontal drag
      if (!this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Left') && !this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Right')){
         this.rigidBody.addForce(globalP5.createVector(this.rigidBody.Velocity.x * -1, 0), deccelerationScale * this.rigidBody.mass); 
          }
      
    }
    
    
    if (this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Jump') && this.jumps > 0 && this.canJump){
        this.rigidBody.Velocity.y = 0;
        this.rigidBody.addForce(globalP5.createVector(0, -1), this.jumpPower);
        this.jumps -= 1;
        this.canJump = false;
        }
    else if (this.rigidBody.gameObject.gameEngine.inputSystem.getInput('Jump')){
        this.canJump = true;     
        }
    
    // flip the sprite depening on which direction on the x-axis they are moving in
    if(this.rigidBody.Velocity.x > 0.5 && this.rigidBody.gameObject.spriteRenderer !== null){
       this.rigidBody.gameObject.spriteRenderer.flip = false
       }
    else if (this.rigidBody.Velocity.x < -0.5 && this.rigidBody.gameObject.spriteRenderer !== null){
       this.rigidBody.gameObject.spriteRenderer.flip = true
       }
    
  }

  serialize(){
    return {
      accelerationScale: this.accelerationScale,
      deccelerationScale: this.deccelerationScale,
      maxSpeed: this.maxSpeed,
      jumpPower: this.jumpPower,
      airControl: this.airControl
    };
  }

  static deserialize(rigidBody, {accelerationScale, deccelerationScale, maxSpeed, jumpPower, airControl}){
    return new PlatformerPlayerController(rigidBody, accelerationScale, deccelerationScale, maxSpeed, jumpPower, airControl);
  }
}

class Animation{
  /**
   * Creates a new instance of the class.
   * @param {Image} spriteSheetImg - The sprite sheet image.
   * @param {number} numOfFrames - The number of frames in the sprite sheet.
   * @param {number} size - The size of the sprite. (optional)
   * @param {number} speed - The speed of the animation. (optional)
   * @param {number} rotation - The rotation angle of the sprite. (optional)
   */
  constructor(animator, spriteSheetImg, numOfFrames, size=1, speed=10, rotation=0){
    if (typeof spriteSheetImg === "string"){
      this.spriteSheet = animator.gameObject.gameEngine.imageSystem.getImage(spriteSheetImg);
      this.spriteSheetName = spriteSheetImg;
    }

    else{
      this.spriteSheet = spriteSheetImg;
      this.spriteSheetName = null;
    }
    

    this.frameHeight =  this.spriteSheet.height;
    this.frameWidth = this.spriteSheet.width / numOfFrames;
    
    this.rotation = rotation;
    
    this.numOfFrames = numOfFrames;
    
    this.size = size;
    
    this.frames = [];
    this.speed = speed;
    
    this.flipAxisOffset = 0;
    
    this.generateFrameData();
    
    this.animationOffset = globalP5.createVector(0,0);
  }
  
  /**
   * Generates frame data for the sprite animation.
   */
  generateFrameData(){
    for (let i = 0; i < this.numOfFrames; i++){
      this.frames.push({"img": this.spriteSheet, "sWidth": this.frameWidth, "sHeight": this.frameHeight, "sx": (i) * this.spriteSheet.width / this.numOfFrames, "sy": 0, "size": this.size})
    }
    
  }
  
  serialize(){
    return {
      "spriteSheetName": this.spriteSheetName,
      rotation: this.rotation,
      numOfFrames: this.numOfFrames,
      size: this.size,
      speed: this.speed,
      flipAxisOffset: this.flipAxisOffset,
      animationOffset: this.animationOffset
    };
  }

  static deserialize(animator, {spriteSheetName, rotation, numOfFrames, size, speed, flipAxisOffset, animationOffset}){
    const animation = new Animation(animator, spriteSheetName, numOfFrames, size, speed, rotation);
    
    animation.flipAxisOffset = flipAxisOffset;
    animation.animationOffset = animationOffset;
    return animation;
  }
  
}

class Animator {
  /**
   * Represents a constructor for a game object.
   * @constructor
   * @param {GameObject} gameObject - The game object associated with the animator.
   */
  constructor(gameObject){
    this.gameObject = gameObject;
    this.animations = {};
    this.shapeAnimations = {};
    this.currentAnimation = null;
    this.finishCurrentAnim = false;
    this.inTransition = false;
    this.currentFrame = 0;
    this.flip = false;
    this.flipVertical = false;
    this.frameTime = 0;
    this.loopCount = 0;

    this.defaultAnimationName = null;

    this.animationOffset = globalP5.createVector(0,0)
  }
  
  /**
   * Creates an animation and adds it to the animations object.
   * @param {string} name - The name of the animation.
   * @param {string} spriteSheetImg - The image URL of the sprite sheet.
   * @param {number} numOfFrames - The number of frames in the sprite sheet.
   * @param {number} [size=1] - The size of the animation.
   * @param {number} [speed=10] - The speed of the animation.
   * @param {number} [rotation=0] - The rotation of the animation.
   */
  createAnimation(name, spriteSheetImg, numOfFrames, size=1, speed=10, rotation=0){
    this.animations[name] = new Animation(this, spriteSheetImg, numOfFrames, size, speed, rotation);
    if (this.defaultAnimationName === null){
      this.defaultAnimationName = name;
    }
  }

  
  /**
   * Transitions to the specified animation.
   * @param {string} animToShow - The name of the animation to transition to.
   * @param {boolean} [shouldFinish=false] - Indicates whether the current animation should be finished before transitioning.
   */
  transition(animToShow, shouldFinish=false){
    this.inTransition = true;
    this.finishCurrentAnim = shouldFinish;
    
    if (this.currentAnimation === null){
      this.currentAnimation = this.animations[animToShow]
      this.nextAnimation = this.animations[animToShow]
    }

    else{
      this.nextAnimation = this.animations[animToShow]
    }
    
  }
  
  /**
   * Updates the animation frame and handles transitions between animations.
   */
  update(){
    this.frameTime += globalP5.deltaTime / 1000
    
    if (this.inTransition){
      if (this.currentAnimation === null){
        this.currentAnimation = this.nextAnimation
        this.inTransition = false;
        this.currentFrame = 0;
        this.loopCount = 0;
      }

      else if (this.finishCurrentAnim){
        if (this.currentFrame >= this.currentAnimation.frames.length - 1){
            this.currentAnimation = this.nextAnimation
            this.inTransition = false;
            this.currentFrame = 0;
            this.loopCount = 0;
            
        }
      } 
      else{
        
        this.currentAnimation = this.nextAnimation
        this.inTransition = false;
        this.currentFrame = 0;
        this.loopCount = 0;
      }
    }
    
    if (this.currentAnimation !== null && this.currentAnimation !== undefined) {
    
    const frameInfo = this.currentAnimation.frames[this.currentFrame];
    globalP5.push();
    globalP5.imageMode(globalP5.CORNER)
      
    this.animationOffset = this.currentAnimation.animationOffset;
      
    globalP5.translate(this.gameObject.transform.Position.x + this.animationOffset.x, this.gameObject.transform.Position.y + this.animationOffset.y)
      
    if (this.flip && this.flipVertical){
      globalP5.push();
      globalP5.translate(this.currentAnimation.flipAxisOffset,0)
      globalP5.scale(-1, -1);
    }

    else if (this.flip){
      globalP5.push();
      globalP5.translate(this.currentAnimation.flipAxisOffset,0)
      globalP5.scale(-1, 1);
    }

    else if (this.flipVertical){
      globalP5.push();
      globalP5.translate(this.currentAnimation.flipAxisOffset,0)
      globalP5.scale(1, -1);
    }

    if (this.flipVertical){
      
      globalP5.translate(this.currentAnimation.flipAxisOffset,0)
      
    }
    
    globalP5.push();
    globalP5.rotate(this.currentAnimation.rotation)
    globalP5.image(frameInfo.img, 0, 0, frameInfo.sWidth*frameInfo.size, frameInfo.img.height*frameInfo.size, frameInfo.sx, 0, frameInfo.sWidth, frameInfo.img.height)
    
    globalP5.pop();

    if (this.flip || this.flipVertical){
        globalP5.pop();
      }

  
      
    if (this.frameTime > 1 / this.currentAnimation.speed){
      this.frameTime = 0
      
      if (this.currentFrame < this.currentAnimation.frames.length - 1){
      this.currentFrame += 1;
    }
    else{
      this.loopCount += 1;
      this.currentFrame = 0;
    }  
        }
    
    globalP5.pop();
    }
  }

  serialize(){
    const serializedAnimations = {};
    for (const key in this.animations){
      serializedAnimations[key] = this.animations[key].serialize();
    }
    return {
      animations: serializedAnimations,
      currentAnimation: this.currentAnimation.serialize(),
      finishCurrentAnim: this.finishCurrentAnim,
      inTransition: this.inTransition,
      currentFrame: this.currentFrame,
      flip: this.flip,
      flipVertical: this.flipVertical,
      frameTime: this.frameTime,
      loopCount: this.loopCount,
      animationOffset: this.animationOffset,
      defaultAnimationName: this.defaultAnimationName
    };
  }

  static deserialize(gameObject, {animations, currentAnimation, finishCurrentAnim, inTransition, currentFrame, flip, flipVertical, frameTime, loopCount, animationOffset, defaultAnimationName}){
    const animator = new Animator(gameObject);

    

    const deserializedAnimations = {};
    for (const key in animations){
      deserializedAnimations[key] = Animation.deserialize(animator, animations[key]);
    }

    animator.animations = deserializedAnimations;
    animator.currentAnimation = Animation.deserialize(animator, currentAnimation);
    animator.finishCurrentAnim = finishCurrentAnim;
    animator.inTransition = inTransition;
    animator.currentFrame = currentFrame;
    animator.flip = flip;
    animator.flipVertical = flipVertical;
    animator.frameTime = frameTime;
    animator.loopCount = loopCount;
    animator.animationOffset = animationOffset;

    animator.transition(defaultAnimationName, true);
    return animator;
  }
}


class BoxCollider {
  /**
   * Represents a Collider object.
   * @constructor
   * @param {GameObject} gameObject - The game object that the collider is attached to.
   * @param {p5.Vector} colliderSize - The size of the collider.
   * @param {boolean} [isTrigger=false] - Whether the collider is a trigger or not.
   * @param {boolean} [isContinuous=false] - Whether the collider should continuously check for collisions.
   * @param {p5.Vector} [colliderOffset=globalP5.createVector(0,0)] - The offset of the collider from the game object's position.
   */
  constructor(gameObject, colliderSize, isTrigger=false, isContinuous=false, colliderOffset=globalP5.createVector(0,0)){
    this.colliderType = "rect";
    this.gameObject = gameObject;
    this.colliderSize = globalP5.createVector(colliderSize.x, colliderSize.y);
    this.colliderOffset = globalP5.createVector(colliderOffset.x, colliderOffset.y);

    this.isTrigger = isTrigger;
    this.isContinuous = isContinuous
    
    this.colliderTags = []
    
    this.collidingWith = []
    
    this.transform = {};
    this.transform.Position = this.gameObject.transform.Position.copy().add(this.colliderOffset);
    
    this.topLeft = this.transform.Position.copy();
    this.topRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y);
    this.bottomLeft = globalP5.createVector(this.transform.Position.x, this.transform.Position.y  + this.colliderSize.y);
    this.bottomRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y + this.colliderSize.y);
    
    this.midLeft = globalP5.createVector(this.transform.Position.x, this.transform.Position.y  + this.colliderSize.y / 2);
    this.midRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y + this.colliderSize.y /2);
    this.midTop = globalP5.createVector(this.transform.Position.x + this.colliderSize.x / 2, this.transform.Position.y);
    this.midBottom = globalP5.createVector(this.transform.Position.x + this.colliderSize.x / 2, this.transform.Position.y + this.colliderSize.y);
    
  }
  
  /**
   * Adds a tag to the colliderTags array.
   * @param {string} tag - The tag to be added.
   */
  addTag(tag){
    this.colliderTags.push(tag)
  }
  
  /**
   * Checks if the object has a specific tag.
   * @param {string} tag - The tag to check.
   * @returns {boolean} - True if the object has the tag, false otherwise.
   */
  hasTag(tag){
    if (this.colliderTags.includes(tag)){
      return true;
    } 
    
    return false;
      
  }
  
  /**
   * Displays the collider of an object.
   */
  showCollider(){
    globalP5.noFill()
    globalP5.strokeWeight(2);
    globalP5.stroke(0, 0, 255);
    globalP5.rect(this.transform.Position.x, this.transform.Position.y, this.colliderSize.x, this.colliderSize.y)
    globalP5.fill("white")
    globalP5.noStroke()
  }
  
  /**
   * Updates the position and calculates the corner and mid points of the collider.
   */
  update(){
    this.transform.Position = this.gameObject.transform.Position.copy().add(this.colliderOffset)
    
    this.topLeft = this.transform.Position.copy();
    this.topRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y);
    this.bottomLeft = globalP5.createVector(this.transform.Position.x, this.transform.Position.y  + this.colliderSize.y);
    this.bottomRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y + this.colliderSize.y);
    
    this.midLeft = globalP5.createVector(this.transform.Position.x, this.transform.Position.y  + this.colliderSize.y / 2);
    this.midRight = globalP5.createVector(this.transform.Position.x + this.colliderSize.x, this.transform.Position.y + this.colliderSize.y /2);
    this.midTop = globalP5.createVector(this.transform.Position.x + this.colliderSize.x / 2, this.transform.Position.y);
    this.midBottom = globalP5.createVector(this.transform.Position.x + this.colliderSize.x / 2, this.transform.Position.y + this.colliderSize.y);
  }

  serialize(){
    return {
      colliderSize: this.colliderSize,
      isTrigger: this.isTrigger,
      isContinuous: this.isContinuous,
      colliderOffset: this.colliderOffset,
      colliderType: this.colliderType,
      colliderTags: this.colliderTags
    };
  }

  static deserialize(gameObject, {colliderSize, isTrigger, isContinuous, colliderOffset, colliderTags, colliderType}){
    const collider = new BoxCollider(gameObject, colliderSize, isTrigger, isContinuous, colliderOffset);
    collider.colliderTags = colliderTags;
    collider.colliderType = colliderType;

    collider.colliderSize = globalP5.createVector(colliderSize.x, colliderSize.y);
    collider.colliderOffset = globalP5.createVector(colliderOffset.x, colliderOffset.y);

    return collider;
  }
}

class CircleCollider {
  /**
   * Creates a new Collider object.
   * @param {GameObject} gameObject - The game object associated with the collider.
   * @param {number} colliderRadius - The radius of the collider.
   * @param {boolean} [isTrigger=false] - Whether the collider is a trigger or not.
   * @param {boolean} [isContinuous=false] - Whether the collider should continuously check for collisions.
   * @param {p5.Vector} [colliderOffset=globalP5.createVector(0,0)] - The offset position of the collider relative to the game object's position.
   */
  constructor(gameObject, colliderRadius, isTrigger=false, isContinuous=false, colliderOffset=globalP5.createVector(0,0)){
    this.colliderType = "circle";
    this.gameObject = gameObject;
    this.colliderRadius = colliderRadius;
    this.colliderOffset = globalP5.createVector(colliderOffset.x, colliderOffset.y);

    this.isTrigger = isTrigger;
    this.isContinuous = isContinuous; 
    
    this.colliderTags = []
    
    this.transform = {};
    this.collidingWith = []
    
    this.transform.Position = this.gameObject.transform.Position.copy().add(this.colliderOffset)
  }
  
  /**
   * Adds a tag to the colliderTags array.
   * @param {string} tag - The tag to be added.
   */
  addTag(tag){
    this.colliderTags.push(tag)
  }
  
  /**
   * Checks if the object has a specific tag.
   * @param {string} tag - The tag to check.
   * @returns {boolean} - True if the object has the tag, false otherwise.
   */
  hasTag(tag){
    if (this.colliderTags.includes(tag)){
      return true;
    } 
    
    return false;
  }
  
  
  /**
   * Displays the collider of the game object.
   * Used for debugging purposes.
   */
  showCollider(){
    globalP5.strokeWeight(2);
    globalP5.stroke(255, 0, 0);
    globalP5.noFill()
    globalP5.circle(this.gameObject.transform.Position.x + this.colliderOffset.x, this.gameObject.transform.Position.y + this.colliderOffset.y, this.colliderRadius*2)
    globalP5.fill("white")
    globalP5.noStroke()
  }
  
  /**
   * Updates the object's position based on the collider offset.
   */
  update(){
    this.transform.Position = this.gameObject.transform.Position.copy().add(this.colliderOffset)
  }

  serialize(){
    return {
      colliderRadius: this.colliderRadius,
      isTrigger: this.isTrigger,
      isContinuous: this.isContinuous,
      colliderOffset: this.colliderOffset,
      colliderType: this.colliderType,
      colliderTags: this.colliderTags
    };
  }

  static deserialize(gameObject, {colliderRadius, isTrigger, isContinuous, colliderOffset, colliderTags, colliderType}){
    const collider = new CircleCollider(gameObject, colliderRadius, isTrigger, isContinuous, colliderOffset);
    collider.colliderTags = colliderTags;
    collider.colliderType = colliderType;

    collider.colliderOffset = globalP5.createVector(colliderOffset.x, colliderOffset.y);

    return collider;
  }

}


class ImageSystem{
  /**
   * Represents a constructor.
   * @constructor
   */
  constructor(){
    this.Images = {}
  }
  
  /**
   * Adds an image to the Images object.
   * @param {string} name - The name of the image.
   * @param {string} imagePath - The path to the image file.
   */
  addImage(name, imagePath){
    const img = globalP5.loadImage(imagePath)
    this.Images[name] = img
    
  }
  
  /**
   * Retrieves an image by its name.
   * @param {string} name - The name of the image to retrieve.
   * @returns {any} The image corresponding to the given name.
   */
  getImage(name){
    return this.Images[name];
  }
}

class ScriptSystem{
  /**
   * Represents a constructor function.
   * @constructor
   * @param {p5} p5Var - The p5 instance.
   * @param {GameEngine} gameEngine - The game engine instance.
   */
  constructor(p5Var, gameEngine){
    this.Scripts = {};

    this.p5Var = p5Var;
    this.gameEngine = gameEngine;
  }
  
  /**
   * Loads a script dynamically and stores it in the Scripts object.
   * @param {string} scriptName - The name of the script.
   * @param {string} scriptPath - The path to the script.
   * @returns {Promise} - A promise that resolves when the script is loaded.
   */
  async loadScript(scriptName, scriptPath){
    this.Scripts[scriptName] = await import(scriptPath);

  }
  
  /**
   * Retrieves a script by its name.
   * @param {string} scriptName - The name of the script to retrieve.
   * @returns {class} - The script class corresponding to the given name.
   */
  getScript(scriptName){
    return this.Scripts[scriptName];
  }

}

class Particle{
  /**
   * Represents a particle object.
   * @constructor
   * @param {number} lifeSpan - The lifespan of the particle.
   * @param {string} color - The color of the particle.
   * @param {number} [opacity=1] - The opacity of the particle.
   * @param {boolean} [shouldFade=true] - Whether the particle should fade over time.
   * @param {string} [shape="circle"] - The shape of the particle.
   * @param {p5.Vector} [sizeRange=globalP5.createVector(1, 5)] - The range of sizes for the particle.
   * @param {boolean} [hasGravity=false] - Whether the particle is affected by gravity.
   * @param {number} [gravityScale=0.6] - The scale of gravity for the particle.
   * @param {boolean} [hasWind=false] - Whether the particle is affected by wind.
   * @param {number} [windScale=0.02] - The scale of wind for the particle.
   * @param {p5.Vector} [windDirection=globalP5.createVector(1,0)] - The direction of the wind for the particle.
   * @param {boolean} [glow=false] - Whether the particle has a glow effect.
   */
   constructor(lifeSpan, color, opacity=1, shouldFade=true, shape="circle", sizeRange=globalP5.createVector(1, 5), hasGravity=false, gravityScale=0.6, hasWind=false, windScale=0.02, windDirection=globalP5.createVector(1,0), glow=false){
    this.velocity = globalP5.createVector(0,0);
    this.lifeSpan = lifeSpan;
    this.color = color;
    this.opacity = opacity;
    this.shouldFade = shouldFade;
    this.glow = glow;

    this.shape = shape;
    this.size = globalP5.random(sizeRange.x, sizeRange.y);
    this.hasGravity = hasGravity;
    this.gravityScale = gravityScale;
    this.hasWind = hasWind;
    this.windScale = windScale;
    this.windDirection = windDirection;

    this.timeAlive = 0;
   }

  /**
   * Spawns a new object at the specified position.
   * @param {p5.Vector} position - The position of the object.
   * @param {p5.Vector} [size=null] - The size of the object.
   * @param {p5.Vector} [vel=null] - The velocity of the object.
   */
   spawn(position, size=null, vel=null){
    if (size !== null) this.size = size;
    if (vel !== null) this.velocity = vel;

    this.position = position;
   }



  /**
   * Draws the particle on the p5js canvas.
   */
   draw(){
    globalP5.push();
    globalP5.fill(this.color, this.opacity * 255);
    globalP5.noStroke();
    globalP5.translate(this.position.x, this.position.y);

    if (this.glow){
      globalP5.drawingContext.shadowBlur = 20;
      globalP5.drawingContext.shadowColor = globalP5.color(this.color);
    }

    if (this.shape === "circle"){
      globalP5.circle(0, 0, this.size);
      
    }

    else if (this.shape === "rect"){
      globalP5.rect(0, 0, this.size, this.size);
    }

    globalP5.pop();
   }

 

  /**
   * Updates the physics of the object.
   * If the object has gravity, it applies the gravity force.
   * If the object has wind, it applies the wind force.
   * Finally, it updates the position of the object based on its velocity.
   */
  physics(){
    if (this.hasGravity){
      this.velocity.add(globalP5.createVector(0, this.gravityScale))
    }

    if (this.hasWind){
      this.velocity.add(this.windDirection.copy().mult(this.windScale))
    }

    this.position.add(this.velocity);
  }  

  /**
   * Updates the object's properties and behavior.
   */
  update(){
    if (this.shouldFade){
      this.opacity = globalP5.map(this.timeAlive, 0, this.lifeSpan * 1000, 1, 0);
    }
    this.physics();
    this.draw()
  }
}

class ParticleEmitter{
  /**
   * Represents a particle emitter.
   * @constructor
   * @param {ParticleSystem} particleSystem - The particle system to which the emitter belongs.
   * @param {p5.Vector} xVelRange - The range of x-axis velocity for the particles.
   * @param {p5.Vector} yVelRange - The range of y-axis velocity for the particles.
   * @param {string} particleName - The name of the particle.
   * @param {p5.Vector} pos - The position of the emitter.
   * @param {number} radius - The radius of the emitter.
   * @param {number} spawnRate - The rate at which particles are spawned.
   * @param {p5.Vector} densityRange - The range of particle density.
   * @param {number} [triggerDelay=0] - The delay before the emitter starts emitting particles.
   * @param {number} [emmiterLifeSpan=1] - The lifespan of the emitter.
   * @param {string} [trigger="OnLoop"] - The trigger event for emitting particles.
   * @param {object} [followObject=null] - The object to follow for emitting particles.
   * @param {p5.Vector} [followObjectOffset=p5.Vector(0,0)] - The offset from the follow object's position.
   */
  constructor(particleSystem, xVelRange, yVelRange, particleName, pos, radius, spawnRate, densityRange, triggerDelay=0, emmiterLifeSpan=1, trigger="OnLoop", followObject=null, followObjectOffset=globalP5.createVector(0,0)){
    this.particleSystem = particleSystem;
    this.particleName = particleName;

    this.particleInstances = [];

    this.pos = pos;
    this.radius = radius;
    this.spawnRate = spawnRate;
    this.densityRange = densityRange;
    this.triggerDelay = triggerDelay;
    this.emmiterLifeSpan = emmiterLifeSpan;
    this.trigger = trigger;
    this.followObject = followObject;
    this.followObjectOffset = followObjectOffset;

    this.xVelRange = xVelRange;
    this.yVelRange = yVelRange;

    this.timeAlive = 0;
    this.timeSinceLastUpdate = 60 * this.spawnRate;
  }

  /**
   * Spawns particles based on the given parameters.
   */
  spawnParticles(){
    for (let i = 0; i < Math.round(this.radius / this.particleSystem.particles[this.particleName].sizeRange.y * globalP5.random(this.densityRange.x, this.densityRange.y)); i++){
      let position = this.pos.copy()

      if(this.followObject !== null){
        position = this.followObject.transform.Position.copy().add(this.followObjectOffset);
      }

      let particle = new Particle(this.particleSystem.particles[this.particleName].lifeSpan, this.particleSystem.particles[this.particleName].color, this.particleSystem.particles[this.particleName].opacity, this.particleSystem.particles[this.particleName].shouldFade, this.particleSystem.particles[this.particleName].shape, this.particleSystem.particles[this.particleName].sizeRange, this.particleSystem.particles[this.particleName].hasGravity, this.particleSystem.particles[this.particleName].gravityScale, this.particleSystem.particles[this.particleName].hasWind, this.particleSystem.particles[this.particleName].windScale, this.particleSystem.particles[this.particleName].windDirection, this.particleSystem.particles[this.particleName].glow);
      particle.spawn(position.add(globalP5.createVector(globalP5.random(-this.radius, this.radius), globalP5.random(-this.radius, this.radius))), null, globalP5.createVector(globalP5.random(this.xVelRange.x, this.xVelRange.y), globalP5.random(this.yVelRange.x, this.yVelRange.y)));
      particle.timeAlive = 0;
      this.particleInstances.push(particle);
      
    }
  }

  /**
   * Updates the particle system.
   * @param {boolean} shouldSpawn - Determines if particles should be spawned.
   */
  update(shouldSpawn=true){
    
    this.timeSinceLastUpdate += globalP5.deltaTime;
    this.timeAlive += globalP5.deltaTime;

    if (this.timeAlive >= this.triggerDelay * 1000){
      if (this.timeSinceLastUpdate >= 60 / this.spawnRate && shouldSpawn){
        this.timeSinceLastUpdate = 0;
        this.spawnParticles();
      }
  
      
    }

    for(let i = this.particleInstances.length - 1; i >= 0; i--){
      if(this.particleInstances[i].timeAlive >= this.particleInstances[i].lifeSpan * 1000){
        this.particleInstances.splice(i, 1);
       
      }

      else{

        this.particleInstances[i].update();
        this.particleInstances[i].timeAlive += globalP5.deltaTime;


      }
    }

  }
}

class ParticleSystem{
  /**
   * Represents a constructor for a class.
   * @constructor
   */
  constructor(){
    this.particles = {};
    this.ParticleEmitters = {};
    this.emitterInstances = [];
  }

  /**
   * Creates a new particle with the specified properties.
   * @param {string} name - The name of the particle.
   * @param {number} lifeSpan - The lifespan of the particle in frames.
   * @param {string} color - The color of the particle.
   * @param {number} [opacity=1] - The opacity of the particle (optional, default is 1).
   * @param {boolean} [shouldFade=true] - Indicates whether the particle should fade over time (optional, default is true).
   * @param {string} [shape="circle"] - The shape of the particle (optional, default is "circle").
   * @param {p5.Vector} [sizeRange=globalP5.createVector(1, 5)] - The range of sizes for the particle (optional, default is a vector with values 1 and 5).
   * @param {boolean} [hasGravity=false] - Indicates whether the particle is affected by gravity (optional, default is false).
   * @param {number} [gravityScale=0.6] - The scale of gravity for the particle (optional, default is 0.6).
   * @param {boolean} [hasWind=false] - Indicates whether the particle is affected by wind (optional, default is false).
   * @param {number} [windScale=0.02] - The scale of wind for the particle (optional, default is 0.02).
   * @param {p5.Vector} [windDirection=globalP5.createVector(1, 0)] - The direction of the wind for the particle (optional, default is a vector with values 1 and 0).
   * @param {boolean} [glow=false] - Indicates whether the particle should have a glow effect (optional, default is false).
   */
  createNewParticle({
    name,
    lifeSpan,
    color,
    opacity = 1,
    shouldFade = true,
    shape = "circle",
    sizeRange = globalP5.createVector(1, 5),
    hasGravity = false,
    gravityScale = 0.6,
    hasWind = false,
    windScale = 0.02,
    windDirection = globalP5.createVector(1, 0),
    glow = false
  }) {
    this.particles[name] = { lifeSpan, color, opacity, shouldFade, shape, sizeRange, hasGravity, gravityScale, hasWind, windScale, windDirection, glow};
  }

  
  /**
   * Creates a new particle emitter.
   * @param {Object} options - The options for the particle emitter.
   * @param {string} options.name - The name of the particle emitter.
   * @param {string} options.particleName - The name of the particle.
   * @param {number} options.radius - The radius of the particle emitter.
   * @param {number} options.spawnRate - The spawn rate of the particles.
   * @param {p5.Vector} options.densityRange - The range of particle density.
   * @param {number} [options.triggerDelay=0] - The delay before triggering the emitter.
   * @param {number} [options.emitterLifeSpan=1] - The lifespan of the emitter.
   * @param {string} [options.trigger="OnLoop"] - The trigger for the emitter.
   * @param {Object} [options.followObject=null] - The object to follow.
   * @param {p5.Vector} [options.followObjectOffset=p5.Vector(0, 0)] - The offset from the follow object.
   * @param {p5.Vector} [options.xVelRange=p5.Vector(-1, 1)] - The range of x velocity.
   * @param {p5.Vector} [options.yVelRange=p5.Vector(-1, 1)] - The range of y velocity.
   */
  createNewParticleEmitter({
    name,
    particleName,
    radius,
    spawnRate,
    densityRange,
    triggerDelay = 0,
    emitterLifeSpan = 1,
    trigger = "OnLoop",
    followObject = null,
    followObjectOffset = globalP5.createVector(0, 0),
    xVelRange = globalP5.createVector(-1, 1),
    yVelRange = globalP5.createVector(-1, 1)
  }) {
    this.ParticleEmitters[name] = {particleName, radius, spawnRate, densityRange, triggerDelay, emitterLifeSpan, trigger, followObject, xVelRange, yVelRange, followObjectOffset};
  }
  

  /**
   * Updates the emitter instances and particles.
   */
  update(){
    for (let i = this.emitterInstances.length - 1; i >= 0; i--){
  
      if(this.emitterInstances[i].timeAlive - this.emitterInstances[i].triggerDelay * 1000 >= this.emitterInstances[i].emmiterLifeSpan * 1000){
        if (this.particles[this.emitterInstances[i].particleName].timeAlive >= this.particles[this.emitterInstances[i].particleName].lifeSpan * 1000){
          this.emitterInstances.splice(i, 1);
        }

        else{
          this.emitterInstances[i].update(false);
        }
          
      }

      else{
        this.emitterInstances[i].update();
      }
      
    


    }
  }

  /**
   * Spawns a particle emitter at the specified position.
   * @param {string} emitterName - The name of the particle emitter.
   * @param {p5.Vector} [pos=globalP5.createVector(0,0)] - The position of the emitter.
   */
  spawnEmitter(emitterName, pos=globalP5.createVector(0,0)){
    pos = pos.copy();
    let emmiter = new ParticleEmitter(this, this.ParticleEmitters[emitterName].xVelRange, this.ParticleEmitters[emitterName].yVelRange, this.ParticleEmitters[emitterName].particleName, pos, this.ParticleEmitters[emitterName].radius, this.ParticleEmitters[emitterName].spawnRate, this.ParticleEmitters[emitterName].densityRange, this.ParticleEmitters[emitterName].triggerDelay, this.ParticleEmitters[emitterName].emitterLifeSpan, this.ParticleEmitters[emitterName].trigger, this.ParticleEmitters[emitterName].followObject, this.ParticleEmitters[emitterName].followObjectOffset);

    this.emitterInstances.push(emmiter);
  }
}





class GameEngine {
  /**
   * Creates a new instance of the class.
   * @param {string} gameStateScriptPath - The path to the game state script.
   */
  constructor(gameStateScriptPath){
    this.inputSystem = new InputSystem();
    this.scriptSystem = new ScriptSystem(globalP5, this);
    this.particleSystem = new ParticleSystem();
    this.imageSystem = new ImageSystem();

    this.gameStateScript = null;

    this.loadGameStateScript(gameStateScriptPath).then((script) => {
      this.gameStateScript = script;
      this.gameStateScript.Preload();
    });
  }

  

  /**
   * Initializes the game setup.
   * 
   * @param {number} [fps=60] - The desired frames per second.
   * @param {boolean} [resizeToFit=false] - Whether to resize the canvas to fit the window.
   * @param {number} [screenWidth=400] - The width of the game screen.
   * @param {number} [screenHeight=400] - The height of the game screen.
   */
  Setup(fps=60, resizeToFit=false, screenWidth=400, screenHeight=400){
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    if(resizeToFit){
      globalP5.createCanvas(globalP5.windowWidth, globalP5.windowHeight);
      this.screenWidth = globalP5.windowWidth;
      this.screenHeight = globalP5.windowHeight;
    }

    else{
      globalP5.createCanvas(screenWidth, screenHeight);
    }
    
    
    this.currentLevel = null;
    this.currentLevelObjects = null;
    this.currentLevelScript = null;
    
    this.gameStateStarted = false;

    this.resizeToFit = resizeToFit;

    this.rays = [];
    this.toDebug = [];

    this.cull = false;
    this.culledObjects = [];
      
    this.gameObjects = {};
    this.playerObjects = [];
    this.debug = false;
    this.rayDebug = true;
    this.FPS = fps;
    globalP5.frameRate(this.FPS)
      
    this.backgroundImage = null;
    this.backgroundSize = null;
    this.backgroundScrollSpeed = 0;
    this.currentBackgroundScroll = 0;
    
    globalP5.imageMode(globalP5.CENTER);
    globalP5.rectMode(globalP5.CORNER);

    globalP5.angleMode(globalP5.DEGREES);

    

    this.mainCamera = null;
    this.cameras = {};

    

    globalP5.windowResized = function(){
      if (!this.resizeToFit) return;
      globalP5.resizeCanvas(globalP5.windowWidth, globalP5.windowHeight);
      this.screenWidth = globalP5.windowWidth;
      this.screenHeight = globalP5.windowHeight;

    }
    

    


    waitForCondition(() => {return this.gameStateScript !== null}).then(() => {
      this.gameStateScript.Setup();
    });
    

  }
  
  /**
   * Sets the width of the canvas.
   * @param {number} width - The new width of the canvas.
   */
  setCanvasWidth(width){
    this.screenWidth = width;
    globalP5.resizeCanvas(this.screenWidth, this.screenHeight);
  }

  /**
   * Sets the height of the canvas.
   * @param {number} height - The new height of the canvas.
   */
  setCanvasHeight(height){
    this.screenHeight = height;
    globalP5.resizeCanvas(this.screenWidth, this.screenHeight);
  }
  
  /**
   * Adds a camera to the sketch.
   * @param {string} cameraName - The name of the camera.
   * @param {GameObject} object - The object to be tracked by the camera.
   * @param {p5.Vector} [cameraOffset=globalP5.createVector(0,0)] - The offset of the camera from the tracked object.
   */
  addCamera(cameraName, object, cameraOffset=globalP5.createVector(0,0)){
    const camera = new Camera(object, this.screenWidth, this.screenHeight, cameraOffset);
    this.cameras[cameraName] = camera;
    this.mainCamera = camera;
  }

  /**
   * Broadcasts an event with the given name and data.
   * @param {string} eventName - The name of the event.
   * @param {any} data - The data to be passed along with the event.
   */
  broadCastEvent(eventName, data){
    const newEvent = new CustomEvent(eventName, { detail: data });

    window.dispatchEvent(newEvent);
  }

  /**
   * Registers an event listener for the specified event name.
   * 
   * @param {string} eventName - The name of the event to listen for.
   * @param {function} func - The callback function to be executed when the event is triggered.
   */
  onEvent(eventName, func){
    window.addEventListener(eventName, event => {
        func(event.detail); 
        
    });
  }


  /**
   * Loads a level and initializes its script.
   * @param {string} levelName - The name of the level to load.
   * @param {string} levelManagerScriptName - The name of the script that manages the level.
   */
  loadLevel(levelName, levelManagerScriptName){
    this.backgroundImage = null;
    this.backgroundSize = null;

    
    
    globalP5.loadJSON("./gameData.json", (data) => {
      let levelData = data.gameData.levels[levelName];
    

      this.currentLevel = levelName;
      this.currentLevelObjects = {};
      this.cull = false;

      
      if (levelData !== undefined){
        if (levelData.shouldResize === false && levelData.shouldResize !== undefined && levelData.shouldResize !== null){
          
          this.resizeToFit = false;
          this.setCanvasWidth(levelData.backgroundX);
          this.setCanvasHeight(levelData.backgroundY);
        }
        
        else{
          this.setCanvasWidth(globalP5.windowWidth);
          this.setCanvasHeight(globalP5.windowHeight);
          this.resizeToFit = true;
        }

        
        const gameObjectsJson = levelData.gameObjects;
        
        const gameObjects = [];
        for (const object of gameObjectsJson){
          gameObjects.push(GameObject.deserialize(this, object));
        }
        this.addObjectsToLevel(levelName, gameObjects);

        

        if (levelData.levelManagerScriptName !== "" && levelData.levelManagerScriptName !== undefined && levelData.levelManagerScriptName !== null){
          levelManagerScriptName = levelData.levelManagerScriptName
        }
      }


      if (this.currentLevelScript !== null){
        try{
          this.currentLevelScript.End();
        }
        catch (err){
          console.log(err);
        }
        
      }
  
      
  
      const script = this.scriptSystem.getScript(levelManagerScriptName);
      const scriptInstance = new script.default(globalP5, this, levelName);
      this.currentLevelScript = scriptInstance;
      
      this.currentLevelScript.Start();
    });
  }

  saveCurrentLevel(){
    globalP5.loadJSON("./gameData.json", (data) => {
      if (data.gameData.levels[this.currentLevel] === undefined){
        data.gameData.levels[this.currentLevel] = {};
      }

      data.gameData.levels[this.currentLevel].gameObjects = Object.values(this.currentLevelObjects).map(object => object.serialize());
      globalP5.saveJSON(data, "gameData.json");
    });
  }

  /**
   * Adds objects to a specific level.
   * @param {string} levelName - The name of the level.
   * @param {Array} objects - An array of objects to be added.
   */
  addObjectsToLevel(levelName, objects){
    for (const object of objects){
      if (this.currentLevel = levelName){
        this.currentLevelObjects[object.name] = object;
      }
    }
    
  }

  /**
   * Adds a camera to the specified level.
   * @param {string} levelName - The name of the level.
   * @param {string} cameraName - The name of the camera.
   */
  addCameraToLevel(levelName, cameraName){
    if (cameraName === null){
      this.mainCamera = null;
    }

    else{
      if (this.currentLevel = levelName){
        this.mainCamera = this.cameras[cameraName];
      }
    }
    
  }


  /**
   * Loads a game state script asynchronously.
   * @param {string} scriptPath - The path to the script file.
   * @returns {Promise} A promise that resolves with the loaded script instance.
   */
  async loadGameStateScript(scriptPath) {
    return new Promise((resolve, reject) => {
        import(scriptPath)
            .then(script => {
                const scriptInstance = new script.default(globalP5, this);
                resolve(scriptInstance);
            })
            .catch(error => {
                reject(error);
            });
    });
  }

  
  
  
  /**
   * Detects collision between two colliders.
   * @param {Collider} collider1 - The first collider.
   * @param {Collider} collider2 - The second collider.
   */
  detectCollision(collider1, collider2){
      if(collider1.gameObject === collider2.gameObject){
         return; 
      }
      
    
      if (collider1.colliderType === "circle" && collider2.colliderType === "circle"){

        let continuousCheckCircle1;
        if (collider1.gameObject.rigidBody !== null && collider1.isContinuous){
          continuousCheckCircle1 = this.intersectSphere(p5.Vector.add(collider1.transform.Position, p5.Vector.normalize((collider2.transform.Position.copy().sub(collider1.transform.Position))).mult(collider1.colliderRadius)), collider1.gameObject.rigidBody.Velocity, collider2.transform.Position, collider2.colliderRadius)
        }

        let continuousCheckCircle2;
        if (collider2.gameObject.rigidBody !== null && collider2.isContinuous){
          continuousCheckCircle2 = this.intersectSphere(p5.Vector.add(collider2.transform.Position, p5.Vector.normalize((collider1.transform.Position.copy().sub(collider2.transform.Position))).mult(collider2.colliderRadius)), collider2.gameObject.rigidBody.Velocity, collider1.transform.Position, collider1.colliderRadius)
        }



        const minDistance = collider1.colliderRadius + collider2.colliderRadius;
        const distanceBetweenCenters = globalP5.dist(
                collider1.transform.Position.x,
                collider1.transform.Position.y,
                collider2.transform.Position.x,
                collider2.transform.Position.y
              );
        
        

        if (distanceBetweenCenters <= minDistance || continuousCheckCircle1 || continuousCheckCircle2){
          collider1.gameObject.collidingWith.push(collider2)
          collider2.gameObject.collidingWith.push(collider1)
          collider1.collidingWith.push(collider2)
          collider2.collidingWith.push(collider1)  
            if (collider1.isTrigger === false && collider2.isTrigger === false){
                const collisionNormal = p5.Vector.sub(collider1.transform.Position.copy(), collider2.transform.Position.copy()).normalize();
                this.resolveCircleToCircleCollision(collider1.gameObject.rigidBody, collider2.gameObject.rigidBody, collisionNormal, distanceBetweenCenters, minDistance);
                 
                
              
                
                }
            }
        
      }
    
      else if (collider1.colliderType === "circle" && collider2.colliderType === "rect"){

          let nearestX = globalP5.constrain(collider1.transform.Position.x, collider2.transform.Position.x, collider2.bottomRight.x)
          let nearestY = globalP5.constrain(collider1.transform.Position.y, collider2.transform.Position.y, collider2.bottomRight.y)
          let closestPoint = globalP5.createVector(nearestX, nearestY)

          
          let continuousCheckRect;
          let continuousCheckCircle;
          
          
          

          

          if (collider1.gameObject.rigidBody !== null && collider1.isContinuous){
            let direction = globalP5.createVector(closestPoint.x - collider1.transform.Position.x ,  closestPoint.y - collider1.transform.Position.y).normalize();
            let closestPointOnCircle = collider1.transform.Position.copy().add(direction.mult(collider1.colliderRadius));

            continuousCheckRect = this.intersectRect(closestPointOnCircle, collider1.gameObject.rigidBody.Velocity, collider2.transform.Position, collider2.transform.Position.copy().add(collider2.colliderSize))
          }
          
          
          if (collider2.gameObject.rigidBody !== null && collider2.isContinuous){
            continuousCheckCircle = this.intersectSphere(closestPoint, collider2.gameObject.rigidBody.Velocity, collider1.transform.Position, collider1.colliderRadius)
          }
          
          const distance = p5.Vector.sub(collider1.transform.Position.copy(), closestPoint.copy())
          
          
          const collisionNormal = distance.copy().normalize()
          
          if (collider1.colliderRadius >= distance.mag() || continuousCheckCircle || continuousCheckRect){
              const overlap = collider1.colliderRadius - distance.mag();
              
              collider1.gameObject.collidingWith.push(collider2)
              collider2.gameObject.collidingWith.push(collider1)
              collider1.collidingWith.push(collider2)
              collider2.collidingWith.push(collider1)  
              
            if (collider1.isTrigger === false && collider2.isTrigger === false){
              this.resolveOtherCollision(collider1.gameObject.rigidBody, collider2.gameObject.rigidBody, collisionNormal, overlap)
            }
              
              }
          
          
          
          }
    
      else if (collider1.colliderType === "rect" && collider2.colliderType === "circle"){

          let nearestX = globalP5.constrain(collider2.transform.Position.x, collider1.transform.Position.x, collider1.bottomRight.x)
          let nearestY = globalP5.constrain(collider2.transform.Position.y, collider1.transform.Position.y, collider1.bottomRight.y)
          let closestPoint = globalP5.createVector(nearestX, nearestY)

          let continuousCheckRect;
          let continuousCheckCircle;

       
        

          if (collider2.gameObject.rigidBody !== null && collider2.isContinuous){
            let direction = globalP5.createVector(closestPoint.x - collider2.transform.Position.x, closestPoint.y - collider2.transform.Position.y ).normalize();
            let closestPointOnCircle = collider2.transform.Position.copy().add(direction.mult(collider2.colliderRadius));

            continuousCheckRect = this.intersectRect(closestPointOnCircle, collider2.gameObject.rigidBody.Velocity, collider1.transform.Position, collider1.transform.Position.copy().add(collider1.colliderSize))
            
          }

          if (collider1.gameObject.rigidBody !== null && collider1.isContinuous){
            continuousCheckCircle = this.intersectSphere(closestPoint, collider1.gameObject.rigidBody.Velocity, collider2.transform.Position, collider2.colliderRadius)
          }
          
          const distance = p5.Vector.sub(collider2.transform.Position.copy(), closestPoint.copy())
          
          
          const collisionNormal = distance.copy().normalize()
          
    
          if (collider2.colliderRadius >= distance.mag() || continuousCheckCircle || continuousCheckRect){
              
              

              const overlap = collider2.colliderRadius - distance.mag();
              

              collider1.gameObject.collidingWith.push(collider2)
              collider2.gameObject.collidingWith.push(collider1)
              collider1.collidingWith.push(collider2)
              collider2.collidingWith.push(collider1)  

              
            
              if (collider1.isTrigger === false && collider2.isTrigger === false){
                this.resolveOtherCollision(collider2.gameObject.rigidBody, collider1.gameObject.rigidBody, collisionNormal, overlap)
              }
              
              
              }
          
          
          
          
        }
    
      else{
        let continuousCheckRect1;
        let continuousCheckRect2;
        
        let closestX1 = globalP5.constrain(collider2.transform.Position.x + collider2.colliderSize.x / 2, collider1.transform.Position.x, collider1.transform.Position.x + collider1.colliderSize.x);
        let closestY1 = globalP5.constrain(collider2.transform.Position.y + collider2.colliderSize.y / 2, collider1.transform.Position.y, collider1.transform.Position.y + collider1.colliderSize.y);
        
        let closestX2 = globalP5.constrain(collider1.transform.Position.x + collider1.colliderSize.x / 2, collider2.transform.Position.x, collider2.transform.Position.x + collider2.colliderSize.x);
        let closestY2 = globalP5.constrain(collider1.transform.Position.y + collider1.colliderSize.y / 2, collider2.transform.Position.y, collider2.transform.Position.y + collider2.colliderSize.y);
       
       
        if (collider1.gameObject.rigidBody !== null && collider1.isContinuous){
          continuousCheckRect1 = this.intersectRect(globalP5.createVector(closestX1, closestY1), collider1.gameObject.rigidBody.Velocity, collider2.transform.Position, collider2.transform.Position.copy().add(collider2.colliderSize))
        }

        if (collider2.gameObject.rigidBody !== null && collider2.isContinuous){
          continuousCheckRect2 = this.intersectRect(globalP5.createVector(closestX2, closestY2), collider2.gameObject.rigidBody.Velocity, collider1.transform.Position, collider1.transform.Position.copy().add(collider1.colliderSize))

        }

        //AABB Collision Detection
       if (
          collider1.transform.Position.x < collider2.transform.Position.x + collider2.colliderSize.x &&
          collider1.transform.Position.x + collider1.colliderSize.x > collider2.transform.Position.x &&
          collider1.transform.Position.y < collider2.transform.Position.y + collider2.colliderSize.y &&
          collider1.transform.Position.y + collider1.colliderSize.y > collider2.transform.Position.y 
          || continuousCheckRect1 || continuousCheckRect2
        ) {

        const overlapX = globalP5.min(collider1.transform.Position.x + collider1.colliderSize.x, collider2.transform.Position.x + collider2.colliderSize.x) - globalP5.max(collider1.transform.Position.x, collider2.transform.Position.x);

        const overlapY =globalP5. min(collider1.transform.Position.y + collider1.colliderSize.y,collider2.transform.Position.y + collider2.colliderSize.y) - globalP5.max(collider1.transform.Position.y, collider2.transform.Position.y);

        let collisionNormal = globalP5.createVector(0, 0);
        let overlap = 0

        
        if (overlapX < overlapY) {
          // X-axis collision
          collisionNormal.x = (collider1.transform.Position.x < collider2.transform.Position.x) ? 1 : -1;
          overlap = overlapX;
        } else {
          // Y-axis collision
          collisionNormal.y = (collider1.transform.Position.y < collider2.transform.Position.y) ? 1 : -1;
          overlap = overlapY;
        }

        collider1.gameObject.collidingWith.push(collider2)
        collider2.gameObject.collidingWith.push(collider1)
        collider1.collidingWith.push(collider2)
        collider2.collidingWith.push(collider1) 

        if (collider1.isTrigger === false && collider2.isTrigger === false){
          this.resolveOtherCollision(collider2.gameObject.rigidBody, collider1.gameObject.rigidBody, collisionNormal, overlap);
        }
        
            
        }
      }
    
  }


  /**
   * Checks if a ray intersects with a rectangle defined by minimum and maximum bounds.
   *
   * @param {p5.Vector} startPoint - The starting point of the ray.
   * @param {p5.Vector} dir - The direction of the ray.
   * @param {p5.Vector} minBounds - The minimum bounds of the rectangle.
   * @param {p5.Vector} maxBounds - The maximum bounds of the rectangle.
   * @returns {boolean} Returns true if the ray intersects with the rectangle, otherwise false.
   */
  intersectRect(startPoint, dir, minBounds, maxBounds) {
    // code pulled from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection.html 
    // Code Translated from c# and commented by chat-gpt 3.5 (slightly adapted by me)
    // chat gpt code stats here:

    // Check if the direction magnitude is zero
    if (dir.mag() === 0) {
        // Handle or skip the intersection calculation for zero magnitude
        return false;
    }

    // Calculate intersection with AABB
    let framesToView = 2;
    let endPoint = startPoint.copy().add(dir.copy().mult(framesToView));

    this.rays.push([startPoint, endPoint]);

    let tmin = (minBounds.x - startPoint.x) / dir.x;
    let tmax = (maxBounds.x - startPoint.x) / dir.x;

    if (tmin > tmax) {
        let temp = tmin;
        tmin = tmax;
        tmax = temp;
    }

    let tymin = (minBounds.y - startPoint.y) / dir.y;
    let tymax = (maxBounds.y - startPoint.y) / dir.y;

    if (tymin > tymax) {
        let temp = tymin;
        tymin = tymax;
        tymax = temp;
    }

    if ((tmin > tymax) || (tymin > tmax)) {
        return false;
    }

    tmin = globalP5.max(tmin, tymin);
    tmax = globalP5.min(tmax, tymax);

    if (tmax < 0) {
        return false;
    }

    // Check if intersection point is within the bounds of the segment
    let hitX = startPoint.x + tmin * dir.x;
    let hitY = startPoint.y + tmin * dir.y;

   

    if (
        hitX < globalP5.min(startPoint.x, endPoint.x) ||
        hitX > globalP5.max(startPoint.x, endPoint.x) ||
        hitY < globalP5.min(startPoint.y, endPoint.y) ||
        hitY > globalP5.max(startPoint.y, endPoint.y)
    ) {
        return false;
    }

    // If all checks pass, return true
    return true;
  

    // chatgpt code ends here
}




  /**
   * Calculates if a ray intersects with a sphere.
   * 
   * @param {p5.Vector} orig - The starting point of the ray.
   * @param {p5.Vector} dir - The direction of the ray.
   * @param {p5.Vector} center - The center point of the sphere.
   * @param {number} radius - The radius of the sphere.
   * @returns {boolean} - True if the ray intersects with the sphere, false otherwise.
   */
  intersectSphere(orig, dir, center, radius) {
    // https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
    // Code Translated from c# and commented by chat-gpt 3.5 (slightly adapted by me)
    // chat gpt code stats here:

    let framesToView = 2;
    let E, L, C, r;
    // Set the starting point of the ray (E)
    E = orig;

    // Set the end point of the ray (L)
 
    L = p5.Vector.add(orig, (p5.Vector.mult(dir, framesToView)));
 
    
    // Set the center of the sphere (C)
    C = center;
    // Set the radius of the sphere (r)
    r = radius;

    

    this.rays.push([E,L])
    
    
    // Compute direction vector of the ray (d)
    let d = p5.Vector.sub(L, E);
    // Compute vector from center sphere to ray start (f)
    let f = p5.Vector.sub(E, C);

    
    
   

    // Solve the quadratic equation for t
    let a = d.dot(d);
    let b = 2 * f.dot(d);
    let c = f.dot(f) - r * r;
    let discriminant = b * b - 4 * a * c;
    
    if (discriminant >= 0 && b !== 0) {
      // Calculate solutions for t
      let t1 = (-b - globalP5.sqrt(discriminant)) / (2 * a);
      let t2 = (-b + globalP5.sqrt(discriminant)) / (2 * a);
      

      

      // Calculate intersection points
      let intersection1 = p5.Vector.add(E, p5.Vector.mult(d, t1));
      let intersection2 = p5.Vector.add(E, p5.Vector.mult(d, t2));
      


    
    if (globalP5.min(t1, t2) >= 0 && globalP5.min(t1, t2) <= 1){
      return true;
    }
    
    }

    return false;

    // chatgpt code ends here
  }

  
  /**
   * Checks for collision between a circle and other game objects.
   * @param {number} radius - The radius of the circle.
   * @param {p5.Vector} position - The position of the circle.
   * @param {Array} gameObjectValues - An array of game objects to check collision against.
   * @returns {Array} - An array of game objects colliding with the circle.
   */
  circleCheck(radius, position, gameObjectValues){
    let physCheckObject = new GameObject(this, position, "circleCheckObject")
    physCheckObject.addCircleCollider(radius, true, false, globalP5.createVector(0,0))
    
    this.toDebug.push({"radius":radius, "position":position})

    let circleCheckCollider = physCheckObject.colliders[0];
    circleCheckCollider.collidingWith = []



    const objects = gameObjectValues;
      for (let i = 0; i < objects.length - 1; i++) {
        for (const collider of objects[i].colliders){
            this.detectCollision(circleCheckCollider, collider)
          }
  
    }

    const collidingWith = circleCheckCollider.collidingWith;
  
    physCheckObject.delete()
  
    return collidingWith
  }

  
  /**
   * Resolves collision between two circle rigid bodies.
   * @param {RigidBody} rigidBody1 - The first circle rigid body.
   * @param {RigidBody} rigidBody2 - The second circle rigid body.
   * @param {p5.Vector} collisionNormal - The collision normal vector.
   * @param {number} distanceBetweenCenters - The distance between the centers of the circles.
   * @param {number} minDistance - The minimum distance between the circles for them to be considered colliding.
   */
  resolveCircleToCircleCollision(rigidBody1, rigidBody2, collisionNormal, distanceBetweenCenters, minDistance){
    // Calculate relative velocity
      const coefficientOfRestitution = Math.min(rigidBody1.bounce, rigidBody2.bounce);
      const e = coefficientOfRestitution;
    
      
      
      const impulseDirection = collisionNormal.normalize();
      
      
      
      const RelativeVelocity = p5.Vector.sub(rigidBody1.Velocity, rigidBody2.Velocity);
      
      const impulseMagnitude = (-(1 + e) * p5.Vector.dot(RelativeVelocity, impulseDirection.copy())) / (rigidBody1.inverseMass + rigidBody2.inverseMass);
      
      
    
      const MassToMassRatio = rigidBody2.mass / rigidBody1.mass;

      const moveRatioRigidbody1 = MassToMassRatio / (1 + MassToMassRatio);
      const moveRatioRigidbody2 = 1 / (1 + MassToMassRatio);

    
      rigidBody1.gameObject.transform.Position.add(impulseDirection.copy().normalize().mult((minDistance - distanceBetweenCenters) * moveRatioRigidbody1 )); 
      rigidBody2.gameObject.transform.Position.sub(impulseDirection.copy().normalize().mult((minDistance - distanceBetweenCenters) * moveRatioRigidbody2) );
      
    
      rigidBody1.addForce(impulseDirection.copy(), impulseMagnitude);
      rigidBody2.addForce(impulseDirection.copy(), -impulseMagnitude);
  }
  
  /**
   * Resolves collision between two rigid bodies.
   * @param {RigidBody} rigidBody1 - The first rigid body involved in the collision.
   * @param {RigidBody} rigidBody2 - The second rigid body involved in the collision.
   * @param {p5.Vector} collisionNormal - The collision normal vector.
   * @param {number} overlap - The amount of overlap between the two rigid bodies.
   */
  resolveOtherCollision(rigidBody1, rigidBody2, collisionNormal, overlap){
    // Calculate relative velocity
      const coefficientOfRestitution = Math.min(rigidBody1.bounce, rigidBody2.bounce);
      const e = coefficientOfRestitution;
      
      
      
      const impulseDirection = collisionNormal.normalize();
      
      
      
      const RelativeVelocity = p5.Vector.sub(rigidBody1.Velocity, rigidBody2.Velocity);
      
      
    
      const impulseMagnitude = (-(1 + e) * p5.Vector.dot(RelativeVelocity, impulseDirection.copy())) / (rigidBody1.inverseMass + rigidBody2.inverseMass);
      
    
    
      const MassToMassRatio = rigidBody2.mass / rigidBody1.mass;
      

      const moveRatioRigidbody1 = MassToMassRatio / (1 + MassToMassRatio);
      const moveRatioRigidbody2 = 1 / (1 + MassToMassRatio);
      
      
      
    
    // Update the positions with the adjusted values
    rigidBody1.gameObject.transform.Position.add(p5.Vector.mult(impulseDirection.copy().normalize(), overlap * moveRatioRigidbody1));
    rigidBody2.gameObject.transform.Position.sub(p5.Vector.mult(impulseDirection.copy().normalize(), overlap * moveRatioRigidbody2));

    
      
    
    rigidBody1.addForce(impulseDirection.copy(), impulseMagnitude);
    rigidBody2.addForce(impulseDirection.copy(), -impulseMagnitude);
  }
  
  
  
  
  /**
   * Draws the background image on the canvas.
   * 
   * @param {p5.Image} img - The image to be displayed as the background.
   * @param {p5.Vector} size - The size of the image to be displayed. If null, the image will be displayed at the full screen size.
   */
  drawBackground(img=null,  size=null){
    globalP5.push()
    this.currentBackgroundScroll += this.backgroundScrollSpeed;
    globalP5.translate(this.screenWidth / 2 + this.currentBackgroundScroll % this.screenWidth, this.screenHeight / 2);
    
    if (img !== null && size === null){
      globalP5.image(img, 0, 0, this.screenWidth, this.screenHeight)
      globalP5.image(img, 0 + this.screenWidth, 0, this.screenWidth, this.screenHeight)
    }

    else if (img !== null && size !== null){
      globalP5.image(img, 0, 0, size.x, size.y)   
      globalP5.image(img, 0 + this.screenWidth, 0, this.screenWidth, this.screenHeight) 
    }

    globalP5.pop()
  }
  

  /**
   * Sets the background image and size.
   * @param {p5.Image} img - The image URL or path.
   * @param {p5.Vector} size - The size of the background image.
   */
  setBackground(img, size){
    this.backgroundImage = img;
    this.backgroundSize = size;
  }



  /**
   * Checks for collisions between game objects.
   * @param {Object} gameObjectValues - The values of game objects.
   */
  checkAllCollisions(gameObjectValues){
    try{
      const objects = Object.values(gameObjectValues);
      for (let i = 0; i <= objects.length - 1; i++){
        for (let j = i + 1; j <= objects.length - 1; j++){
          for (const collider1 of objects[i].colliders){
            for (const collider2 of objects[j].colliders){
              this.detectCollision(collider1, collider2)
            }
          }
        }
      }
    }

    catch(err){
      console.log(err)
    }
  
  }
  
  /**
   * Culls objects within a specified range based on collision detection.
   * 
   * @param {number} range - The range within which objects should be culled.
   * @param {object} position - The position of the culling object.
   * @param {Array} gameObjectValues - An array of game objects to be culled.
   * @returns {Array} - An array of culled objects.
   */
  cullObjects(range, position, gameObjectValues){
    let physCheckObject = new GameObject(this, position, "circleCheckObject")
    physCheckObject.addCircleCollider(range, true, false, globalP5.createVector(0,0))
    
    let circleCheckCollider = physCheckObject.colliders[0];
    circleCheckCollider.collidingWith = []

    let culledObjects = []

    const objects = gameObjectValues;
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].ignoreCulling){
          culledObjects.push(objects[i])
        }

        for (const collider of objects[i].colliders){
            this.detectCollision(circleCheckCollider, collider)
        }
  
    }

    const collidingWith = circleCheckCollider.collidingWith.forEach(collider => culledObjects.push(collider.gameObject));
    

    physCheckObject.delete()
    
    return culledObjects;
  }


  /**
   * Adds culling functionality to the object.
   * @param {GameObject} gameObject - The game object to center the culling around.
   * @param {number} range - The range within which the object should be visible.
   */
  addCulling(gameObject, range){
    this.cullingObject = gameObject;
    this.cullingRange = range;
    this.cull = true;

  }



  /**
   * Updates the game state and renders the game objects.
   * Runs in the p5.js draw loop.
   */
  update(){
    
    if (this.resizeToFit){
        this.screenWidth = globalP5.windowWidth;
        this.screenHeight = globalP5.windowHeight;

    }

    


    globalP5.background(0);
    
    this.rays = []
    this.toDebug = []

    this.drawBackground(this.backgroundImage, this.backgroundPos, this.backgroundSize)
    globalP5.frameRate(this.FPS)
    
    let gameObjects = this.gameObjects
    let gameObjectValues;

    if (this.currentLevelObjects !== null){
      gameObjects = this.currentLevelObjects;
    }
    
    if (this.cull){
      gameObjectValues = Object.values(gameObjects)
      this.culledObjects = this.cullObjects(this.cullingRange, this.cullingObject.transform.Position, gameObjectValues)
      gameObjectValues = this.culledObjects;
      
    }

    else{
      gameObjectValues = Object.values(gameObjects)
    }

  
      this.checkAllCollisions(gameObjectValues)
      
      for(let i = 0; i <= this.playerObjects.length - 1; i++){
          this.playerObjects[i].updatePlayer();
      }

      

      for (const name in gameObjectValues) {
      if (gameObjectValues.hasOwnProperty(name)) {
        const gameObject = gameObjectValues[name];
        
        gameObject.updateComponents();
        gameObject.collidingWith = [];
        
        }}

      

      if (this.gameStateScript !== null){
        if (this.gameStateStarted === false){
          this.gameStateScript.Start();
          this.gameStateStarted = true;
        }

        else{
          this.gameStateScript.Update();
        }
      
        
      }

      if (this.currentLevelScript !== null){
        this.currentLevelScript.Update();
      }
      

      if (this.mainCamera !== null){
        this.mainCamera.update()    
      }
      
      for (const name in gameObjectValues) {
        if (gameObjectValues.hasOwnProperty(name)) {
          const gameObject = gameObjectValues[name];
          
          gameObject.renderComponents();

          if (this.debug){
            for (let i = 0; i <= this.rays.length - 1; i++) {
              globalP5.stroke("green");
              if(this.rayDebug){
                globalP5.line(this.rays[i][0].x, this.rays[i][0].y, this.rays[i][1].x, this.rays[i][1].y);
              }
              
            }
          }
        
          
          
    
        }
      }

      if (this.debug){
        for (let i = 0; i <= this.toDebug.length -1; i++){
          globalP5.noFill()
          globalP5.stroke(0, 255, 255)
          
          globalP5.drawingContext.setLineDash([1, 5]);
          globalP5.circle(this.toDebug[i].position.x, this.toDebug[i].position.y, this.toDebug[i].radius*2)
          globalP5.fill("white")
          globalP5.drawingContext.setLineDash([0,0]);
        }
      }

      
      this.particleSystem.update()
    



  }


}





export class MonoBehaviour {
  /**
   * Represents a constructor function.
   * @constructor
   * @param {p5} p5Var - The p5 instance.
   * @param {GameEngine} gameEngine - The game engine.
   * @param {GameObject} gameObject - The game object.
   */
  constructor(p5Var, gameEngine, gameObject){
    this.p5 = p5Var;
    this.gameEngine = gameEngine;
    this.gameObject = gameObject;
  }

  /**
   * Calculates the angle between the camera and the mouse position.
   * @param {Camera} camera - The camera object.
   * @param {number} screenWidth - The width of the screen.
   * @param {number} screenHeight - The height of the screen.
   * @returns {number} The angle between the camera and the mouse position in degrees.
   */
  static cameraToMouseAngle(camera, screenWidth, screenHeight){
    const directionVector = p5.Vector.sub(globalP5.createVector(globalP5.mouseX, globalP5.mouseY), globalP5.createVector(screenWidth / 2 + camera.cameraOffset.x, screenHeight / 2 + camera.cameraOffset.y));
    const directionNormal = p5.Vector.normalize(directionVector);
  
    const angle = Math.atan2(directionNormal.x, directionNormal.y) * 180 / Math.PI;
    return angle;
  }


  /**
   * Calculates the direction vector from the camera to the mouse position.
   * 
   * @param {Camera} camera - The camera object.
   * @param {number} screenWidth - The width of the screen.
   * @param {number} screenHeight - The height of the screen.
   * @returns {p5.Vector} - The normalized direction vector from the camera to the mouse position.
   */
  static cameraToMouseDirection(camera, screenWidth, screenHeight){
    const directionVector = p5.Vector.sub(globalP5.createVector(globalP5.mouseX, globalP5.mouseY), globalP5.createVector(screenWidth / 2 + camera.cameraOffset.x, screenHeight / 2 + camera.cameraOffset.y));
    const directionNormal = p5.Vector.normalize(directionVector);
  
    return directionNormal;
  }

  static GameObject = GameObject;
  static RigidBody = RigidBody;
  static BoxCollider = BoxCollider;
  static CircleCollider = CircleCollider;
  static Animator = Animator;
  static Animation = Animation;
  static ImageSystem = ImageSystem;
  static SpriteRenderer = SpriteRenderer;
  static Camera = Camera;
  static Particle = Particle;
  static ParticleEmitter = ParticleEmitter;


  static waitForCondition = waitForCondition;
  
}

window.addEventListener('load', (event) => {
  console.log('Webpage fully loaded');


  let sketch = new p5(game);

  //There is a p5 js instance mode bug that causes setup to try and run before the webpage will load and this prevents that from happening
});

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});
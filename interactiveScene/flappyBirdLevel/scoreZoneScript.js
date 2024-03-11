import { MonoBehaviour } from "../sketch.js";

export default class ScoreZoneScript{
    constructor(p5Var, gameEngine, gameObject){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.gameObject = gameObject;
    }

    Start(){
        // Event listener for "flappyGameOver" event
        this.gameEngine.onEvent("flappyGameOver", () => {
            // Set the x velocity of the rigid body to 0
            this.gameObject.rigidBody.Velocity.x = 0;
        });
    }

    Update(){
        // Check if the x position of the game object is less than or equal to -300
        if (this.gameObject.transform.Position.x <= -300){
            // Delete the game object
            this.gameObject.delete();
        }

        // Iterate through each collider that the game object is colliding with
        for (const collider of this.gameObject.colliders[0].collidingWith){
            // Check if the colliding game object has the tag "FlappyBird"
            if (collider.gameObject.hasTag("FlappyBird")){
                // Broadcast the event "increaseFlappyScore"
                this.gameEngine.broadCastEvent("increaseFlappyScore");
                // Delete itself
                this.gameObject.delete();
            }
        }
    }

  }

  
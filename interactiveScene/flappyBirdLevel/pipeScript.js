import { MonoBehaviour } from "../sketch.js";

export default class PipeScript{
    constructor(p5Var, gameEngine, gameObject){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.gameObject = gameObject;
    }

    Start(){
        // Set up event listener for game over event
        this.gameOver = false;
        this.gameEngine.onEvent("flappyGameOver", () => {
            // Stop the pipe's movement when game over
            this.gameObject.rigidBody.Velocity.x = 0;
            this.gameOver = true;
        });

    }

    Update(){
        if (this.gameOver){
            return;
        }

        // Delete the pipe object when it goes off the screen
        if (this.gameObject.transform.Position.x <= -300){
            this.gameObject.delete();
        }

        // Check for collision with the Flappy Bird object
        for (const collider of this.gameObject.colliders[0].collidingWith){
            if (collider.gameObject.hasTag("FlappyBird")){
                // Broadcast game over event when collision occurs
                this.gameEngine.broadCastEvent("flappyGameOver");
            }
        }
    }
}
import { MonoBehaviour } from "../sketch.js";

export default class Enemy{
    constructor(p5Var, gameEngine, gameObject){
      this.p5 = p5Var;
      this.gameEngine = gameEngine;
      this.gameObject = gameObject;
    }

    Start(){

    }

    Update(){
        let wasHit = false;

        // Check if the enemy is colliding with any game object tagged as "Player" or "lava"
        for (const collider of this.gameObject.colliders[0].collidingWith){
            if (collider.gameObject.hasTag("Player") || collider.gameObject.hasTag("lava")){
                wasHit = true;
            }
        }

        // If the enemy was hit, delete the game object
        if (wasHit){
            this.gameObject.delete();
        }

    }

  }

  
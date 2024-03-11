import { MonoBehaviour } from "../sketch.js";

export default class BirdScript {
  constructor(p5Var, gameEngine, gameObject) {
    this.p5 = p5Var; 
    this.gameEngine = gameEngine; 
    this.gameObject = gameObject;
  }

  Start() {
    // Add keyboard input mapping for the 'flap' action, mapped to the 'space' key
    this.gameEngine.inputSystem.addKeyboardInput('flap', 'space', 'bool');
  }

  Update() {
    if (this.gameEngine.inputSystem.getInputDown('flap')) {
      // If the 'flap' key is pressed, transition the animator to the 'flap' state
      this.gameObject.animator.transition("flap");
      this.gameObject.rigidBody.Velocity.y = -10.5; // Set the vertical velocity of the rigid body
    } else {
      if (this.gameObject.animator.loopCount > 0) {
        // If the animator has completed at least one loop, transition back to the 'default' state
        this.gameObject.animator.transition("default");
      }
    }
  }
}

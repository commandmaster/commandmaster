import ComponentBase from "./componentBase.js";
import { RendererAPI } from "../modules/renderer.js";



class GuiElement {
    constructor(p5){
      this.p5 = p5;
      this.datGui = new dat.GUI();
      this.Hide();
    }
  
    Show(){
      this.datGui.show();
    }
  
    Hide(){
      this.datGui.hide();
    }  
}
  
  class Inspector extends GuiElement {
    #inspectorFolder;
  
    constructor(p5, editorComponent){
      super(p5);
        this.editorComponent = editorComponent;
        this.engineAPI = editorComponent.engineAPI;
        this.#inspectorFolder = this.datGui.addFolder('Inspector');

        this.components = {};
        this.folders = {};


        this.#inspectorFolder.add({AddComponent: () => {
            brompt("Enter the name of the new component", (val) => {
                if (val === "") return;
                if (this.editorComponent.gameObject.components[val]){
                    console.log("Component already exists");
                    return;
                }

                if (val === "EditorComponent"){
                    console.log("Cannot add EditorComponent");
                    return;
                }

                if (!(["Transform", "Rigidbody", "ParticleSystem", "StateMachine"].includes(val))) {
                    console.log("Component name not valid");
                    return;
                }


                const newComponentName = val;
                this.editorComponent.gameObject.createComponentFromDefault(newComponentName);
                this.addComponent(newComponentName, this.editorComponent.gameObject.components[newComponentName].componentConfig);
                
            });  
        }}, "AddComponent");

        this.#inspectorFolder.add({RemoveComponent: () => {
            this.editorComponent.gameObject.RemoveComponent(component);
            this.folders[component].close();
            this.#inspectorFolder.removeFolder(this.folders[component]);
        }}, "RemoveComponent");
    }
  
    Show(){
        super.Show();
        this.#inspectorFolder.open();
        
    }
  
    Hide(){
      super.Hide();
    }

    SaveConfigsToGameData(){
        for (const component in this.components){
            const storedConfig = JSON.parse(localStorage.getItem('gameData'));
            const name = this.editorComponent.gameObject.gameObjectConfig.name;

            const componentConfig = this.components[component];

            storedConfig.scenes[this.engineAPI.engine.currentSceneName].gameObjects[name].overideComponents[component] = componentConfig;
            localStorage.setItem('gameData', JSON.stringify(storedConfig));
        }

        for (const folder in this.folders){
            // Update Rigidbody component from the component
            if (folder === "Rigidbody"){
                this.editorComponent.gameObject.components.Rigidbody.updateFromNewConfig(this.components[folder]);
            }

            // Update other components from the component
            else if (folder !== "Transform"){
                this.editorComponent.gameObject.components[folder].updateFromNewConfig(this.components[folder]);
            }
        }

        // Update the transform component from the component
        if (this.editorComponent.gameObject.components.Transform.transformUpdated){
            this.refreshComponent("Transform", this.editorComponent.gameObject.components.Transform.generateComponentConfig());
        }
    }

    addComponent(componentName, componentConfig){
        this.components[componentName] = JSON.parse(JSON.stringify(componentConfig));
        const folder = this.#inspectorFolder.addFolder(componentName);

        this.folders[componentName] = folder;
        this.#addFolderRecursive(folder, this.components[componentName]);

        if (componentName == "Transform"){
            const revursiveControllerConfigurator = (folder) =>{
                // Add onChange event listener to each controller in the folder
                folder.__controllers.forEach(controller => {
                    controller.onChange(() => {
                        // Check if the transform has been updated before updating from new config
                        if (!this.editorComponent.gameObject.components.Transform.transformUpdated) this.editorComponent.gameObject.components.Transform.updateFromNewConfig(this.components[componentName]);
                    });
                });

                // Recursively configure controllers in sub-folders
                Object.values(folder.__folders).forEach(folder => {
                    revursiveControllerConfigurator(folder);
                });
            }

            // Start recursive configuration
            revursiveControllerConfigurator(folder);
        }
    }

    refreshComponent(componentName, componentConfig){
        this.components[componentName] = JSON.parse(JSON.stringify(componentConfig));

        const recursiveRefresh = (folder, object) => {
            for (const key in object){
                if (typeof object[key] === "object"){
                    // Recursively refresh sub-folders
                    recursiveRefresh(folder.__folders[key], object[key]);
                }

                else{
                    // Find the controller with the matching property and set its value
                    folder.__controllers.find(controller => controller.property === key).setValue(object[key]);
                }
            }
        
        }

        // Start recursive refresh
        recursiveRefresh(this.folders[componentName], this.components[componentName]);

    }

    #addFolderRecursive(parentFolder, object){
        for (const key in object){
            if (typeof object[key] === "object"){
                // Create a new folder for nested objects
                const folder = parentFolder.addFolder(key);

                // Recursively add sub-folders and properties
                this.#addFolderRecursive(folder, object[key]);
            }

            else{
                // Add property to the parent folder
                parentFolder.add(object, key);
            }
        }
    }
  }
  
  
  

  

export default class EditorComponent extends ComponentBase{
    constructor(engineAPI, gameObject) {
        super(engineAPI, null, gameObject);

    }

    Start(){
        // Add this editor object to the editor system
        this.engine.editorSystem.AddEditorObject(this);
        
        // Create an instance of the Inspector class
        this.inspector = new Inspector(this.p5, this);
        this.inspector.Hide();

        // Add components to the inspector
        for (const component in this.gameObject.components){
            if (component !== "EditorComponent"){
                this.inspector.addComponent(component, this.gameObject.components[component].componentConfig);
            }
        }
        
        // Initialize variables
        this.showEditor = false;
        this.isDragging = false;
        this.mode = "translate";

        // Add event listeners for mouse and keyboard input
        window.addEventListener("mousedown", (e) => {
            if (e.button === 0){
                const clickedPos = this.engineAPI.engine.renderer.camera.ScreenToWorld({x: e.clientX, y: e.clientY});

                const clickedOnRadius = 80;
                const pos = this.gameObject.components.Transform.worldPosition;

                const isWithRadius = (pos, clickedPos, radius) => {
                    return Math.sqrt((pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2) < radius;
                }

                if (isWithRadius(pos, clickedPos, clickedOnRadius)){
                    // Highlight the object in the editor system
                    this.engineAPI.engine.editorSystem.HighlightObject(this);
                    this.showEditor = true;
                    this.isDragging = true;
                    this.mode = "translate";
                }

                else{
                    this.showEditor = false;
                }
            }
        });

        window.addEventListener("mouseup", (e) => {
            if (e.button === 0){
                this.isDragging = false;
            }
        }); 

        window.addEventListener("keydown", (e) => {
            if (e.key === "t" || e.key === "w"){
                this.mode = "translate";
            }

            if (e.key === "r"){
                this.mode = "rotate";
            }
        });

    }

    Update(){
        if (this.inspector) this.inspector.SaveConfigsToGameData();
        if (!this.showEditor) return;        

        if (this.mode === "translate"){
            // Render translation arrows
            this.#translateDebugRender();

            if (this.isDragging){
                const pos = this.engineAPI.engine.renderer.camera.ScreenToWorld({x: this.p5.mouseX, y: this.p5.mouseY});

                // Update local position based on mouse drag
                //this.gameObject.components.Transform.localPosition = pos;
                this.gameObject.components.Transform.SetLocalFromWorld(pos);
                
            }
        }

        if (this.mode === "rotate"){
            const dir = this.engineAPI.engine.renderer.camera.ScreenToWorld({x: this.p5.mouseX, y: this.p5.mouseY});
            const pos = this.gameObject.components.Transform.worldPosition;

            // Calculate angle between object and mouse position
            const angle = Math.atan2(dir.y - pos.y, dir.x - pos.x);

            // Update local rotation based on mouse position
            this.gameObject.components.Transform.SetLocalRotFromWorld(angle * 180 / Math.PI)
            this.#rotateDebugRender();
        }
    }

    #translateDebugRender(){
        const pos = this.gameObject.components.Transform.worldPosition;
        const task = new RendererAPI.CustomRenderTask(this.engineAPI, (p5) => {
            const img = this.engineAPI.engine.renderer.editorTextures["movingArrow2"];

            const arrowOffsetsX = [0, -150, 0, 150];
            const arrowOffsetsY = [150, 0, -150, 0];

            for (let i = 0; i < 4; i++){
                p5.push();
                p5.translate(pos.x, pos.y);
                p5.translate(arrowOffsetsX[i], arrowOffsetsY[i]);
                p5.rotate(i * 90 - 90);
                
                p5.scale(0.03);
                p5.rotate(-180)
                p5.tint(255, 0, 0, 1000);
                p5.image(img, 0, 0);
                p5.pop();
            }
 
        });

        this.engineAPI.engine.renderer.addRenderTask(task);
    }

    #rotateDebugRender(){
        const pos = this.gameObject.components.Transform.worldPosition;
        const task = new RendererAPI.CustomRenderTask(this.engineAPI, (p5) => {
            const img = this.engineAPI.engine.renderer.editorTextures["rotationArrow"];
            const arrowOffsetsX = 150
            const rot = this.gameObject.components.Transform.worldRotation;

            p5.push();
            p5.translate(pos.x, pos.y);
            p5.rotate(rot)
            p5.translate(arrowOffsetsX, 0)
            p5.scale(0.2);
            
            // Render the rotation arrow
            p5.tint(0, 0, 255, 10000);
            p5.image(img, 0, 0);
            p5.pop();
        });

        this.engineAPI.engine.renderer.addRenderTask(task);
    }
}
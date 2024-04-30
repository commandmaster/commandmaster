// P5 UI Library

class UIHandler{
    constructor(){
        this.widgets = {}
    }

    AddWidget(name, widget){
        this.widgets[name] = widget;
    }

    Update(){
        Object.keys(this.widgets).forEach(key => {
            this.widgets[key].Update();
        });
    }

    SetActiveWidget(name){
        Object.keys(this.widgets).forEach(key => {
            if (key == name){
                this.widgets[key].Show();
            }

            else{
                this.widgets[key].Hide();
            }
        });
    }

    Get(name){
        return this.widgets[name];
    }

    HideAllWidgets(){
        Object.keys(this.widgets).forEach(key => {
            this.widgets[key].Hide();
        });
    }

}


class UIWidget{
    #visible = false;

    constructor(p5, widgetOptions={bgColor:[0, 0, 0]}){
        this.p5 = p5;
        this.widgetOptions = widgetOptions;

        this.elements = [];
    }

    AddElement(element){
        this.elements.push(element);
    }

    Update(){
        if (!this.#visible) return;

        this.p5.push();
        this.p5.imageMode(this.p5.CORNER);
        this.p5.rectMode(this.p5.CORNER);
        this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
        this.p5.strokeWeight(0);
        this.p5.noStroke();

        this.p5.fill(this.widgetOptions.bgColor[0], this.widgetOptions.bgColor[1], this.widgetOptions.bgColor[2]);
        this.p5.rect(0, 0, this.p5.width, this.p5.height);
        this.elements.forEach(element => {
            element.Update();
        });
        this.p5.pop();
    }

    Show(){
        this.#visible = true;
    }

    Hide(){
        this.#visible = false;
    }
}

class UIElement{
    constructor(p5, widget, elementOptions={x:0, y:0, width:0, height:0, anchor:'top-left', placeMode:'corner'}){
        this.p5 = p5;
        this.widget = widget;
        widget.AddElement(this);

        this.elementOptions = elementOptions;

        this.x =  elementOptions.x;
        this.y = elementOptions.y;
        this.width = elementOptions.width;
        this.height = elementOptions.height;
        this.anchor = elementOptions.anchor;
        this.placeMode = elementOptions.placeMode;

        this.behaviors = [];
    }

    Update(){
        for (let i = 0; i < this.behaviors.length; i++){
            this.behaviors[i](this);
        }


        const baseResWidth = 1920;
        const baseResHeight = 1080;

        this.p5.textAlign(this.p5.CENTER);

        const minScale = Math.min(this.p5.width / baseResWidth, this.p5.height / baseResHeight);

        this.width = this.elementOptions.width * minScale;
        this.height = this.elementOptions.height * minScale;
    }

    addCustomBehavior(behaviorFunc){
        this.behaviors.push(behaviorFunc);
    }
}

class UIButton extends UIElement{
    OnClick = null;

    constructor(p5, widget, elementOptions={x:0, y:0, width:0, height:0, anchor:'top-left', placeMode:'corner'}){
        super(p5, widget, elementOptions);
    }

    Update(){
        super.Update();

        this.p5.push();
        let x, y;
        const baseResWidth = 1920;
        const baseResHeight = 1080;

        
        if (this.anchor == 'top-left'){
            x = this.x * (this.p5.width / baseResWidth);
            y = this.y * (this.p5.height / baseResHeight);
        }

        if (this.anchor == 'top-right'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width;
            y = this.y * (this.p5.height / baseResHeight);
        }

        if (this.anchor == 'bottom-left'){
            x = this.x * (this.p5.width / baseResWidth) 
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height;
        }

        if (this.anchor == 'bottom-right'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width;
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height;
        }

        if (this.anchor == 'center'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width / 2;
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height / 2;
        }

        if (this.placeMode == 'center'){
            x -= this.width / 2;
            y -= this.height / 2;
        }

        else if (this.placeMode == 'corner'){
            x = x;
            y = y;
        }

        this.p5.fill(255, 0, 0);
        

        if (this.p5.mouseX > x && this.p5.mouseX < x + this.width && this.p5.mouseY > y && this.p5.mouseY < y + this.height && this.p5.mouseIsPressed){
            if (this.onClick != null){
                this.onClick();
            }
        }

        this.p5.rect(x, y, this.width, this.height);

        this.p5.pop();
    }

    set OnClick(callback){
        this.onClick = callback;
    }
}

class UIText extends UIElement{
    constructor(p5, widget, elementOptions={x:0, y:0, width:0, height:0, anchor:'top-left', placeMode:'corner', text:'', textColor:[255, 255, 255], textSize:12, font:null}){
        super(p5, widget, elementOptions);
        this.text = elementOptions.text;
        this.textColor = elementOptions.textColor;
        this.textSize = elementOptions.textSize;
        this.font = elementOptions.font;
    }

    Update(){   
        super.Update();

        if (this.font != null){
            this.font.ApplyFont();
        }

        let x, y;
        const baseResWidth = 1920;
        const baseResHeight = 1080;

        this.p5.fill(255, 255, 255);
        
        
        if (this.anchor == 'top-left'){
            x = this.x * (this.p5.width / baseResWidth);
            y = this.y * (this.p5.height / baseResHeight);
        }

        if (this.anchor == 'top-right'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width;
            y = this.y * (this.p5.height / baseResHeight);
        }

        if (this.anchor == 'bottom-left'){
            x = this.x * (this.p5.width / baseResWidth) 
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height;
        }

        if (this.anchor == 'bottom-right'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width;
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height;
        }

        if (this.anchor == 'center'){
            x = this.x * (this.p5.width / baseResWidth) + this.p5.width / 2;
            y = this.y * (this.p5.height / baseResHeight) + this.p5.height / 2;
        }




        if (this.placeMode == 'center'){
            this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        }

        else if (this.placeMode == 'corner'){
            this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
        }
    
        const minScale = Math.min(this.p5.width / baseResWidth, this.p5.height / baseResHeight);
        this.p5.textSize(this.textSize * minScale);
        this.p5.text(this.text, x, y);

    }
}

class UIFont{
    constructor(p5, pathTofont){
        this.p5 = p5;
        this.loaded = false;
        this.loadedFont = null;
        this.font = this.p5.loadFont(pathTofont, (font) => {
            this.loadedFont = font;
            this.loaded = true;
        });
    }

    ApplyFont(){
        if (this.loaded){
            this.p5.textFont(this.loadedFont);
        }
    }
}
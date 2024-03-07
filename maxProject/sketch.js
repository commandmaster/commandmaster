// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
let box1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  let startingColor = prompt("What color would you like the box to start with?");
  let endingColor = prompt("What color would you like the box to end with?");

  box1 = new GradientBox(400, 400, startingColor, endingColor, 30, 30, 5);
}

function draw() {
  //background(220);
  box1.display();
}


class GradientBox{
  constructor(sizeX, sizeY, color1, color2, offsetX, offsetY, round){

    color1 = color(color1);
    color2 = color(color2);
    
    // clip(() => {
    //   circle(offsetX + sizeX/2, offsetY + sizeY/2, sizeX + sizeX*round/100);
    // });

    noStroke();
    let oldColor = color1;
    for (let i = 0; i < sizeX; i++){
      const newColor = lerpColor(oldColor, color2, map(i, 0, sizeX, 0, 1));
      fill(newColor);
      rect(i + offsetX, offsetY, 1, sizeY);
      
    }
   
  }

  display(){
    //display the box
  }
}
// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let zoom = 0.0001;
let lastValue = 0;
let slider;
let seed = 0;
let position = 0;
let start = 0;
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  seed = random(0, 1000);

  slider = createSlider(0, 100, 50);
  lastValue = 0;


  slider.position(10, 10);
  slider.size(200, 20);
  generateTerrain(seed);
  
}

function generateTerrain(seed = 0, start = 0){
  for (let i = 0; i < 10000; i++) {
    let x = i + start;
    let y = height * noise(seed + i * zoom);

    stroke(255);
    fill(255);
    rect(x, y, 1, height - y);
  }
}


function draw() {
  translate(-position, 0);

  
  lastValue = slider.value();
  zoom = map(lastValue, 0, 100, 0.000001, 0.02);
  background(0);
  generateTerrain();
  

  const moveSpeed = 10;
  position += moveSpeed;
  start += moveSpeed;
  
}

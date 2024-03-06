// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let ball1;
function setup() {
  createCanvas(windowWidth, windowHeight);
  ball1 = new Ball(0,0);
}

function draw() {
  background(220);
  ball1.update();
}


class Ball{
  constructor(x,y){
    this.x = x;
    this.y = y;

    this.speed = 10;
    this.vel = createVector(1, 1);
    this.radius = 25;
  }

  update(){
    if (this.x > width || this.x < 0){
      this.vel.x *= -1  + random(-0.3, 0.3);
    }
    if (this.y > height || this.y < 0){
      this.vel.y *= -1+ random(-0.3, 0.3);
    }

    this.x += this.vel.x * this.speed;
    this.y += this.vel.y * this.speed;

    fill(0);

    this.x = constrain(this.x, 0 - this.radius, width + this.radius);
    this.y = constrain(this.y, 0 - this.radius, height + this.radius);

    circle(this.x, this.y, this.radius*2);

  }

  
}
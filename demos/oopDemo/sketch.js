class Walker{
  #speed
  radius = 10;
  
  constructor(x, y, speed){
    this.#speed = speed;
    this.x = x;
    this.y = y;

    this.dirx = 0;
    this.diry = 0;
  }
  
  #move(){
    const dir = createVector(1, 0)
    

    const centerBias = createVector(width / 2, height / 2)
    const distToCenter = dist(this.x, this.y, centerBias.x, centerBias.y)
    const centerBiasDirection = createVector(centerBias.x - this.x, centerBias.y - this.y)
    centerBiasDirection.normalize()

    centerBiasDirection.mult(1 / distToCenter / 1)




    this.x += centerBiasDirection.x + dir.x 
    this.y += centerBiasDirection.y + dir.y 

  }
  
  #display(){
    circle(this.x, this.y, this.radius)
  }
  
  update(){
    this.#move()
    this.#display()
  }
}

let walker1;
function setup() {
  createCanvas(400, 400);
  walker1 = new Walker(30, 30, 1)
}

function draw() {
  background(220);
  walker1.update()
}
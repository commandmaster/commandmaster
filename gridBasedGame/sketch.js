
let grid1;
const sketch = function(p5) {
  p5.setup = () => {
    // fill the window
    const maxSize = Math.min(window.innerWidth, window.innerHeight);
    p5.createCanvas(maxSize, maxSize);
    p5.frameRate(60);

    grid1 = new Grid(p5, maxSize, maxSize, 0.05);
  }

  p5.draw = () => {
    p5.background(0);
    grid1.Update();

  }

}

class Grid{
  constructor(p5, width, height, density = 0.5){
    this.p5 = p5;
    this.grid = [];
    this.width = width;
    this.height = height;
    


    this.density = density;
    

    p5.noStroke();

    this.#initGrid();
  }


  #initGrid(){
    const cellSize = this.width / (this.width * this.density);
    for(let x = 0; x < this.width; x += cellSize){
      for(let y = 0; y < this.height; y += cellSize){
        this.grid.push(new Cell(this.p5, x, y, cellSize));
      }
    }
  }

  Update(){
    this.p5.push();
    
    for(let cell of this.grid){
      cell.Update();
    }
    
    
    this.p5.pop();
  }

}

class Cell{
  constructor(p5, x, y, size){
    this.x = x;
    this.y = y;
    this.p5 = p5;
    this.size = size;
  }

  Update(){
    // Update the cell
    this.#draw();
  }

  #draw(){
    // Draw the cell
    const randColor = this.p5.random(255);
    const randColor2 = this.p5.random(255);
    
    this.p5.fill(randColor, randColor2, 255);
    this.p5.rect(this.x, this.y, this.size, this.size);
  }

}


window.addEventListener('load', () => {
  let gameWindowSketch = new p5(sketch);
});
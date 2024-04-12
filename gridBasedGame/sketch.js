
let grid1;
const sketch = function(p5) {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    grid1 = new Grid(p5, 10, 500, 500);
    p5.background(255);
    p5.strokeWeight(2);
  }

  p5.draw = () => {
    p5.background(255);
    grid1.Update();
  }

}



class Grid{
  constructor(p5, resolution, pixelsX, pixelsY){
    this.p5 = p5;
    this.resolution = p5.constrain(resolution, 1, p5.max(pixelsX, pixelsY));
    this.pixelsX = pixelsX;
    this.pixelsY = pixelsY;
    this.#initGrid();
  }

  #initGrid(){
    this.grid = [];
    const rows = this.pixelsY / this.resolution;
    const cols = this.pixelsX / this.resolution;

    for (let i = 0; i < rows; i++){
      this.grid[i] = [];
      for (let j = 0; j < cols; j++){
        const randColor = Math.random() > 0.5 ? 0 : 255;
        this.grid[i][j] = new GridPiece(randColor);
      }
    }
    
  }

  #drawGrid(){
    this.p5.push();
    this.p5.noStroke();
    for (let i = 0; i < this.grid.length; i++){
      for (let j = 0; j < this.grid[i].length; j++){
        this.p5.fill(this.grid[i][j].color);
        this.p5.rect(j * this.resolution, i * this.resolution, this.resolution, this.resolution);
      }
    }
    this.p5.pop();
  }


  #gridBehavior(){
    let allGrey = true;
    for (let i = 0; i < this.grid.length; i++){
      for (let j = 0; j < this.grid[i].length; j++){
        // form a spiral
        const distToCenter = Math.sqrt((i - this.grid.length / 2) ** 2 + (j - this.grid[i].length / 2) ** 2);
        const color = this.grid[i][j].color;
        const targetColor = this.p5.map(distToCenter, 0, Math.sqrt((this.grid.length / 2) ** 2 + (this.grid[i].length / 2) ** 2), 0, 255);
        this.grid[i][j].color = this.p5.lerp(color, targetColor, 0.1); 
      }
    }

    
  }

  Update(){
    this.#gridBehavior();
    this.#drawGrid();
  }

}


class GridPiece{
  color;

  constructor(color){
    this.color = color;
  }
}

window.addEventListener('load', () => {
  let gameWindowSketch = new p5(sketch);
});
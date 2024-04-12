
let grid1;
const sketch = function(p5) {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    grid1 = new Grid(p5, 100, 100);
    p5.background(255);
    p5.noStroke();
  }

  p5.draw = () => {
    p5.noStroke();
    p5.background(255);
    grid1.Update();
  }

  p5.mouseWheel = (event) => {
    const zoomSpeed = 5 ;
    grid1.zoom -= event.delta / 1000 * zoomSpeed;
  }

}



class Grid{
  constructor(p5, rows, cols){
    this.p5 = p5;
    this.rows = rows;
    this.cols = cols;

    this.defaultSize = 10;
    this.zoom = 1;

    this.grid = [];
    this.positionType ='middle';
    this.#initGrid();

    

  }

  #initGrid(){
    for (let i = 0; i < this.rows; i++){
      this.grid.push([]);
      for (let j = 0; j < this.cols; j++){
        this.grid[i].push(new Cell(this.p5, i, j, this.defaultSize));
      }
    }
    
    if (this.positionType === 'middle'){
      console.log('middle');
      let x = (this.p5.width - this.cols * this.defaultSize) / 2;
      let y = (this.p5.height - this.rows * this.defaultSize) / 2;
      this.#setGridPosition(x, y);
    }
  }

  #setGridPosition(x, y){
    for (let i = 0; i < this.rows; i++){
      for (let j = 0; j < this.cols; j++){
        this.grid[i][j].x += x;
        this.grid[i][j].y += y;
      }
    }
  }

  Update(){
    // MouseWheel Zoom
    this.zoom = this.p5.constrain(this.zoom, 0.2, 25);
    if (this.positionType === 'middle'){
      this.p5.translate(this.p5.width / 2, this.p5.height / 2);
      this.p5.scale(this.zoom);
      this.p5.translate(-this.p5.width / 2, -this.p5.height / 2);
    }

    //highligth cell on mouse hover
    let x = this.p5.mouseX - this.p5.width / 2;
    let y = this.p5.mouseY - this.p5.height / 2;
     
    x /= this.zoom;
    y /= this.zoom;

    x += this.p5.width / 2;
    y += this.p5.height / 2;

    const cell = this.#getCell(x, y);
    if (cell){
      cell.color = this.p5.color(0, 255, 0);
    }

    for (let i = 0; i < this.rows; i++){
      for (let j = 0; j < this.cols; j++){
        this.grid[i][j].Show();
      }
    }

  }

  #getCell(x, y){
    for (let i = 0; i < this.rows; i++){
      for (let j = 0; j < this.cols; j++){
        // acount for zoom
        let cellX = this.grid[i][j].x;
        let cellY = this.grid[i][j].y;
        let cellSize = this.grid[i][j].size;
        
        if (x > cellX && x < cellX + cellSize && y > cellY && y < cellY + cellSize){
          return this.grid[i][j];
        }
      
      }
    }
  
  }

}


class Cell{
  constructor(p5, i, j, size){
    this.p5 = p5;
    this.i = i;
    this.j = j;
    this.size = size;
    this.x = this.i * this.size;
    this.y = this.j * this.size;
    this.color = this.p5.color(255, 0, 0);
  }

  Show(){

    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    this.p5.fill(this.color);
    this.p5.rect(this.x, this.y, this.size, this.size);
  }
}


window.addEventListener('load', () => {
  let gameWindowSketch = new p5(sketch);
});
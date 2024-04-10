
let grid1;
const sketch = function(p5) {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    grid1 = new Grid(p5, 5, 1000, 700);
    p5.background(255);
    p5.strokeWeight(2);
  }

  p5.draw = () => {
    p5.background(0, 100, 100);
    grid1.Update();
  }

}



class Grid{
  constructor(p5, resolution, pixelsX, pixelsY){
    this.p5 = p5;
    this.resolution = p5.constrain(resolution, 1, p5.max(pixelsX, pixelsY));
    this.pixelsX = pixelsX;
    this.pixelsY = pixelsY;

    this.backgorundImage = this.p5.loadImage('./download.jpg', (img)=>{
      this.bgImg = img;
    })

    this.#initGrid();
  }

  #initGrid(){
    this.grid = [];
    const rows = this.pixelsY / this.resolution;
    const cols = this.pixelsX / this.resolution;

    for (let i = 0; i < rows; i++){
      this.grid[i] = [];
      for (let j = 0; j < cols; j++){
        const randColor = 255;
        this.grid[i][j] = new GridPiece(randColor);
      }
    }
    
  }

  #drawGrid(){
    this.p5.push();
    this.p5.noStroke();
    for (let i = 0; i < this.grid.length; i++){
      for (let j = 0; j < this.grid[i].length; j++){
        if (!this.grid[i][j].hasUpdated){
          continue;
        }
        this.p5.fill(this.grid[i][j].color);
        this.p5.rect(j * this.resolution, i * this.resolution, this.resolution, this.resolution);
      }
    }
    this.p5.pop();
  }


  #gridBehavior(){
    for (let i = 0; i < this.grid.length; i++){
      for (let j = 0; j < this.grid[i].length; j++){

        if (!this.bgImg){
          continue;
        }

        let piece = this.grid[i][j];
        let pieceColor = this.p5.color(piece.color) ;
        let mouse = this.p5.createVector(this.p5.mouseX, this.p5.mouseY);
        let pieceVector = this.p5.createVector(j * this.resolution, i * this.resolution);
        let distance = this.p5.dist(mouse.x, mouse.y, pieceVector.x, pieceVector.y);

        function lerpColor(p5, p5Color1, p5Color2, amount){
          const red = p5.lerp(p5Color1.levels[0], p5Color2.levels[0], amount);
          const green = p5.lerp(p5Color1.levels[1], p5Color2.levels[1], amount);
          const blue = p5.lerp(p5Color1.levels[2], p5Color2.levels[2], amount);
          return p5.color(red, green, blue);
        }

        // get pixel of bgImg associated with this grid piece
        const realtiveX = j / this.grid[0].length;
        const realtiveY = i / this.grid.length;
        const relativeToImage = this.bgImg.get(realtiveX * this.bgImg.width, realtiveY * this.bgImg.height);
        const pixelColor = this.p5.color(relativeToImage);
        
        const radius = 200;
        const brushStrength = 1;
        if (Math.abs(distance) < radius){
          piece.color = lerpColor(this.p5, pieceColor, pixelColor, brushStrength);
          piece.hasUpdated = true;
        } 

        
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
    this.hasUpdated = true;
  }
}

window.addEventListener('load', () => {
  let gameWindowSketch = new p5(sketch);
});
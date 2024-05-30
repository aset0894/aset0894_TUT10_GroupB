// rectangles in grid variable settings
let numRectangles = 25;
let rectangleWidth;
let rectangleHeight;
let lineRectangles = [];
let drawRectangles = true;
let horizontalGrid;
let verticalGrid 

let grid;
let noiseOffset = 0;
let noiseIncrement = 0.001;


// character blocks variable settings
let charaBlocks = [];   // character blocks array
let boundary = [];  // boundary array

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectangleWidth = width / numRectangles;
  rectangleHeight = height / numRectangles;

  // Define starting points for vertical grid lines
    let verticalStartX = [0.28*windowWidth, 0.44*windowWidth, 0.52*windowWidth, 0.76*windowWidth];

  // Define starting points for horizontal grid lines
    let horizontalStartY = [0.12*windowHeight, 0.52*windowHeight, 0.8*windowHeight];

  // Create horizontal grid lines
    horizontalGrid = new gridLine(numRectangles,horizontalStartY,1,rectangleWidth,rectangleHeight);

  // Create vertical grid lines
    verticalGrid = new gridLine(numRectangles,verticalStartX,2,rectangleWidth,rectangleHeight);
    //createGridLine("vertical", verticalStartX);

  // Character's block width and height
  let charaWidth = random(0.06*windowWidth,0.1*windowWidth); // randomised between 30 to 50
  let charaHeight = random(0.06*windowHeight,0.1*windowHeight);

  // Define each of the boundaries with the start (x,y) points and end (x,y) points
  let bound_startX = [0+charaWidth/2, verticalStartX[2]+rectangleWidth+charaWidth/2, verticalStartX[3]+rectangleWidth+charaWidth/2];
  let bound_endX = [verticalStartX[0]-charaWidth/2, verticalStartX[3]-charaWidth/2, width-charaWidth/2];
  let bound_startY = [horizontalStartY[0]+rectangleWidth+charaHeight/2,horizontalStartY[1]+rectangleWidth+charaHeight/2];
  let bound_endY = [horizontalStartY[1]-charaHeight/2, horizontalStartY[2]-charaHeight/2];

  // Add each defined boundary to boundary array (6 boundaries)
  boundary.push({startX:bound_startX[0], startY:bound_startY[0], endX:bound_endX[0], endY:bound_endY[0]});
  boundary.push({startX:bound_startX[0], startY:bound_startY[1], endX:bound_endX[0], endY:bound_endY[1]});
  
  boundary.push({startX:bound_startX[1], startY:bound_startY[0], endX:bound_endX[1], endY:bound_endY[0]});
  boundary.push({startX:bound_startX[1], startY:bound_startY[1], endX:bound_endX[1], endY:bound_endY[1]});

  boundary.push({startX:bound_startX[2], startY:bound_startY[0], endX:bound_endX[2], endY:bound_endY[0]});
  boundary.push({startX:bound_startX[2], startY:bound_startY[1], endX:bound_endX[2], endY:bound_endY[1]});

  for(let i = 0; i < 6; i++){
    // pick random boundary
    let randomBoundary = boundary[floor(random()*boundary.length)];
    // find index of the randomBoundary in the boundary array and remove that randomBoundary that's already been selected
    boundary.splice(boundary.indexOf(randomBoundary),1);

    // define charaDetails for all the character blocks
    let charaDetails = {
      x: random(randomBoundary.startX,randomBoundary.endX), 
      y: random(randomBoundary.startY,randomBoundary.endY),
      w: charaWidth,
      h: charaHeight, 
      state: random()>=0.5,
      boundary: randomBoundary
    }

    // create the same number of chara1 and chara2 then push it to charaBlocks array
    if(i % 2 == 0){
      charaBlocks.push(new chara1(charaDetails));
    }else{
      charaBlocks.push(new chara2(charaDetails));
    }
  }
}

function draw() {
  //background(230, 213, 190);
  background(0)

  let n = noise(frameCount * 0.005);
  noiseOffset += noiseIncrement;

  let backgroundColor = map(n,0,1,0,50);
  background(backgroundColor);

  // draw each character block
  for(let chara of charaBlocks){
    chara.move();
    chara.checkCollision();
    chara.draw();

    if(chara.collidedHorizontal){
        horizontalGrid.updateColors(n);
    }else if(chara.collidedHorizontal == false){
        horizontalGrid.draw();
    }

    if(chara.collidedVertical){
        verticalGrid.updateColors(n);
    }else if(chara.collidedVertical == false){
        verticalGrid.draw();
    }


  }
  
  stroke(0);
}

function createGridLine(direction, startingArray, colorInput){
    // Create a colors scheme for the rectangles in grid
    let yellow = color(236, 214, 38);
    let blue = color(68, 105, 186);
    let beige = color(217, 216, 211);
    let red = color(176, 58, 46);

    // Create array of the color scheme
    let randomColors = [yellow, blue, beige, red];
    
    for (let i = 0; i < startingArray.length; i++) {
        let start = startingArray[i];
        for (let j = 0; j < numRectangles; j++) {
            if(direction === "horizontal"){
                x = j * rectangleWidth;
                y = start;
            }else{
                x = start;
                y = j * rectangleHeight;
            }
            let rectColor = colorInput ?? random(randomColors);
            let gridLine = new Rectangle(x, y, rectangleWidth, rectangleHeight, rectColor);
            lineRectangles.push(gridLine);
        }
    }
}

// Adapt to the changes of canvas size
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);
  }

  changeColor(color){
    this.color = color;
  }
}

class gridLine {
    constructor(numRect, startingArray, direction, rectWidth, rectHeight){
        this.numRect = numRect;
        this.startingArray = startingArray;
        this.direction = direction;
        this.rectWidth = rectWidth;
        this.rectHeight = rectHeight;
        this.lineRectangles = [];
        this.offset = 0;
        this.initialiseLine();
    }

    initialiseLine(){
        // initial color 
        let yellow = color(236, 214, 38);
        let blue = color(68, 105, 186);
        let beige = color(217, 216, 211);
        let red = color(176, 58, 46);

        // Create array of the color scheme
        let randomColors = [yellow, blue, beige, red];

        for (let i=0; i<this.startingArray.length; i++){
            let start = this.startingArray[i];
            for (let j = 0; j < this.numRect; j++) {
                let x, y;
                // 1 if horizontal, 2 if vertical
                if(this.direction === 1){
                    x = j * this.rectWidth;
                    y = start;
                }else{
                    x = start;
                    y = j * this.rectHeight;
                }
                let rectColor = random(randomColors);
                let gridLine = new Rectangle(x, y, this.rectWidth, this.rectHeight, rectColor);
                this.lineRectangles.push(gridLine);
            }
        }
    }

        draw(){
            for(let rect of this.lineRectangles){
                rect.draw();
            }
            this.offset += 0.003;
        }

        updateColors(n) {
            for (let i = 0; i < this.lineRectangles.length; i++) {
              let currentColor = this.lineRectangles[i].color;
              let randomColor = color(random(100,255), random(200,255), random(100,255));
              /*let r = lerp(red(currentColor), red(randomColor), n);
              let g = lerp(green(currentColor), green(randomColor), n);
              let b = lerp(blue(currentColor), blue(randomColor), n);*/
                  // create dynamic color change with perlin noise
                let r = map(noise(this.offset), 0, 1, 0, 255);
                let g = map(noise(this.offset + 15), 0, 1, 0, 255);
                let b = map(noise(this.offset + 30), 0, 1, 10, 255);
              this.lineRectangles[i].changeColor(color(r, g, b));
            }
        }
}

class chara1{
  constructor(charaDetails){
    this.x = charaDetails.x;
    this.y = charaDetails.y;
    this.baseWidth = charaDetails.w;  // width for the biggest rectangle
    this.baseHeight = charaDetails.h; // height for the biggest rectangle
    this.innerWidth = charaDetails.w * 0.5; // width for the inner medium rectangle
    this.innerHeight = charaDetails.h * 0.5; // height for the inner medium rectangle
    this.smallestWidth = charaDetails.w * 0.25; // width for the smallest rectangle
    this.smallestHeight = charaDetails.h * 0.25; // height for the smallest rectangle
    this.breathingSpeed = 0.10; // Speed of breathing effect

    this.speed = random(2,5); // speed of character's movement
    this.direction = 1; // direction of character's movement (1 = move right or move down; -1 = move left or move up)
    this.Horizontal = charaDetails.state; // true if the character moves horizontally, and false if it moves vertically
    this.boundary = charaDetails.boundary; // set the boundary in which the character can move
    this.collidedHorizontal = false;
    this.collidedVertical = false;

    this.collisionFrame = 0;
    this.collisionDelay = 10;
  }

  update() {
    // breathing effects for each of the rectangles
    let breathSizeOuter = sin(frameCount* this.breathingSpeed) * 5;
    this.currentWidth = this.baseWidth + breathSizeOuter;
    this.currentHeight = this.baseHeight + breathSizeOuter;

    let breathSizeInner = sin(frameCount * this.breathingSpeed + 180 / 2) * 2; // Offset phase for inner medium rectangle
    this.innerWidth = this.baseWidth * 0.5 + breathSizeInner;
    this.innerHeight = this.baseHeight * 0.5 + breathSizeInner;

    let breathSizeSmallest = sin(frameCount * this.breathingSpeed + 180) * 0.5; // Further offset phase for smallest rectangle
    this.smallestWidth = this.baseWidth * 0.25 + breathSizeSmallest;
    this.smallestHeight = this.baseHeight * 0.25 + breathSizeSmallest;
  }

  display(){
    push();
    rectMode(CENTER); // set rectMode to center

    // Display the biggest rectangle
    fill('#4682B4');  // Blue color 
    stroke(255);     
    rect(this.x, this.y, this.currentWidth, this.currentHeight);

    // Display the inner medium rectangle
    fill('#FFD700');  // Yellow color
    stroke(255);       
    rect(this.x, this.y, this.innerWidth, this.innerHeight);

    // Display the smallest rectangle
    fill('#FFFFFF');  // White color
    noStroke();       
    rect(this.x, this.y, this.smallestWidth, this.smallestHeight);
    pop();
  }

  draw(){
    this.update();
    this.display();
  }

  move(){
    // move horizontally if character's state is true, and vertically if it's false
    if(this.Horizontal){
      this.x += this.speed * this.direction;
    } else {
      this.y += this.speed * this.direction;
    }
  }

  /*checkCollision(){
    // check the collision with the grid
    // if it moves horizontal, change the direction when it touches the x boundary
    // if it moves vertical, change the direction when it touches the y boundary
    if(this.Horizontal){
      if(this.x <= this.boundary.startX || this.x > this.boundary.endX){
        this.direction *= -1;
        if(!this.collidedHorizontal){
            this.collidedHorizontal = true;
            this.collisionFrame = frameCount;
        }
      } else if (frameCount - this.collisionFrame > this.collisionDelay) {
        this.collidedHorizontal = false;
      }
    } else {
      if(this.y <= this.boundary.startY || this.y > this.boundary.endY){
        this.direction *= -1;
        if(!this.collidedVertical){
            this.collidedVertical = true;
            this.collisionFrame = frameCount;
        }
      } else if (frameCount - this.collisionFrame > this.collisionDelay){
        this.collidedVertical = false;
      }
    }
  }*/
  checkCollision(){
    // check the collision with the grid
    // if it moves horizontal, change the direction when it touches the x boundary
    // if it moves vertical, change the direction when it touches the y boundary
    if (this.Horizontal) {
        if (this.x <= this.boundary.startX || this.x > this.boundary.endX) {
            this.collidedHorizontal = true;
            this.direction *= -1;
        } else {
          this.collidedHorizontal = false;
        }
    } else {
        if (this.y <= this.boundary.startY || this.y > this.boundary.endY) {
            this.collidedVertical = true;
            this.direction *= -1;
        } else {
            this.collidedVertical= false;
        }
    }
}

  
}

class chara2{
  constructor(charaDetails){
    this.x = charaDetails.x;
    this.y = charaDetails.y;
    this.width = charaDetails.w;
    this.height = charaDetails.h;

    this.speed = random(2,3); // speed of character's movement
    this.direction = 1; // direction of character's movement (1 = move right or move down; -1 = move left or move up)
    this.Horizontal = charaDetails.state; // true if the character moves horizontally, and false if it moves vertically
    this.boundary = charaDetails.boundary; // set the boundary in which the character can move
    this.collidedHorizontal = false;
    this.collidedVertical = false;

    this.collisionFrame = 0;
    this.collisionDelay = 10;
  }
  
  draw() {    
    push();
    angleMode(DEGREES);
    rectMode(CENTER);
    fill(`#D9D8D4`);
    stroke(`#ecd626`);
    strokeWeight(3);
  
    // Translate to the position without rotating or scaling
    translate(this.x, this.y);

    // Draw the character
    // BG Rectangle
    strokeWeight(0);
    rect(0, 0, this.width, this.height); // Adjust the size as needed


    //moving rectangles
    //styles
    noStroke();

    //rectangle with minor movement 
    fill(`#4469BA`);
    stroke(`#4469BA`); 
    strokeWeight(3);

    let growthCharZ = sin(frameCount * 2) * 0.5 + 0.5;

    let mediumInsideRectWidth = map(growthCharZ, 0, 1, this.width/4 * 3, this.width); // Map the growth factor to the width
    let mediumInsideRectHeight = map(growthCharZ, 0, 1, this.height/4 * 3, this.height); // Map the growth factor to the height
    rect(0, 0, mediumInsideRectWidth, mediumInsideRectHeight);
   
    //static rectangle 
    fill(`#ecd626`);
    stroke(`#4469BA`);
    strokeWeight(2);
    rect(0, 0, this.width/8 * 6, this.height/8 * 6)

  
    // Eyes
    let flip = sin(frameCount) * 2; // [-1, 1]
    this.eyeOne(-this.width/6, -this.height/8, flip); // Position and scale of the eye
    this.eyeTwo(this.width/6, -this.height/8, flip); // Position and scale of the eye

    // Mouth
    noStroke();
    stroke(`#b03a2e`);
    strokeWeight(3)
    fill(`#D9D8D4`);
    ellipse(0, this.height/6, (this.width/3), this.height/10);    

    pop();
    angleMode(RADIANS);
  }

  eyeOne(x, y, flip) {
    push();
    noStroke();
    translate(x,y); // Position the eye based on provided coordinates
    scale(flip, 2);
    if (flip > 0) {
      fill(`#4469BA`);
    } else {
      fill(`#b03a2e`); // Change the color when flipped
    }
    ellipse(0, 0, this.width/8);
    pop();
  }

  eyeTwo(x, y, flip) {
    push();
    noStroke();
    translate(x,y); // Position the eye based on provided coordinates
    scale(flip, 2);
    if (flip > 0) {
      fill(`#b03a2e`);
    } else {
      fill(`#4469BA`); // Change the color when flipped
    }
    ellipse(0, 0, this.width/8);
    pop();
  }

  move(){
    // move horizontally if character's state is true, and vertically if it's false
    if(this.Horizontal){
      this.x += this.speed * this.direction;
    } else {
      this.y += this.speed * this.direction;
    }
  }

  checkCollision(){
    // check the collision with the grid
    // if it moves horizontal, change the direction when it touches the x boundary
    // if it moves vertical, change the direction when it touches the y boundary
    if (this.Horizontal) {
        if (this.x <= this.boundary.startX || this.x > this.boundary.endX) {
            this.collidedHorizontal = true;
            this.direction *= -1;
        } else {
          this.collidedHorizontal = false;
        }
    } else {
        if (this.y <= this.boundary.startY || this.y > this.boundary.endY) {
            this.collidedVertical = true;
            this.direction *= -1;
        } else {
            this.collidedVertical= false;
        }
    }
  }
}
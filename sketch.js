// rectangles in grid variable settings
let numRectangles = 25; // number of rectangles

// rectangle width and height
let rectangleWidth;
let rectangleHeight;

// initialise the horizontal and vertical grid lines
let horizontalGrid;
let verticalGrid 

let switchInterval = 200; // the interval time to switch between default and perlin noise state
let defaultState = true; // set the default state to true

// character blocks variable settings
let charaBlocks = [];   // character blocks array
let boundary = [];  // boundary array

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectangleWidth = width / numRectangles;
  rectangleHeight = height / numRectangles;

  // Define starting points for vertical grid lines
  let verticalStartX = [0.28*width, 0.44*width, 0.52*width, 0.76*width];

  // Define starting points for horizontal grid lines
  let horizontalStartY = [0.12*height, 0.52*height, 0.8*height];

  // Create horizontal grid lines
  horizontalGrid = new gridLine(numRectangles,horizontalStartY,1,rectangleWidth,rectangleHeight);

  // Create vertical grid lines
  verticalGrid = new gridLine(numRectangles,verticalStartX,2,rectangleWidth,rectangleHeight);

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
      x: random(randomBoundary.startX,randomBoundary.endX),   // random x position within the boundary
      y: random(randomBoundary.startY,randomBoundary.endY),   // random y position within the boundary
      w: charaWidth,
      h: charaHeight, 
      state: random()>=0.5,   // return true or false, true means horizontal, and false means vertical
      boundary: randomBoundary  // assign random boundary
    }

    // create character 1 and character 2 then push it to charaBlocks array
    if(i % 2 == 0){
      charaBlocks.push(new chara1(charaDetails));
    }else{
      charaBlocks.push(new chara2(charaDetails));
    }
  }
}

function draw() {
  // To change the state every approximately 200 (switchInterval) divide by 60 (the default frameCount) = 3.33 seconds
  if(frameCount % switchInterval == 0){
    defaultState = !defaultState;
    // reset the colors of the grids back to the initial default colors
    horizontalGrid.resetColors(); 
    verticalGrid.resetColors();
  }

  // Conditions if it is in default state, draw the light mode
  if(defaultState){
    background(230, 213, 190);
    // loop through the charaBlocks array to draw the character with the movement and check if it is collided
    for(let chara of charaBlocks){
      chara.move();
      chara.checkCollision();
      chara.draw();

      // draw the grids without any color updates
      horizontalGrid.draw();
      verticalGrid.draw();
    }
  } else {
    // change the bacgkround to dark mode (black)
    background(0);
    // loop through the charaBlocks, but also check if the character is collided or not
    for(let chara of charaBlocks){
      chara.move();
      chara.checkCollision();
      chara.draw();

      // if the character is collided with the horizontal grid line, update the color with perlin-noise color
      if(chara.collidedHorizontal){
        horizontalGrid.updateColors();
      }else if(chara.collidedHorizontal == false){
        horizontalGrid.draw();
      }

      // if the character is collided with the vertical grid line, update the color with perlin-noise color
      if(chara.collidedVertical){
        verticalGrid.updateColors();
      }else if(chara.collidedVertical == false){
        verticalGrid.draw();
      }
  }
  stroke(0);
}
}

// Adapt to the changes of canvas size
function windowResized(){
  // ensure the square proportion so the grid line and character doesn't get stretched
  let size = Math.min(windowWidth,windowHeight);
  resizeCanvas(size, size);

  // recalculate the bound when we resize the screen
  horizontalGrid.recalculateBounds(numRectangles, rectangleWidth, rectangleHeight);
  verticalGrid.recalculateBounds(numRectangles, rectangleWidth, rectangleHeight);
}

// Rectangle class with basic constructor
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

  // add change color method here to be accessed in the grid line class
  changeColor(color){
    this.color = color;
  }
}

// grid line class
class gridLine {
    constructor(numRect, startingArray, direction, rectWidth, rectHeight){
        this.numRect = numRect;   // number of rectangles in the grid
        this.startingArray = startingArray;   // starting array value of each grid line
        this.direction = direction; // direction = 1 is horizontal, and 2 is vertical
        this.rectWidth = rectWidth; // width and height of each rectangle
        this.rectHeight = rectHeight;
        this.lineRectangles = [];   // array to store the grid lines
        this.offset = 0;  // offset of the perlin noise
        this.initialColors = [];  // array to store all initial colors
        this.initialiseLine(); // call the initialiseLine method
    }

    initialiseLine(){
        // initial colors
        let yellow = color(236, 214, 38);
        let blue = color(68, 105, 186);
        let beige = color(217, 216, 211);
        let red = color(176, 58, 46);

        // Create array of the color scheme
        let randomColors = [yellow, blue, beige, red];

        // loop through startingArray to generate the grid line
        for (let i=0; i<this.startingArray.length; i++){
            let start = this.startingArray[i];
            for (let j = 0; j < this.numRect; j++) {
                let x, y;
                // direction is 1 if horizontal, 2 if vertical
                if(this.direction === 1){
                    x = j * this.rectWidth;   // make the rectangles addition along the x axis if horizontal
                    y = start;
                }else{
                    x = start;
                    y = j * this.rectHeight;
                }
                let rectColor = random(randomColors); // set rectColor to random color selection
                this.initialColors.push(rectColor); // add each rectColor to initial colors array
                let gridLine = new Rectangle(x, y, this.rectWidth, this.rectHeight, rectColor); // create the grid line
                this.lineRectangles.push(gridLine); // add the grid line to the array
            }
        }
    }

      draw(){
          for(let rect of this.lineRectangles){
            rect.draw();  // draw the grid line
          }
          // Increment the offset
          this.offset += 0.003;
      }

      // update the colors to perlin noise color mapping
        updateColors() {
          // loop through each grid line and map the noise of the r,g,b color
          for (let i = 0; i < this.lineRectangles.length; i++) {
            let r = map(noise(this.offset + i * 0.1), 0, 1, 0, 255);
            let g = map(noise(this.offset + i * 0.1 + 10), 0, 1, 0, 255);
            let b = map(noise(this.offset + i * 0.1 + 20), 0, 1, 10, 255);
            // change the color of each grid line element
            this.lineRectangles[i].changeColor(color(r, g, b));
          }
        }
        // reset the colors to the initial color selection
        resetColors(){
          for(let i = 0; i< this.lineRectangles.length; i++){
            this.lineRectangles[i].changeColor(this.initialColors[i]);
          }
        }

        // recalculate the bounds
        recalculateBounds(numRect, rectWidth, rectHeight){
          this.numRect = numRect;
          this.rectWidth = rectWidth;
          this.rectHeight = rectHeight;
          this.lineRectangles = [];
          this.initialiseLine();
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
    this.collidedHorizontal = false;  // initial setup to false, which means not collided with the horizontal grid
    this.collidedVertical = false; // initial setup to false, which means not collided with the vertical grid
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
      this.x += this.speed * this.direction;  // Increment the x position by the speed times direction
    } else {
      this.y += this.speed * this.direction;  // Increment the y position by the speed times direction
    }
  }

  checkCollision(){
    // check the collision with the grid
    // if it moves horizontal, change the direction when it touches the x boundary
    // if it moves vertical, change the direction when it touches the y boundary
    if (this.Horizontal) {
        if (this.x <= this.boundary.startX || this.x > this.boundary.endX) {
            this.collidedHorizontal = true; // set the collided state to true
            this.direction *= -1; // change direction
        } else {
          this.collidedHorizontal = false; // set the collided state to false when it is no longer collided
        }
    } else {
        if (this.y <= this.boundary.startY || this.y > this.boundary.endY) {
            this.collidedVertical = true; // set the collided state to true
            this.direction *= -1; // change direction
        } else {
            this.collidedVertical= false; // set the collided state to false when it is no longer collided
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
    // Store the state of whether the character collide horizontally or vertically
    this.collidedHorizontal = false; // initial setup to false, which means not collided with the horizontal grid
    this.collidedVertical = false; // initial setup to false, which means not collided with the vertical grid
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
          this.collidedHorizontal = true; // set the collided state to true
          this.direction *= -1; // change direction
      } else {
        this.collidedHorizontal = false; // set the collided state to false when it is no longer collided
      }
    } else {
      if (this.y <= this.boundary.startY || this.y > this.boundary.endY) {
          this.collidedVertical = true; // set the collided state to true
          this.direction *= -1; // change direction
      } else {
          this.collidedVertical= false; // set the collided state to false when it is no longer collided
      }
    }
  }
}
// rectangles in grid variable settings
let numRectangles = 25;
let rectangleWidth;
let rectangleHeight;
let lineRectangles = [];
let drawRectangles = true;
let lineSpacing = 10;

// character blocks variable settings
let charaBlocks = [];   // character blocks array
let boundary = [];  // boundary array

// grid color variables
let yellow;
let blue;
let beige;
let red;

let randomColors;

function setup() {
  createCanvas(500, 500);
  rectangleWidth = width / numRectangles;
  rectangleHeight = height / numRectangles;

  // Create a colors scheme for the rectangles in grid
  yellow = color(236, 214, 38);
  blue = color(68, 105, 186);
  beige = color(217, 216, 211);
  red = color(176, 58, 46);

  // Create array of the color scheme
  randomColors = [yellow, blue, beige, red];

  // Define starting points for vertical grid lines
  let verticalStartX = [140, 220, 260, 380];

  // Define starting points for horizontal grid lines
  let horizontalStartY = [60, 260, 400];

  // Create horizontal grid lines
  for (let i = 0; i < horizontalStartY.length; i++) {
    let startY = horizontalStartY[i];
    for (let j = 0; j < numRectangles; j++) {
      let x = j * rectangleWidth;
      let y = startY;
      let horizontalLines = new Rectangle(x, y, rectangleWidth, rectangleHeight, random(randomColors));
      lineRectangles.push(horizontalLines);
    }
  }

  // Create vertical grid lines
  for (let i = 0; i < verticalStartX.length; i++) {
    let startX = verticalStartX[i];
    for (let j = 0; j < numRectangles; j++) {
      let x = startX;
      let y = j * rectangleHeight;
      let verticalLines = new Rectangle(x, y, rectangleWidth, rectangleHeight, random(randomColors));
      lineRectangles.push(verticalLines);
    }
  }

  // Character's block width and height
  let charaWidth = random(30,50); // randomised between 30 to 50
  let charaHeight = random(30,50);

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
  background(230, 213, 190);
  // draw the grid made up of rectangles
  if (drawRectangles) {
    for (const rect of lineRectangles) {
      rect.draw();
    }
  }

  // draw each character block
  for(let chara of charaBlocks){
    chara.move();
    chara.checkCollision();
    chara.draw();
  }
  
  stroke(0);
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

  checkCollision(){
    // check the collision with the grid
    // if it moves horizontal, change the direction when it touches the x boundary
    // if it moves vertical, change the direction when it touches the y boundary
    if(this.Horizontal){
      if(this.x <= this.boundary.startX || this.x > this.boundary.endX){
        this.direction *= -1;
      }
    } else {
      if(this.y <= this.boundary.startY || this.y > this.boundary.endY){
        this.direction *= -1;
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

    this.speed = random(2,5); // speed of character's movement
    this.direction = 1; // direction of character's movement (1 = move right or move down; -1 = move left or move up)
    this.Horizontal = charaDetails.state; // true if the character moves horizontally, and false if it moves vertically
    this.boundary = charaDetails.boundary; // set the boundary in which the character can move
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
    if(this.Horizontal){
      if(this.x <= this.boundary.startX || this.x > this.boundary.endX){
        this.direction *= -1;
      }
    } else {
      if(this.y <= this.boundary.startY || this.y > this.boundary.endY){
        this.direction *= -1;
      }
    }
  }
}
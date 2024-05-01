// 2D Array Project: An RPG Proof of Concept
// Seth Gardiner
// April 30th 2024
//
// Extra for Experts:
// - logic, expandability
// - many levels in one JSON, all retrievable

// in the level arrays
// 0 is a grass
// 1 is high ground (basically a wall)
// 3 is a pathway
// 5 is the player 

// initiallizing variables
let levelOneString;
let grassImage;
let highGroundImage;
let levels;
let highGround;
let grass;
let tileSize;
let playerImage;
let player;
let pathway;
let pathwayImage;
let currentLevel;
let firstIteration = true;
const PLAYER = 5;
const HIGHGROUND = 1;
const GRASS = 0;
const PATHWAY = 3;
let movementOfScreenX;
let movementOfScreenY;
let previousPlayerTile; 

// the ratio under no circumstances can be changed, everything will break
const TILESONSCREENHORIZONTALLY = 21;
const TILESONSCREENVERTICALLY = 11;


function preload() {
  // levelOneString = loadStrings("levelOne.txt");
  grassImage = loadImage("tiles/grass.jpg");
  highGroundImage = loadImage("tiles/highGround.png");
  levels = loadJSON("levels.json");
  playerImage = loadImage("sprites/player.jpg");
  pathwayImage = loadImage("tiles/pathway.jpg");
}

function setup() {
  // make the biggest 20/11 tile display you can
  if (windowHeight < windowWidth / TILESONSCREENHORIZONTALLY * TILESONSCREENVERTICALLY) {
    createCanvas(windowHeight / TILESONSCREENVERTICALLY * TILESONSCREENHORIZONTALLY, windowHeight); // if the window height is smaller than the width would allow
  }
  else {
    createCanvas(windowWidth, windowWidth / TILESONSCREENHORIZONTALLY * TILESONSCREENVERTICALLY); // the height of the window is enough to accomidate the maximum width off the width
  }

  tileSize = width / TILESONSCREENHORIZONTALLY;

  givePropertiesToTiles();
  givePropertiesToNPCsAndPlayer();

  levels.levelOne[player.yPosition][player.xPosition] = 5; // where the player starts off
}

function givePropertiesToTiles() {
  // setting tiles as objects with all their properties
  highGround = {
    isPassible: false,
    texture: highGroundImage,
  };
  grass = {
    isPassible: true,
    texture: grassImage,
  };
  previousPlayerTile = grass; // despite not technically fitting the bill of the function, this is important to be here as grass as an object does not exist before here, 
  // previousPlayerTile can be set to anything, it just indicates what the player is initially standing on
  pathway = {
    isPassible: true,
    texture: pathwayImage,
  };
}

function givePropertiesToNPCsAndPlayer() {
  player = {
    // plops the character dead center of the screen
    yPosition: Math.floor(levels.levelOne.length / 2),
    xPosition: Math.floor(levels.levelOne[Math.floor(levels.levelOne.length / 2)].length / 2),
    texture: playerImage,
  };
}

function draw() {
  background(220);

  // currently there is no functionality to switch between levels
  // any mention of levelOne is currenly a magic number situation
  drawLevel(levels.levelOne);
}

function centerScreenOnCharacter() {
  movementOfScreenX = -1 * player.xPosition + Math.floor(TILESONSCREENHORIZONTALLY / 2);
  movementOfScreenY = -1 * player.yPosition + Math.floor(TILESONSCREENVERTICALLY / 2);
}

function drawLevel(level) {
  // the only purpose of the local variable "level" is to make it easier to call the function drawLevel,
  // ex. now when you call it, that's all you need to do, as opposed to set the level and then call it
  currentLevel = level; // do to the reliance on the "currentLevel" variable, this is an incredibly important line
  if (firstIteration === true) {
    centerScreenOnCharacter();
    firstIteration = false;
  }

  noStroke();
  // for every element of the level, check which type it is, numbers are converted to objects, and objects are displayed
  for (let y = 0; y < currentLevel.length; y++) {
    for (let x = 0; x < currentLevel[y].length; x++) {
      if (currentLevel[y][x] === HIGHGROUND) {
        // replace numbers with objects in the level array
        currentLevel[y][x] = highGround;
      }
      else if (currentLevel[y][x] === GRASS) {
        // replace numbers with objects in the level array
        currentLevel[y][x] = grass;
      }
      else if (currentLevel[y][x] === PLAYER) {
        // replace numbers with objects in the level array
        currentLevel[y][x] = player;
      }
      else if (currentLevel[y][x] === PATHWAY) {
        // replace numbers with objects in the level array
        currentLevel[y][x] = pathway;
      }
      else if (currentLevel[y][x] === highGround) {
        // places the image at the location
        image(highGround.texture, (x + movementOfScreenX) * tileSize, (y - 0.5 + movementOfScreenY) * tileSize, tileSize, tileSize * 1.5);
      }
      else if (currentLevel[y][x] === grass) {
        // places the image at the location
        image(grass.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      else if (currentLevel[y][x] === pathway) {
        image(pathway.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      // places the image at the location
      else if (currentLevel[y][x] === player) {
        image(player.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
    }
  }
}

function movePlayer(xMovement, yMovement) {
    // old location
    let oldPlayerX = player.xPosition;
    let oldPlayerY = player.yPosition;

    // reset old location to be whatever the last tile was
    currentLevel[oldPlayerY][oldPlayerX] = previousPlayerTile;
    previousPlayerTile = currentLevel[player.yPosition + yMovement][player.xPosition + xMovement];

    // move player in code
    player.xPosition += xMovement;
    player.yPosition += yMovement;

    // move player in drawing
    currentLevel[player.yPosition][player.xPosition] = player;
}

function keyPressed() {
  // I am fully aware that checking if the block I am about to run into is solid 16 times is inefficient, 
  // as is spreading out all the possible circumstances of how you can move and if the screen should scroll. 
  // however, this is a reverted version of the code, because in my attempts to consolidate, I believe I have come across a bug outside of my control
  // For the purpose of the current code, which does not contain the bug, the following explanation of is pointless. 
  // I attemt to run an if statement wherein I check to see if the character is at an x position of 20, and if it is and I move to the left, scroll the screen. 
  // At an x position of 20, the screen does not scroll. Instead, at an x position of 21, the screen scrolls despite no command indicating to do so. 
  // I confimed in the console my logic is correct, when inputted in the console, the if statement logic returns false, then when I run the code
  // it procedes as if it returned true. I was utterly unable to fix this problem, and thus removed it completely. 



  // a bug exists where if you are on the cross line of both the top and bottom (or left and right) simultaneously it scrolls the screen when it should not

  // player movement keys
  // checks if you are too close to the edge of the screen to screen scroll

  // vertical movement 
  // to be clear: the cross line is the exact line at which the movement switches from a screen scroll to non-centered movement

  // behind cross line 
  if (player.yPosition < Math.floor(TILESONSCREENVERTICALLY / 2) || player.yPosition > currentLevel.length - Math.floor(TILESONSCREENVERTICALLY / 2 + 1) ) {
    if (key === "w" 
    // thanks to needing to check for solid tiles here, I cannot move the check for running off the map into the movePlayer function
    && player.yPosition - 1 >= 0 // checking if you are running off the map
    && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) { // checks if the block you're trying to enter is passible, needs to be checked last so as not to be checking the state of undefined
      movePlayer(0, -1);
    }
    else if (key === "s" 
    && player.yPosition + 1 <= currentLevel.length - 1 // checking if you are running off the map
    && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movePlayer(0, 1);
    }
  }

  // on cross line
  // at top
  else if (player.yPosition === Math.floor(TILESONSCREENVERTICALLY / 2) ) {
    if (key === "w" && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) {
      movePlayer(0, -1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movementOfScreenY -= 1;
      movePlayer(0, 1);
    }
  }
  // at bottom
  else if (player.yPosition === currentLevel.length - Math.floor(TILESONSCREENVERTICALLY / 2 + 1) ) {
    if (key === "w" && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) {
      movementOfScreenY += 1;
      movePlayer(0, -1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movePlayer(0, 1);
    }
  }

  // before cross line
  else if (player.yPosition > 5 || player.yPosition < currentLevel.length - Math.floor(TILESONSCREENVERTICALLY / 2 + 1) ) {
    if (key === "w" && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) {
      movementOfScreenY += 1;
      movePlayer(0, -1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movementOfScreenY -= 1;
      movePlayer(0, 1);
    }
  }

  // horizontal movement

  // behind cross line 
  if (player.xPosition < Math.floor(TILESONSCREENHORIZONTALLY / 2) || player.xPosition > currentLevel[player.yPosition].length - Math.floor(TILESONSCREENHORIZONTALLY / 2 + 1)) {
    if (key === "a" 
    && player.xPosition - 1 >= 0 // checking if you are running off the map
    && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) { // are you trying to enter a nonsolid tile to your left
      movePlayer(-1, 0);
    }
    else if (key === "d" 
    && player.xPosition + 1 <= currentLevel[player.yPosition].length - 1 // checking if you are running off the map
    && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) { // are you trying to enter a nonsolid tile to your right
      movePlayer(1, 0);
    }
  }

  // on cross line
  // at left
  else if (player.xPosition === Math.floor(TILESONSCREENHORIZONTALLY / 2)) {
    if (key === "a" && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) {
      movePlayer(-1, 0);
    }
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) {
      movementOfScreenX -= 1;
      movePlayer(1, 0);
    }
  }
  // at right
  else if (player.xPosition === currentLevel[player.yPosition].length - Math.floor(TILESONSCREENHORIZONTALLY / 2 + 1)) {
    if (key === "a" && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) {
      movementOfScreenX += 1;
      movePlayer(-1, 0);
    }
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) {
      movePlayer(1, 0);
    }
  }

  // before cross line
  else if (player.xPosition > Math.floor(TILESONSCREENHORIZONTALLY / 2) || player.xPosition > currentLevel[player.yPosition].length - Math.floor(TILESONSCREENHORIZONTALLY / 2 + 1)) {
    if (key === "a" && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) {
      movementOfScreenX += 1;
      movePlayer(-1, 0);
    }
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) {
      movementOfScreenX -= 1;
      movePlayer(1, 0);
    }
  }
}
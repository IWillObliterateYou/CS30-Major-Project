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
let firstIteration = true; // checks that this level load is the very first on the game preforms
let currentLevel;
let currentDoorSet;
let movementOfScreenX;
let movementOfScreenY;
let previousPlayerTileType;
let lastTileWasADoor = false;
let doors;
let dooredLastTurn;

// for use in the level arrays; defines what numbers correspond to which objects
const PLAYER = 5;
const GRASS = 0;
const HIGHGROUND = 1;
const PATHWAY = 3;

// the ratio under no circumstances can be changed, everything will break
const TILES_ON_SCREEN_HORIZONTALLY = 21;
const TILES_ON_SCREEN_VERTICALLY = 11;


function preload() {
  grassImage = loadImage("assets/tiles/grass.jpg");
  highGroundImage = loadImage("assets/tiles/highGround.png");
  levels = loadJSON("levels.json");
  doors = loadJSON("doors.json");
  playerImage = loadImage("assets/sprites/player.jpg");
  pathwayImage = loadImage("assets/tiles/pathway.jpg");
}

function setup() {
  // make the biggest 20/11 tile display you can
  if (windowHeight < windowWidth / TILES_ON_SCREEN_HORIZONTALLY * TILES_ON_SCREEN_VERTICALLY) {
    createCanvas(windowHeight / TILES_ON_SCREEN_VERTICALLY * TILES_ON_SCREEN_HORIZONTALLY, windowHeight); // if the window height is smaller than the width would allow
  }
  else {
    createCanvas(windowWidth, windowWidth / TILES_ON_SCREEN_HORIZONTALLY * TILES_ON_SCREEN_VERTICALLY); // the height of the window is enough to accomidate the maximum width off the width
  }

  tileSize = width / TILES_ON_SCREEN_HORIZONTALLY;

  givePropertiesToTiles();
  givePropertiesToNPCsAndPlayer();

  // sets the default level to levelOne
  currentLevel = levels.levelOne;
  currentDoorSet = doors.levelOne;
  levels.levelOne[player.yPosition][player.xPosition] = PLAYER; // where the player starts off in level one
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
  previousPlayerTileType = grass; // despite not technically fitting the bill of the function, this is important to be here as grass as an object does not exist before here, 
  // previousPlayerTile can be set to anything, it just indicates what the player is initially standing on
  pathway = {
    isPassible: true,
    texture: pathwayImage,
  };
}

function givePropertiesToNPCsAndPlayer() {
  player = {
    // plops the character dead center of the screen in the first level
    yPosition: Math.floor(levels.levelOne.length / 2),
    xPosition: Math.floor(levels.levelOne[Math.floor(levels.levelOne.length / 2)].length / 2),
    texture: playerImage,
    previousXPosition: Math.floor(levels.levelOne.length / 2),
    previousYPosition: Math.floor(levels.levelOne[Math.floor(levels.levelOne.length / 2)].length / 2),
  };
}

function draw() {
  background(220);

  drawCurrentLevel();

  shouldTileBeTreatedAsDoor(currentDoorSet);
}

// uses the doors.json, each level has an entries and exits sister property with the same name in the doors json instead
// the scheme is: each array within the property is one two-way door (because you can backtrack)
// the first number is the y position, the second is the x position, the third is the "code" for the entrance, 
// the fourth is the code for the level to go to, the fifth is the required y screen shift value to be set (importantly, set, not shifted), the sixth is the required x screen shift to be set
// because each door is only connected to one other point, each link has a unique name within its property, whatever code matches in a different level is the one that you will enter into
// it is a bit overcomplicated for such a small amount of simple levels, but it is meant to be upscaled easily
function levelShift(levelCode, doorCode) {
// replace last tile to grass or whatever it needs to be before shifting 
  currentLevel[player.yPosition][player.xPosition] = previousPlayerTileType;
  previousPlayerTileType = currentLevel[player.yPosition][player.xPosition];

  if (levelCode === "l1") {
    currentLevel = levels.levelOne;
    currentDoorSet = doors.levelOne;
  }
  else if (levelCode === "l2") {
    currentLevel = levels.levelTwo;
    currentDoorSet = doors.levelTwo;
  }
  else if (levelCode === "l3") {



// use maps to call doors by code




    currentLevel = levels.levelThree;
    currentDoorSet = doors.levelThree;
  }


  let currentDoorCode = doorCode;

  for (let secondDoor of currentDoorSet) {
    if (currentDoorCode === secondDoor[2]) {
      // setting up the player as needed where it needs to be
      player.xPosition = secondDoor[1];
      player.yPosition = secondDoor[0];
      movementOfScreenY = secondDoor[4];
      movementOfScreenX = secondDoor[5];

      // moving the player sprite
      currentLevel[player.yPosition][player.xPosition] = player;

      // only one door can (and should) activate at once, so just end the function here
      return true;
    }
  }
}

function checkIfLastTileWasADoor(levelDoors) {
  // currently not working










  // check if the previous tile was a door with another for loop
  // is there a way to check if a value exists anywhere in an array outside of a for loop? 
  for (let door of levelDoors) {
    if (door[0] === player.previousYPosition && door[1] === player.previousXPosition) { //  checking if last turn was on a door on the same level {
      lastTileWasADoor = true;
    }
    lastTileWasADoor = false;
  }
}

function shouldTileBeTreatedAsDoor(levelDoors) {
  checkIfLastTileWasADoor(levelDoors);

  // importantly this does not check if this tile is a door, because if you enter a level through a passageway were more than one door are directly 
  // adjacent and you move into one of those, level shift should not be triggered
  for (let doorNumber = 0; doorNumber < levelDoors.length; doorNumber++) {
    if (player.yPosition === levelDoors[doorNumber][0] && player.xPosition === levelDoors[doorNumber][1]
      && lastTileWasADoor === false
      && dooredLastTurn === false) { // checking if the last turn was followed by a levelshift
      levelShift(levelDoors[doorNumber][3], levelDoors[doorNumber][2]);
      dooredLastTurn = true;
    }
  }
}

function centerScreenOnCharacter() {
  movementOfScreenX = -1 * player.xPosition + Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2);
  movementOfScreenY = -1 * player.yPosition + Math.floor(TILES_ON_SCREEN_VERTICALLY / 2);
}

function convertLevelArrayFromNumbersToObjects() {
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
    }
  }
}

function drawCurrentLevel(level) {
  // only start dead center in level one, any other level's start will be determined by how you enter it/the level itself
  if (currentLevel === levels.levelOne && firstIteration) {
    centerScreenOnCharacter();
    firstIteration = false;
  }

  noStroke();

  convertLevelArrayFromNumbersToObjects();

  // for every element of the level, check which type it is and displays it
  for (let y = 0; y < currentLevel.length; y++) {
    for (let x = 0; x < currentLevel[y].length; x++) {
      if (currentLevel[y][x] === highGround) {
        // places the image at the location
        image(highGround.texture, (x + movementOfScreenX) * tileSize, (y - 0.5 + movementOfScreenY) * tileSize, tileSize, tileSize * 1.5);
      }
      else if (currentLevel[y][x] === grass) {
        image(grass.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      else if (currentLevel[y][x] === pathway) {
        image(pathway.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      else if (currentLevel[y][x] === player) {
        image(player.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
    }
  }
}

function movePlayer(xMovement, yMovement) {
  dooredLastTurn = false;
  // old location
  player.previousXPosition = player.xPosition;
  player.previousYPosition = player.yPosition;

  // reset old location to be whatever the last tile was
  currentLevel[player.previousYPosition][player.previousXPosition] = previousPlayerTileType;
  previousPlayerTileType = currentLevel[player.yPosition + yMovement][player.xPosition + xMovement];

  // move player in code
  player.xPosition += xMovement;
  player.yPosition += yMovement;

  // move player in drawing
  currentLevel[player.yPosition][player.xPosition] = player;
}

function keyPressed() {
  // I am fully aware that checking if the block I am about to run into is solid 16 times is inefficient, 
  // as is spreading out all the possible circumstances of how you can move and if the screen should scroll. 
  // however, due to a major bug explained in my 2D array project, I cannot do it that way

  // player movement keys
  // checks if you are too close to the edge of the screen to screen scroll

  // vertical movement 
  // to be clear: the cross line is the exact line at which the movement switches from a screen scroll to non-centered movement

  // behind cross line 
  if (player.yPosition < Math.floor(TILES_ON_SCREEN_VERTICALLY / 2) || player.yPosition > currentLevel.length - Math.floor(TILES_ON_SCREEN_VERTICALLY / 2 + 1)) {
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
  else if (player.yPosition === Math.floor(TILES_ON_SCREEN_VERTICALLY / 2)) {
    if (key === "w" && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) {
      movePlayer(0, -1);
    }
    // extra check added to see if the level is the size of the level, which would cause screen to scroll when it shouldn't
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true && player.yPosition !== Math.floor(TILES_ON_SCREEN_VERTICALLY / 2)) {
      movementOfScreenY -= 1;
      movePlayer(0, 1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movePlayer(0, 1);
    }
  }
  // at bottom
  else if (player.yPosition === currentLevel.length - Math.floor(TILES_ON_SCREEN_VERTICALLY / 2 + 1)) {
    if (key === "w" && currentLevel[player.yPosition - 1][player.xPosition].isPassible === true) {
      movementOfScreenY += 1;
      movePlayer(0, -1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movePlayer(0, 1);
    }
  }

  // before cross line
  else if (player.yPosition > 5 || player.yPosition < currentLevel.length - Math.floor(TILES_ON_SCREEN_VERTICALLY / 2 + 1)) {
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
  if (player.xPosition < Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2) || player.xPosition > currentLevel[player.yPosition].length - Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2 + 1)) {
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
  else if (player.xPosition === Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2)) {
    if (key === "a" && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) {
      movePlayer(-1, 0);
    }
    // extra check added to see if the level is the size of the level, which would cause screen to scroll when it shouldn't
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true && player.xPosition !== currentLevel[player.yPosition].length - Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2 + 1)) {
      movementOfScreenX -= 1;
      movePlayer(1, 0);
    }
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) {
      movePlayer(1, 0);
    }
  }
  // at right
  else if (player.xPosition === currentLevel[player.yPosition].length - Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2 + 1)) {
    if (key === "a" && currentLevel[player.yPosition][player.xPosition - 1].isPassible === true) {
      movementOfScreenX += 1;
      movePlayer(-1, 0);
    }
    else if (key === "d" && currentLevel[player.yPosition][player.xPosition + 1].isPassible === true) {
      movePlayer(1, 0);
    }
  }

  // before cross line
  else if (player.xPosition > Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2) || player.xPosition > currentLevel[player.yPosition].length - Math.floor(TILES_ON_SCREEN_HORIZONTALLY / 2 + 1)) {
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
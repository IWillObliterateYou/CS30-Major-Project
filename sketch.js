// 2D Array Project: An Slightly More Fleshed Out RPG Proof of Concept
// Seth Gardiner
// April 30th 2024
//
// Extra for Experts:
// - 

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
let CurrentDoorSet;
let movementOfScreenX;
let movementOfScreenY;
let lastTileWasADoor = false;
let dooredLastTurn;
let spriteGrid;
let slimeImage;
let gameState = "openWorld";
let enemyHealth;
let battleSlimeImage;
let enemyAhead;
let enemyType;
let enemy;
let attackButton;

// for the sprite grid
const PLAYER = 5; // probably delete this
const SLIME = 4;

// for use in the level arrays; defines what numbers correspond to which objects
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
  playerImage = loadImage("assets/sprites/player.jpg");
  pathwayImage = loadImage("assets/tiles/pathway.jpg");
  slimeImage = loadImage("assets/sprites/slime.png");
  battleSlimeImage = loadImage("assets/sprites/slimeBattle.png");
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
  givePropertiesToPlayer();

  // sets the default level to levelOne
  currentLevel = levels.levelOne;
  CurrentDoorSet = LVL_ONE_DOORS;

  generateSpriteOverlayGrid();
  spawnEnemies();
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
  pathway = {
    isPassible: true,
    texture: pathwayImage,
  };
}

function givePropertiesToPlayer() {
  player = {
    // plops the character dead center of the screen in the first level
    yPosition: Math.floor(levels.levelOne.length / 2),
    xPosition: Math.floor(levels.levelOne[Math.floor(levels.levelOne.length / 2)].length / 2),
    texture: playerImage,
    previousXPosition: Math.floor(levels.levelOne.length / 2),
    previousYPosition: Math.floor(levels.levelOne[Math.floor(levels.levelOne.length / 2)].length / 2),
    health: 100,
    attack: 10
  };
}

function draw() {
  if (gameState === "openWorld") {
    drawCurrentLevel();
    drawSpriteGrid();
    drawTallerTiles();

    for (let possibleEnemy in spriteGrid) {
      if (possibleEnemy instanceof slimeEnemy) {
        possibleEnemy.movement();
      }
    }
  }
  else if (gameState === "combat") {
    loadCombat(enemy);
    attackButton.draw();
  }
}

// temporary maps of the doors in the sketch instead of JSON
// because of this, the doors.JSON does absolutely nothing
// important note: doors need to be hardcodes, any map changes must be checked with the doors 
const LVL_ONE_DOORS = new Map([
  ["e1", [14, 30, "l2", -9, -10]],
  ["e2", [15, 30, "l2", -10, -10]],
  ["e3", [16, 30, "l2", -11, -10]]
]);

const LVL_TWO_DOORS = new Map([
  ["e1", [4, 0, "l1", 0, 0]],
  ["e2", [5, 0, "l1", 0, 0]],
  ["e3", [6, 0, "l1", 0, 0]],
  ["2e1", [4, 20, "l3", 0, 0]],
  ["2e2", [5, 20, "l3", 0, 0]],
  ["2e3", [6, 20, "l3", 0, 0]]
]);

const LVL_THREE_DOORS = new Map([
  ["2e1", [18, 0, "l2", -13, 0]],
  ["2e2", [19, 0, "l2", -14, 0]],
  ["2e3", [20, 0, "l2", -15, 0]]
]);

class slimeEnemy {
  constructor(x, y, aiType, startingDirection) {
    this.xPosition = x;
    this.yPosition = y;
    this.ai = aiType;
    this.dy = 1; // enemy movement distance per movement vertically
    this.dx = 1; // enemy movement distance per movement horizontally
    let directionOfTravel = startingDirection;
    this.movementCounter = 0;
    this.health = 50;
    this.maxHealth = 50;
    this.attack = 10;
    this.combatAI = "hyperAgressive";
    this.texture = slimeImage;
    this.combatTexture = battleSlimeImage;
  }
  movement() {
    if (this.movementCounter > this.movementCounter + 1000) {
      this.aiActivate();
      this.movementCounter = millis();
    }
  }
  aiActivate() {
    if (this.ai === "vertical") {
      this.verticalShuffleAI();
    }
    else if (this.ai === "horizontal") {
      this.horizontalShuffleAI;
    }
  }
  verticalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "up" && spriteGrid[this.y - 1] !== player) {
      // going up
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.y - this.dy - 2][this.x].isPassible === true) {

        this.move(0, -this.dy);
      }
      else if (currentLevel[this.y - this.dy - 2][this.x].isPassible === false) {
        this.directionOfTravel = "down";
      }
    }
    else if (this.directionOfTravel === "down") {
      // going down
      if (currentLevel[this.y + this.dy + 2][this.x].isPassible === true) {

        this.move(0, this.dy);
      }
      else if (currentLevel[this.y - this.dy - 2][this.x].isPassible === false) {
        this.directionOfTravel = "up";
      }
    }
    else if (spriteGrid[this.y - 1 === player || this.y + 1 === player]) {
      enterCombat(slimeEnemy);
    }
  }
  horizontalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "left" && spriteGrid[this.y][this.x - 1] !== player) {
      // going left
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.y][this.x - this.dx - 2].isPassible === true
        && this.directionOfTravel === "left") {

        this.move(-this.dx, 0);
      }
      else if (currentLevel[this.y][this.x - this.dx - 2].isPassible === false
        && this.directionOfTravel === "left") {
        this.directionOfTravel = "right";
      }
    }
    else if (this.directionOfTravel === "right") {
      // going right
      if (currentLevel[this.y][this.x + this.dx + 2].isPassible === true
        && this.directionOfTravel === "right") {

        this.move(this.dx, 0);
      }
      else if (currentLevel[this.y][this.x + this.dx + 2].isPassible === false
        && this.directionOfTravel === "right") {
        this.directionOfTravel = "left";
      }
    }
    else if (spriteGrid[this.y][this.x - 1 === player || this.x + 1 === player]) {
      enterCombat(slimeEnemy);
    }
  }
  circleAI() {
    // currently unused
  }
  move(dx, dy) {
    spriteGrid[this.yPosition + dy][this.xPosition + dx] = this;
    spriteGrid[this.yPosition - dy][this.xPosition - dx] = "";
  }
}

// sets up all the stuff for combat that is called only once
function enterCombat(enemy) {
  enemyHealth = enemy.health;

  gameState = "combat";
}

// runs combat after entering
function loadCombat(enemy) {
  background(0, 220, 255);

  // mapping the enemy.combatTexture to adjust to varying window sizes

  // loading one enemy dead center
  image(enemy.combatTexture, width / 2 - enemy.combatTexture.width / 2, height / 2 - enemy.combatTexture.height, enemy.combatTexture.width, enemy.combatTexture.height);

  // gui
  // enemy healthbar
  // adjusted health changes the health value of the enemy to fit the width of the enemy healthbar
  let adjustedHealth = map(enemy.health, 0, enemy.maxHealth, 0, enemy.combatTexture.width + 40);

  stroke("black");
  // stroke weight is set because I need to adjust the locations of certain gui elements so they don't barely clip off-screen
  strokeWeight(1);
  fill("grey");
  rect(width / 2 - enemy.combatTexture.width / 2 - 20, height / 2 - enemy.combatTexture.height - 50, enemy.combatTexture.width + 40, 20, 10);
  fill("red");
  rect(width / 2 - enemy.combatTexture.width / 2 - 20, height / 2 - enemy.combatTexture.height - 50, adjustedHealth, 20, 10);

  // player 
  // action box
  fill(180, 150);
  rect(20, height / 4 * 3 - 2, width / 5, height / 4, 5);
  // stat box
  rect(20 + width / 5, height / 4 * 3 - 2, width / 5 * 4 - 40, height / 4, 5);

  let combatActionCollision = "none";

  // action box word boxes
  // if (combatActionCollision === "attack") { // if the colour of the boxes changed, reset it for the remaining boxes
  //   fill(210, 150);
  // }
  // rect(30, height / 4 * 3 + 2, width / 5 - 20, (height / 4) / 4 - 2, 5);  // attack
  // fill(180, 150);
  // if (combatActionCollision === "placeholder1") {
  //   fill(210, 150);
  // }
  // rect(30, height / 4 * 3 + 2 + ((height / 4) / 4) - 2, width / 5 - 20, (height / 4) / 4 - 2, 5); // placeholder 1
  // fill(180, 150);
  // if (combatActionCollision === "placeholder2") {
  //   fill(210, 150);
  // }
  // rect(30, height / 4 * 3 + 2 + ((height / 4) / 4) * 2 - 4, width / 5 - 20, (height / 4) / 4 - 2, 5); // placeholder 2
  // fill(180, 150);  
  // if (combatActionCollision === "placeholder3") {
  //   fill(210, 150);
  // }
  // rect(30, height / 4 * 3 + 2 + ((height / 4) / 4) * 3 - 6, width / 5 - 20, (height / 4) / 4 - 2, 5); // placeholder 3

  makeTheCombatButtonsWork();
  attackButton.draw();

  // words in the action box
  textAlign(CENTER, CENTER);
  noStroke();
  fill("black");
  textSize((height / 4 - 6) / 4 - 5);
  // text("Attack", 30, height / 4 * 3 + 2, width / 5 - 20, (height / 4) / 4 - 2);
  // text("Placeholder", 30, height / 4 * 3 + 2 + ((height / 4) / 4) - 2, width / 5 - 20, (height / 4) / 4 - 2, 5);
  // text("Placeholder", 30, height / 4 * 3 + 2 + ((height / 4) / 4) * 2 - 4, width / 5 - 20, (height / 4) / 4 - 2, 5);
  // text("Placeholder", 30, height / 4 * 3 + 2 + ((height / 4) / 4) * 3 - 6, width / 5 - 20, (height / 4) / 4 - 2, 5);
  noStroke();
}

function makeTheCombatButtonsWork() {
  attackButton = new Clickable();
  attackButton.locate(30, height / 4 * 3 + 2);
  attackButton.resize(width / 5 - 20, (height / 4) / 4 - 2);
  attackButton.color = "#69aaaaaa";
  attackButton.cornerRadius = 5;       //Corner radius of the clickable (float)
  attackButton.strokeWeight = 1;        //Stroke width of the clickable (float)
  attackButton.onHover = function() {
    attackButton.color = "#aaffffff";
  };
}


// uses the doors.json, each level has an entries and exits sister property with the same name in the doors json instead
// the scheme is: each array within the property is one two-way door (because you can backtrack)
// the key is the "code" for the door, the first number in the array is the y position, the second is the x position, 
// the third is the code for the level to go to, the fourth is the required y screen shift value to be set (importantly, set, not shifted), the fifth is the required x screen shift to be set
// because each door is only connected to one other point, each link has a unique name within its property, whatever code matches in a different level is the one that you will enter into
// it is a bit overcomplicated for such a small amount of simple levels, but it is meant to be upscaled easily
function levelShift(levelCode, doorCode) {
  let ExitDoorSet;

  if (levelCode === "l1") {
    currentLevel = levels.levelOne;
    ExitDoorSet = LVL_ONE_DOORS;
  }
  else if (levelCode === "l2") {
    currentLevel = levels.levelTwo;
    ExitDoorSet = LVL_TWO_DOORS;
  }
  else if (levelCode === "l3") {
    currentLevel = levels.levelThree;
    ExitDoorSet = LVL_THREE_DOORS;
  }


  // goal: move doors to the doors.JSON which currently does nothing
  // https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
  // saveJSON



  let secondDoor = ExitDoorSet.get(doorCode);

  // setting up the player as needed where it needs to be
  player.xPosition = secondDoor[1];
  player.yPosition = secondDoor[0];
  movementOfScreenY = secondDoor[3];
  movementOfScreenX = secondDoor[4];

  generateSpriteOverlayGrid();
  spawnEnemies();

  // moving the player sprite
  spriteGrid[player.yPosition][player.xPosition] = player;

  // setting the exit set to now be the current set and removing the exit set
  CurrentDoorSet = ExitDoorSet;
  ExitDoorSet = "";

  // only one door can (and should) activate at once, so just end the function here
  return;
}

function spawnEnemies() {
  for (let y = 0; y < spriteGrid.length; y++) {
    for (let x = 0; x < spriteGrid[y].length; x++) {
      if (currentLevel[y][x] === 4) {
        spriteGrid[y][x] = new slimeEnemy(x, y, "vertical", "up");
        currentLevel[y][x] = GRASS;
      }
    }
  }
}

function titleScreen() {
  // sky background
  background(0, 220, 255);

  // a mountain midground
  // a forest foreground
}

function shouldTileBeTreatedAsDoor(levelDoors) {
  // level doors is the initially the LVL_ONE_DOORS map

  //checkIfLastTileWasADoor(levelDoors);

  // importantly this does not check if this tile is a door, because if you enter a level through a passageway were more than one door are directly 
  // adjacent and you move into one of those, level shift should not be triggered
  for (let [key, value] of levelDoors) {
    if (player.yPosition === value[0] && player.xPosition === value[1]) {  // checks if you're on a door

      if (dooredLastTurn === false) {
        levelShift(value[2], key);
      }

      dooredLastTurn = true;
      return;
    }
  }
  dooredLastTurn = false;
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
      else if (currentLevel[y][x] === PATHWAY) {
        // replace numbers with objects in the level array
        currentLevel[y][x] = pathway;
      }
    }
  }
}

function convertSpritePlayerToObjectPlayer() {
  for (let y = 0; y < currentLevel.length; y++) {
    for (let x = 0; x < currentLevel[y].length; x++) {
      if (spriteGrid[y][x] === PLAYER) {
        // replace numbers with objects in the sprite array
        spriteGrid[y][x] = player;
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
      if (currentLevel[y][x] === grass) {
        image(grass.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      else if (currentLevel[y][x] === pathway) {
        image(pathway.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
    }
  }
}

function drawSpriteGrid() {
  convertSpritePlayerToObjectPlayer();

  for (let y = 0; y < spriteGrid.length; y++) {
    for (let x = 0; x < spriteGrid[y].length; x++) {
      if (spriteGrid[y][x] === player) {
        image(player.texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      if (spriteGrid[y][x] instanceof slimeEnemy) {
        image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
    }
  }
}

function drawTallerTiles() {
  for (let y = 0; y < currentLevel.length; y++) {
    for (let x = 0; x < currentLevel[y].length; x++) {
      if (currentLevel[y][x] === highGround) {
        // taller tiles need to be able to overlap the player, so they need to by their own function to be drawn last
        image(highGround.texture, (x + movementOfScreenX) * tileSize, (y - 0.5 + movementOfScreenY) * tileSize, tileSize, tileSize * 1.5);
      }
    }
  }
}

function generateSpriteOverlayGrid() {
  spriteGrid = [];
  // this uses the exact same logic as the illustrations so it should be the same dimensions as the level
  for (let y = 0; y < currentLevel.length; y++) {
    // setting up the sprite grid 2D array
    spriteGrid.push([]);
    for (let x = 0; x < currentLevel[y].length; x++) {
      // insert any enemy type as an && currentLevel[y][x] !== (insert here)
      if (player.yPosition === y && player.xPosition === x) {
        spriteGrid[y].push(PLAYER);
      }
      else {
        spriteGrid[y].push("");
      }
    }
  }
}

function checkIfEnemyInTheWay(xMovement, yMovement) {
  // this only works if the absolute value of xMovement and yMovement never exceed 1

  // checking below and above, right and left
  if (spriteGrid[player.yPosition + yMovement] instanceof slimeEnemy) {
    enemy = spriteGrid[player.yPosition + yMovement];
    return true;
  }
  else if (spriteGrid[player.yPosition][player.xPosition + xMovement] instanceof slimeEnemy) {
    enemy = spriteGrid[player.yPosition][player.xPosition + xMovement];
    return true;
  }
  return false;
}

function movePlayer(xMovement, yMovement) {
  // always move regardless of if running into enemy

  // old location
  player.previousXPosition = player.xPosition;
  player.previousYPosition = player.yPosition;

  // reset old location to be empty
  spriteGrid[player.previousYPosition][player.previousXPosition] = "";

  // if there is an enemy do not finish moving the player. The player will be erased until combat ends 
  // while relevant variables (xMovemet, yMovement, player.xPosition, player.yPosition) are saved
  if (checkIfEnemyInTheWay(xMovement, yMovement)) {
    enterCombat(enemy);
  }
  else {
    // move player in code
    player.xPosition += xMovement;
    player.yPosition += yMovement;

    // move player in drawing
    spriteGrid[player.yPosition][player.xPosition] = player;
  }

  // checking for doors
  shouldTileBeTreatedAsDoor(CurrentDoorSet);
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
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true && currentLevel.length === TILES_ON_SCREEN_VERTICALLY) {
      movePlayer(0, 1);
    }
    else if (key === "s" && currentLevel[player.yPosition + 1][player.xPosition].isPassible === true) {
      movementOfScreenY -= 1;
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
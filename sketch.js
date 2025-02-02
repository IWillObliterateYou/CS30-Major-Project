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
let minotaurImage;
let battleMinotaurImage;
let enemyAhead;
let enemyType;
let enemy;
let attackButton;
let placeholderButton1;
let placeholderButton2;
let placeholderButton3;
let combatTurn = "player";
let turnTimer;
let yMovementForCombat;
let xMovementForCombat;
let ignoringEnemy = false;
let enemyMovementTimer = 0;
let didEnemyTriggerCombat;
let timeBetweenOpenWorldEnemyMovements = 250;
let startGameButton;

// for the sprite grid
const SLIME = 4;
const PLAYER = 5;

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
  minotaurImage = loadImage("assets/sprites/minotaur.png");
  battleMinotaurImage = loadImage("assets/sprites/minotaurBattle.png");
}

function setup() {
  // make the biggest tile display you can with the tiles on screen vertically and horizontally
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

  titleScreenButtons();
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
    maxHealth: 100,
    attack: 30
  };
}

function draw() {
  if (gameState === "openWorld") {
    drawCurrentLevel();
    drawSpriteGrid();
    drawTallerTiles();

    for (let row of spriteGrid) {
      for (let possibleEnemy of row) {
        if (possibleEnemy instanceof slimeEnemy) {
          possibleEnemy.movement();
        }
      }
    }
  }
  else if (gameState === "combat") {
    loadCombat(enemy);
    attackButton.draw();
  }
  else if (gameState === "failure") {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(100);
    text("You Died", width / 2, height / 2);
  }
  // doesn't work so it is never called
  else if (gameState === "titleScreen") {
    titleScreen();
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
    this.directionOfTravel = startingDirection;
    this.movementCounter = 0;
    this.currentHealth = 50;
    this.maxHealth = 50;
    this.attack = 10;
    this.combatAI = "hyperAggressive";
    this.texture = slimeImage;
    this.combatTexture = battleSlimeImage;
    this.twoStepEnemyMovementStageOne = true;
    this.twoTileTurnCounter = 0;
  }
  movement() {
    if (millis() > this.movementCounter + timeBetweenOpenWorldEnemyMovements && gameState === "openWorld") {
      this.aiActivate();
      this.movementCounter = millis();
    }
  }
  aiActivate() {
    if (this.ai === "vertical") {
      this.verticalShuffleAI();
      this.dx = 0;
    }
    else if (this.ai === "horizontal") {
      this.horizontalShuffleAI();
      this.dy = 0;
    }
    else if (this.ai === "circle") {
      this.circleAI();
    }
  }
  circleAI() {
    // all directiions of travel place the enemy in the corners
    // this is a counterclockwise circle

    // checking for the player in the intended direction here for simplicity
    if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] !== player || // checking for player above
      this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] !== player || // checking for player below
      this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition - this.dx] !== player || // checking for player to the right
      this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition + this.dx] !== player) // checking for player left
    {
      if (this.directionOfTravel === "up") {
        this.twoTileTurnCounter += 1;
        // if the enemy has moved a number of times divisible by 4 (because this movement is called twice per tile) 
        // and this is not the first movement, move and change direction, otherwise just move;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "left";
        }
        this.move(0, -this.dy);
      }
      else if (this.directionOfTravel === "left") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "down";
        }
        this.move(-this.dx, 0);
      }
      else if (this.directionOfTravel === "down") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "right";
        }
        this.move(0, this.dy);
      }
      else if (this.directionOfTravel === "right") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "up";
        }
        this.move(this.dx, 0);
      }
    }
    // if there is the player in the way
    else {
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  verticalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] !== player) {
      // going up
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.yPosition - this.dy - 2][this.xPosition].isPassible && spriteGrid[this.yPosition - this.dy][this.xPosition] === "") {

        this.move(0, -this.dy);
      }
      else {
        this.directionOfTravel = "down";
        this.twoStepEnemyMovementStageOne = false; // sticks them in the center of their tile
      }
    }
    else if (this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] !== player) {
      // going down
      if (currentLevel[this.yPosition + this.dy + 2][this.xPosition].isPassible && spriteGrid[this.yPosition + this.dy][this.xPosition] === "") {

        this.move(0, this.dy);
      }
      else {
        this.directionOfTravel = "up";
        this.twoStepEnemyMovementStageOne = false;
      }
    }
    else if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] === player || // if the player is above and going up
      this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] === player) { // if the player is below and going down
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  horizontalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition - this.dx] !== player) {
      // going up
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.yPosition][this.xPosition - this.dx - 2].isPassible && spriteGrid[this.yPosition][this.xPosition - this.dx] === "") {

        this.move(-this.dx, 0);
      }
      else {
        this.directionOfTravel = "right";
        this.twoStepEnemyMovementStageOne = false; // sticks them in the center of their tile
      }
    }
    else if (this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition + this.dx] !== player) {
      // going down
      if (currentLevel[this.yPosition][this.xPosition + this.dx + 2].isPassible && spriteGrid[this.yPosition][this.xPosition + this.dx] === "") {
        this.move(this.dx, 0);
      }
      else {
        this.directionOfTravel = "left";
        this.twoStepEnemyMovementStageOne = false;
      }
    }
    else if (this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition - this.dx] === player || // if the player is above and going up
      this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition + this.dx] === player) { // if the player is below and going down
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  move(dx, dy) {
    this.twoStepEnemyMovementStageOne = !this.twoStepEnemyMovementStageOne;
    if (!this.twoStepEnemyMovementStageOne) {
      spriteGrid[this.yPosition + dy][this.xPosition + dx] = this;
      this.yPosition += dy;
      this.xPosition += dx;
      spriteGrid[this.yPosition - dy][this.xPosition - dx] = "";
    }
  }
}

class minotaurEnemy {
  constructor(x, y, aiType, startingDirection) {
    this.xPosition = x;
    this.yPosition = y;
    this.ai = aiType;
    this.dy = 1; // enemy movement distance per movement vertically
    this.dx = 1; // enemy movement distance per movement horizontally
    this.directionOfTravel = startingDirection;
    this.movementCounter = 0;
    this.currentHealth = 150;
    this.maxHealth = 150;
    this.attack = 30;
    this.combatAI = "aggressive";
    this.texture = minotaurImage;
    this.combatTexture = battleMinotaurImage;
    this.twoStepEnemyMovementStageOne = true;
  }
  movement() {
    if (millis() > this.movementCounter + timeBetweenOpenWorldEnemyMovements && gameState === "openWorld") {
      this.aiActivate();
      this.movementCounter = millis();
    }
  }
  aiActivate() {
    if (this.ai === "vertical") {
      this.verticalShuffleAI();
      this.dx = 0;
    }
    else if (this.ai === "horizontal") {
      this.horizontalShuffleAI();
      this.dy = 0;
    }
  }
  verticalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] !== player) {
      // going up
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.yPosition - this.dy - 2][this.xPosition].isPassible && spriteGrid[this.yPosition - this.dy][this.xPosition] === "") {

        this.move(0, -this.dy);
      }
      else {
        this.directionOfTravel = "down";
        this.twoStepEnemyMovementStageOne = false; // sticks them in the center of their tile
      }
    }
    else if (this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] !== player) {
      // going down
      if (currentLevel[this.yPosition + this.dy + 2][this.xPosition].isPassible && spriteGrid[this.yPosition + this.dy][this.xPosition] === "") {

        this.move(0, this.dy);
      }
      else {
        this.directionOfTravel = "up";
        this.twoStepEnemyMovementStageOne = false;
      }
    }
    else if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] === player || // if the player is above and going up
      this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] === player) { // if the player is below and going down
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  horizontalShuffleAI() {
    // checking what direction to travel and if collision with the player is imminent
    if (this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition - this.dx] !== player) {
      // going up
      // checking if it's close enough to a wall to turn around
      if (currentLevel[this.yPosition][this.xPosition - this.dx - 2].isPassible && spriteGrid[this.yPosition][this.xPosition - this.dx] === "") {

        this.move(-this.dx, 0);
      }
      else {
        this.directionOfTravel = "right";
        this.twoStepEnemyMovementStageOne = false; // sticks them in the center of their tile
      }
    }
    else if (this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition + this.dx] !== player) {
      // going down
      if (currentLevel[this.yPosition][this.xPosition + this.dx + 2].isPassible && spriteGrid[this.yPosition][this.xPosition + this.dx] === "") {
        this.move(this.dx, 0);
      }
      else {
        this.directionOfTravel = "left";
        this.twoStepEnemyMovementStageOne = false;
      }
    }
    else if (this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition - this.dx] === player || // if the player is above and going up
      this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition + this.dx] === player) { // if the player is below and going down
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  circleAI() {
    // all directiions of travel place the enemy in the corners
    // this is a counterclockwise circle

    // checking for the player in the intended direction here for simplicity
    if (this.directionOfTravel === "up" && spriteGrid[this.yPosition - this.dy][this.xPosition] !== player || // checking for player above
      this.directionOfTravel === "down" && spriteGrid[this.yPosition + this.dy][this.xPosition] !== player || // checking for player below
      this.directionOfTravel === "right" && spriteGrid[this.yPosition][this.xPosition - this.dx] !== player || // checking for player to the right
      this.directionOfTravel === "left" && spriteGrid[this.yPosition][this.xPosition + this.dx] !== player) // checking for player left
    {
      if (this.directionOfTravel === "up") {
        this.twoTileTurnCounter += 1;
        // if the enemy has moved a number of times divisible by 4 (because this movement is called twice per tile) 
        // and this is not the first movement, move and change direction, otherwise just move;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "left";
        }
        this.move(0, -this.dy);
      }
      else if (this.directionOfTravel === "left") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "down";
        }
        this.move(-this.dx, 0);
      }
      else if (this.directionOfTravel === "down") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "right";
        }
        this.move(0, this.dy);
      }
      else if (this.directionOfTravel === "right") {
        this.twoTileTurnCounter += 1;
        if (this.twoTileTurnCounter % 4 === 0 && this.twoTileTurnCounter !== 0) {
          this.directionOfTravel = "up";
        }
        this.move(this.dx, 0);
      }
    }
    // if there is the player in the way
    else {
      enemy = this;
      didEnemyTriggerCombat = true;
      enterCombat(enemy);
    }
  }
  move(dx, dy) {
    this.twoStepEnemyMovementStageOne = !this.twoStepEnemyMovementStageOne;
    if (!this.twoStepEnemyMovementStageOne) {
      spriteGrid[this.yPosition + dy][this.xPosition + dx] = this;
      this.yPosition += dy;
      this.xPosition += dx;
      spriteGrid[this.yPosition - dy][this.xPosition - dx] = "";
    }
  }
}

// sets up all the stuff for combat that is called only once
function enterCombat(enemy) {
  enemyHealth = enemy.currentHealth;
  turnTimer = 0;

  makeTheCombatButtonsWork(enemy);

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
  let adjustedHealth = map(enemy.currentHealth, 0, enemy.maxHealth, 0, enemy.combatTexture.width + 40);

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
  // health
  let adjustedPlayerHealth = map(player.health, 0, player.maxHealth, 0, width / 5);
  fill("grey");
  rect(width / 5 + width / 22, height / 4 * 3 + 5, width / 5, height / 20);
  fill("red");
  rect(width / 5 + width / 22, height / 4 * 3 + 5, adjustedPlayerHealth, height / 20);

  attackButton.draw();
  placeholderButton1.draw();
  placeholderButton2.draw();
  placeholderButton3.draw();

  // these if statements are kept seperate for the sake of new ai types
  if (millis() >= turnTimer + 500 && combatTurn === "enemy") {
    if (enemy.combatAI === "hyperAggressive") {
      player.health -= enemy.attack;
      turnTimer = millis();
      combatTurn = "player";
    }
    // I don't have time to make a more complex ai, so aggresive = hyperAggresive
    else if (enemy.combatAI === "aggressive") {
      player.health -= enemy.attack;
      turnTimer = millis();
      combatTurn = "player";
    }
  }

  if (enemy.currentHealth <= 0) {
    endCombatVictory();

    spriteGrid[player.yPosition][player.xPosition] = player;
  }
  else if (player.health <= 0) {
    endCombatFailure();
  }
}

function endCombatVictory() {
  gameState = "openWorld";

  combatTurn = "player";

  if (!didEnemyTriggerCombat) {
    ignoringEnemy = true;
    movePlayer(xMovementForCombat, yMovementForCombat);
    ignoringEnemy = false;
  }
  else {
    // is done automatically if the player triggers combat
    spriteGrid[enemy.yPosition][enemy.xPosition] = "";
  }
  didEnemyTriggerCombat = false; // the default
}

function endCombatFailure() {
  gameState = "failure";
}

function makeTheCombatButtonsWork(enemy) {
  attackButton = new Clickable();
  attackButton.locate(30, height / 4 * 3 + 2);
  attackButton.resize(width / 5 - 20, (height / 4) / 4 - 2);
  attackButton.textSize = (height / 4) / 4 - 2;
  attackButton.text = "Attack";
  attackButton.cornerRadius = 5;       //Corner radius of the clickable (float)
  attackButton.strokeWeight = 1;        //Stroke width of the clickable (float)
  attackButton.onHover = function () {
    attackButton.color = "#eedddddd";
  };
  attackButton.onOutside = function () {
    attackButton.color = "#69dddddd";
  };
  attackButton.onRelease = function () {
    if (millis() >= turnTimer + 500 && combatTurn === "player") {
      turnTimer = millis();
      enemy.currentHealth -= player.attack;
      combatTurn = "enemy";
    }
  };

  placeholderButton1 = new Clickable();
  placeholderButton1.locate(30, height / 4 * 3 + 2 + ((height / 4) / 4) - 2);
  placeholderButton1.resize(width / 5 - 20, (height / 4) / 4 - 2);
  placeholderButton1.textSize = (height / 4) / 4 - 2;
  placeholderButton1.text = "Placeholder";
  placeholderButton1.cornerRadius = 5;       //Corner radius of the clickable (float)
  placeholderButton1.strokeWeight = 1;        //Stroke width of the clickable (float)
  placeholderButton1.onHover = function () {
    placeholderButton1.color = "#eedddddd";
  };
  placeholderButton1.onOutside = function () {
    placeholderButton1.color = "#69dddddd";
  };

  placeholderButton2 = new Clickable();
  placeholderButton2.locate(30, height / 4 * 3 + 2 + ((height / 4) / 4) * 2 - 4);
  placeholderButton2.resize(width / 5 - 20, (height / 4) / 4 - 2);
  placeholderButton2.textSize = (height / 4) / 4 - 2;
  placeholderButton2.text = "Placeholder";
  placeholderButton2.cornerRadius = 5;       //Corner radius of the clickable (float)
  placeholderButton2.strokeWeight = 1;        //Stroke width of the clickable (float)
  placeholderButton2.onHover = function () {
    placeholderButton2.color = "#eedddddd";
  };
  placeholderButton2.onOutside = function () {
    placeholderButton2.color = "#69dddddd";
  };

  placeholderButton3 = new Clickable();
  placeholderButton3.locate(30, height / 4 * 3 + 2 + ((height / 4) / 4) * 3 - 6);
  placeholderButton3.resize(width / 5 - 20, (height / 4) / 4 - 2);
  placeholderButton3.textSize = (height / 4) / 4 - 2;
  placeholderButton3.text = "Placeholder";
  placeholderButton3.cornerRadius = 5;       //Corner radius of the clickable (float)
  placeholderButton3.strokeWeight = 1;        //Stroke width of the clickable (float)
  placeholderButton3.onHover = function () {
    placeholderButton3.color = "#eedddddd";
  };
  placeholderButton3.onOutside = function () {
    placeholderButton3.color = "#69dddddd";
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

  // only one door can (and should) activate at once, so just end the function here
  return;
}

// [ypos, xpos, enemytype, level, direction of travel, level]
let enemyLocations =
  // level one
  [[12, 12, slimeEnemy, "vertical", "up", "l1"], [12, 18, slimeEnemy, "horizontal", "right", "l1"], [18, 12, slimeEnemy, "horizontal", "left", "l1"], [18, 18, slimeEnemy, "vertical", "down", "l1"],
  // level two
  [5, 7, slimeEnemy, "vertical", "up", "l2"], [5, 12, slimeEnemy, "vertical", "down", "l2"],
  // level three
  // the minotaur's fourth and fifth argument are blank, so it never moves
  [19, 19, minotaurEnemy, "", "", "l3"], [18, 20, slimeEnemy, "circle", "left", "l3"], [18, 18, slimeEnemy, "circle", "down", "l3"], [20, 20, slimeEnemy, "circle", "up", "l3"], [20, 18, slimeEnemy, "circle", "right", "l3"]];

function spawnEnemies() {
  for (let enemy of enemyLocations) {
    // levels.levelOne does not exist before initialization, so it cannot go in enemyLocations
    if (enemy[5] === "l1") {
      enemy[5] = levels.levelOne;
    }
    else if (enemy[5] === "l2") {
      enemy[5] = levels.levelTwo;
    }
    else if (enemy[5] === "l3") {
      enemy[5] = levels.levelThree;
    }

    if (enemy[5] === currentLevel) {
      spriteGrid[enemy[0]][enemy[1]] = new enemy[2](enemy[1], enemy[0], enemy[3], enemy[4]);
    }
  }
}

function titleScreenButtons() {
  startGameButton = new Clickable();
  startGameButton.locate(width / 2 - width / 6, height / 2 - height / 6);
  startGameButton.resize(width / 3, height / 3);
  startGameButton.textSize = height / 4;
  startGameButton.text = "Begin";

  startGameButton.onHover = function () {
    startGameButton.color = "#d73e23";
  };
  startGameButton.onOutside = function () {
    startGameButton.color = "#873e23";
  };
  startGameButton.onRelease = function() {
    gameState = "openWorld";
  };
}

// doesn't work so it is never called
function titleScreen() {
  // sky background
  background(0, 220, 255);
  titleScreenButtons();

  // a mountain midground
  // a forest foreground

  // buttons
  startGameButton.draw();
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
      if (spriteGrid[y][x] instanceof slimeEnemy && spriteGrid[y][x].twoStepEnemyMovementStageOne) {
        if (spriteGrid[y][x].directionOfTravel === "left") {
          // checking if a half step needs to be taken left
          image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize - tileSize * spriteGrid[y][x].dx / 2, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
        }
        // checking if a half step needs to be taken right
        else if (spriteGrid[y][x].directionOfTravel === "right") {
          image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize + tileSize * spriteGrid[y][x].dx / 2, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
        }
        // checking if a half step needs to be taken up
        else if (spriteGrid[y][x].directionOfTravel === "up") {
          image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize - tileSize * spriteGrid[y][x].dy / 2, tileSize, tileSize);
        }
        // checking if a half step needs to be taken down
        else if (spriteGrid[y][x].directionOfTravel === "down") {
          image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize + tileSize * spriteGrid[y][x].dy / 2, tileSize, tileSize);
        }
      }
      // drawing the enemy in the middle of the tile, not halfway through
      else if (spriteGrid[y][x] instanceof slimeEnemy && !spriteGrid[y][x].twoStepEnemyMovementStageOne) {
        image(spriteGrid[y][x].texture, (x + movementOfScreenX) * tileSize, (y + movementOfScreenY) * tileSize, tileSize, tileSize);
      }
      if (spriteGrid[y][x] instanceof minotaurEnemy) {
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
  if (spriteGrid[player.yPosition + yMovement][player.xPosition] instanceof slimeEnemy || spriteGrid[player.yPosition + yMovement][player.xPosition] instanceof minotaurEnemy) {
    enemy = spriteGrid[player.yPosition + yMovement][player.xPosition];
    return true;
  }
  else if (spriteGrid[player.yPosition][player.xPosition + xMovement] instanceof slimeEnemy || spriteGrid[player.yPosition][player.xPosition + xMovement] instanceof minotaurEnemy) {
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
  // while relevant variables (xMovement, yMovement, player.xPosition, player.yPosition) are saved
  if (checkIfEnemyInTheWay(xMovement, yMovement) && !ignoringEnemy) {
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

  yMovementForCombat = yMovement;
  xMovementForCombat = xMovement;
}

function keyPressed() {
  // I am fully aware that checking if the block I am about to run into is solid 16 times is inefficient, 
  // as is spreading out all the possible circumstances of how you can move and if the screen should scroll. 
  // however, due to a major bug explained in my 2D array project, I cannot do it that way

  // player movement keys
  // checks if you are too close to the edge of the screen to screen scroll

  // vertical movement 
  // to be clear: the cross line is the exact line at which the movement switches from a screen scroll to non-centered movement

  // only move if in the open world
  if (gameState === "openWorld") {
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
}
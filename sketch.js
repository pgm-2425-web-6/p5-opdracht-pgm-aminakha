let characterSprite;
let characterRunningSprite;
let backgroundSprites = []; // Array to store background images
let coinSprite;
let bossBackgroundSprite;
let bossSprite;
let bossSprintSprite;
let platform;
let bossAttackSprite;
let shurikenSprite;

let coinSound;
let jumpSound;
let victorySound;

let characterX = 50; // Character's X position
let characterY; // Character's Y position
let isRunning = false; // Flag for running animation
let speed = 5; // Speed of character movement
let facingRight = true; // Track the direction the character is facing
let jumpVelocity = 0; // Initial velocity for jumping
let gravity = 0.5; // Gravity pulling the character down
let maxJumps = 0; // Track the number of jumps
let isJumping = false; // To manage jump logic
let coins = []; // Array to store coins
let score = 0; // Player's score
let nextLevelButton; // Reference to the button
let currentBackground; // Current background image
let lvlCounter = 0; // Level counter

// Platform variables
let platformY; // Platform Y position
let platformHeight = 50; // Platform height

// Boss battle variables
let bossX;
let bossY;
let bossWidth = 200; // Width of the boss sprite
let bossHeight = 200; // Height of the boss sprite
let bossHealth = 5;
let bossDirection = 1; // Direction the boss moves
let bossSpeed = 2;
let bossIsAttacking = false; // Flag for boss attack state

// Player shurikens
let playerShurikens = []; // Array to store player-shooting shurikens

function preload() {
  // Load multiple backgrounds into the array
  backgroundSprites.push(loadImage("sprites/background.gif"));
  backgroundSprites.push(loadImage("sprites/background-2.gif"));
  backgroundSprites.push(loadImage("sprites/background-3.gif"));
  backgroundSprites.push(loadImage("sprites/background-4.gif"));
  bossBackgroundSprite = loadImage("sprites/bossroom.png");
  characterSprite = loadImage("sprites/ninjaIdle.gif");
  characterRunningSprite = loadImage("sprites/ninjaRunning.gif");
  platform = loadImage("sprites/platformSprite.jpg");
  coinSprite = loadImage("sprites/coin.gif");
  bossSprite = loadImage("sprites/boss.gif"); // Boss idle sprite
  bossSprintSprite = loadImage("sprites/bossRunning.gif"); // Boss running sprite
  bossAttackSprite = loadImage("sprites/bossAttack.gif"); // Boss attack sprite
  shurikenSprite = loadImage("sprites/shuriken.png");

  coinSound = loadSound("sounds/coinsound.mp3");
  jumpSound = loadSound("sounds/jump.mp3");
  victorySound = loadSound("sounds/victorysound.mp3");
}

function setup() {
  createCanvas(600, 400);
  characterY = height - 145; // Set character's Y position
  platformY = height - platformHeight; // Set platform's Y position
  drawCoins(); // Populate the coins array

  // Set a random background for the first level
  currentBackground = backgroundSprites[floor(random(backgroundSprites.length))];
}

function draw() {
  // Draw the current background
  background(currentBackground);

  // Draw the platform
  image(platform, 0, platformY, width, platformHeight);

  // Handle character movement
  handleCharacterMovement();

  // Apply gravity and jumping logic
  handleGravity();

  // Handle player shurikens
  handlePlayerShurikens();

  // If it's not the boss level, handle coin collection
  if (lvlCounter !== 3) {
    handleCoins();
  } else {
    // Boss fight logic
    drawBoss();
    handleBossBattle();
  }

  // Display score (for non-boss levels)
  if (lvlCounter !== 3) {
    displayScore();
  }

  // Check win condition
  checkWin();
}

function handleCharacterMovement() {
  // Handle movement logic
  if (keyIsDown(LEFT_ARROW)) {
    characterX -= speed;
    facingRight = false;
    isRunning = true;
  } else if (keyIsDown(RIGHT_ARROW)) {
    characterX += speed;
    facingRight = true;
    isRunning = true;
  } else {
    isRunning = false;
  }

  // Keep character within canvas bounds
  characterX = constrain(characterX, 0, width - 100);
  
  // Draw the character at the correct position
  drawCharacter();
}

function drawCharacter() {
  // Draw the character sprite based on whether it is running or idle
  push();
  if (!facingRight) {
    translate(characterX + 100, characterY); // Flip horizontally
    scale(-1, 1);
    image(isRunning ? characterRunningSprite : characterSprite, 0, 0, 100, 100);
  } else {
    translate(characterX, characterY);
    image(isRunning ? characterRunningSprite : characterSprite, 0, 0, 100, 100);
  }
  pop();
}

function handleGravity() {
  // Apply gravity
  characterY += jumpVelocity;
  jumpVelocity += gravity;

  // Ground detection
  if (characterY > platformY - 100) {
    characterY = platformY - 100;
    jumpVelocity = 0;
    isJumping = false;
    maxJumps = 0;
  }
}

function handleCoins() {
  // Draw and handle coins
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    image(coinSprite, coin.x, coin.y, 30, 30);

    if (dist(characterX + 50, characterY + 50, coin.x + 15, coin.y + 15) < 40) {
      coins.splice(i, 1);
      score++;
      coinSound.play();
    }
  }
}

function drawCoins() {
  coins = [];
  for (let i = 0; i < 10; i++) {
    let x = random(50, width - 50);
    let y = random(50, platformY - 50);
    coins.push({ x: x, y: y });
  }
}

function nextLevel() {
  lvlCounter++; // Increment level counter
  
  if (lvlCounter === 3) {
    currentBackground = bossBackgroundSprite;
    coins = [];
    bossBattleSetup();
  } else {
    currentBackground = backgroundSprites[floor(random(backgroundSprites.length))];
    score = 0;
    drawCoins();
  }

  characterX = 50;

  if (nextLevelButton) {
    nextLevelButton.remove();
    nextLevelButton = null;
  }
}

function bossBattleSetup() {
  bossX = width - bossWidth - 50;
  bossY = platformY - bossHeight;
  bossHealth = 5;
}

function drawBoss() {
  // Draw the boss sprite
  if (bossIsAttacking) {
    image(bossAttackSprite, bossX, bossY, bossWidth, bossHeight);
  } else if (bossSpeed > 0) {
    image(bossSprintSprite, bossX, bossY, bossWidth, bossHeight);
  } else {
    image(bossSprite, bossX, bossY, bossWidth, bossHeight);
  }

  // Draw the boss health bar
  drawBossHealthBar();
}

function drawBossHealthBar() {
  let barWidth = 100; // Width of the full health bar
  let barHeight = 10; // Height of the health bar
  let healthPercentage = bossHealth / 5; // Health percentage (assuming max health is 5)

  let healthBarX = bossX + bossWidth / 2 - barWidth / 2; // Center the health bar above the boss
  let healthBarY = bossY - 20; // Position the health bar above the boss sprite

  // Draw the health bar's background
  fill(255, 0, 0);
  rect(healthBarX, healthBarY, barWidth, barHeight);

  // Draw the current health
  fill(0, 255, 0);
  rect(healthBarX, healthBarY, barWidth * healthPercentage, barHeight);
}

function handleBossBattle() {
  bossX += bossDirection * bossSpeed;
  if (bossX > width - bossWidth || bossX < 0) {
    bossDirection *= -1;
  }

  // Check for shuriken collision with boss
  for (let i = playerShurikens.length - 1; i >= 0; i--) {
    let shuriken = playerShurikens[i];
    if (
      shuriken.x > bossX &&
      shuriken.x < bossX + bossWidth &&
      shuriken.y > bossY &&
      shuriken.y < bossY + bossHeight
    ) {
      bossHealth--;
      playerShurikens.splice(i, 1); // Remove shuriken on hit
      console.log("Boss hit! Health: " + bossHealth);
    }
  }

  if (bossHealth <= 0) {
    victorySound.play();
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(255, 200, 0);
    text("You Defeated the Boss!", width / 2, height / 2);
    noLoop();
  }
}

function handlePlayerShurikens() {
  for (let i = playerShurikens.length - 1; i >= 0; i--) {
    let shuriken = playerShurikens[i];
    shuriken.x += shuriken.speed;

    image(shurikenSprite, shuriken.x, shuriken.y, 20, 20);

    if (shuriken.x > width || shuriken.x < 0) {
      playerShurikens.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW && maxJumps < 2) {
    isJumping = true;
    jumpVelocity = -10;
    maxJumps++;
    jumpSound.play();
  }

  if (keyCode === 32) {
    // Shoot a shuriken
    let shurikenSpeed = facingRight ? 10 : -10;
    playerShurikens.push({
      x: characterX + 50,
      y: characterY + 50,
      speed: shurikenSpeed,
    });
  }
}

function displayScore() {
  fill(255);
  textSize(16);
  text("Score: " + score, 10, 20);
}

function checkWin() {
  if (coins.length === 0 && lvlCounter !== 3) {
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255, 200, 0);
    text("Level Complete!", width / 2, height / 2);

    if (!nextLevelButton) {
      nextLevelButton = createButton("Next Level");
      nextLevelButton.position(width / 2 - 50, height / 2 + 50);
      nextLevelButton.mousePressed(nextLevel);
    }
  }
}

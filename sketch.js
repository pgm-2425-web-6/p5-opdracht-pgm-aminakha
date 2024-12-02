let characterSprite;
let characterRunningSprite;
let backgroundSprites = []; // Array to store background images
let coinSprite;
let platform;
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
let lvlCounter= 0 ;

function preload() {
  // Load multiple backgrounds into the array
  backgroundSprites.push(loadImage("./sprites/background.gif"));
  backgroundSprites.push(loadImage("./sprites/background-2.gif"));
  backgroundSprites.push(loadImage("./sprites/background-3.gif"));
  backgroundSprites.push(loadImage("./sprites/background-4.gif"));

  characterSprite = loadImage("./sprites/ninjaIdle.gif");
  characterRunningSprite = loadImage("./sprites/ninjaRunning.gif");
  platform = loadImage("./sprites/platformSprite.jpg");
  coinSprite = loadImage("./sprites/coin.gif");
  coinSound = loadSound("./sounds/coinsound.mp3");
  jumpSound = loadSound("./sounds/jump.mp3");
  victorySound = loadSound("./sounds/victorysound.mp3");
}

function setup() {
  createCanvas(600, 400);
  characterY = height - 145; // Set character's Y position
  drawCoins(); // Populate the coins array

  // Set a random background for the first level
  currentBackground = backgroundSprites[floor(random(backgroundSprites.length))];
}

function draw() {
  // Draw the current background
  background(currentBackground);

  // Draw the platform
  image(platform, 0, height - 50, width, 50);

  // Handle movement
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

  // Apply gravity
  characterY += jumpVelocity;
  jumpVelocity += gravity;

  // Ground detection
  if (characterY > height - 145) {
    characterY = height - 145;
    jumpVelocity = 0;
    isJumping = false;
    maxJumps = 0;
  }

  // Keep character within canvas bounds
  characterX = constrain(characterX, 0, width - 100);

  // Draw the character
  push();
  if (!facingRight) {
    translate(characterX + 100, characterY);
    scale(-1, 1);
    image(isRunning ? characterRunningSprite : characterSprite, 0, 0, 100, 100);
  } else {
    translate(characterX, characterY);
    image(isRunning ? characterRunningSprite : characterSprite, 0, 0, 100, 100);
  }
  pop();

  // Draw coins and check collection
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    image(coinSprite, coin.x, coin.y, 30, 30);

    if (dist(characterX + 50, characterY + 50, coin.x + 15, coin.y + 15) < 40) {
      coins.splice(i, 1);
      score++;
      coinSound.play();
    }
  }

  // Display score
  fill(255);
  textSize(20);
  text("Score: " + score, 10, 30);

  // Check for win
  if (score === 10) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(255, 200, 0);
    text("You won", width / 2, height / 2);

    if (!victorySound.isPlaying()) {
      victorySound.play();
    }

    // Show "Next Level" button
    if (!nextLevelButton) {
      nextLevelButton = createButton("Next Level");
      nextLevelButton.position(width / 2 - 50, height / 2 + 50);
      nextLevelButton.mousePressed(nextLevel);
    }
  }
}

// Handle jumping
function keyPressed() {
  if (keyCode === UP_ARROW && maxJumps < 2) {
    jumpVelocity = -10;
    maxJumps++;
    isJumping = true;
    jumpSound.play();
  }
}

// Draw coins
function drawCoins() {
  coins = [];
  for (let i = 0; i < 10; i++) {
    let x = random(50, width - 50);
    let y = random(50, height - 150);
    coins.push({ x: x, y: y });
  }
}

// Handle next level
function nextLevel() {
  console.log("Next level loaded!");
  score = 0; // Reset score
  drawCoins(); // Regenerate coins
  nextLevelButton.remove(); // Remove button
  nextLevelButton = null; // Reset button reference
  characterX = 50; // Reset character position

  // Pick a new random background
  currentBackground = backgroundSprites[floor(random(backgroundSprites.length))];
 
}

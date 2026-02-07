const mineflayer = require('mineflayer');
const WebSocket = require('ws'); // NEW

// ---- Minecraft bot ----
const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Bot_Alpha'
});

// ---- Movement state (shared with web) ----
const movementState = {
  forward: 0, // 0 → 1
  strafe: 0,  // -1 → 1
  jump: false
};


bot.once('spawn', () => {
  console.log('Bot spawned');
  bot.chat('/gamemode survival');

  setTimeout(() => {
    bot._client.write('abilities', {
      flags: 0,
      flyingSpeed: 0.05,
      walkingSpeed: 0.1
    });

    bot.physicsEnabled = true;
    console.log('Physics ready');
  }, 1000);
});

// ---- Apply movement every physics tick ----
// ---- Apply movement every physics tick ----
bot.on('physicsTick', () => {
  if (!bot.controlState) return;

  // Update forward/back based on the value (positive = forward, negative = backward)
  bot.controlState.forward = movementState.forward > 0;
  bot.controlState.back    = movementState.forward < 0;

  // Update strafing (positive = right, negative = left)
  bot.controlState.left  = movementState.strafe < 0;
  bot.controlState.right = movementState.strafe > 0;

  bot.controlState.jump = movementState.jump;
});


// ---- WebSocket server ----
const wss = new WebSocket.Server({
  port: 8080,
  host: '0.0.0.0' // LISTEN ON LAN
});


wss.on('connection', (ws) => {
  console.log('Web client connected');

  ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());

  if (msg.type === 'move') {
    movementState.forward = msg.forward;
    movementState.strafe  = msg.strafe;
  }

  if (msg.type === 'jump') {
    movementState.jump = msg.state;
  }
});


  ws.on('close', () => {
    console.log('Web client disconnected');
    // Safety: stop movement if client drops
    for (const k in movementState) movementState[k] = false;
  });
});

console.log('WebSocket server running on ws://0.0.0.0:8080 (LAN enabled)');

bot.on('error', console.error);
bot.on('end', () => console.log('Bot disconnected'));

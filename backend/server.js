const mineflayer = require('mineflayer');
const WebSocket = require('ws');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');

// ---- Bot Registry ----
// Stores active bots: { "BotName": botInstance }
const bots = {};

// ---- WebSocket Server ----
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleCommand(msg, ws);
    } catch (e) {
      console.error('Invalid JSON:', e);
    }
  });
});

function handleCommand(msg, ws) {
  const { type, name } = msg;

  // 1. SPAWN COMMAND
  if (type === 'spawn') {
    if (bots[name]) {
      console.log(`Bot ${name} already exists.`);
      return;
    }

    console.log(`Spawning bot: ${name}...`);
    const bot = mineflayer.createBot({
      host: 'localhost',
      port: 25565,
      username: name
    });

    // Load plugins
    bot.loadPlugin(pathfinder);

    // Setup events
    bot.once('spawn', () => {
      console.log(`${name} spawned.`);
      bot.chat('I am alive!');
      
      // Initialize movements
      const defaultMove = new Movements(bot);
      bot.pathfinder.setMovements(defaultMove);
      
      // Store bot instance
      bots[name] = bot;
    });

    bot.on('end', () => {
      console.log(`${name} disconnected.`);
      delete bots[name];
    });
    
    bot.on('error', (err) => console.log(`${name} error:`, err));
  }

  // 2. CHOP COMMAND
  if (type === 'chop') {
    const bot = bots[name];
    if (!bot) {
      console.log(`Bot ${name} not found!`);
      return;
    }
    chopOneLog(bot);
  }
}

// ---- Logic: Chop ONE Log ----
async function chopOneLog(bot) {
  bot.chat('Looking for a tree...');

  // 1. Find wood
  const woodBlock = bot.findBlock({
    matching: block => block.name.includes('_log'),
    maxDistance: 32
  });

  if (!woodBlock) {
    bot.chat('No wood found nearby.');
    return;
  }

  // 2. Walk to it
  try {
    const goal = new GoalNear(woodBlock.position.x, woodBlock.position.y, woodBlock.position.z, 1);
    await bot.pathfinder.goto(goal);
  } catch (err) {
    bot.chat('Cannot reach the tree.');
    return;
  }

  // 3. Equip Axe (if available)
  const axe = bot.inventory.items().find(item => item.name.includes('_axe'));
  if (axe) await bot.equip(axe, 'hand');

  // 4. Chop it
  try {
    await bot.dig(woodBlock);
    bot.chat('Timber! Job done.');
  } catch (err) {
    bot.chat('Failed to break block.');
  }
}

console.log('Bot Manager running on ws://localhost:8080');
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Render ሰርቨር እንዳይዘጋ Port መክፈት
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GSM Auto Bot is Running Live 24/7!');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const botToken = '8801785713:AAGcXXkLaFelzwaFgJx2X2TDjm84ysylVhc';
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 <b>እንኳን ወደ GSM Tools አውቶማቲክ ኪራይ አገልግሎት በደህና መጡ!</b>\n\nመከራየት የሚፈልጉትን Tool ይምረጡ፦", {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚡ UNLOCK TOOL (12 ሰዓት) - 400 ETB", callback_data: "buy_unlock" }],
        [{ text: "🛠 CHIMERA TOOL (24 ሰዓት) - 500 ETB", callback_data: "buy_chimera" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "buy_unlock") {
    bot.sendMessage(chatId, `📌 <b>UNLOCK TOOL (12 ሰዓት)</b>\n💰 <b>ዋጋ:</b> 400 ETB\n\n💳 <b>የመክፈያ መንገዶች፦</b>\n• <b>Telebirr:</b> <code>09XXXXXXXX</code>\n• <b>CBE ንግድ ባንክ:</b> <code>1000XXXXXXXX</code>\n\nክፍያውን ከፈጽሙ በኋላ የከፈሉበትን <b>ደረሰኝ (Screenshot)</b> እዚህ ይላኩ። ክፍያዎ ሲረጋገጥ የመግቢያ Username እና Password ይላክልዎታል።`, { parse_mode: 'HTML' });
  } else if (data === "buy_chimera") {
    bot.sendMessage(chatId, `📌 <b>CHIMERA TOOL (24 ሰዓት)</b>\n💰 <b>ዋጋ:</b> 500 ETB\n\n💳 <b>የመክፈያ መንገዶች፦</b>\n• <b>Telebirr:</b> <code>09XXXXXXXX</code>\n• <b>CBE ንግድ ባንክ:</b> <code>1000XXXXXXXX</code>\n\nክፍያውን ከፈጽሙ በኋላ ደረሰኝ እዚህ ይላኩ።`, { parse_mode: 'HTML' });
  }
});

bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "✅ <b>ደረሰኝዎ ደርሶናል!</b>\nክፍያው ተረጋግጦ የ Tool መግቢያ መረጃዎ በደቂቃዎች ውስጥ ይላክልዎታል።", { parse_mode: 'HTML' });
});

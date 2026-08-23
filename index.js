const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Render ሰርቨር እንዳይዘጋ Port መክፈት
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GSM Store Bot is Running 24/7!');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const botToken = '8801785713:AAGcXXkLaFelzwaFgJx2X2TDjm84ysylVhc';
const bot = new TelegramBot(botToken, { polling: true });

// 👇 የአንተ የቴሌግራም ID (ትዕዛዞች በቀጥታ ወደ አንተ እንዲመጡ)
// የራስህን ID ለማወቅ በቴሌግራም @userinfobot ን /start በለው
const ADMIN_CHAT_ID = 'የአንተ_TELEGRAM_ID';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 <b>እንኳን ወደ GSM Tools ኪራይ አገልግሎት በደህና መጡ!</b>\n\nእባክዎ መከራየት የሚፈልጉትን Tool ይምረጡ፦", {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚡ UNLOCK TOOL (12 ሰዓት) - 400 ETB", callback_data: "tool_unlock" }],
        [{ text: "🛠 CHIMERA TOOL (24 ሰዓት) - 500 ETB", callback_data: "tool_chimera" }],
        [{ text: "📞 የደንበኞች አገልግሎት (Admin)", url: "https://t.me/ethiofaster" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "tool_unlock" || data === "tool_chimera") {
    const toolName = data === "tool_unlock" ? "UNLOCK TOOL (12 ሰዓት)" : "CHIMERA TOOL (24 ሰዓት)";
    const price = data === "tool_unlock" ? "400 ETB" : "500 ETB";

    bot.sendMessage(chatId, `📌 <b>የትዕዛዝ ማጠቃለያ፦</b>\n🛠 <b>Tool:</b> ${toolName}\n💰 <b>ዋጋ:</b> ${price}\n\n💳 <b>የክፍያ አማራጮች፦</b>\n• <b>Telebirr:</b> <code>09XXXXXXXX</code>\n• <b>CBE:</b> <code>1000XXXXXXXX</code>\n\nከከፈሉ በኋላ የከፈሉበትን <b>የደረሰኝ ስክሪንሾት (Screenshot)</b> እዚህ ይላኩ። ክፍያዎ እንደተረጋገጠ መግቢያው ይላክልዎታል!`, { parse_mode: 'HTML' });
  }
});

// ደንበኞች ደረሰኝ (ፎቶ ወይም ጽሑፍ) ሲልኩ ለአድሚን ማስተላለፍ
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;

  // ደንበኛውን ማመስገን
  bot.sendMessage(chatId, "✅ <b>ደረሰኝዎ ደርሶናል!</b>\nክፍያው ተረጋግጦ የመግቢያ መረጃው (Username & Password) በደቂቃዎች ውስጥ ይላክልዎታል።", { parse_mode: 'HTML' });

  // ለአድሚን ደረሰኙን መላክ
  if (ADMIN_CHAT_ID && ADMIN_CHAT_ID !== 'የአንተ_TELEGRAM_ID') {
    await bot.sendPhoto(ADMIN_CHAT_ID, msg.photo[msg.photo.length - 1].file_id, {
      caption: `📩 <b>አዲስ የክፍያ ደረሰኝ መጥቷል!</b>\n👤 ከ: ${user} (ID: <code>${chatId}</code>)\n\nመረጃ ለመላክ፦\n<code>/send ${chatId} username password</code> ብለው ይላኩ።`,
      parse_mode: 'HTML'
    });
  }
});

// አድሚኑ ለደንበኛው ዩዘርኔም እና ፓስዋርድ ለመላክ የሚጠቀምበት ትዕዛዝ
// አጠቃቀም፦ /send 123456789 user123 pass123
bot.onText(/\/send (\d+) (.+) (.+)/, (msg, match) => {
  const fromId = msg.chat.id;
  if (fromId.toString() !== ADMIN_CHAT_ID.toString()) return;

  const targetChatId = match[1];
  const uName = match[2];
  const pass = match[3];

  bot.sendMessage(targetChatId, `🎉 <b>የ Tool መግቢያ መረጃዎ ተዘጋጅቷል፦</b>\n\n👤 <b>Username:</b> <code>${uName}</code>\n🔑 <b>Password:</b> <code>${pass}</code>\n\n🙏 ስለመረጡን እናመሰግናለን!`, { parse_mode: 'HTML' });
  bot.sendMessage(fromId, `✅ መረጃው ለደንበኛው (ID: ${targetChatId}) በተሳካ ሁኔታ ተልኳል!`);
});

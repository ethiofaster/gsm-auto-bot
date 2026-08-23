const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');

// Render እንዳይዘጋ የሚያደርግ ፖርት
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GSM Auto Bot DHRU API is Running 24/7!');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const botToken = '8801785713:AAGcXXkLaFelzwaFgJx2X2TDjm84ysylVhc';
const bot = new TelegramBot(botToken, { polling: true });

// 👇 የ TK-Unlocker መረጃዎች
const API_URL = 'https://tk-unlocker.com/api/index.php';
const TK_USERNAME = 'ethiofaster'; // የ TK-Unlocker የተጠቃሚ ስምህን እዚህ አስገባ
const TK_API_KEY = 'T4A-TB0-4CG-GHD-PE1-2WL-SX2-3LB';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 <b>እንኳን ወደ GSM Tools አውቶማቲክ ኪራይ አገልግሎት በደህና መጡ!</b>\n\nመከራየት የሚፈልጉትን Tool ይምረጡ፦", {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚡ UNLOCK TOOL (12 ሰዓት) - 400 ETB", callback_data: "buy_unlock" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "buy_unlock") {
    bot.sendMessage(chatId, "⏳ <b>ትዕዛዝዎ በ TK-Unlocker API እየተስተናገደ ነው...</b>\nእባክዎ ጥቂት ሰከንዶች ይጠብቁ።", { parse_mode: 'HTML' });

    try {
      // 1. መጀመሪያ ያሉትን የሰርቨር ሰርቪሶች መፈተሽ ወይም በቀጥታ ማዘዝ
      const params = new URLSearchParams();
      params.append('username', TK_USERNAME);
      params.append('apiaccesskey', TK_API_KEY);
      params.append('action', 'placeserverorder');
      params.append('requestformat', 'JSON');
      
      // የ UnlockTool ሰርቪስ ትዕዛዝ ፓራሜትር
      const orderParameters = {
        ID: '1', // ነባሪ ID
        customfield: ''
      };
      params.append('parameters', JSON.stringify(orderParameters));

      const response = await axios.post(API_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      });

      const resData = response.data;

      // 2. ከመጣው ምላሽ ውስጥ ውጤቱን ማውጣት
      const rawText = typeof resData === 'object' ? JSON.stringify(resData) : String(resData);

      const uMatch = rawText.match(/(?:username|user|login)[:\s=]+([a-zA-Z0-9_\.\@\-]+)/i);
      const pMatch = rawText.match(/(?:password|pass)[:\s=]+([a-zA-Z0-9_\.\@\-\!\#\$]+)/i);
      const codeMatch = rawText.match(/(?:CODE|code)[:\s=]+([^\,\}\"]+)/i);

      if (uMatch && pMatch) {
        bot.sendMessage(chatId, `🎉 <b>የ UnlockTool መግቢያ መረጃዎ፦</b>\n\n👤 <b>Username:</b> <code>${uMatch[1]}</code>\n🔑 <b>Password:</b> <code>${pMatch[1]}</code>\n\n⏱ <b>የቆይታ ጊዜ:</b> 12 ሰዓት\n🙏 ስለመረጡን እናመሰግናለን!`, { parse_mode: 'HTML' });
      } else if (codeMatch) {
        bot.sendMessage(chatId, `🎉 <b>የ UnlockTool መረጃዎ፦</b>\n\n🔑 <b>Code/Login:</b> <code>${codeMatch[1].trim()}</code>\n\n🙏 እናመሰግናለን!`, { parse_mode: 'HTML' });
      } else {
        // የሰርቨሩን ምላሽ ዝርዝር ለደንበኛው ማሳየት
        bot.sendMessage(chatId, `📋 <b>የ TK-Unlocker ምላሽ፦</b>\n\n<code>${rawText.substring(0, 1500)}</code>`, { parse_mode: 'HTML' });
      }

    } catch (err) {
      bot.sendMessage(chatId, "❌ ስህተት፦ " + (err.response ? JSON.stringify(err.response.data) : err.message));
    }
  }
});

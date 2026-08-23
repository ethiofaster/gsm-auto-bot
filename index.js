const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GSM Auto Bot is Running Live 24/7!');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const botToken = '8801785713:AAGcXXkLaFelzwaFgJx2X2TDjm84ysylVhc';
const bot = new TelegramBot(botToken, { polling: true });

const COOKIES = [
  { name: 'DHRUSESS', value: 'q17n54ctp30j6qdgvh5pggi2n9', domain: 'tk-unlocker.com' },
  { name: 'x-token', value: '2a66a366fc24e5a0b2f2303b2ab9e857e981539a', domain: 'tk-unlocker.com' }
];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 <b>እንኳን ወደ GSM Tools አውቶማቲክ ኪራይ አገልግሎት በደህና መጡ!</b>", {
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
    bot.sendMessage(chatId, "⏳ <b>ትዕዛዝዎ እየተስተናገደ ነው...</b>\nብሮውዘሩ ወደ TK-Unlocker ገብቶ እያዘዘ ነው፤ እባክዎ ጥቂት ሰከንዶች ይጠብቁ።", { parse_mode: 'HTML' });

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.setCookie(...COOKIES);

      // ወደ ገጹ መግባት
      await page.goto('https://tk-unlocker.com/remote', { waitUntil: 'networkidle2', timeout: 60000 });

      // Order በተኑን መፈለግ እና መጫን
      const clicked = await page.evaluate(() => {
        // በተኑን በ class, id ወይም በውስጡ ባለው ጽሑፍ መፈለግ
        const btn = document.querySelector('.placeorder') || 
                    document.querySelector('button[type="submit"]') || 
                    Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a')).find(el => /place order|order|submit|ኪራይ/i.test(el.innerText || el.value));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        throw new Error("የማዘዣው በተን አልተገኘም (Session Expired ሆኖ ሊሆን ይችላል)።");
      }

      // ውጤቱ እስኪመጣ መጠበቅ
      await new Promise(r => setTimeout(r, 7000));

      const pageText = await page.evaluate(() => document.body.innerText);
      await browser.close();

      // Username እና Password መፈለግ
      const uMatch = pageText.match(/(?:username|user|login)[:\s=]+([a-zA-Z0-9_\.\@\-]+)/i);
      const pMatch = pageText.match(/(?:password|pass)[:\s=]+([a-zA-Z0-9_\.\@\-\!\#\$]+)/i);

      if (uMatch && pMatch) {
        bot.sendMessage(chatId, `🎉 <b>የ UnlockTool መግቢያ መረጃዎ፦</b>\n\n👤 <b>Username:</b> <code>${uMatch[1]}</code>\n🔑 <b>Password:</b> <code>${pMatch[1]}</code>\n\n⏱ <b>የቆይታ ጊዜ:</b> 12 ሰዓት\n🙏 ስለመረጡን እናመሰግናለን!`, { parse_mode: 'HTML' });
      } else {
        bot.sendMessage(chatId, `📋 <b>የሰርቨር ምላሽ፦</b>\n\n<code>${pageText.substring(0, 1000)}</code>`, { parse_mode: 'HTML' });
      }

    } catch (err) {
      if (browser) await browser.close();
      bot.sendMessage(chatId, "❌ ስህተት፦ " + err.message);
    }
  }
});

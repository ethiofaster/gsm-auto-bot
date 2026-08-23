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

// 👇 እዚህ ጋር የ TK-Unlocker አካውንትህን Username እና Password አስገባ
const TK_USERNAME = 'የአንተ_TK_USERNAME_እዚህ_አስገባ';
const TK_PASSWORD = 'የአንተ_TK_PASSWORD_እዚህ_አስገባ';

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

      // 1. Login ገጽ መክፈት
      await page.goto('https://tk-unlocker.com/login', { waitUntil: 'networkidle2', timeout: 60000 });

      // 2. ዩዘርኔም እና ፓስዋርድ አስገብቶ Login ማድረግ
      await page.type('input[name="username"], input[type="text"], input[type="email"]', TK_USERNAME);
      await page.type('input[name="password"], input[type="password"]', TK_PASSWORD);
      
      await Promise.all([
        page.keyboard.press('Enter'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {})
      ]);

      // 3. ወደ Remote Order ገጽ መሄድ
      await page.goto('https://tk-unlocker.com/remote', { waitUntil: 'networkidle2', timeout: 60000 });

      // 4. Order ማዘዝ
      await page.evaluate(() => {
        const btn = document.querySelector('.placeorder') || 
                    document.querySelector('button[type="submit"]') || 
                    Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a')).find(el => /place order|order|submit|rent/i.test(el.innerText || el.value));
        if (btn) btn.click();
      });

      // 5. ውጤቱን መጠበቅ
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

const { Telegraf }= require("telegraf");
const axios = require("axios");
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply("Hello, This bot is Binance P2P price shower bot.\n Sending rate...");
    getData()
    .then((result) => {
        ctx.telegram.sendMessage(ctx.chat.id, result, {
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true }
        });
    });
});

bot.help((ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, `<b> List Of Available Commands </b>
/start to check buying and selling rate on Binance
/help to get help
/convUSDT to convert USDT to ETB
/convETB to convert ETB to USDT`, {
    parse_mode: "HTML"
    });
});

// Command to convert USDT to ETB
bot.command("convUSDT", (ctx) => {
    const args = ctx.message.text.split(' ');
    const first = parseFloat(args[1]);
    
    if (!isNaN(first)) {
        getData()
        .then(() => {
            const buyPrice = first * buyRate;
            const sellPrice = first * sellRate;
            ctx.reply(`Converting ${first} USDT to ETB...`);
            ctx.telegram.sendMessage(ctx.chat.id, 
                `Binance Exchange USDT Rate\n Buying Rate: ${buyPrice} ETB\n Selling Rate: ${sellPrice} ETB`, {
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true }
            });
        });
    } else {
        ctx.reply("Please use this format: /convUSDT [amount]");
    }
});

// Command to convert ETB to USDT
bot.command("convETB", (ctx) => {
    const args = ctx.message.text.split(' ');
    const first = parseFloat(args[1]);

    if (!isNaN(first)) {
        getData()
        .then(() => {
            const buyPrice = first / buyRate;
            const sellPrice = first / sellRate;
            ctx.reply(`Converting ${first} ETB to USDT...`);
            ctx.telegram.sendMessage(ctx.chat.id, 
                `You can buy: ${buyPrice} USDT with ${first} ETB, or sell for ${sellPrice} USDT`, {
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true }
            });
        });
    } else {
        ctx.reply("Please use this format: /convETB [amount]");
    }
});

// Fetch Binance data
async function getData() {
    let url = "https://ethiopian-currency-exchange.vercel.app/";
    let res = await axios.get(url);
    const name = res.data.bestRates[3].bank;
    baseCurrency = res.data.bestRates[3].baseCurrency;
    currencyCode = res.data.bestRates[3].currencyCode;
    buyRate = res.data.bestRates[3].buyRate;
    sellRate = res.data.bestRates[3].sellRate;
    buySellDifference = -1 * res.data.bestRates[3].buySellDifference;
    lastUpdated = res.data.lastUpdated;

    const results = `<b> Platform : <a href="www.binance.com"> ${name} </a></b>
Base Currency: <b>${baseCurrency}</b>
Currency Code: <b>${currencyCode}</b>
Buy Rate: ${buyRate} ETB
Sell Rate: ${sellRate} ETB
Buy Sell Difference: ${buySellDifference} ETB
Last Updated: ${lastUpdated}
Created by Bright Techs`;

    return results;
}

// Launch the bot
bot.launch();

// Export handler for Vercel
module.exports = async (req, res) => {
    res.status(200).send('Bot is running.');
};


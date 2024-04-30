// import
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
// variables

let stateBot = 0
const Admin = 1777245435
const customTextMessageError = ''

// init
const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://tg-shop-react.vercel.app';
const webAppUrlError = 'https://tg-shop-react.vercel.app/error';
// app
const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());
// bot
bot.onText(/\/setState (.+)/, (msg, arr) => {
    const { id } = msg.chat

    if (id === Admin) {
        stateBot = 3
        customTextMessageError = arr[1]
        bot.sendMessage(id, `переменная переведенна в 3 и поставлен текст :` + arr[1])
    } else {
        bot.sendMessage(id, 'у вас нет прав на данную команду')
    }
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/help') {
        await bot.sendMessage(chatId, 
            `
        доступные сейчас команды:
        /start - сайт
        /id - узнать id
        /admin' - только админ может использовать
        `)
    }


    if(text === '/id') {
        await bot.sendMessage(chatId, chatId)
    }
    if(text === '/admin'){
        if(chatId === Admin) {
            await bot.sendMessage(chatId, 'Админ панель:', {
                reply_markup: {
                    inline_keyboard: [
                      [
                        { text: 'state 0', callback_data: 'state0' },
                        { text: 'state 1', callback_data: 'state1' },
                        { text: 'state 2', callback_data: 'state2' }
                    ]
                ]
            }
        });
    } if(chatId !== Admin)  {
       await bot.sendMessage(chatId, "Извините вы не являетесь админом")
    }
    
        
    }
    if(stateBot === 0) {
        if(text === '/start') {
            await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                    ]
                }
            })
        }
    } if (stateBot === 1) {
        if(text === '/start') {
            await bot.sendMessage(chatId, 'извените но сейчас идут работы над сайтом или ботом', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Извините', web_app: {url: webAppUrlError}}]
                    ]
                }
            })
        }
    } if (stateBot === 2) {
        if(text === '/start') {
            await bot.sendMessage(chatId, 'извените но видимо произошла какая то ошибка и над ней уже работают')
        }
    } if (stateBot === 3) {
        if(text === '/start') {
            await bot.sendMessage(chatId, customTextMessageError)
        }
    }
    
});
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    
    if (query.data === 'state0') {
        stateBot = 0
      bot.editmess(chatId, 'переменная 0 выставлена');
    } else if (query.data === 'state1') {
        stateBot = 1
      bot.sendMessage(chatId, 'переменная 1 выставлена');
    } else if (query.data === 'state2') {
        stateBot = 2
      bot.sendMessage(chatId, 'переменная 2 выставлена');
  }
  });
// express
app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 3000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))


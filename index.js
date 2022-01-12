const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const SERVER_PORT = process.env.PORT || 3000;
const WORDLE_URL = 'https://www.powerlanguage.co.uk/wordle/';

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    console.log('Incoming request:: ', req.url);
    next();
});

const getLocalStorage = async (url) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.emulateTimezone('Asia/Kolkata');
    await page.goto(url);

    const localStorageData = await page.evaluate(() => {
        let items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
        }
        return items;
    });
    await browser.close();
    return localStorageData;
};

app.get('/storage', async (req, res) => {
    try {
        const { query: { url } } = req;
        const localStorage = await getLocalStorage(url);
        console.log({ url, localStorage });
        res.send(JSON.stringify(localStorage));
    } catch (error) {
        console.error(error.message);
        res.writeHead(400);
        res.end(error.message);
    }
});


app.get('/wordle', async (req, res) => {
    let letters = ['😞'];
    try {
        const localStorage = await getLocalStorage(WORDLE_URL);
        letters = JSON.parse(localStorage.gameState).solution.split('');
    } catch (error) {
        console.error(error.message);
    }
    res.render('wordle', { letters });
});

app.listen(SERVER_PORT, () => {
    console.log(`Server @ http://localhost:${SERVER_PORT}`);
});

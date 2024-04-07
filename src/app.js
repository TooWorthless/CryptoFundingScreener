import express from 'express';
import expressHbs from 'express-handlebars';
import fs from 'fs';
import { createServer } from 'http';
import { fundingsParser } from './parser/fundingsParser.js';
// import { createWSS } from './wss.js';
import { createWSS } from './wss/wss.js';
// import { startParsing, getCurrentData } from './parsing.js';
import { utils } from './utils.js';


const app = express();
const server = createServer(app);
createWSS(server);

fundingsParser.start();



app.engine('hbs', expressHbs.engine(
    {
        layoutsDir: './src/web/views/layouts', 
        defaultLayout: 'layout',
        extname: 'hbs'
    }
));
app.set('view engine', 'hbs');
app.set('views', './src/web/views');



app.use(express.static('./src/web/static'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        const query = req.query;

        const exchangesDatasList = [];
        for(const exchange of fundingsParser.exchanges) {
            if(exchange.title === query.exchange) {

                let nextSortType;
                if(query && query.sort) {
                    if(query.sort === 'up') {
                        nextSortType = 'down';
                    }
                    else if(query.sort === 'down') {
                        nextSortType = 'up';
                    }
                }

                exchangesDatasList.push({
                    title: exchange.title,
                    sortType: nextSortType
                });
            }
            else {
                exchangesDatasList.push({
                    title: exchange.title,
                    sortType: 'up'
                });
            }
        }

        res.render('home', {
            port: 80,
            exchanges: exchangesDatasList
        });
    } catch (error) {
        console.log('error.message app.get / :>> ', error.message);
    }
});



server.listen(80, () => {
    console.log('Express JS Service started!');
});
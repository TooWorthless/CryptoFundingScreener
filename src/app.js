import express from 'express';
import expressHbs from 'express-handlebars';
import fs from 'fs';
import { createServer } from 'http';
import { fundingsParser } from './parser/fundingsParser.js';
import { createWSS } from './wss/wss.js';
import { utils } from './utils.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const server = createServer(app);
createWSS(server);


const IP = process.env.IP;
const PORT = process.env.PORT;


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
                    sortType: nextSortType,
                    ip: IP,
                    port: PORT
                });
            }
            else {
                exchangesDatasList.push({
                    title: exchange.title,
                    sortType: 'up',
                    ip: IP,
                    port: PORT
                });
            }
        }

        res.render('home', {
            ip: IP,
            port: PORT,
            exchanges: exchangesDatasList
        });
    } catch (error) {
        console.log('error.message app.get / :>> ', error.message);
    }
});



server.listen(PORT, () => {
    console.log('Express JS Service started!');
});
import axios from 'axios';
import fs from 'fs';


class FundingsParser {

    constructor(exchanges) {
        this.parsedDatasList = [];
        this.exchanges = exchanges;


        this.longParsingMethods = {
            'okx': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link, {
                        'instType': 'SWAP'
                    });

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {
                        let symbolId = symbolObject.instId.split('-');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);

                        if(symbolType !== 'usdt') continue;

                        const symbolFundingRateResponse = await this.getRequest(exchange.funding_link, {
                            'instId': symbolId.join('-')
                        });
                        
                        if(!symbolFundingRateResponse) continue;


                        try {
                            const symbolFundingRateData = symbolFundingRateResponse.data.data[0];
                            const symbolFundingRate = +(+symbolFundingRateData.fundingRate*100).toFixed(4);
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                      
                    }
          
                } catch (error) {
                    console.log('err', error.message);
                }
            },
            'xt': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link, {
                        'instType': 'SWAP'
                    });

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.result.symbols;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolId = symbolObject.symbol.split('_');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        const symbolFundingRateResponse = await this.getRequest(exchange.funding_link, {
                            'symbol': symbolId.join('_')
                        });
                        
                        if(!symbolFundingRateResponse) continue;


                        try {
                            const symbolFundingRateData = symbolFundingRateResponse.data.result;
                            const symbolFundingRate = +(+symbolFundingRateData.fundingRate*100).toFixed(4);
                            

                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'binance': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.symbols;

                    for(const symbolObject of symbolsObjectsList) {

                        // console.log('symbolObject :>> ', symbolObject);

                        let symbolId = [symbolObject.baseAsset, symbolObject.quoteAsset];
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        const symbolFundingRateResponse = await this.getRequest(exchange.funding_link, {
                            'symbol': symbolObject.symbol
                        });
                        
                        if(!symbolFundingRateResponse) continue;

                        try {
                            const symbolFundingRateData = symbolFundingRateResponse.data;
                            const symbolFundingRate = +(+symbolFundingRateData.lastFundingRate*100).toFixed(4);
                            
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            }
        }

        this.shortParsingMethods = {
            'mexc': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolId = symbolObject.symbol.split('_');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.fundingRate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'bybit': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link, {
                        'category': 'linear'
                    });

                    if(!coinsResponse) return;

                    
                    const symbolsObjectsList = coinsResponse.data.result.list;
                    
                    for(const symbolObject of symbolsObjectsList) {
                        let symbolOrigin = formatSymbolTitle(symbolObject.symbol);

                        if(!symbolOrigin.includes('usdt')) continue;
                        
                        let symbolId = [symbolOrigin.replace('usdt', ''), 'usdt'];
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            // if(!symbolObject.fundingRate) continue;
                            const symbolFundingRate = +(+symbolObject.fundingRate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'bingx': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolId = symbolObject.symbol.split('-');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.lastFundingRate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'bitget': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link, {
                        'productType': 'USDT-FUTURES'
                    });

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolOrigin = formatSymbolTitle(symbolObject.symbol);

                        if(!symbolOrigin.includes('usdt')) continue;
                        
                        let symbolId = [symbolOrigin.replace('usdt', ''), 'usdt'];
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.fundingRate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'gate': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data;

                    for(const symbolObject of symbolsObjectsList) {
                        let symbolId = symbolObject.name.split('_');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.funding_rate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'htx': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {
                        let symbolId = symbolObject.contract_code.split('-');
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.funding_rate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'bitmart': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data.symbols;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolOrigin = formatSymbolTitle(symbolObject.symbol);

                        if(!symbolOrigin.includes('usdt')) continue;
                        
                        let symbolId = [symbolOrigin.replace('usdt', ''), 'usdt'];
                        let symbolTitle = formatSymbolTitle(symbolId[0]);
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.funding_rate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            },
            'kukoin)': async (exchange) => {
                try {
                    const coinsResponse = await this.getRequest(exchange.coins_link);

                    if(!coinsResponse) return;

                    const symbolsObjectsList = coinsResponse.data.data;

                    for(const symbolObject of symbolsObjectsList) {

                        let symbolOrigin = formatSymbolTitle(symbolObject.symbol);

                        if(!symbolOrigin.includes('usdtm')) continue;
                        
                        let symbolId = [symbolOrigin.replace('usdtm', ''), 'usdt'];
                        let symbolTitle = formatSymbolTitle(symbolId[0]).replace('xbt', 'btc');
                        let symbolType = formatSymbolTitle(symbolId[1]);


                        if(symbolType !== 'usdt') continue;

                        try {
                            const symbolFundingRate = +(+symbolObject.fundingFeeRate*100).toFixed(4);
                            
                            this.parsingMethodHandler(symbolTitle, symbolFundingRate, exchange);

                        } catch (error) {
                            console.log('error.message :>> ', error.message);
                        }
                        
                    }
                } catch (error) {
                    console.log('err :>> ', error.message);
                }
            }
        }
    }


    start() {
        this.#runMethods();
        setInterval(() => {
            this.#runLongMethods()
        }, 90000);
        setInterval(() => {
            this.#runShortMethods()
        }, 15000);
    }


    #runMethods() {
        for(const exchange of this.exchanges) {
            if(Object.keys(this.longParsingMethods).includes(exchange.title)) {
                this.longParsingMethods[exchange.title](exchange);
            }
            else if(Object.keys(this.shortParsingMethods).includes(exchange.title)) {
                this.shortParsingMethods[exchange.title](exchange);
            }
        }
    }

    #runLongMethods() {
        for(const exchange of this.exchanges) {
            if(Object.keys(this.longParsingMethods).includes(exchange.title)) {
                this.longParsingMethods[exchange.title](exchange);
            }
        }
    }

    #runShortMethods() {
        for(const exchange of this.exchanges) {
            if(Object.keys(this.shortParsingMethods).includes(exchange.title)) {
                this.shortParsingMethods[exchange.title](exchange);
            }
        }
    }

    parsingMethodHandler(symbolTitle, symbolFundingRate, exchange) {
        try {
            let isNewSymbol = true;
            let thisSymbolIndex;

            for(const symbolIndex in this.parsedDatasList) {
                const symbolData = this.parsedDatasList[symbolIndex];

                if(symbolData.title === symbolTitle) {
                    isNewSymbol = false;
                    thisSymbolIndex = symbolIndex;
                    break;
                }
            }

            if(isNewSymbol) {
                this.parsedDatasList.push({
                    title: symbolTitle,
                    exchanges: this.exchanges.map((exchangeData) => {
                        return {
                            title: exchangeData.title,
                            funding: null
                        }
                    })
                });
                thisSymbolIndex = this.parsedDatasList.length-1;
            }


            for(const exchangeIndex in this.parsedDatasList[thisSymbolIndex].exchanges) {
                const exchangeData = this.parsedDatasList[thisSymbolIndex].exchanges[exchangeIndex];
                if(exchangeData.title === exchange.title) {
                    this.parsedDatasList[thisSymbolIndex].exchanges[exchangeIndex].funding = symbolFundingRate;
                    break;
                }
            }
        } catch (error) {
            console.log('error.message parsingMethodHandler :>> ', error.message);
        }
    }


    async getRequest(path, params) {
        let requestPath;

        if(params === undefined)
            requestPath = `${path}`;
        else
            requestPath = `${path}?${Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
    
        try {
            const response = await axios.get(requestPath);

            if(!response || !(response.status === 200)) return null;
    
            return response;
        } catch (error) {
            console.error('getRequest error.message :>> ', error.message);
        }
    }

}


const exchanges = JSON.parse((await fs.promises.readFile('./config/exchanges.json')).toString());
const fundingsParser = new FundingsParser(exchanges);




function formatSymbolTitle(symbolTitle) {
    let symbolsList = symbolTitle.split('');

    symbolsList = symbolsList.map((symbol) => {
        const alphabet = [ 
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
        ];
    
        for(const alphabetLetter of alphabet) {
            if(symbol.toLowerCase() === alphabetLetter) return symbol.toLowerCase();
        }
    
        return '';
    });

    // return symbolsList.join('').replace('coin', '').replace('xbt', 'btc');
    return symbolsList.join('').replace('coin', '');
}



export {
    fundingsParser
}
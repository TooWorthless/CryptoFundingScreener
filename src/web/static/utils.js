

function sortDataByFunding (symbolsData, exchangeTitle, sortType) {


    if(sortType === 'up') {
        for(const sd of symbolsData) {


            let previousExchangeFunding;
            for(let symbolDataIndex = 0; symbolDataIndex < symbolsData.length-1; symbolDataIndex++) {
                for(const exchange of symbolsData[symbolDataIndex].exchanges) {
                    if(exchange.title === exchangeTitle) {
                        if(previousExchangeFunding !== undefined && previousExchangeFunding > +exchange.funding) {
                            const temp = symbolsData[symbolDataIndex];
                            symbolsData[symbolDataIndex] = symbolsData[symbolDataIndex-1];
                            symbolsData[symbolDataIndex-1] = temp;
                            previousExchangeFunding = +exchange.funding;
                        }
                        else {
                            previousExchangeFunding = +exchange.funding;
                        }
                        break;
                    }
                }
            }
        }
    }
    else if(sortType === 'down') {
        for(const sd of symbolsData) {
            let previousExchangeFunding;
            for(let symbolDataIndex = 0; symbolDataIndex < symbolsData.length-1; symbolDataIndex++) {
                for(const exchange of symbolsData[symbolDataIndex].exchanges) {
                    if(exchange.title === exchangeTitle) {
                        if(previousExchangeFunding && previousExchangeFunding < +exchange.funding) {
                            const temp = symbolsData[symbolDataIndex];
                            symbolsData[symbolDataIndex] = symbolsData[symbolDataIndex-1];
                            symbolsData[symbolDataIndex-1] = temp;
                            previousExchangeFunding = +exchange.funding;
                        }
                        else {
                            previousExchangeFunding = +exchange.funding;
                        }
                        break;
                    }
                }
            }
        }
    }


    return symbolsData;
}
import { WebSocket, WebSocketServer } from 'ws';
import { utils } from '../utils.js';
import { fundingsParser } from '../parser/fundingsParser.js';


const createWSS = (server) => {
    const wss = new WebSocketServer({ server });


    const connections = new Map();


    function updateParsedData(serverId) {
        connections.forEach((ws, id) => {
            if (id === serverId && ws.readyState === WebSocket.OPEN) {
                let data = fundingsParser.parsedDatasList;            

                ws.send(''+JSON.stringify(data));
            }
        });
    }

    async function handleWebSocketConnection(serverId) {

        try {
            updateParsedData(serverId);
            setInterval(() => {
                updateParsedData(serverId);
            }, 6000);

        } catch (error) {
            console.log('error.message handleWebSocketConnection :>> ', error.message);
        }
        return;
    }



    wss.on('connection', (ws) => {
        const serverId = Math.random().toString(36).substr(2, 9);
        console.log('serverId :>> ', serverId);

        connections.set(serverId, ws);

        // handleWebSocketConnection(serverId, ws);

        ws.on('message', (message) => {
            console.log('message.toString() :>> ', message.toString());
            if(message.toString().split('|')[0] === 'connect') {
                const data = message.toString().split('|');
                console.log('data :>> ', data);
                handleWebSocketConnection(serverId);
            }
        });

        ws.on('close', () => {
            connections.delete(serverId);
        });

    });



    return wss;
};


export {
    createWSS
}


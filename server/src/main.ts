import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { BlockchainServer } from './blockchainServer';

const PORT = 3000;
const app = express();

const httpServer: http.Server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Listening on http://localhost:${PORT}`);
  }
});

const wsServer = new WebSocket.Server({ server: httpServer });
new BlockchainServer(wsServer);
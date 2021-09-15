import * as WebSocket from 'ws';
import { MessageServer } from './messageServer';
import { Message, MessageTypes, UUID } from './messages';

type Replies = Map<WebSocket, Message>;

export class BlockchainServer extends MessageServer<Message> {
    private readonly receivedMessagesAwaitingResponse = new Map<UUID, WebSocket>();

    private readonly sentMessagesAwaitingReply = new Map<UUID, Replies>();

    protected handleMessage(sender: WebSocket, message: Message): void {
        switch (message.type) {
            case MessageTypes.GetLongestChainRequest:
              return this.handleGetLongestChainRequest(sender, message);
            case MessageTypes.GetLongestChainResponse:
              return this.handleGetLongestChainResponse(sender, message);
            case MessageTypes.NewBlockRequest:
              return this.handleAddTransactionsRequest(sender, message);
            case MessageTypes.NewBlockAnnouncement:
              return this.handleNewBlockAnnouncement(sender, message);
            default: {
              console.log(`Received unkown message type: "${message.type}"`);
            }
        }
    }

    private handleGetLongestChainRequest(requestor: WebSocket, message: Message): void {
        if (this.clientIsNotAlone) {
            this.receivedMessagesAwaitingResponse.set(message.correlationID, requestor);
            this.sentMessagesAwaitingReply.set(message.correlationID, new Map());
            this.broadcastExcept(requestor, message);
        } else {
            this.replyTo(requestor, {
              type: MessageTypes.GetLongestChainResponse,
              correlationID: message.correlationID,
              payload: [],
            });
        }
    }

    private handleGetLongestChainResponse(sender: WebSocket, message: Message): void {
      if (this.receivedMessagesAwaitingResponse.has(message.correlationID)) {
          const requestor = this.receivedMessagesAwaitingResponse.get(message.correlationID);

          if (this.everyoneReplied(sender, message)) {
            const allReplies = this.sentMessagesAwaitingReply.get(message.correlationID).values();
            const longestChain = Array.from(allReplies).reduce(this.selectTheLongestChain);
            this.replyTo(requestor, longestChain);
          }
      }
    }

    private handleAddTransactionsRequest(requestor: WebSocket, message: Message): void {
      this.broadcastExcept(requestor, message);
    }

    private handleNewBlockAnnouncement(requestor: WebSocket, message: Message): void {
      this.broadcastExcept(requestor, message);
    }

    private everyoneReplied(sender: WebSocket, message: Message): boolean {
      const repliedClients = this.sentMessagesAwaitingReply
          .get(message.correlationID)
          .set(sender, message);

      const awaitingForClients = Array.from(this.clients).filter(client => !repliedClients.has(client));

      return awaitingForClients.length === 1;
    }

    private selectTheLongestChain(currentlyLongest: Message, current: Message, index: number) {
      return index > 0 && current.payload.length > currentlyLongest.payload.length ? current : currentlyLongest;
    }

    private get clientIsNotAlone(): boolean {
      return this.clients.size > 1;
    }
}

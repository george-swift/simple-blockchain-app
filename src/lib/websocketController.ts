import { Transaction, Block } from "./block";
import { UUID, Message, MessageTypes } from "./messages";
import { v4 } from "uuid";

interface PromiseExecutor<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}
export default class WebsocketController {
  private websocket!: Promise<WebSocket>;
  private messageCallback!: (message: Message) => void;
  private readonly messageAwaitingReply = new Map<UUID, PromiseExecutor<Message>>();

  private get url(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = process.env.REACT_APP_WS_PROXY_HOST || window.location.host;
    return `${protocol}://${host}`;
  }

  connect(messageCallBack: (message: Message) => void): Promise<WebSocket> {
    this.messageCallback = messageCallBack;

    return this.websocket = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      ws.addEventListener('open', () => resolve(ws));
      ws.addEventListener('error', error => reject(error));
      ws.addEventListener('message', this.onMessageReceived);
    });
  }

  disconnect() {
    this.websocket.then(ws => ws.close());
  }

  private readonly onMessageReceived = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (this.messageAwaitingReply.has(message.correlationID)) {
      this.messageAwaitingReply.get(message.correlationID)!.resolve(message);
      this.messageAwaitingReply.delete(message.correlationID);
    } else {
      this.messageCallback(message);
    }
  }

  async send(message: Partial<Message>, awaitingReply = false): Promise<Message> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<Message>(async (resolve, reject) => {
      if (awaitingReply) {
        this.messageAwaitingReply.set(message.correlationID!, { resolve, reject})
      }

      this.websocket
        .then(
          ws => ws.send(JSON.stringify(message)),
          () => this.messageAwaitingReply.delete(message.correlationID!)
        );
    });
  }

  async requestLongestChain(): Promise<Block[]> {
    const reply = await this.send({
      type: MessageTypes.GetLongestChainRequest,
      correlationID: v4(),
    }, true);

    return reply.payload;
  }

  requestNewBlock(transactions: Transaction[]): void {
    this.send({
      type: MessageTypes.NewBlockRequest,
      correlationID: v4(),
      payload: transactions,
    });
  }

  announceNewBlock(block: Block): void {
    this.send({
      type: MessageTypes.NewBlockAnnouncement,
      correlationID: v4(),
      payload: block
    });
  }
}

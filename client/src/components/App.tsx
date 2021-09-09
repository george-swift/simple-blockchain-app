import React, { useCallback, useEffect, useState } from 'react';
import { BlockchainNode } from '../lib/blockchainNode';
import { Block, Transaction } from '../lib/block';
import { Message, MessageTypes } from '../lib/messages';
import { formatTx, getStatus } from '../lib/utils';
import WebsocketController from '../lib/websocketController';
import TransactionForm from './TransactionForm';
import TransactionsPanel from './TransactionsPanel';
import BlocksPanel from './BlocksPanel';

const server = new WebsocketController();
const node = new BlockchainNode();

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('');

  const addTransaction = (transaction: Transaction): void => {
    node.addTransaction(transaction);
    setStatus(getStatus(node));
  };

  const addBlock = async (block: Block, notifyNodes = true): Promise<void> => {
    try {
      await node.addBlock(block);
      if (notifyNodes) server.announceNewBlock(block);
    } catch ({ message }) {
      console.log(message);
    }
    setStatus(getStatus(node));
  };

  const generateBlock = async () => {
    server.requestNewBlock(node.pendingTransactions);
    const miningProcess = node.mineBlockWith(node.pendingTransactions);
    setStatus(getStatus(node));

    const newBlock = await miningProcess;
    addBlock(newBlock);
  };

  const handleLongestChainRequest = useCallback(
    (message: Message) => {
      server.send({
        type: MessageTypes.GetLongestChainResponse,
        correlationID: message.correlationID,
        payload: node.chain,
      })
    },
    [],
  );

  const handleNewBlockRequest = useCallback(
    async (message: Message) => {
      const transactions = message.payload as Transaction[];
      const miningProcess = node.mineBlockWith(transactions);
      setStatus(getStatus(node));
      const newBlock = await miningProcess;
      addBlock(newBlock);
    },
    [],
  );

  const handleNewBlockAnnouncement = useCallback(
    async (message: Message) => {
      const newBlock = message.payload as Block;
      addBlock(newBlock, false);
    },
    [],
  );

  const handleServerMessages = useCallback(
    (message: Message) => {
      switch (message.type) {
        case MessageTypes.GetLongestChainRequest:
          return handleLongestChainRequest(message);
        case MessageTypes.NewBlockRequest:
          return handleNewBlockRequest(message);
        case MessageTypes.NewBlockAnnouncement:
          return handleNewBlockAnnouncement(message);
        default:
          console.log(`Received unknown message type: "${message.type}"`);
      }
    },
    [handleLongestChainRequest, handleNewBlockRequest, handleNewBlockAnnouncement],
  );

  useEffect(() => setStatus(getStatus(node)), []);

  useEffect(() => {
    const initializeBlockChainNode = async () => {
      await server.connect(handleServerMessages);
      const blocks = await server.requestLongestChain();

      if (blocks.length > 0) {
        node.initializeWith(blocks);
      } else {
        await node.initializeWithGenesisBlock();
      }

      setStatus(getStatus(node));
    };

    initializeBlockChainNode();
  
    return () => server.disconnect();
  }, [handleServerMessages]);

  return (
    <main>
      <h1>Blockchain Node</h1>
      <aside>{status}</aside>
      <section>
        <TransactionForm
          onAddTransaction={addTransaction}
          disabled={node.isMining || node.chainIsEmpty}
        />
      </section>
      <section>
        <TransactionsPanel
          formattedTx={formatTx(node.pendingTransactions)}
          onGenerateBlock={generateBlock}
          disabled={node.isMining || node.noPendingTransactions}
        />
      </section>
      <section>
        <BlocksPanel blocks={node.chain} />
      </section>
    </main>
  );
};

export default App;
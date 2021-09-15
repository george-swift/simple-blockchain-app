import { BlockchainNode } from "./blockchainNode";
import { Transaction } from "./block";

export const formatTx = (transactions: Transaction[]): string => {
  return transactions
    .map((tx) => `${tx.sender} → ${tx.recipient}: $${tx.amount}`)
    .join('\n');
};

export const getStatus = (node: BlockchainNode): string => {
  return node.chainIsEmpty
    ? '⌛️ Initializing the blockchain...'
    : node.isMining
    ? '⏳ Mining a new block...'
    : node.noPendingTransactions
    ? '📩 Add one or more transactions.'
    : `( Transactions: ${node.pendingTransactions.length} ) ✅ Ready to mine a new block`;
};

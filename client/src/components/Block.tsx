import React from "react";
import { Block } from "../lib/block";
import { formatTx } from "../lib/utils";

type BlockProps = {
  index: number;
  block: Block;
};

const BlockComponent: React.FC<BlockProps> = ({ index, block }) => {
  const transactions = formatTx(block.transactions);
  const timestamp = new Date(block.timestamp).toLocaleTimeString();

  return (
    <div className="block">
      <div className="block__header">
        <span className="block__index">#{index}</span>
        <span className="block__timestamp">{timestamp}</span>
      </div>
      <div className="block__hashes">
        <div className="block__hash">
          <div className="block__label">← Prev Hash</div>
          <div className="block__hash-value">{block.previousHash}</div>
        </div>
        <div className="block__hash">
          <div className="block__label">This Hash</div>
          <div className="block__hash-value">{block.hash}</div>
        </div>
      </div>
      <div>
        <div className="block__label">TRANSACTIONS</div>
        <pre className="block__transactions">
          {transactions || 'No transactions'}
        </pre>
      </div>
    </div>
  );
};

export default BlockComponent;

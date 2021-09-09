import React from "react";

type TransactionsPanelProps = {
  formattedTx: string;
  onGenerateBlock: () => void;
  disabled: boolean;
};

const TransactionsPanel: React.FC<TransactionsPanelProps> = ({
  formattedTx, onGenerateBlock, disabled,
}) => (
  <>
    <h2>Pending Transactions</h2>
    <pre className="pending-transactions__list">
      {formattedTx || 'No pending transactions'}
    </pre>
    <div className="pending-transactions__form">
      <button
        type="button"
        className="ripple"
        onClick={() => onGenerateBlock()}
        disabled={disabled}
      >
        Generate Block
      </button>
    </div>
    <div className="clear"></div>
  </>
);

export default TransactionsPanel;

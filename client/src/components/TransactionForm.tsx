import React, { ChangeEvent, FormEvent, useState } from "react";
import { Transaction } from "../lib/block";

type FormProps = {
  onAddTransaction: (transaction: Transaction) => void;
  disabled: boolean;
};

const defaultFormState = {
  sender: '',
  recipient: '',
  amount: 0,
};

const TransactionForm: React.FC<FormProps> = ({ onAddTransaction, disabled }) => {
  const [form, setForm] = useState<Transaction>(defaultFormState);
  const { sender, recipient, amount } = form;
  const isValid = sender && recipient && amount > 0;

  const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddTransaction(form);
    setForm(defaultFormState);
  };

  return (
    <>
      <h2>New Transaction</h2>
      <form className="add-transaction-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="sender"
          placeholder="Sender"
          autoComplete="off"
          value={sender}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <span className="hidden-xs">→</span>
        <input
          type="text"
          name="recipient"
          placeholder="Recipient"
          autoComplete="off"
          value={recipient}
          onChange={handleInputChange}
          disabled={disabled}
        />
         <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={amount}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <button type="submit" className="ripple" disabled={!isValid || disabled}>Add Transaction</button>
      </form>
    </>
  );
};

export default TransactionForm;
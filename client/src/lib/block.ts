export interface Transaction {
  readonly sender: string;
  readonly recipient: string;
  readonly amount: number;
}

export interface Block {
  readonly previousHash: string;
  readonly hash: string;
  readonly nonce: number;
  readonly timestamp: number;
  readonly transactions: Transaction[];
}

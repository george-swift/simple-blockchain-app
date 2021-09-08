import sha256 from "./crypto";
import { Transaction, Block } from "./block";

const HASH_REQUIREMENT = '0000';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type WithoutHash<T> = Omit<T, 'hash'>;
export type NotMinedBlock = Omit<Block, 'hash' | 'nonce'>;

export class BlockchainNode {
  private _chain: Block[] = [];
  private _pendingTransactions: Transaction[] = [];
  private _isMining = false;

  async mineBlock(block: NotMinedBlock): Promise<Block> {
    this._isMining = true;
    let hash = '';
    let nonce = 0;

    do {
      hash = await this.calculateHash({ ...block, nonce: ++nonce });
    } while (!hash.startsWith(HASH_REQUIREMENT));

    this._isMining = false;
    this._pendingTransactions = [];
    
    return {
      ...block,
      hash,
      nonce,
    };
  }

  async mineBlockWith(transactions: Transaction[]): Promise<Block> {
    const block = {
      previousHash: this.latestBlock.hash,
      timestamp: Date.now(),
      transactions,
    };

    return this.mineBlock(block);
  }

  async initializeWithGenesisBlock(): Promise<void> {
    const genesisBlock = await this.mineBlock({
      previousHash: '0',
      timestamp: Date.now(),
      transactions: [],
    });

    this._chain.push(genesisBlock);
  }

  initializeWith(blocks: Block[]): void {
    this._chain = [...blocks];
  }

  addTransaction(transaction: Transaction): void {
    this._pendingTransactions.push(transaction);
  }

  async addBlock(newBlock: Block): Promise<void> {
    const previousBlockIndex = this._chain.findIndex(b => b.hash === newBlock.previousHash);
    const tail = this._chain.slice(previousBlockIndex + 1);
    const errorPrefix = `⚠️ Block '${newBlock.hash.substr(0, 8)}' is rejected`;

    if (previousBlockIndex < 0) {
      throw new Error(`${errorPrefix} - No block in the chain with specified previous hash '${newBlock.previousHash.substr(0, 8)}'.`)
    }

    if (tail.length >= 1) {
      throw new Error(`${errorPrefix} - The longer tail of the current node takes precedence over the new block.`)
    }

    const newBlockHash = await this.calculateHash(newBlock);
    const previousBlockHash = this._chain[previousBlockIndex].hash;
    const newBlockValid = newBlockHash.startsWith(HASH_REQUIREMENT) && newBlock.previousHash === previousBlockHash && newBlock.hash === newBlockHash;

    if (!newBlockValid) throw new Error(`${errorPrefix} - Hash verification failed.`);

    this._chain = [...this._chain, newBlock];
  }
  
  get isMining() : boolean {
    return this._isMining;
  }

  get chain() : Block[] {
    return [...this._chain];
  }
  
  get chainIsEmpty() : boolean {
    return this._chain.length === 0;
  }

  get latestBlock() : Block {
    return this._chain[this._chain.length - 1];
  }

  get pendingTransactions() : Transaction[] {
    return [...this._pendingTransactions];
  }
  
  get hasPendingTransactions() : boolean {
    return this.pendingTransactions.length > 0;
  }
  
  get noPendingTransactions() : boolean {
    return this.pendingTransactions.length === 0;
  }

  private async calculateHash(block: WithoutHash<Block>): Promise<string> {
    const data = block.previousHash + block.timestamp + JSON.stringify(block.transactions) + block.nonce;
    return sha256(data);
  }
}
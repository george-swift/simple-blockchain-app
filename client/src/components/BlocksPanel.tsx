import React from "react";
import { Block } from "../lib/block";
import BlockComponent from "./Block";

type BlocksPanelProps = {
  blocks: Block[];
};

const BlocksPanel: React.FC<BlocksPanelProps> = ({ blocks }) => (
  <>
    <h2>Current Blocks</h2>
    <div className="blocks">
      <div className="blocks__ribbon">
        {
          blocks.map((block, index) => (
            <BlockComponent
              key={block.hash}
              index={index}
              block={block}
            />
          ))
        }
      </div>
    </div>
  </>
);

export default BlocksPanel;
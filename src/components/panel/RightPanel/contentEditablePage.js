import { useState, useEffect, useRef } from "preact/hooks";
import styled from "styled-components";
import ContentEditableBlock from "./contentEditableBlock";

const Page = styled.div`
  margin: 5%;
  justify-items: auto;
`;

const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36);
};

const initialBlock = [
  { id: uid(), content: "Title", tag: "h1" },
  { id: uid(), content: "Jot anything down", tag: "p" },
];

// const setCaretToEnd = (element) => {
//   const range = document.createRange();
//   const selection = window.getSelection();
//   range.selectNodeContents(element);
//   range.collapse(false);
//   selection.removeAllRanges();
//   selection.addRange(range);
//   element.focus();
// };

function ContentEditablePage(props) {
  const [blocks, setBlocks] = useState(initialBlock);

  const blocksRef = useRef([]);
  const [refFocusIndex, setRefFocusIndex] = useState(0);

  function handleFocus(index) {
    blocksRef.current[index]?.focus();
    console.log("currentFocus: " + index);
  }

  useEffect(() => {
    handleFocus(refFocusIndex);
    console.log(blocks);
  }, [blocks]);

  function addBlockHandler(currentBlock) {
    const newBlock = { id: uid(), content: "", tag: "p" };

    setBlocks(preBlocks => {
      const index = preBlocks.map((b) => b.id).indexOf(currentBlock.id);
      const updatedBlock = [...preBlocks];
      updatedBlock.splice(index + 1, 0, newBlock);
      setRefFocusIndex(index + 1);
      return updatedBlock;
    });
  }

  function updatePageHandler(updatedBlock) {
    const preBlocks = blocks;
    const index = blocks.map((b) => b.id).indexOf(updatedBlock.id);
    const updatedBlocks = [...preBlocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: updatedBlock.tag,
      content: updatedBlock.content,
    };
    setBlocks(updatedBlocks);
  }

  function deleteBlockHandler(currentBlock) {

    setBlocks(preBlocks => {
      const index = preBlocks.map((b) => b.id).indexOf(currentBlock.id);
      
      const updatedBlock = [...preBlocks];
      updatedBlock.splice(index, 1);

      setRefFocusIndex(index - 1);

      return [...updatedBlock]
    });
  }

  return (
    <Page>
      {blocks.map((block, key) => {
        return (
          <ContentEditableBlock
            key={key}
            id={block.id}
            content={block.content}
            tag={block.tag}
            blockRef={(el) => blocksRef.current[key] = el}
            index={key}
            addBlock={addBlockHandler}
            moveFocus={handleFocus}
            updatePage={() => updatePageHandler(block)}
            deleteBlock={() => deleteBlockHandler(block)}
          />
        );
      })}
    </Page>
  );
}

export default ContentEditablePage;

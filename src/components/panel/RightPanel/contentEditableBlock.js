import { useState, useEffect, useRef } from "preact/hooks";
import styled from "styled-components";

const Block = styled.div`
  background-color: beige;
  padding: 3px;
  border-radius: 10px;
  margin-bottom: 3px;
`;

function ContentEditableBlock(props) {
  const [block, setBlock] = useState({
    id: props.id,
    content: props.content,
    tag: props.tag,
    backup: null,
    previousKey: ""
  });

  const blockRef = useRef(null);

  function onInputHandler(e) {
    block.content = e.currentTarget.textContent;
    console.log(block.content);
  }

  function onKeyDownHandler(e) {
    console.log(e.key);
    
    if (e.key === "/") {
      block.backup = block.content;
      console.log(block);
    }
    if (e.key === "Enter") {
      if (block.previousKey !== "Shift") {
        e.preventDefault();
        props.addBlock({
          id: props.id,
          ref: blockRef.current,
        });
      }
    }
    // if (e.key === "Backspace" && !block.content) {
    //   e.preventDefault();
    //   props.deleteBlock({
    //     id: props.id,
    //     ref: blockRef.current,
    //   });
    // }

    block.previousKey = e.key;
  }

  return (
    <Block>
      <block.tag
        ref={blockRef}
        contenteditable="true"
        onInput={onInputHandler}
        onKeyDown={onKeyDownHandler}
      >{block.content}</block.tag>
    </Block>
  );
}

export default ContentEditableBlock;

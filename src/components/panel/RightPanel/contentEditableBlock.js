import { useState } from "preact/hooks";

function ContentEditableBlock(props) {
  const [block, setBlock] = useState({
    id: props.id,
    content: props.content,
    tag: props.tag,
    backup: null,
    previousKey: "",
  });

  function onInputHandler(e) {
    block.content = e.currentTarget.textContent;
    console.log(e.currentTarget.textContent);
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
          index: props.index,
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
    <block.tag
      contenteditable="true"
      ref={props.blockRef}
      onInput={onInputHandler}
      onKeyDown={onKeyDownHandler}
      style="background-color: beige;
          padding: 3px;
          border-radius: 10px;
          margin-bottom: 3px;"
    >
      {block.content}
    </block.tag>
  );
}

export default ContentEditableBlock;

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
    // block.content = e.currentTarget.textContent;
    // console.log(e.currentTarget.textContent);
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
        let param1 = props.id;
        let param2 = props.index;
        props.addBlock({
          id: param1,
          index: param2,
        });
      }
    }
    if (e.key === "ArrowDown") {
      props.moveFocus(props.index + 1);
    }
    if (e.key === "ArrowUp") {
      props.moveFocus(props.index - 1);
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
      // onInput={onInputHandler}
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

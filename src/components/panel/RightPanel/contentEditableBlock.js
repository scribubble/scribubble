import { useState } from "preact/hooks";

function ContentEditableBlock(props) {
  const [block, setBlock] = useState({
    id: props.id,
    content: props.content,
    tag: props.tag,
    backup: null,
    previousKey: "",
  });

  function onChangeHandler(e) {
    // setBlock(preState => {
    //   return { ...preState, content: e.target.value};
    // });
    block.content = e.currentRef.textContent;
  }

  function onKeyDownHandler(e) {
    // console.log(e.key);

    if (e.key === "/") {
      block.backup = block.content;
      console.log(block);
    }
    if (e.key === "Enter") {
      if (block.previousKey !== "Shift") {
        e.preventDefault();
        props.addBlock({
          id: props.id,
        });
      }
    }
    if (e.key === "ArrowDown") {
      props.moveFocus(props.index + 1);
    }
    if (e.key === "ArrowUp") {
      props.moveFocus(props.index - 1);
    }

    if (e.key === "Backspace" && !block.content) {
      e.preventDefault();
      props.deleteBlock({
        id: props.id,
      });
    }

    block.previousKey = e.key;
  }

  return (
    <block.tag
      contentEditable="true"
      ref={props.blockRef}
      // onInput={onInputHandler}
      onChange={onChangeHandler}
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

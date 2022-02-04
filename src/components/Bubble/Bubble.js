import { Link } from "preact-router/match";
import styled from "styled-components";

const Bubble = () => {
  return (
    <Link href="/web">
      <Container>
        {/* <CreatedBubble> */}
        {/* <Object></Object> */}
        {/* </CreatedBubble> */}
      </Container>
    </Link>
  );
};

export default Bubble;

const Container = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  /* background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%); */
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 1s ease-in-out;
`;

const CreatedBubble = styled.canvas`
  display: block;
  margin: 0 auto;
  cursor: move;
`;

import { Link } from "preact-router/match";
import Nav from "../../components/Nav/Nav";
import Bubble from "../../components/Bubble/Bubble";
import HomeBubble from "./homeBubble";
import styled from "styled-components";

const Home = () => {
  return (
    <>
      <Nav />
      <Wrapper>
        <BubbleContainer>
          <Link href="/web">
            <CreateBubble>
              <Text>Click to </Text>
              <Text>Create your Bubble</Text>
            </CreateBubble>
          </Link>
          <Bubble />
        </BubbleContainer>
        <Inner>
          {/* <Link activeClassName="active" href="/vr">
            VR
          </Link> */}
          <IntroText top={`150px`} left={`100px`}>
            Welcome to
          </IntroText>
          <IntroText top={`250px`} left={`640px`}>
            new ways to Scribble,
          </IntroText>
          <IntroText top={`500px`} left={`80px`}>
            an interactive expression of your thoughts
          </IntroText>
          <IntroText top={`650px`} left={`680px`}>
            on this Website
          </IntroText>
        </Inner>
      </Wrapper>
      <HomeBubble />
    </>
  );
};

export default Home;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`;

const CreateBubble = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 0.2px dashed grey;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  opacity: 0.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 1s ease-in-out;

  &:hover {
    background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    opacity: 0.8;
  }
`;

const Text = styled.span`
  padding: 5px 0;
  font-size: 14px;
  z-index: 9;
`;
const Inner = styled.div`
  padding-top: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 1120px;
  position: relative;
`;

const IntroText = styled.h1`
  font-family: "Poiret One", cursive;
  font-size: 40px;
  color: ${({ theme }) => theme.black};
  position: absolute;
  top: ${({ top }) => top};
  left: ${({ left }) => left};
`;

const BubbleContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: inherit;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: center;
  /* display: block;
  margin: 0 auto;
  cursor: move; */
`;

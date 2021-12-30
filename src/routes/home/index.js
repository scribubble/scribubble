import { Link } from "preact-router/match";

import styled from "styled-components";

const Home = () => {
  return (
    <div id="main">
      <nav>
        <Link activeClassName="active" href="/web">
          PC
        </Link>
        <br />
        <Link activeClassName="active" href="/vr">
          VR
        </Link>
        <Background>안녕하세요! hhhh ㅠㅠㅠㅠ 와아아아</Background>
      </nav>
    </div>
  );
};

export default Home;

const Background = styled.div`
  background-color: blue;
`;

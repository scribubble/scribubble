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
        <Background>안su</Background>
      </nav>
    </div>
  );
};

export default Home;

const Background = styled.div`
  background-color: red;
`;

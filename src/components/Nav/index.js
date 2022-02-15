import { Link } from "preact-router/match";
import styled from "styled-components";

const Nav = () => {
  return (
    <Wrapper>
      <Inner>
        <Link to="/">
          <Logo>scribubble</Logo>
        </Link>
        <List>about</List>
      </Inner>
    </Wrapper>
  );
};

export default Nav;

const Wrapper = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 120px;
  padding: 20px;
  position: fixed;
  z-index: 99;
`;

const Inner = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.veryLightGrey};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  height: 94px;
  width: 1120px;
`;

const Logo = styled.h1`
  font-family: "Poiret One", cursive;
  font-size: 28px;
  color: ${({ theme }) => theme.black};
  cursor: pointer;
`;

const List = styled.span`
  font-size: 18px;
`;

import styled, { css } from 'styled-components';

export const RoundedButton = styled.button`
    background: white;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    cursor: pointer;
`;

export const NavButton = styled(RoundedButton)`
    border: none;
    background: ${(props) => props.isActive ? 'blue': 'white'};
`;

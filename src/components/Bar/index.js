import styled, { css } from 'styled-components';

export const Bar = styled.div`
    display: flex;
    margin-left: 1rem;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    background: #ffffff;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
`;

export const DivisionLine = styled.div`
    width: 50%;
    height: .125rem;
    background: #c9c9c9;
`;
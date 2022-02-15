import styled, { css } from 'styled-components';

export const Bar = styled.div`
    display: flex;
    margin-left: 1rem;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    background: #ffffff;
    align-items: center;
    gap: 1rem;
    -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
`;
export const ColBar = styled(Bar)`
    flex-direction: column;
`;
export const RowBar = styled(Bar)`
    flex-direction: row;
`;
export const RowBottomBar = styled(RowBar)`
    position: absolute;
    bottom: 0;
    right: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
`;

export const DivisionLine = styled.div`
    width: 50%;
    height: .125rem;
    background: #c9c9c9;
`;
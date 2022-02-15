import styled, { css } from 'styled-components';
import theme from '../../style/theme';
import { RoundButton } from '../Button';

export const ProfileBlock = styled.div`
    // margin: 0.5rem;
`;

export const ProfileSM = styled(RoundButton)`
    margin: 0.5rem 0.5rem 0.5rem 0rem;
    width: 2.25rem;
    height: 2.25rem;
    background: ${theme.surface};
    font-size: 0;
    &:first-letter {
        font-size: 1rem;
    }
`;
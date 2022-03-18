import styled, { css } from 'styled-components';


export const RoundColorPicker = styled.div`
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 1.25rem;
    overflow: hidden;
`;

export const ColorPicker = styled.input.attrs(props => ({
    type: "color"
}))`
    border: 0;
    padding: 0;
    width: 200%;
    height: 200%;
    cursor: pointer;
    transform: translate(-25%, -25%)
`;

export const ColorInput = styled.input.attrs(props => ({
    type: "text"
}))`
    width: 4rem;
    border: 1px solid #00000022;
    padding: 0.25rem;
    border-radius: 0.25rem;
    font-size: .875rem;
}
`;

export const LengthInput = styled.input.attrs(props => ({
    type: "range",
    orient: "vertical"
}))`
    writing-mode: bt-lr;
    -webkit-appearance: slider-vertical;
    width: .5rem;
    height: 6rem;
`;

export const ZoomInput = styled.input.attrs(props => ({
    readOnly: true,
    type: "number"
}))`
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    width: 2rem;
    border: none;
    font-size: 1rem;
    text-align: center;
    -moz-appearance: textfield;
`;
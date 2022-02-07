import styled, { css } from 'styled-components';


export const ColorPicker = styled.input.attrs(props => ({
    type: "color"
}))`
    width: 1.75rem;
    height: 1.75rem;
	-webkit-appearance: none;
    border: none;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    padding: 0px;
    &:-webkit-color-swatch-wrapper {
        padding: 0px;
    }
    &:-webkit-color-swatch {
        border: none;
    }
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
import styled, { css } from 'styled-components';

export const RoundedButton = styled.button`
    border: none;
    border-radius: .25rem;
    background: transparent;
    cursor: pointer;
`;
export const RoundButton = styled.button`
    border: none;
    border-radius: 50%;
    background: ${(props) => props.background ? props.background : 'transparent'};
    cursor: pointer;
    ${(props) => props.customStyle}
`;

export const ToolButton = styled(RoundedButton)`
    svg {
        stroke: ${(props) => props.isActive ? '#FF2052': 'currentColor'}
    }
    &:hover svg {
        stroke: ${(props) => props.isActive ? '#FF2052': '#5c5c5c'}
    }
`;

export const IndependentButton = styled(RoundedButton)`
    margin: 0.5rem;
    padding: 0.5rem 0.75rem 0.25rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
`;

export const SelectingMe = styled.div`
    position: absolute;
    margin-left: -1rem;
`;

export const TextButton = (props) =>  {
    return (
        <IndependentButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z" />
                <path d="M12 5v16" />
                <path d="M7 7h1" />
                <path d="M7 11h1" />
                <path d="M16 7h1" />
                <path d="M16 11h1" />
                <path d="M16 15h1" />
            </svg>
        </IndependentButton>
    );
};


export const ExploreToolButton = (props) => {
    return (
        <ToolButton isActive={props.isActive} onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7"></path>
            </svg>
        </ToolButton>
    );
};

export const SelectToolButton = (props) => {
    return (
        <ToolButton isActive={props.isActive} onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="3" y1="12" x2="6" y2="12"></line>
                <line x1="12" y1="3" x2="12" y2="6"></line>
                <line x1="7.8" y1="7.8" x2="5.6" y2="5.6"></line>
                <line x1="16.2" y1="7.8" x2="18.4" y2="5.6"></line>
                <line x1="7.8" y1="16.2" x2="5.6" y2="18.4"></line>
                <path d="M12 12l9 3l-4 2l-2 4l-3 -9"></path>
            </svg>
        </ToolButton>
    );
};

export const EraseToolButton = (props) => {
    return (
        <ToolButton isActive={props.isActive} onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9"></path>
                <line x1="18" y1="12.3" x2="11.7" y2="6"></line>
            </svg>
        </ToolButton>
    );
};

export const DrawingToolButton = (props) => {
    return (    
        <ToolButton isActive={props.isActive} onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z"></path>
                <path d="M16 7h4"></path>
                <path d="M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3"></path>
            </svg>
        </ToolButton>
    );
};

export const ShapeToolButton = (props) => {
    return (    
        <ToolButton isActive={props.isActive} onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 3l-4 7h8z"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <rect x="4" y="14" width="6" height="6" rx="1"></rect>
            </svg>
        </ToolButton>
    );
};


export const PalleteButton = styled(RoundButton)`
    background: ${(props) => props.color};
    width: 1.25rem;
    height: 1.25rem;
    -webkit-box-shadow: 0px 0px ${(props) => props.selecting ? '5px 5px' : '1px 1px'}px rgba(0, 0, 0, 25%);
    box-shadow: 0px 0px ${(props) => props.selecting ? '5px 5px' : '1px 1px'} rgba(0, 0, 0, 25%);
`;

export const AddPalleteButton = (props) => {
    return (
        <RoundButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 21a9 9 0 1 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"></path>
                <circle cx="7.5" cy="10.5" r=".5" fill="currentColor"></circle>
                <circle cx="12" cy="7.5" r=".5" fill="currentColor"></circle>
                <circle cx="16.5" cy="10.5" r=".5" fill="currentColor"></circle>
            </svg>
        </RoundButton>
    );
};

export const PlaneButton = (props) => {
    return (
        <RoundButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M6.141 4.163l12 1.714a1 1 0 0 1 .859 .99v10.266a1 1 0 0 1 -.859 .99l-12 1.714a1 1 0 0 1 -1.141 -.99v-13.694a1 1 0 0 1 1.141 -.99z"></path>
            </svg>
        </RoundButton>
    );
};
export const SphereButton = (props) => {
    return (
        <RoundButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="9"></circle>
            </svg>
        </RoundButton>
    );
};
export const CylinderButton = (props) => {
    return (
        <RoundButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <rect x="5" y="3" width="14" height="18" rx="2"></rect>
            </svg>
        </RoundButton>
    );
};
export const SquareButton = (props) => {
    return (
        <RoundButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="5" cy="5" r="2"></circle>
                <circle cx="19" cy="5" r="2"></circle>
                <circle cx="5" cy="19" r="2"></circle>
                <circle cx="19" cy="19" r="2"></circle>
                <line x1="5" y1="7" x2="5" y2="17"></line>
                <line x1="7" y1="5" x2="17" y2="5"></line>
                <line x1="7" y1="19" x2="17" y2="19"></line>
                <line x1="19" y1="7" x2="19" y2="17"></line>
            </svg>
        </RoundButton>
    );
};

export const PlusButton = (props) => {
    return (
        <RoundedButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </RoundedButton>
    );
};
export const MinusButton = (props) => {
    return (
        <RoundedButton onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </RoundedButton>
    );
};
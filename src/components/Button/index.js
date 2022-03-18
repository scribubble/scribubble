/** @format */

import styled, { css } from "styled-components";
import theme from "../../style/theme";
import { BiCylinder, BiCube, BiEraser, BiGlobe } from "react-icons/bi";
import { TiSortAlphabetically } from "react-icons/ti";
import { GrSelect } from "react-icons/gr";
import { FiMove, FiRotateCw, FiMaximize2 } from "react-icons/fi";

export const RoundedButton = styled.button`
	border: none;
	border-radius: 0.25rem;
	background: transparent;
	cursor: pointer;
	&:disabled {
		cursor: auto;
	}
	&:not([disabled]):hover svg {
		stroke: ${theme.darkGrey};
	}
`;
export const RoundButton = styled.button`
	border: none;
	border-radius: 50%;
	background: ${(props) =>
		props.background ? props.background : "transparent"};
	cursor: pointer;
	${(props) => props.customStyle}
	&:disabled {
		cursor: auto;
	}
	&:not([disabled]):hover svg {
		stroke: ${theme.darkGrey};
	}
`;

export const ToolButton = styled(RoundedButton)`
	svg {
		stroke: ${(props) =>
			props.isActive ? theme.secondary : "currentColor"};
	}
	&:not([disabled]):hover svg {
		stroke: ${(props) => (props.isActive ? theme.secondary : "#5c5c5c")};
	}
`;

export const IndependentButton = styled(RoundedButton)`
	margin: 0.5rem;
	padding: 0.5rem 0.75rem 0.25rem 0.75rem;
	border: none;
	border-radius: 0.25rem;
	-webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
	box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
	&:hover svg {
		opacity: .75;
	}
	&.off svg {
		opacity: .5;
	}
`;

export const SelectingMe = styled.div`
	position: absolute;
	margin-left: -1rem;
`;

export const TextButton = (props) => {
	return (
		<IndependentButton
			onClick={props.onClick}
			className={props.class}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<TiSortAlphabetically className='icon' size='22' color='currentColor' />
		</IndependentButton>
	);
};

//=============================================================
// Tool Button
//=============================================================
export const ExploreToolButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='23'
				height='23'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<circle cx='12' cy='12' r='2'></circle>
				<path d='M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7'></path>
			</svg>
		</ToolButton>
	);
};

export const SelectToolButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<GrSelect className='icon' size='22' color='currentColor' />
		</ToolButton>
	);
};

export const EraseToolButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			disabled={props.disabled}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<BiEraser className='icon' size='24' color='currentColor' />
		</ToolButton>
	);
};

export const DrawingToolButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<path d='M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4'></path>
				<line x1='13.5' y1='6.5' x2='17.5' y2='10.5'></line>
			</svg>
		</ToolButton>
	);
};

export const ShapeToolButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<path d='M12 3l-4 7h8z'></path>
				<circle cx='17' cy='17' r='3'></circle>
				<rect x='4' y='14' width='6' height='6' rx='1'></rect>
			</svg>
		</ToolButton>
	);
};

//=============================================================
// Drawing Button
//=============================================================
export const DashedButton = (props) => {
	return (
		<ToolButton
			isActive={props.isActive}
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<path d='M5 12h2'></path>
				<path d='M17 12h2'></path>
				<path d='M11 12h2'></path>
			</svg>
		</ToolButton>
	);
};

//=============================================================
// Pallete Button
//=============================================================
export const PalleteButton = styled(RoundButton)`
	background: ${(props) => props.color};
	width: 1.25rem;
	height: 1.25rem;
	-webkit-box-shadow: 0px 0px
		${(props) => (props.selecting ? "5px 5px" : "1px 1px")}px
		rgba(0, 0, 0, 25%);
	box-shadow: 0px 0px ${(props) => (props.selecting ? "5px 5px" : "1px 1px")}
		rgba(0, 0, 0, 25%);
`;

export const AddPalleteButton = (props) => {
	return (
		<RoundButton
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<path d='M12 21a9 9 0 1 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25'></path>
				<circle cx='7.5' cy='10.5' r='.5' fill='currentColor'></circle>
				<circle cx='12' cy='7.5' r='.5' fill='currentColor'></circle>
				<circle cx='16.5' cy='10.5' r='.5' fill='currentColor'></circle>
			</svg>
		</RoundButton>
	);
};

//=============================================================
// Shape Button
//=============================================================

export const SquareButton = (props) => {
	return (
		<RoundButton
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<rect x='4' y='4' width='16' height='16' rx='2'></rect>
			</svg>
		</RoundButton>
	);
};
export const SphereButton = (props) => {
	return (
		<RoundButton
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<BiGlobe className='icon' size='24' color='currentColor' />
		</RoundButton>
	);
};
export const CylinderButton = (props) => {
	return (
		<RoundButton
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<BiCylinder className='icon' size='24' color='currentColor' />
		</RoundButton>
	);
};
export const CubeButton = (props) => {
	return (
		<RoundButton
			onClick={props.onClick}
			onMouseEnter={props.onMouseEnter}
			onMouseLeave={props.onMouseLeave}
		>
			<BiCube className='icon' size='24' color='currentColor' />
		</RoundButton>
	);
};

export const PlusButton = (props) => {
	return (
		<RoundedButton onClick={props.onClick}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<line x1='12' y1='5' x2='12' y2='19'></line>
				<line x1='5' y1='12' x2='19' y2='12'></line>
			</svg>
		</RoundedButton>
	);
};
export const MinusButton = (props) => {
	return (
		<RoundedButton onClick={props.onClick}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke-width='2'
				stroke='currentColor'
				fill='none'
				stroke-linecap='round'
				stroke-linejoin='round'>
				<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
				<line x1='5' y1='12' x2='19' y2='12'></line>
			</svg>
		</RoundedButton>
	);
};

//=============================================================
// TransfomControl Mode Button
//=============================================================
export const MoveButton = (props) => {
	return (
		<ToolButton isActive={props.isActive} onClick={props.onClick}>
			<FiMove className='icon' size='22' color='currentColor' />
		</ToolButton>
	);
};
export const RotateButton = (props) => {
	return (
		<ToolButton isActive={props.isActive} onClick={props.onClick}>
			<FiRotateCw className='icon' size='22' color='currentColor' />
		</ToolButton>
	);
};
export const ScaleButton = (props) => {
	return (
		<ToolButton isActive={props.isActive} onClick={props.onClick}>
			<FiMaximize2 className='icon' size='22' color='currentColor' />
		</ToolButton>
	);
};

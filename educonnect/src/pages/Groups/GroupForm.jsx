import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { createGroup } from '../../api/groups';

// ─────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const modalEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const modalExit = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.98) translateY(4px);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
`;

const slideInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const checkmarkBounce = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

const spinnerRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const dropdownEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// ─────────────────────────────────────────────────────────────
// SVG ICONS (Inline for zero dependency)
// ─────────────────────────────────────────────────────────────

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckLarge = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconHash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMinus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SpinnerSvg = styled.svg`
  animation: ${spinnerRotate} 800ms linear infinite;
`;

const Spinner = () => (
  <SpinnerSvg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </SpinnerSvg>
);

// ─────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 27, 75, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
  animation: ${fadeIn} 200ms ease-out;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  border: 0.5px solid rgba(79, 70, 229, 0.18);
  box-shadow: 0 25px 50px -12px rgba(30, 27, 75, 0.25);
  animation: ${modalEnter} 250ms cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 92vh;
    padding: 1.5rem 1.25rem;
    animation: ${modalEnter} 300ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(79, 70, 229, 0.12);
  position: relative;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleAccent = styled.div`
  width: 4px;
  height: 24px;
  background: #4F46E5;
  border-radius: 2px;
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
  letter-spacing: -0.3px;
  line-height: 1.3;
`;

const CloseBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  flex-shrink: 0;

  &:hover {
    background: #EEF2FF;
    color: #4F46E5;
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FormCard = styled.div`
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Field = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid rgba(79, 70, 229, 0.25);
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #fff;
  color: #1E1B4B;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  &::placeholder {
    color: #9CA3AF;
  }

  ${props => props.$hasError && css`
    border-color: #EF4444 !important;
    background: rgba(239, 68, 68, 0.03);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
    animation: ${shake} 400ms ease-in-out;
  `}

  ${props => props.$isValid && css`
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
  `}

  @media (max-width: 480px) {
    font-size: 16px; /* Prevent iOS zoom */
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

const CharCounter = styled.span`
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 11px;
  color: ${props => props.$nearLimit ? '#EF4444' : '#9CA3AF'};
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  min-height: 20px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${slideInDown} 200ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ErrorMsg = styled.span`
  font-size: 12px;
  color: #EF4444;
  font-weight: 500;
  line-height: 1.4;
`;

const HintText = styled.p`
  font-size: 12px;
  color: #6B7280;
  margin-top: 6px;
  line-height: 1.4;
`;

// ─── Custom Select (Combobox) ───

const SelectTrigger = styled.button`
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid rgba(79, 70, 229, 0.25);
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #fff;
  color: ${props => props.$hasValue ? '#1E1B4B' : '#9CA3AF'};
  outline: none;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }

  ${props => props.$hasError && css`
    border-color: #EF4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
  `}

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%) ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
  color: #6B7280;
  transition: transform 200ms ease;
  display: flex;
  align-items: center;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 0.5px solid rgba(79, 70, 229, 0.18);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(30, 27, 75, 0.12);
  z-index: 10;
  max-height: 280px;
  overflow-y: auto;
  animation: ${dropdownEnter} 150ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DropdownSearch = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid rgba(79, 70, 229, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9CA3AF;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
`;

const DropdownSearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1E1B4B;
  background: transparent;

  &::placeholder {
    color: #9CA3AF;
  }
`;

const DropdownOption = styled.div`
  padding: 10px 12px;
  font-size: 14px;
  color: #1E1B4B;
  cursor: pointer;
  transition: background 100ms ease;
  border-radius: 8px;
  margin: 2px 4px;

  &:hover {
    background: #EEF2FF;
  }

  ${props => props.$selected && css`
    background: #4F46E5 !important;
    color: #fff;
    font-weight: 500;
  `}

  ${props => props.$highlighted && css`
    background: #EEF2FF;
  `}
`;

const DropdownEmpty = styled.div`
  padding: 20px;
  text-align: center;
  color: #6B7280;
  font-size: 13px;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

// ─── Member Stepper ───

const StepperRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const StepperBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(79, 70, 229, 0.25);
  background: #EEF2FF;
  color: #4F46E5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #4F46E5;
    color: #fff;
    border-color: #4F46E5;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StepperValue = styled.div`
  min-width: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1E1B4B;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const RecommendedBadge = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #4F46E5;
  background: #EEF2FF;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.02em;
`;

const SliderContainer = styled.div`
  padding: 8px 4px;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #4F46E5;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    transition: transform 150ms ease, box-shadow 150ms ease;
    border: 2px solid #fff;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.15);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #4F46E5;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    border: 2px solid #fff;
    transition: transform 150ms ease, box-shadow 150ms ease;
  }

  &::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.15);
  }

  @media (prefers-reduced-motion: reduce) {
    &::-webkit-slider-thumb, &::-moz-range-thumb {
      transition: none;
    }
  }
`;

// ─── Preview Card ───

const PreviewSection = styled.div`
  margin-bottom: 1.5rem;
`;

const PreviewLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6B7280;
  margin-bottom: 10px;
`;

const PreviewCard = styled.div`
  background: #fff;
  border: 0.5px solid rgba(79, 70, 229, 0.18);
  border-radius: 12px;
  padding: 14px;
  border-top: 3px solid #4F46E5;
  transition: all 150ms ease;

  ${props => props.$empty && css`
    border: 1px dashed rgba(79, 70, 229, 0.2);
    border-top: 1px dashed rgba(79, 70, 229, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  `}
`;

const PreviewTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1E1B4B;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PreviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  background: #EEF2FF;
  color: #4F46E5;
`;

const PreviewMembers = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
  margin-top: 8px;
`;

const AvatarStack = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid #fff;
  margin-left: -8px;
  color: #fff;
  background: ${props => {
    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'];
    return colors[props.$index % colors.length];
  }};

  &:first-child {
    margin-left: 0;
  }
`;

const AvatarMore = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid #fff;
  margin-left: -8px;
  color: #475569;
  background: #F1F5F9;
`;

const PreviewEmptyText = styled.span`
  font-size: 13px;
  color: #9CA3AF;
  font-style: italic;
`;

// ─── Buttons ───

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 10px;
  }
`;

const SubmitBtn = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.$success ? '#10B981' : '#4F46E5'};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px ${props => props.$success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(79, 70, 229, 0.25)'};
  transition: all 150ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${props => props.$success ? 'rgba(16, 185, 129, 0.35)' : 'rgba(79, 70, 229, 0.35)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px ${props => props.$success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(79, 70, 229, 0.25)'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25), 0 4px 12px rgba(79, 70, 229, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
  }
`;

const CancelBtn = styled.button`
  padding: 12px 24px;
  background: transparent;
  color: #4F46E5;
  border: 1px solid rgba(79, 70, 229, 0.25);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: #EEF2FF;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  }

  @media (max-width: 480px) {
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// ─── Success Overlay ───

const SuccessOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: #ECFDF5;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 2rem;
  z-index: 5;
  animation: ${fadeIn} 200ms ease-out;

  @media (max-width: 480px) {
    border-radius: 16px 16px 0 0;
  }
`;

const SuccessIconWrapper = styled.div`
  animation: ${checkmarkBounce} 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SuccessTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #065F46;
  text-align: center;
`;

const SuccessSubtext = styled.div`
  font-size: 14px;
  color: #059669;
  text-align: center;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 0 0 16px 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #10B981;
  animation: ${progressFill} 1200ms linear forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    width: 100%;
  }
`;

// ─── General Error ───

const GeneralError = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-left: 3px solid #EF4444;
  background: #FEF2F2;
  border-radius: 0 8px 8px 0;
  margin-bottom: 1rem;
  animation: ${slideInDown} 200ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const GeneralErrorText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #991B1B;
  flex: 1;
`;

// ─────────────────────────────────────────────────────────────
// SUBJECTS DATA
// ─────────────────────────────────────────────────────────────

const SUBJECTS = [
  'Algorithms',
  'Data Structures',
  'Mathematics',
  'Databases',
  'Networks',
  'Operating Systems',
  'Software Engineering',
  'Machine Learning',
  'Web Development',
  'Computer Architecture',
];

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function GroupForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', subject_tag: '', max_members: 8 });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectSearch, setSelectSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  const initialFocusRef = useRef(true);

  const MAX_NAME_LENGTH = 50;

  // ─── Focus Trap & Keyboard ───
  useEffect(() => {
    // Focus first input on mount
    if (initialFocusRef.current && nameInputRef.current) {
      nameInputRef.current.focus();
      initialFocusRef.current = false;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Check if form is dirty before closing
        const isDirty = form.name || form.subject_tag || form.max_members !== 8;
        if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) {
          return;
        }
        onClose();
      }

      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && !selectOpen) {
        handleSubmit();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, input, select, textarea, [href]:not([disabled])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [form, selectOpen, onClose]);

  // ─── Click Outside for Select ───
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setSelectOpen(false);
      }
    };

    if (selectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectOpen]);

  // ─── Validation ───
  const validate = useCallback((fieldName, values) => {
    const e = {};
    const data = values || form;

    if (!fieldName || fieldName === 'name') {
      if (!data.name.trim()) e.name = 'Group name is required';
      else if (data.name.trim().length < 3) e.name = 'Must be at least 3 characters';
      else if (data.name.trim().length > MAX_NAME_LENGTH) e.name = `Cannot exceed ${MAX_NAME_LENGTH} characters`;
    }

    if (!fieldName || fieldName === 'max_members') {
      if (data.max_members < 2) e.max_members = 'Must have at least 2 members';
      if (data.max_members > 20) e.max_members = 'Cannot exceed 20 members';
    }

    return e;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'max_members' ? parseInt(value) || 2 : value;

    setForm(prev => ({ ...prev, [name]: val }));

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldErrors = validate(name);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };

  const handleSelectSubject = (subject) => {
    setForm(prev => ({ ...prev, subject_tag: subject }));
    setErrors(prev => { const next = { ...prev }; delete next.subject_tag; return next; });
    setSelectOpen(false);
    setSelectSearch('');
  };

  const handleMemberStep = (delta) => {
    const newVal = Math.max(2, Math.min(20, form.max_members + delta));
    setForm(prev => ({ ...prev, max_members: newVal }));
    setErrors(prev => { const next = { ...prev }; delete next.max_members; return next; });
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setForm(prev => ({ ...prev, max_members: val }));
    setErrors(prev => { const next = { ...prev }; delete next.max_members; return next; });
  };

  const filteredSubjects = SUBJECTS.filter(s => 
    s.toLowerCase().includes(selectSearch.toLowerCase())
  );

  // ─── Submit ───
  const handleSubmit = async () => {
    const allErrors = validate();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({ name: true, subject_tag: true, max_members: true });
      return;
    }

    setLoading(true);
    try {
      await createGroup(form);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      setErrors({ general: 'Failed to create group. Please try again.' });
      setLoading(false);
    }
  };

  const isNameValid = form.name.trim().length >= 3 && form.name.trim().length <= MAX_NAME_LENGTH;
  const showNameError = touched.name && errors.name;

  return createPortal(
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal 
        ref={modalRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        {/* Success Overlay */}
        {success && (
          <SuccessOverlay>
            <SuccessIconWrapper>
              <IconCheckLarge />
            </SuccessIconWrapper>
            <SuccessTitle>Study group created!</SuccessTitle>
            <SuccessSubtext>Redirecting you...</SuccessSubtext>
            <ProgressBar>
              <ProgressFill />
            </ProgressBar>
          </SuccessOverlay>
        )}

        <ModalHeader>
          <TitleWrapper>
            <TitleAccent aria-hidden="true" />
            <ModalTitle id="modal-title">Create a study group</ModalTitle>
          </TitleWrapper>
          <CloseBtn 
            onClick={onClose} 
            aria-label="Close dialog"
            type="button"
          >
            <IconClose />
          </CloseBtn>
        </ModalHeader>

        <p id="modal-desc" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
          Fill out the form below to create a new study group for collaborative learning.
        </p>

        {/* General Error */}
        {errors.general && (
          <GeneralError role="alert" aria-live="polite">
            <IconAlert />
            <GeneralErrorText>{errors.general}</GeneralErrorText>
          </GeneralError>
        )}

        <FormCard>
          {/* Group Name */}
          <Field>
            <Label htmlFor="name">Group name</Label>
            <InputWrapper>
              <InputIcon><IconHash /></InputIcon>
              <Input
                ref={nameInputRef}
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Algorithms Study Group — Week 3"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                $hasError={!!showNameError}
                $isValid={isNameValid && form.name.trim().length > 0}
                aria-invalid={!!showNameError}
                aria-describedby={showNameError ? 'name-error' : undefined}
                maxLength={MAX_NAME_LENGTH}
                autoComplete="off"
              />
              <CharCounter $nearLimit={form.name.length > MAX_NAME_LENGTH - 5}>
                {form.name.length}/{MAX_NAME_LENGTH}
              </CharCounter>
            </InputWrapper>
            {showNameError && (
              <ErrorContainer id="name-error">
                <IconAlert />
                <ErrorMsg>{errors.name}</ErrorMsg>
              </ErrorContainer>
            )}
          </Field>

          {/* Subject Select */}
          <Field>
            <Label htmlFor="subject_tag">Subject</Label>
            <SelectWrapper ref={selectRef}>
              <SelectTrigger
                id="subject_tag"
                type="button"
                onClick={() => setSelectOpen(!selectOpen)}
                $hasValue={!!form.subject_tag}
                $hasError={!!errors.subject_tag}
                aria-haspopup="listbox"
                aria-expanded={selectOpen}
                aria-labelledby="subject-label"
              >
                {form.subject_tag || 'Select a subject'}
                <SelectArrow $open={selectOpen}>
                  <IconChevronDown />
                </SelectArrow>
              </SelectTrigger>

              {selectOpen && (
                <DropdownPanel role="listbox">
                  <DropdownSearch>
                    <IconSearch />
                    <DropdownSearchInput
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search subjects..."
                      value={selectSearch}
                      onChange={(e) => setSelectSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </DropdownSearch>
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject, idx) => (
                      <DropdownOption
                        key={subject}
                        role="option"
                        aria-selected={form.subject_tag === subject}
                        $selected={form.subject_tag === subject}
                        $highlighted={highlightedIndex === idx}
                        onClick={() => handleSelectSubject(subject)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {subject}
                      </DropdownOption>
                    ))
                  ) : (
                    <DropdownEmpty>No subjects found</DropdownEmpty>
                  )}
                </DropdownPanel>
              )}
            </SelectWrapper>
            {errors.subject_tag && (
              <ErrorContainer>
                <IconAlert />
                <ErrorMsg>{errors.subject_tag}</ErrorMsg>
              </ErrorContainer>
            )}
          </Field>

          {/* Max Members */}
          <Field>
            <Label htmlFor="max_members">Max members</Label>
            <StepperRow>
              <StepperBtn
                type="button"
                onClick={() => handleMemberStep(-1)}
                disabled={form.max_members <= 2}
                aria-label="Decrease members"
              >
                <IconMinus />
              </StepperBtn>
              <StepperValue>
                {form.max_members}
                {form.max_members === 8 && <RecommendedBadge>Recommended</RecommendedBadge>}
              </StepperValue>
              <StepperBtn
                type="button"
                onClick={() => handleMemberStep(1)}
                disabled={form.max_members >= 20}
                aria-label="Increase members"
              >
                <IconPlus />
              </StepperBtn>
            </StepperRow>
            <SliderContainer>
              <Slider
                id="max_members"
                name="max_members"
                type="range"
                min="2"
                max="20"
                value={form.max_members}
                onChange={handleSliderChange}
                aria-label="Maximum members"
              />
            </SliderContainer>
            <HintText>Drag the slider or use buttons to set between 2 and 20 members. Default is 8.</HintText>
            {errors.max_members && (
              <ErrorContainer>
                <IconAlert />
                <ErrorMsg>{errors.max_members}</ErrorMsg>
              </ErrorContainer>
            )}
          </Field>
        </FormCard>

        {/* Live Preview */}
        <PreviewSection>
          <PreviewLabel>Preview</PreviewLabel>
          {form.name.trim() ? (
            <PreviewCard>
              <PreviewTitle>{form.name}</PreviewTitle>
              <PreviewMeta>
                {form.subject_tag && <Badge>{form.subject_tag}</Badge>}
                <Badge style={{ background: '#F1F5F9', color: '#475569' }}>
                  New Group
                </Badge>
              </PreviewMeta>
              <PreviewMembers>
                <IconUsers />
                0 / {form.max_members} members
                <AvatarStack>
                  <Avatar $index={0}>YO</Avatar>
                  <Avatar $index={1}>U</Avatar>
                  <AvatarMore>+{Math.max(0, form.max_members - 3)}</AvatarMore>
                </AvatarStack>
              </PreviewMembers>
            </PreviewCard>
          ) : (
            <PreviewCard $empty>
              <PreviewEmptyText>Your group will appear here</PreviewEmptyText>
            </PreviewCard>
          )}
        </PreviewSection>

        {/* Actions */}
        <BtnRow>
          <CancelBtn type="button" onClick={onClose}>
            Cancel
          </CancelBtn>
          <SubmitBtn
            type="button"
            onClick={handleSubmit}
            disabled={loading || success}
            $success={success}
          >
            {loading && !success ? (
              <>
                <Spinner />
                Creating...
              </>
            ) : success ? (
              <>
                <IconCheck />
                Created!
              </>
            ) : (
              'Create Group'
            )}
          </SubmitBtn>
        </BtnRow>
      </Modal>
    </Overlay>,
    document.body
  );
}
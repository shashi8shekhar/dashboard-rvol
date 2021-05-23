import React from 'react';
import { css } from 'aphrodite';
import CircularProgress from 'components/core/circularProgress/CircularProgress';

import classnames from 'classnames';
import styles from './ButtonStyle';

export const ButtonTypes = {
  PRIMARY: 'PRIMARY',
  LIGHT: 'LIGHT',
  WHITE: 'WHITE',
};

const getClassname = type => {
  switch (type) {
    case ButtonTypes.PRIMARY:
      return styles.primaryBtn;
    case ButtonTypes.LIGHT:
      return styles.lightBtn;
    case ButtonTypes.WHITE:
      return styles.whiteBtn;
    default:
      return '';
  }
};

const getLoaderColor = type => {
  switch (type) {
    case ButtonTypes.PRIMARY:
      return '#ffffff';

    default:
      return '#000000';
  }
};

const Button = ({ type, text, className, style, leftIcon, rightIcon, onClick, disabled, isLoading, title }) => {
  const buttonClassName = getClassname(type);

  const renderLeftIcon = () => {
    return leftIcon ? <span className={css(styles.leftIcon)}>{leftIcon}</span> : null;
  };

  const renderRightIcon = () => {
    return rightIcon ? <span className={css(styles.rightIcon)}>{rightIcon}</span> : null;
  };

  return (
    <button
      title={title}
      style={style}
      className={classnames(
        css(styles.button, buttonClassName, (disabled || isLoading) && styles.disabled),
        className,
        'no-css'
      )}
      onClick={onClick}
    >
      {isLoading ? (
        <CircularProgress noWrapper size={20} style={{ color: getLoaderColor(type) }}></CircularProgress>
      ) : (
        <>
          {renderLeftIcon()}
          {text}
          {renderRightIcon()}
        </>
      )}
    </button>
  );
};

export default Button;

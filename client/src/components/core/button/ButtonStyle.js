import { StyleSheet } from 'aphrodite';

const styles = StyleSheet.create({
  button: {
    background: 'transparent',
    border: 'none',
    color: '#4280f5',
    padding: '0 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '30px',
    borderRadius: '2px',
    fontSize: '14px',
    lineHeight: '14px',
  },
  primaryBtn: {
    backgroundColor: '#3477f8',
    opacity: 0.9,
    color: '#ffffff',
    transition: 'opacity 0.2s ease-in-out',
    ':hover': {
      opacity: 1,
    },
  },
  lightBtn: {
    backgroundColor: '#F8F8F8',
    border: '1px solid #d8d8de',
    color: '#4a4956',
    transition: 'background-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: '#F0F0F0',
    },
  },
  whiteBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #d8d8de',
    color: '#4a4956',
    transition: 'background-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: '#F0F0F0',
    },
  },
  disabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  leftIcon: {
    marginRight: '8px',
  },
  rightIcon: {
    marginLeft: '8px',
  },
});

export default styles;
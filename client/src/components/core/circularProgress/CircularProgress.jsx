import React from 'react';
import MaterialCircularProgress from '@material-ui/core/CircularProgress';

import classes from './CircularProgress.module.css';

const CircularProgress = props => {
  const { small, noWrapper, ...rest } = props;

  const loader = (
    <MaterialCircularProgress
      style={{ color: '#3478f8' }}
      thickness={small ? 6 : 4}
      size={small ? 30 : 50}
      {...rest}
    ></MaterialCircularProgress>
  );

  return noWrapper ? <>{loader}</> : <div className={classes.circularProgressWrapper}>{loader}</div>;
};

export default CircularProgress;

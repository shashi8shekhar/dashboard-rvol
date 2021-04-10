import React from 'react';
import axios from 'axios';

import { Button } from '@material-ui/core';

function callServer() {
  axios.get(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/test`, {
    params: {
      table: 'sample',
    },
  }).then((response) => {
    console.log(response.data);
  });
}

export function SampleComponent() {
  return (
    <div>
      This is a sample component
      <Button color="primary">Hello World</Button>
      {callServer()}
    </div>
  );
}
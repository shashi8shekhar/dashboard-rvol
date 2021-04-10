import React from 'react';
import axios from 'axios';

import { Button } from '@material-ui/core';

function callServer() {
  axios.get(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/test`, {
    params: {
      table: 'sample',
    },
  }).then((response) => {
    console.log('test', response.data);
  });
}

function callServer1() {
  axios.get(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/loadConfig`)
      .then((response) => {
        console.log('loadConfig', response.data);
        axios.post(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/loadRvolData`, {
          params: {
            products: response.data,
          },
        }).then((result) => {
            console.log('loadRvolData', result.data);
          }).catch(error => {
            console.error(error)
          });

      });
}


export function SampleComponent() {
  return (
    <div>
      This is a sample component
      <Button color="primary">Hello World</Button>
      {callServer()}
      {callServer1()}
    </div>
  );
}
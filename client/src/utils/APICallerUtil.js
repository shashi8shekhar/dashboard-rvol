import superagent from 'superagent';
import { toast } from 'react-toastify';

export function makeCall(payload) {
  if (payload.apiType == 'get') {
    return new Promise((resolve, reject) => {
      superagent
        .get(payload.urlPath)
        .withCredentials()
        .query(payload.query)
        .end((err, res) => {
          if (err) {
            reject(err);
            handleError(err, payload.urlPath);
          } else {
            resolve(res.body);
          }
        });
    });
  } else if (payload.apiType == 'post') {
    return new Promise((resolve, reject) => {
      if (payload.responseType === 'binnary') {
        var request;
        request = superagent
          .post(payload.urlPath)
          .responseType('blob')
          .withCredentials()
          .send(payload.body)
          .end((err, res) => {
            if (err) {
              reject(err);
              handleError(err, payload.urlPath);
            } else {
              resolve({ data: res.body, fileDetail: res.xhr.getResponseHeader('Content-Disposition') });
            }
          });
      } else {
        request = superagent
          .post(payload.urlPath)
          .withCredentials()
          .send(payload.body)
          .end((err, res) => {
            if (err) {
              reject(err);
              handleError(err, payload.urlPath);
            } else {
              if (res.type === 'application/json') {
                resolve(res.body);
              } else {
                resolve(res.text);
              }
            }
          });
      }
    });
  }
}

export function handleError(err, urlPath) {
  if (err && err.response) {
    if (err.response && (err.response.status === 301 || err.response.status === 302)) {
      toast.error('User Not authenticated, Need to login');
      window.location = window.location.host + window.location.hash;
    } else if (err.response && err.response.status === 500) {
      toast.error('500 internal server error');
    } else if (err.response && err.response.status === 404) {
      toast.error('API endpoint not reachable');
    } else if (err.response && err.response.status === 400) {
      toast.error('API Error');
    } else {
      toast.error('API Error');
    }
  } else {
    toast.error('API Error');
  }
}

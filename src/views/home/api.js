import axios from 'axios';

const API_URL = 'https://flosight.mk1.alexandria.io/api/';

const CONFIG = {
  mode: 'no-cors',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }
}

export const getTransaction = (txid, success, failure) => {
  const API_ENDPOINT = 'tx/';
  const GET_URL = API_URL + API_ENDPOINT + txid;

  return axios
    .get(GET_URL, CONFIG)
    .then(response => {
      success(response.data)
    })
    .catch(error => {
      failure(error.data)
    })
}
import axios from 'axios';

const API_URL = 'https://testnet.explorer.mediciland.com/api/';

const CONFIG = {
  mode: 'no-cors',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }
}

export async function getTransaction (txid) {
  const API_ENDPOINT = 'tx/';
  const GET_URL = API_URL + API_ENDPOINT + txid;

  let res
  
  try {
    res = await axios.get(GET_URL, CONFIG)
  } catch (e) {
    console.error("Failed to get Transaction!")
    console.error(e)
  }

  return res.data
}
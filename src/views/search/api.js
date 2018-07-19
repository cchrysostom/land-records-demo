import axios from 'axios';

const API_URL = 'https://testnet.flocha.in/api';

export const getTransaction = (txid, success, failure) => {
  const API_ENDPOINT = 'tx/'
  const GET_URL = API_URL + API_ENDPOINT + txid
  fetch(GET_URL)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      let tx = {
        txId: json.txid,
        size: json.size,
        fee: json.fees,
        block: json.blockhash,
        received: json.time,
        blocktime: json.blocktime,
        locktime: json.locktime 
      }
      success(tx)
    })
    .then((err) => {
      failure(err)
    })
}

export const getAddress = (data, success, failure) => {
  const API_ENDPOINT = 'addr/'
  // ?address=

}

export const getTransactionsByAddress = (data, success, failure) => {
  const API_ENDPOINT = 'txs/'
  // ?address=
}

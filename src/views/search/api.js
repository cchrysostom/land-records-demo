const API_URL = 'https://testnet.flocha.in/api';

export const getTransaction = (txid, success, failure) => {
  const API_ENDPOINT = 'tx/'
  const GET_URL = API_URL + '/' + API_ENDPOINT + txid

  fetch(GET_URL)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      let tx = {...json}
      tx.txId = tx.txid;
      tx.received = tx.time;
      success(tx)
    })
    .catch((err) => {
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

const API_URL = 'https://testnet.explorer.mediciland.com/api';

export function getTransaction (txid, success, failure) {
  return new Promise((resolve, reject) => {
    let API_ENDPOINT = 'tx/'
    let GET_URL = API_URL + '/' + API_ENDPOINT + txid

    fetch(GET_URL)
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        let tx = {...json}
        tx.txId = tx.txid;
        tx.received = tx.time;
        resolve(tx)
      })
      .catch((err) => {
        console.log(err)
      })
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

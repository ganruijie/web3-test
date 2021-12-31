import Web3 from 'web3'

/*
* 1. Check for injected web3 (mist/metamask)
* 2. If metamask/mist create a new web3 instance and pass on result
* 3. Get networkId - Now we can check the user is connected to the right network to use our dApp
* 4. Get user account from metamask
* 5. Get user balance
*/
export let getWeb3 = () => {
  return new Promise(function(resolve, reject) {
    // Check for injected web3 (mist/metamask)
    if (window.ethereum || typeof window.web3 !== 'undefined') {
      var web3 = new Web3(window.ethereum || window.web3.currentProvider);
      resolve({
        isConnected: window.ethereum.isConnected(),
        web3() {
          return web3;
        }
      })
    } else {
      reject(new Error('Non-Ethereum browser detected. You should consider trying MetaMask!'));
    }
  }).then(result => {
    return new Promise(function(resolve, reject) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(resolve(result))
        .catch((error) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log('User rejected the request.');
          } else {
            console.error(error);
          }
          reject(new Error(error))
        });    
    })
  })
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve network ID
      result.web3().eth.net.getId().then(networkId => {
        // Assign the networkId property to our result and resolve promise
        result = Object.assign({}, result, {networkId})
        resolve(result)
      }).catch(() => {
        // If we can't find a networkId keep result the same and reject the promise
        reject(new Error('Unable to retrieve network ID'))
      });
    })
  })
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve coinbase
      result.web3().eth.getCoinbase((err, coinbase) => {
        if (err) {
          reject(new Error('Unable to retrieve coinbase'))
        } else {
          result = Object.assign({}, result, { coinbase });
          resolve(result)
        }
      })
    })
  })
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve balance for coinbase
      result.web3().eth.getBalance(result.coinbase, (err, balance) => {
        if (err) {
          reject(new Error('Unable to retrieve balance for address: ' + result.coinbase))
        } else {
          result = Object.assign({}, result, { balance })
          resolve(result)
        }
      })
    })
  })
}
export let getChainChanged = () => {
  window.ethereum.on('chainChanged', chainId => {
    return chainId;
  });
}
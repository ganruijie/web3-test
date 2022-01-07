import { createStore } from 'vuex'
import Web3 from 'web3'

export default createStore({
  state: {
    chainId: null,
    ethereum: {},
    accounts: '',
    metaMaskCanUse: false
  },
  mutations: {
    SET_CHAINID(state, value) {
      state.chainId = value;
    },
    SET_ETHEREUM(state, value) {
      state.ethereum = Object.assign({}, value);
    },
    CHANGE_ACCOUNTS(state, value) {
      state.accounts = value;
    },
    SET_META_MASKCANUSE(state, value) {
      state.metaMaskCanUse = value;
    }
  },
  actions: {
    getWeb3({dispatch, commit, state}) {
      return new Promise(function(resolve, reject) {
        // Check for injected web3 (mist/metamask)
        if (window.ethereum || typeof window.web3 !== 'undefined') {
          var web3 = new Web3(window.ethereum || window.web3.currentProvider);
          dispatch('getChainChanged');
          dispatch('getAccountsChanged');
          resolve({
            web3() {
              return web3;
            }
          })
        } else {
          commit('SET_META_MASKCANUSE', false);
          reject(new Error('Non-Ethereum browser detected. You should consider trying MetaMask!'));
        }
      }).then(result => {
        // Pop-up metamask
        return new Promise(function(resolve, reject) {
          window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          })
          .then((permissions) => {
            const accountsPermission = permissions.find(
              (permission) => permission.parentCapability === 'eth_accounts'
            );
            if (accountsPermission) {
              console.log('eth_accounts permission successfully requested!');
            }
            resolve(result)
          })
          .catch((error) => {
            if (error.code === 4001) {
              // EIP-1193 userRejectedRequest error
              console.log('Permissions needed to continue.');
            } else {
              console.error(error);
            }
            reject(new Error(error.message))
          });
        })
      })
      .then(result => {
        return new Promise(function(resolve, reject) {
          window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(() => {
              dispatch('getChainId');
              resolve(result);
              commit('SET_META_MASKCANUSE', true);
            }).catch((error) => {
              if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('User rejected the request.');
              } else {
                console.error(error.message);
              }
              commit('SET_META_MASKCANUSE', false);
              reject(new Error(error.message))
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
              result = Object.assign({}, result, { balance }, {chainId: state.chainId})
              commit('SET_ETHEREUM', result)
              resolve(result)
            }
          })
        })
      })
    },
    getChainId({ commit }) {
      window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
        commit('SET_CHAINID', chainId);
        return chainId;
      })
    },
    getChainChanged({ dispatch, commit }) {
      window.ethereum.on('chainChanged', chainId => {
        commit('SET_CHAINID', chainId)
        dispatch('getWeb3');
        return chainId;
      });
    },
    getAccountsChanged({ dispatch, commit }) {
      window.ethereum.on('accountsChanged', accounts => {
        console.log('accountsChanged');
        commit('CHANGE_ACCOUNTS', accounts)
        dispatch('getWeb3');
      });
    },
  },
  modules: {
  }
})

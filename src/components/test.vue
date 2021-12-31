<template>
  <div class="web3-test">
    <p>web3-test</p>
    <button class="send-btn" @click="sendBtn">sendTransaction</button>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive } from 'vue';
import { useStore } from 'vuex'
export default defineComponent({
  name: 'Test',
  setup(props, content) {
    const store = useStore();
    let methodsFn = {
      init () {
        store.dispatch('getWeb3').then(res => {
          console.log(res, "newWeb3")
        }).catch(err => {
          let { message } = err;
          console.log(message, "999")
        });
      }
    };
    const newWeb3 = computed(() => store.state.ethereum);
    onMounted(() => {
      methodsFn.init();
    });
    const sendBtn = () => {
      let { coinbase, web3 } = newWeb3;
      let param = {
        from: coinbase,
        to: '0x08b46eb918F1B754648172395d8eE52a3BEf4710',
        value: 100000000000000000, //单位wei,1eth = 10^18
        gas: 21000, //默认21000wei
        gasPrice: 20, //默认20Gwei = 20000000000,默认手续费计算 gas*gasPrice 21000*20G = 0.00042eth
      };
      web3().eth.sendTransaction(param)
      .on('transactionHash', function(hash){
        console.log(hash, 'sendTransaction-hash')
      })
      .on('receipt', function(receipt){
        console.log(receipt, 'sendTransaction-receipt')
      })
      .on('confirmation', function(confirmationNumber, receipt){ 
        console.log(confirmationNumber, receipt, 'sendTransaction-confirmationNumber')
      })
      .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
    };
    return {
      sendBtn,
    }
  }
});
</script>

<style scoped>

</style>

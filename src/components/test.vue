<template>
  <div class="web3-test">
    <p>web3-test</p>
    <button class="send-btn" @click="sendBtn">sendTransaction</button>
  </div>
  <div class="test-box">
    <figure class="hover-img">
      <img src="https://picsum.photos/id/200/440/320.jpg"/>
      <figcaption>
        <h3>Lorem <br/>Ipsum</h3>
      </figcaption>
    </figure>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, reactive } from 'vue';
import { useStore } from 'vuex'
class LinkedList {
  constructor(data) {
    this.data = data;
  }
  firstItem() {
    return this.data.find(i => i.head);
  }
  findById(id) {
    return this.data.find(item => item.id === id)
  }
  [Symbol.iterator]() {
    let item = { next: this.firstItem().id };
    return {
      next: () => {
        item = this.findById(item.next);
        if (item) {
          return { value: item.value, done: false };
        }
        return { value: undefined, done: true };
      }
    }
  }
}
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
      const myList = new LinkedList([
        { id: 'a10', value: 'First', next: 'a13', head: true },
        { id: 'a11', value: 'Last', next: null, head: false },
        { id: 'a12', value: 'Third', next: 'a11', head: false },
        { id: 'a13', value: 'Second', next: 'a12', head: false },
      ]);
      for (let item of myList) {
        console.log(item); // 'First', 'Second', 'Third', 'Last'
      }
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

<style scoped lang="less">
  .hover-img {
    position: relative;
    overflow: hidden;
    max-width: 320px;
    min-width: 240px;
    display: inline-block;
    background-color: #000;
    color: #fff;
    text-align: center;
    &::after, &::before {
      background-color: rgba(0, 0, 0, 0.5);
      border-top: 32px solid rgba(0, 0, 0, 0.5);
      border-bottom: 32px solid rgba(0, 0, 0, 0.5);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      content: '';
      transition: all 0.3s ease;
      z-index: 1;
      opacity: 0;
      transform: scaleY(2);
    }
    &:hover::after, &:hover::before {
      transform: scale(1);
      opacity: 1;
    }
    &:hover {
      img {
        opacity: 0.7;
      }
      figcaption  {
        opacity: 1;
      }
    }
    img {
      vertical-align: top;
      max-width: 100%;
      backface-visibility: hidden;
    }
    figcaption {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      align-items: center;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.1em;
      opacity: 0;
      z-index: 2;
      transition-delay: 0.1s;
      font-size: 24px;
      font-family: sans-serif;
      font-weight: 400;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }
  .hover-img * {
    box-sizing: border-box;
    transition: all 0.45 ease;
  }
</style>

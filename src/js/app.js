App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init function() {
    return App.initWeb3();
  }
}
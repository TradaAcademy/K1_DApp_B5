App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('TradaToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.TradaToken = TruffleContract(data);

      // Set the provider for our contract.
      App.contracts.TradaToken.setProvider(App.web3Provider);

      // Use our contract to get balance
      App.getBalances();

      // watch Transfered event
      web3.eth.getBlockNumber(function(err, blockNumber) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Latest block: " + blockNumber);
        App.watchEvent(blockNumber + 1);
      });
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.TradaToken.deployed().then(function(instance) {
        return instance.transfer(toAddress, amount, {from: account, gas: 100000});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  watchEvent: function(fromBlock) {
    var startTime = Date.now() / 1000;
    App.contracts.TradaToken.deployed().then(function(instance) {

      // Note
      // To get all past events at once (in one event), use .get()
      // To get all past events separately, use watch({}, {fromBlock: 0})

      instance.Transfer().watch(function(error, result){
        if (result.blockNumber >= fromBlock) {
          var from = result.args.from;
          var to = result.args.to;
          var value = result.args.value.toNumber();
          console.log(from, to, value);
        }
      });
    })
    .catch(function(err) {
      console.log(err.message);
    });
  },

  getBalances: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.TradaToken.deployed().then(function(instance) {
        return instance.balanceOf(account);
      }).then(function(result) {
        balance = result.c[0];

        $('#TTBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

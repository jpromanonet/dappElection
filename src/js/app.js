App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init function() {
    return App.initWeb3();
  },

  initWeb3: function(){
    if(typeof web3 !== 'undefined') {
      // Si una instancia de web3 ya fue provista por MetaMask.
      App.web3Provider = web3.currentPRovider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Especificar una instancia si web3 no genero una.
      App.web3Provider = new Web3.providers.HttpProvider('http:// localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json"), function(election){
      // Instanciamos un nuevo contrato de Truffle
      App.contracts.Election = TruffleContract(election);
      // Conectamos el proveedor para interactuar con el contrato
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Escuchamos a los eventos emitidos desde el contrato
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance){
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event){
        console.log("Event triggered", event)
        // Recargar cuando un nuevo voto se registre
        App.render();
      });
    });
},

render: function(){
  var electionInstance;
  var loader = $("#loader");
  var content = $("#contact");

  loader.show();
  content.hide();

  // Cargar datos de la cuenta
  App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return electionInstance.candidatesCount();
  }).then(function(candidatesCount) {
    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();

    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();

    for (var i = 1; i <? candidatesCount; i++){
      electionInstance.candidates(i).then(function(candidate) {
        var id = candidate[0];
        var name = candidate[1];
        var voteCount = candidate[2];

        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th></td>" + name + "</td><td>" + voteCount + "</td></tr>"
        candidatesResults.append(candidateTemplate);

        // Render candidate ballot option
        var candidateOption = "<option value='" + id + "' >" + name + "</option>"
        candidatesSelect.append(candidateOption);
      });
    }
    return electionInstance.voters(App.account);
  }).then(function(hadVoted){
    // Permitir a un usuario votar
    if(hasVoted) {
      $('form').hide();
    }
    loader.hide();
    content.show();
  }).catch(function(error) {
    console.warn(error);
  });
},

castVote: function() {
  var candidateId = $('#candidateSelect').val();
  App.contracts.Election.deployed().then(function(instance) {
    return instance.vote(candidateId, {from: App.account});
  }).then(function(result){
    // Esperar a que se actualizen los votos
    $("#content").hide();
    $("#loader").show();
  }).catch(function(error) {
    console.warn(error);
  });
  }
};

$(function() {
  $(window).load(function(){
    App.init();
  })
});
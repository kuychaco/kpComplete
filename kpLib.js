var brain = require('brain');
var Parallel = require('paralleljs');

var bestNet = {
  jsonBackup: '',
  errorRate: 1,
  trainingTime: Infinity
};

module.exports = {
  train: function(trainingData) {
    // var p = new Parallel(training,{ evalPath: 'node_modules/paralleljs/lib/eval.js' });
    multipleNetAlgo(trainingData);
    // TODO: investigate if we need to give them a callback. does this become asynch with paralleljs?
    console.log('your best net is:', bestNet.jsonBackup);
    var net = new brain.NeuralNetwork();
    net.fromJSON(bestNet.jsonBackup);
    return net;
  }
};

var parallelNets = function(hlNum, trainingData) {
  var hlArray = [];
  for(var i = 0; i < hlNum; i++) {
    // TODO: build out logic for how many nodes to put in each hidden layer
    hlArray.push(10);
  }

  console.log('hlArray is:',hlArray);
  var net = new brain.NeuralNetwork({
    hiddenLayers: hlArray, //Use the docs to explore various numbers you might want to use here
    learningRate: 0.6
  });

  var trainingResults = net.train(trainingData, {
    errorThresh: 0.05,  // error threshold to reach
    iterations: 10,   // maximum training iterations
    log: true,           // console.log() progress periodically
    logPeriod: 1,       // number of iterations between logging
  });

  console.log('trainingResults is:',trainingResults);
  bestNetChecker(trainingResults,net);
};

var bestNetChecker = function(trainingResults,trainedNet) {
  if(trainingResults.error < bestNet.errorRate) {
    bestNet.jsonBackup = trainedNet.toJSON();
    bestNet.errorRate = trainingResults.error;
  }

  console.log('bestNet now is:',bestNet);
};

var multipleNetAlgo = function(trainingData) {
  // TODO: add in more fun logic for which nets to create. 
  for(var i = 2; i > 0; i--) {
    parallelNets(i, trainingData);
  }
};
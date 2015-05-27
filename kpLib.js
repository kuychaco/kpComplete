var brain = require('brain');
var Parallel = require('paralleljs');

var bestNet = {
  jsonBackup: '',
  errorRate: 1,
  trainingTime: Infinity
};

module.exports = {
  train: function(trainingData) {
    // Creating a new global variable p that holds our training data for parallelization
    // TODO: Right now I think this path will only work for our learningMachines repo. Investigate how to make this generalized. 
    p = new Parallel(trainingData,{ evalPath: 'server/node_modules/paralleljs/lib/eval.js' });
    multipleNetAlgo(trainingData).then(function() {
      // TODO: investigate if we need to give them a callback. does this become asynch with paralleljs?
      // TODO: Refactor everything to be promise based. Parallelization looks like it requires 
      console.log('your best net is:', bestNet.jsonBackup);
      var net = new brain.NeuralNetwork();
      net.fromJSON(bestNet.jsonBackup);
      return net;
    });
  }
};

var makeTrainingFunc = function(hlNum) {
  var hlArray = [];
  for(var i = 0; i < hlNum; i++) {
    // TODO: build out logic for how many nodes to put in each hidden layer
    hlArray.push(10);
  }

  console.log('hlArray is:',hlArray);
  var net = new brain.NeuralNetwork({
    hiddenLayers: hlArray, //Use the docs to explore various numbers you might want to use here
  });

  var trainingParams = {
      errorThresh: 0.05,  // error threshold to reach
      iterations: 10,   // maximum training iterations
      log: true,           // console.log() progress periodically
      logPeriod: 1,       // number of iterations between logging
      learningRate: 0.3    // learning rate
    };

  return function(data) {
    var trainingResults = net.train(data, trainingParams);
    console.log('trainingResults is:',trainingResults);
    bestNetChecker(trainingResults,net);
  };

};

var bestNetChecker = function(trainingResults,trainedNet) {
  // TODO: every time we have a new bestNet, write that to a file. 
  // That way the user always has access to the current best known net
  // even if they have to abort midway through. 
  // The file will be named the same thing no matter what, so we don't need to worry about creating too many files or confusing the user with non-optimal nets being written to file. 
  // How do we name this file? Probably take the time of day at the start of the training and include that in the name, plus bestNet
  // TODO: write to a file a list of all the param combinations we've already tried
  // Then let the user pass this in to us, and we'll make sure to not test those again
  // This again lets them bail midway through and pick up where they left off. 
  // It also lets them add in param combinations to ignore if they want more control. 
  if(trainingResults.error < bestNet.errorRate) {
    bestNet.jsonBackup = trainedNet.toJSON();
    bestNet.errorRate = trainingResults.error;
  }

  console.log('bestNet now is:',bestNet);
};

var multipleNetAlgo = function(trainingData) {
  // TODO: add in more fun logic for which nets to create. 
  var totalCompleted = 0;
  var totalToRun = 2;
  for(var i = 2; i > 0; i--) {
    p.spawn(makeTrainingFunc(i)).then(function() {
      totalCompleted += 1;
    });
  }

  // TODO: there's a prettier way to do this with promises. 
  while (totalCompleted < totalToRun) {
    //do nothing
  }

  // I'm not sure how to return a promise. But that's what we'll have to do. 
  return true;
};
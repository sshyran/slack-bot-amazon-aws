/**
 * Requires (Custom Modules)
 */
var helper = require('./helper');
var commands = require('./commands');

/**
 * Main Lambda function
 *
 * @param {object} event AWS Lambda uses this parameter to pass in event data to the handler.
 * @param {object} context AWS Lambda uses this parameter to provide your handler the runtime information of the Lambda function that is executing.
 */
exports.handler = function(event, context) {
  processCommands(event, context);
};

/**
 * Process Commands
 *
 * @param {object} event AWS Lambda Event
 * @param {object} context AWS Lambda Context
 */
function processCommands(event, context) {
  if (event && event.text && event.trigger_word) {
    if (!commands[event.trigger_word]) {
      context.fail({text: 'Error: Invalid Command'});
    }

    var command = event.trigger_word.toLowerCase();
    var commandArguments = helper.parseCommand(event.text.trim());

    commands[command](commandArguments[command]).then(function(response) {
      console.log('Success: ' + JSON.stringify(response));
      context.succeed(response);
    }).catch(function(error) {
      console.log('Error: ' + JSON.stringify(error));
      context.fail({text: error});
    });
  } else {
    context.fail({text: 'Error: Event not specified'});
  }
}

/*
@TODO: Port it to proper test
var event = [
  {
    trigger_word: 'bus', // eslint-disable-line camelcase
    text: 'bus 14229 61'
  },
  {
    trigger_word: 'bus', // eslint-disable-line camelcase
    text: 'bus 14229'
  },
  {
    trigger_word: 'haze', // eslint-disable-line camelcase
    text: 'haze'
  },
  {
    trigger_word: 'ipinfo', // eslint-disable-line camelcase
    text: 'ipinfo 8.8.8.8'
  },
  {
    trigger_word: 'socialstats', // eslint-disable-line camelcase
    text: 'socialstats <https://lesterchan.net/blog/2016/02/26/singtel-samsung-galaxy-s7-4g-and-galaxy-s7-edge-4g-price-plans/>'
  }
];
var context = {
  fail: function(error) {
    console.log(error);
  },
  succeed: function(success) {
    console.log(success);
  }
};
event.forEach(function(e) {
  processCommands(e, context);
});
*/

/**
 * Requires (Third Party Modules)
 */
var rp = require('request-promise'),
    moment = require('moment');

/**
 * Requires (Custom Modules)
 */
var helper = require('./helper');

/**
 * Main Lambda function
 */
exports.handler = function(event, context) {
    if(event && event.text) {
        var command = helper.parseCommand(event.text.trim());

        if(!command || !command.bus) {
            context.fail('Error: Invalid Command');
        }

        if(command.bus.length === 0) {
            context.fail('Error: Invalid Arguments');
        }

        getBusArrival(command.bus[0], (command.bus[1] ? command.bus[1] : '')).then(function(response) {
            console.log('Success: ' + JSON.stringify(response));
            context.succeed(response);
        }).catch(function(error) {
            console.log('Error: ' + JSON.stringify(error));
            context.fail(error);
        });
    } else {
        context.fail('Error: Event not specified');
    }
};

/**
 * Get Bus Arrival Timing
 */
function getBusArrival(busStopNo, busNo) {
    busNo = busNo || '';

    return rp({
        uri: 'https://api.lesterchan.net/v1/lta/bus-arrival/' + busStopNo + (busNo !== '' ? '/' + busNo : ''),
        json: true
    }).then(function(body) {
        if (body['Services'] && body['Services'].length > 0) {
            var attachments = [];
            
            for(var i = 0; i < body['Services'].length; i++) {
                // Fields
                var fields = [];

                // Bus Arrival Timings
                if(body['Services'][i]['Status'] !== 'Not In Operation') {
                    var nextBus = body['Services'][i]['NextBus'],
                        subBus = body['Services'][i]['SubsequentBus'],
                        followBus = body['Services'][i]['SubsequentBus3'];
                    if (nextBus['EstimatedArrival'] !== '') {
                        fields.push({
                            'title': 'Next Bus',
                            'value': moment(nextBus['EstimatedArrival']).fromNow() + ' (' + nextBus['Load'] + ')'
                        });
                    } else {
                        if (body['Services'][i]['Status'] === 'In Operation') {
                            fields.push({
                                'title': 'Next Bus',
                                'value': 'No Estimate Available'
                            });
                        } else {
                            fields.push({
                                'title': 'Next Bus',
                                'value': 'Not Operating Now'
                            });
                        }
                    }
                    if (subBus['EstimatedArrival'] !== '') {
                        fields.push({
                            'title': 'Subsequent Bus',
                            'value': moment(subBus['EstimatedArrival']).fromNow() + ' (' + subBus['Load'] + ')'
                        });
                    } else {
                        if (body['Services'][i]['Status'] === 'In Operation') {
                            fields.push({
                                'title': 'Subsequent Bus',
                                'value': 'No Estimate Available'
                            });
                        } else {
                            fields.push({
                                'title': 'Subsequent Bus',
                                'value': 'Not Operating Now'
                            });
                        }
                    }
                    if (followBus['EstimatedArrival'] !== '') {
                        fields.push({
                            'title': 'Following Bus',
                            'value': moment(followBus['EstimatedArrival']).fromNow() + ' (' + followBus['Load'] + ')'
                        });
                    } else {
                        if (body['Services'][i]['Status'] === 'In Operation') {
                            fields.push({
                                'title': 'Following Bus',
                                'value': 'No Estimate Available'
                            });
                        } else {
                            fields.push({
                                'title': 'Following Bus',
                                'value': 'Not Operating Now'
                            });
                        }
                    }
                }

                // Determine Color
                var color = '#479b02';
                if (body['Services'][i]['NextBus']['Load'] === 'Limited Standing') {
                    color = '#d60000';
                } else if (body['Services'][i]['NextBus']['Load'] === 'Standing Available') {
                    color = '#ea8522';
                }

                // Push To Attachments
                attachments.push({
                    'pretext': ':oncoming_bus:   *' + body['Services'][i]['ServiceNo'] + '*     :busstop: *' + body['BusStopID'] + '*',
                    'title': body['Services'][i]['Status'],
                    'fallback': helper.getFallbackMessage(fields),
                    'mrkdwn_in': ['pretext', 'title'],
                    'color': color,
                    'fields': fields
                });
            }

            return {
                'attachments': attachments
            };
        }
    });
}
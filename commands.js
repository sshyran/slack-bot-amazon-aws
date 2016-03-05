/**
 * Requires
 */
var config = require('./config'),
    helper = require('./helper'),
    rp = require('request-promise'),
    moment = require('moment'),
    ip = require('ip');

/**
 * Commands
 */
module.exports = {
    /**
     * Get Bus Arrival Timing
     */
    bus: function(commandArguments) {
        var busStopNo = commandArguments[0], busNo = commandArguments[1] || '';

        return rp({
            uri: config.lesterchanApiUrl + '/lta/bus-arrival/' + busStopNo + (busNo !== '' ? '/' + busNo : ''),
            json: true
        }).then(function(body) {
            if (body['Services'] && body['Services'].length > 0) {
                var attachments = [];
                body['Services'].forEach(function(bus) {
                    // Fields
                    var fields = [];

                    // Bus Arrival Timings
                    if(bus['Status'] !== 'Not In Operation') {
                        var nextBus = bus['NextBus'],
                            subBus = bus['SubsequentBus'],
                            followBus = bus['SubsequentBus3'];
                        if (nextBus['EstimatedArrival'] !== '') {
                            fields.push({
                                'title': 'Next Bus',
                                'value': moment(nextBus['EstimatedArrival']).fromNow() + ' (' + nextBus['Load'] + ')'
                            });
                        } else {
                            if (bus['Status'] === 'In Operation') {
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
                            if (bus['Status'] === 'In Operation') {
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
                            if (bus['Status'] === 'In Operation') {
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
                    if (bus['NextBus']['Load'] === 'Limited Standing') {
                        color = '#d60000';
                    } else if (bus['NextBus']['Load'] === 'Standing Available') {
                        color = '#ea8522';
                    }

                    // Push To Attachments
                    attachments.push({
                        'pretext': ':oncoming_bus:   *' + bus['ServiceNo'] + '*     :busstop: *' + body['BusStopID'] + '*',
                        'title': bus['Status'],
                        'fallback': helper.getFallbackMessage(fields),
                        'mrkdwn_in': ['pretext', 'title'],
                        'color': color,
                        'fields': fields
                    });
                });

                return {
                    'attachments': attachments
                };
            } else {
                return {
                    text: 'Bus stop or number is invalid'
                };
            }
        });
    },
    /**
     * Haze
     */
    'haze': function(commandArguments) {
        return rp({
            uri: config.lesterchanApiUrl + '/nea/psipm25',
            json: true
        }).then(function(body) {
            // Variables
            var northPsi = parseInt(body['item']['region'][0]['record']['reading']['@attributes']['value'], 10),
                centralPsi = parseInt(body['item']['region'][1]['record']['reading']['@attributes']['value'], 10),
                eastPsi = parseInt(body['item']['region'][2]['record']['reading']['@attributes']['value'], 10),
                westPsi = parseInt(body['item']['region'][3]['record']['reading']['@attributes']['value'], 10),
                southPsi = parseInt(body['item']['region'][4]['record']['reading']['@attributes']['value'], 10),
                averagePsi = Math.ceil((northPsi+centralPsi+eastPsi+westPsi+southPsi) / 5),
                timestamp = body['item']['region'][0]['record']['@attributes']['timestamp'],
                niceDate = moment(timestamp, 'YYYYMMDDHHmmss'),
                color = '#479b02';

            // Fields
            var fields = [
                {
                    'title': 'Average',
                    'value': helper.getMessage(averagePsi),
                    'short': true
                },
                {
                    'title': 'Central',
                    'value': helper.getMessage(centralPsi),
                    'short': true
                },
                {
                    'title': 'North',
                    'value': helper.getMessage(northPsi),
                    'short': true
                },
                {
                    'title': 'South',
                    'value': helper.getMessage(southPsi),
                    'short': true
                },
                {
                    'title': 'East',
                    'value': helper.getMessage(eastPsi),
                    'short': true
                },
                {
                    'title': 'West',
                    'value': helper.getMessage(westPsi),
                    'short': true
                }
            ];

            // Determine Color
            if(averagePsi > 300 ) {
                color = '#d60000';
            } else if( averagePsi > 200) {
                color = '#ea8522';
            } else if( averagePsi > 100) {
                color = '#e7b60d';
            } else if( averagePsi > 50) {
                color = '#006fa1';
            }

            // Attachments
            var attachments = [{
                'pretext': ':cloud: *Haze*',
                'title': 'PM2.5 Hourly Update',
                'text': 'Last updated at _' + niceDate.format(config.defaultDateTimeFormat) + '_',
                'fallback': helper.getFallbackMessage(fields),
                'mrkdwn_in': ['pretext', 'text'],
                'color': color,
                'fields': fields
            }];

            return {
                'attachments': attachments
            };
        });
    },
    /**
     * IP Info
     */
    'ipinfo': function(commandArguments) {
        // Variables
        var ipRequest = commandArguments[0] || ip.address();

        // Validate IP Address
        ip.toBuffer(ipRequest);

        return rp({
            uri: 'http://ipinfo.io/' + ipRequest + '/json',
            json: true
        }).then(function(body) {
            // Fields
            var fields = [
                {
                    'title': 'Country',
                    'value': helper.getMessage(body['country']),
                    'short': true
                },
                {
                    'title': 'City',
                    'value': helper.getMessage(body['city']),
                    'short': true
                },
                {
                    'title': 'Region',
                    'value': helper.getMessage(body['region']),
                    'short': true
                },
                {
                    'title': 'Organization',
                    'value': helper.getMessage(body['org']),
                    'short': true
                }
            ];

            // Attachments
            var attachments = [{
                'pretext': ':exclamation: *IP Information*',
                'title': body['ip'],
                'text': body['hostname'],
                'fallback': helper.getFallbackMessage(fields),
                'mrkdwn_in': ['pretext', 'text'],
                'color': config.defaultColor,
                'fields': fields
            }];

            return {
                'attachments': attachments
            };
        });
    },
    'socialstats': function(commandArguments) {
        var link = commandArguments[0] || 'https://lesterchan.net';
        return rp({
            uri: config.lesterchanApiUrl + '/link/?page=' + link,
            json: true
        }).then(function(body) {
            // Fields
            var fields = [
                {
                    'title': 'Total',
                    'value': helper.formatNumber(body['total_count']),
                    'short': true
                },
                {
                    'title': 'Facebook',
                    'value': helper.formatNumber(body['count']['facebook']),
                    'short': true
                },
                {
                    'title': 'Twitter',
                    'value': helper.formatNumber(body['count']['twitter']),
                    'short': true
                },
                {
                    'title': 'Google+',
                    'value': helper.formatNumber(body['count']['google-plus']),
                    'short': true
                },
                {
                    'title': 'LinkedIn',
                    'value': helper.formatNumber(body['count']['linkedin']),
                    'short': true
                },
                {
                    'title': 'Pinterest',
                    'value': helper.formatNumber(body['count']['pinterest']),
                    'short': true
                }
            ];

            // Attachments
            var attachments = [{
                'pretext': ':link: *Link Social Stats*',
                'title': body['url'],
                'title_link': body['url'],
                'fallback': helper.getFallbackMessage(fields),
                'mrkdwn_in': ['pretext', 'text'],
                'color': config.defaultColor,
                'fields': fields
            }];

            return {
                'attachments': attachments
            };
        });
    }
};
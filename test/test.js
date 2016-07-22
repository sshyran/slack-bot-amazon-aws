/**
 * Requires (Test Modules)
 */
var expect = require('expect.js');

/**
 * Requires (Main App)
 */
var lambda = require('../index');

/**
 * Mock AWS Lambda Context
 */
var context = {
  fail: function() {},
  succeed: function() {}
};

describe('slack-bot', function() {
  this.timeout(5000);

  it('Should list down all buses arrival timing at the bus stop', function(done) {
    var output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(4);
      response.attachments.forEach(function(bus) {
        expect(bus).to.have.property('title');
        expect(['In Operation', 'Not In Operation']).to.contain(bus.title);

        expect(bus).to.have.property('fields');
        expect([0, 3]).to.contain(bus.fields.length);
      });
      done();
    }).catch(done);
  });

  it('Should list down a single bus arrival timing at the bus stop', function(done) {
    var output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229 61'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);
      expect(response.attachments[0]).to.have.property('title');
      expect(['In Operation', 'Not In Operation']).to.contain(response.attachments[0].title);

      expect(response.attachments[0]).to.have.property('fields');
      expect([0, 3]).to.contain(response.attachments[0].fields.length);

      done();
    }).catch(done);
  });

  it('Should validate against invalid bus stop number', function(done) {
    var output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus invalidbustopno'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('text');
      expect(response.text).to.eql('Bus stop or number is invalid');

      done();
    }).catch(done);
  });

  it('Should validate against invalid bus number', function(done) {
    var output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229 invalidbusno'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('text');
      expect(response.text).to.eql('Bus stop or number is invalid');

      done();
    }).catch(done);
  });

  it('Should list down Singapore haze conditions', function(done) {
    var output = lambda.handler({
      trigger_word: 'haze',
      text: 'haze'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('PM2.5 Hourly Update');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(6);

      done();
    }).catch(done);
  });

  it('Should list down Singapore 2 hour forecast weather conditions', function(done) {
    var output = lambda.handler({
      trigger_word: 'weather',
      text: 'weather'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('2 hour Forecast');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(47);

      done();
    }).catch(done);
  });

  it('Should list down Google DNS information', function(done) {
    var output = lambda.handler({
      trigger_word: 'ipinfo',
      text: 'ipinfo 8.8.8.8'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('8.8.8.8');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(4);

      done();
    }).catch(done);
  });

  it('Should validate against invalid IP', function(done) {
    var output = lambda.handler({
      trigger_word: 'ipinfo',
      text: 'ipinfo invalidip'
    }, context);

    output.catch(function(error) {
      expect(error).to.have.property('message');
      expect(error.message).to.eql('Invalid ip address: invalidip');

      done();
    }).catch(done);
  });

  it('Should list down social stats count for a link', function(done) {
    var output = lambda.handler({
      trigger_word: 'socialstats',
      text: 'socialstats <https://lesterchan.net/blog/2016/02/26/singtel-samsung-galaxy-s7-4g-and-galaxy-s7-edge-4g-price-plans/>'
    }, context);

    output.then(function(response) {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('https://lesterchan.net/blog/2016/02/26/singtel-samsung-galaxy-s7-4g-and-galaxy-s7-edge-4g-price-plans/');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(6);

      done();
    }).catch(done);
  });
});

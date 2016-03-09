/**
 * Helper
 */
module.exports = {
  ucWords: function(string) {
    return string.replace(/\w\S*/g, function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
  },
  formatNumber: function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  formatBytes: function(bytes, decimals) {
    bytes = parseInt(bytes, 10);
    if (bytes === 0) {
      return '0 Byte';
    }
    var k = 1024;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  },
  getMessage: function(message) {
    if (message) {
      message = message.toString().trim();
    } else {
      message = '';
    }
    return (message.length > 0 ? message : 'N/A');
  },
  parseCommand: function(message) {
    message = this.removeSlackMessageFormatting(message);
    var tokens = message.split(' ');
    var command = {};
    var cmd = tokens.shift();
    var m = cmd.match(/(\w*)/);
    if (m.length > 0) {
      command[m[1]] = tokens;
    }
    return command;
  },
  getFallbackMessage: function(fields) {
    var data = [];
    fields.forEach(function(entry) {
      if (entry.title && entry.title.length > 0) {
        data.push(entry.title + ': ' + entry.value);
      }
    });

    return data.join(', ');
  },
  removeSlackMessageFormatting: function(text) {
    text = text.replace(/<([@#!])?([^>|]+)(?:\|([^>]+))?>/g, (function() {
      return function(m, type, link, label) {
        switch (type) {
          case '!':
            if (link === 'channel' || link === 'group' || link === 'everyone') {
              return "@" + link;
            }
            break;
          default:
            link = link.replace(/^mailto:/, '');
            if (label && link.indexOf(label) === -1) {
              return label + " (" + link + ")";
            }
            return link;
        }
      };
    })(this));
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    return text;
  }
};

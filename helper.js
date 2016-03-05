/**
 * Helper
 */
module.exports = {
    formatNumber: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatBytes: function(bytes,decimals) {
        bytes = parseInt(bytes, 10);
        if(bytes === 0) {
            return '0 Byte';
        }
        var k = 1024,
            dm = decimals + 1 || 3,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    },
    getMessage: function(message) {
        if(message) {
            message = message.toString().trim();
        } else {
            message = '';
        }
        return (message.length > 0 ? message : 'N/A');
    },
    parseCommand: function(message) {
        var tokens = message.split(' '), command = {}, cmd = tokens.shift(), m;
        if(m = cmd.match(/(\w*)/)) {
            command[m[1]] = tokens;
        }
        return command;
    },
    getFallbackMessage: function(fields) {
        var data = [];
        fields.forEach(function(entry) {
            if(entry.title && entry.title.length > 0) {
                data.push(entry.title + ': ' + entry.value);
            }
        });

        return data.join(', ');
    }
};
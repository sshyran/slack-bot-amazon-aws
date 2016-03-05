/**
 * Helper
 */
module.exports = {
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
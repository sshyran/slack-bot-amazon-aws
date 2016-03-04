/**
 * Helper
 */
module.exports = {
    parseCommand: function(message) {
        var tokens = message.split(' ');
        if(!tokens[0].match(/^bus/)) {
            return null;
        }
        var command = {}, cmd = tokens.shift(), m;
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
var Client = require('spirc').Client;
var client = new Client({
    nick: 'spircbot',
    altnicks: ['spircbot_'],
    server: 'irc.freenode.net',
    logStream: process.stdout
});

var chan = client.getTarget('#spirc');
var user = client.user;

// this method will be invoked with a Response object when PRIVMSG events are emitted
var respond = function(response) {
    // the sender name and message are located in the response object, which
    // may differ depending on the response type, since it's PM, these are always the case
    // get a target object from client keyed on the sender's name
    var sayer = client.getTarget(response.prefix.target);
    var message = response.trailing;

    chan.say('I just received a message from: ' + sayer.name);
};

process.on('SIGINT', function() {
    client.disconnect('time to go');
});

client.on('register', function() {
    chan.join();
});

user.onSaid(respond);
chan.onSaid(respond);
client.connect();

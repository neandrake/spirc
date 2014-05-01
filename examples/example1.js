// this example is meant to be run from within the repository
// in a 'production' project with spirc installed through npm, this would just be: require('spirc').Client
var Client = require('../lib/main.js').Client;
var client = new Client({
    nick: 'spircbot',
    altnicks: ['spircbot_'],
    server: 'irc.freenode.net'
});

var chan = client.getTarget('#spirc');
var user = client.user;

// this method is added as a listener to targets,
// and will be invoked with a Response when PRIVMSG events are emitted
var respond = function(response) {
    // the sender name and message are located in the response object, which
    // may differ depending on the response type, since it's PM, these are always the case
    // get a target object from client keyed on the sender's name
    var sayer = client.getTarget(response.prefix.target);
    var message = response.trailing;

    // echo back to the channel
    chan.say('I just received a message from: ' + sayer.name);
};

// graceful shutdown on ctrl+c
process.on('SIGINT', function() {
    client.disconnect('time to go');
});

// after conecting + registering user with server, join a channel
client.on('registered', function() {
    chan.join();
});

// register the respond callback
user.onSaid(respond);
chan.onSaid(respond);

// start connection to server
client.connect();

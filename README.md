spirc
=====

IRC Library

###About
* This library is developed as a personal project to learn the IRC protocol. It is designed to be self-contained - no dependencies.

###API

####Overview
* After connecting successfully to a server, a 'register' event is emitted on the client, which is the appropriate time to auto-join channels.
* Messages received are _Reponse_ objects.
* Messages sent are _Command_ objects.
* Messages are emitted from _Targets_, which can either be _Hosts_, _Channels_, or _Users_.
* Event names are direct from the IRC specification, and can either be simplified string names such as 'PRIVMSG' or numbered codes such as '001' or '433'.

####Examples
Simple example of a bot that connects to a server, joins a channel, then echoes all messages received from the channel or PM back to the channel.
```javascript
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
```

_Client_ constructor parses the object parameter as a _ClientOpts_, and can specify:
```javascript
{
	// traditional setup
	"server": 'irc.freenode.net',
	"port": 6667,
	"nick": null,
	"pass": null,
	"altnicks": [],

	// additional details 
	"username": 'username',
	"hostname": '127.0.0.1',
	"servername": '127.0.0.1',
	"realname": 'realname',

	// support for SSL
	"secure": false,

	// some additional options
	"autoPong": true,			// most servers will kick if PINGs are not replied to
	"autoAltNick": true,		// automatically loop through registering the nicks under the 'altnicks' option
	"autoRegister": true,		// auto-register the client after connecting
	"logStream": null,			// the stream for verbose logging
	"sendsPerSec": 4			// throttling commands sent per sec
}
```

_Target_ defines several convenience methods
- _say_ - sends a PRIVMSG command to the target.
- _onSaid_ - register a listener for PRIVMSG responses.
- _onAnyResponse_ - register a listener for all responses.
- _pipe_ - pipe data from a stream to the target via PRIVMSG commands.

_Channel_ also contains these convenience methods
- _join_ - join the channel
- _part_ - leave the channel

_Host_ also contains these convenience methods
- _quit_ - disconnect from the irc server

The _Client_ object contains a method _send_ for sending a _Command_, which is used by all the convenience methods.
```javascript
var cmd = require('commands');
client.send(new cmd.Names('#channel'));
```

The _Client_ object also contains several convenience methods for registering listeners (these names are a bit trifling)
- _anyOn_ - receives events of a type from any target
- _anyOnce_ - receives events of a type from any target, fired only once
- _anyOnAny_ - receives events of all types from all targets
- _anyOnceAny_ - receives events of all types from all targets, fired only once


The client's socket reading, as well as the target's _pipe_ method use _TokenReader_ object. This is a simple object that emits 'token' events with data based on a given delimiter. The default delimiter is the newline character.


###Roadmap
April 22, 2014
- More IRC Support
- Consistent API
- Simplified API to abstract IRC details
- Documentation/Comments
- CTCP Features
- IRC Server API
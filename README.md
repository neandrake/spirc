spirc
=====

IRC Library

###About
* This library is developed as a personal project to learn the IRC protocol. It is designed to be self-contained - no dependencies.

####Status (May 6 2014)
* Currently only client api is functional. The only testd commands for IRC have been those used for registering, joining/parting channels, sending/receiving messages. The current example1 script (described below) is fully functional and works. The auto-pong, auto-alt-nick-registering, and sending threshold are all functional.

###API

####Overview
* After connecting successfully to a server, a 'register' event is emitted on the client, which is the appropriate time to auto-join channels.
* Messages received are _Inbound_ objects.
* Messages sent are _Outbound_ objects.
* Messages are emitted from _Targets_, which can either be _Hosts_, _Channels_, or _Users_.
* IRC Message events emitted from targets are directly named from IRC RFCs, but are prefixed with ':' character in order to differentiate from other events emitted from the target. Examples are 'PRIVMSG' or '433'.

####Examples
Simple example of a bot that connects to a server, joins a channel, then echoes all messages received from the channel or PM back to the channel.
```javascript
var Client = require('spirc').Client;
var client = new Client({
    nick: 'spircbot',
    altnicks: ['spircbot_'],
    server: 'irc.freenode.net'
});

var chan = client.getTarget('#spirc');
var user = client.user;

// this method is added as a listener to targets,
// and will be invoked with a Response when PRIVMSG events are emitted
function respond(response) {
    // the sender name and message are located in the response object, which
    // may differ depending on the response type, since it's PM, these are always the case
    // get a target object from client keyed on the sender's name
    var sayer = client.getTarget(response.prefix.target);
    var message = response.trailing;

    // echo back to the channel
    chan.say('I just received a message from: ' + sayer.name);
};

// graceful shutdown on ctrl+c
process.on('SIGINT', function onInterrupt() {
    client.disconnect('time to go');
});

// after conecting + registering user with server, join a channel
client.on('registered', function onClientRegistered() {
    chan.join();
});

// register the respond callback
user.onSaid(respond);
chan.onSaid(respond);

// start connection to server
client.connect();
```

####Client Options
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
	"autoPong": true,				// most servers will kick if PINGs are not replied to
	"autoAltNick": true,			// automatically loop through registering the nicks under the 'altnicks' option
	"autoRegister": true,			// auto-register the user after client connects to server
	"sendsPerSec": 4				// throttling commands sent per sec
	"log": new Log(process.stdout),	// log for output, not sure if this will be kept
}
```

####Targets
_Target_ defines several convenience methods
- _say_ - sends a PRIVMSG command to the target.
- _onSaid_ - register a listener for PRIVMSG messages.
- _onInbound_ - register a listener for all inbound messages.
- _pipe_ - pipe data from a stream to the target via PRIVMSG commands.

_Channel_ also contains these convenience methods
- _join_ - join the channel
- _part_ - leave the channel

_Host_ also contains these convenience methods
- _quit_ - disconnect from the irc server
- _onPing_ - convenience for registering a listener whena PING message is received

The _Client_ object contains a method _send_ for sending an _Outbound_ request, which is used by all the convenience methods.
```javascript
var req = require('requests');
client.send(new req.Names('#channel'));
```

####Events
When an inbound message is received these events are fired:
- If the inbound message could not properly be parsed as an IRC message, an 'error' event is fired.
- The _allTargets emits an 'inbound' event with the inbound message.
- The target the message is directed to emits an 'inbound' event with the inbound message.
- The _allTargets emits an event named after the parsed command, with the inbound message.
- The target the message is directed to emits an event named after the parsed command, with the inbound message.

When an outbound message is sent, the client emits an 'outbound' event with the outbound message.

The _Client_ object also provides methods for registering listeners for when any inbound event is received, regardless of target. These events are fired before the specified target has its events fired.
- _onInboundEvent_ - receives inbounds for a specific event
- _onceInboundEvent_ - receives inbounds for a specific event, but is only fired once


The client's socket reading, as well as the target's _pipe_ method use _TokenReader_ object. This is a simple object that emits 'token' events with data based on a given delimiter. The default delimiter is the newline character.


###Roadmap
May 6, 2014
- Promise-ish
- Additional IRC Support
- Consistent and Simplified API
- JSDoc Documentation/Comments
- CTCP
- IRC Server API

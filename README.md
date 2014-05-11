spirc
=====
IRC Library

This library is developed as a personal project to learn the IRC protocol. It is designed to be self-contained - little/no dependencies - and to be the building blocks for IRC utilities.

###Contents
- [spirc](#spirc)
- [Contents](#contents)
- [Status](#status)
- [Roadmap](#roadmap)
- [Install](#install)
- [API](#api)
	- [Overview](#overview)
	- [Examples](#examples)
	- [Client Options](#client-options)
	- [Targets](#targets)
	- [Events](#events)

####Status
_May 6 2014 (Version 0.1.2)_

Currently only client api is functional. The only testd commands for IRC have been those used for registering, joining/parting channels, sending/receiving messages. The current example1 script (described below) is fully functional and works. The auto-pong, auto-alt-nick-registering, and sending threshold are all functional.

###Roadmap
_May 6 2014_
- Promise-ish
- Additional IRC Support
- Consistent and Simplified API
- JSDoc Documentation/Comments
- CTCP
- IRC Server API

####Install
This project is published through Node Package Manager.
```
$ npm install spirc
```
If using from local git clone, see `examples/example1.js` which includes the repository source files instead of npm.

###API
####Overview
- After connecting successfully to a server, a `register` event is emitted on the client, which is the appropriate time to auto-join channels.
- Messages received are `Inbound` objects.
- Messages sent are `Outbound` objects.
- Messages are emitted from `Target`s, which can either be `Host`s, `Channel`s, or `User`s.
- IRC Message events emitted from targets are directly named from IRC RFCs, but are prefixed with ':' character in order to differentiate from other events emitted from the target. Examples are ':PRIVMSG' or ':433'.

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

The `Client` object contains a method _send_ for sending an _Outbound_ request, which is used by all the convenience methods.
```javascript
var req = require('spirc').Requests;
client.send(new req.Names('#channel'));
```
####Client
The `Client` object is what is used to manage a connection to a single server, emitting connection-related events.
- `connect` - connects to the server specified in the options set on client - a `connected` event is emitted once this has completed.
- `disconnect` - disconnect from server, sending PARTs to all known channels, followed by a QUIT to the server - the socket is then closed and a `disconnected` event is emitted.
- 'registered' event - fired when it's been determined that the client's user credentials were successfully registered - by default the client will attempt to register with the provided user credentials after a connection has been made.
- `error` event - fired when a connection error occurs or if an IRC inbound message indicates an error.

The `Client` object also provides methods for registering listeners for when any inbound event is received, regardless of target. These events are fired before the specified target has its events fired.
- `onInboundEvent` - receives inbounds for a specific event
- `onceInboundEvent` - receives inbounds for a specific event, but is only fired once

####Targets
`Target` defines several convenience methods
- `say` - sends a PRIVMSG command to the target.
- `onSaid` - register a listener for PRIVMSG messages directed at this target.
- `onInbound` - register a listener for all inbound messages directed at this target.
- `pipe` - pipe data from a stream to the target via PRIVMSG commands.
- IRC Message Events - targets will emit events for IRC messages directed at them. The event name is the IRC command prefixed by a colon - ex: a PRIVMSG handler can be registered with `.on(':PRIVMSG', callback)`

`Channel` also contains these convenience methods
- `join` - join the channel
- `part` - leave the channel

`Host` also contains these convenience methods
- `quit` - disconnect from the irc server
- `onPing` - convenience for registering a listener whena PING message is received

####Events
When an inbound message is received these events are fired:
- If the inbound message could not properly be parsed as an IRC message, an `error` event is fired.
- The `_allTargets` emits an `inbound` event with the inbound message.
- The target the message is directed to emits an `inbound` event with the inbound message.
- The `_allTargets` emits an event named after the parsed command, with the inbound message.
- The target the message is directed to emits an event named after the parsed command, with the inbound message.

When an outbound message is sent, the client emits an `outbound` event with the outbound message.


The client's socket reading, as well as the target's _pipe_ method use _TokenReader_ object. This is a simple object that emits 'token' events with data based on a given delimiter. The default delimiter is the newline character.

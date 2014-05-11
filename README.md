spirc
=====
IRC Library

This library is intended to be the building blocks for IRC utilities requiring little or no dependencies. It is developed as a personal project to learn the IRC protocol as well as JavaScript library development.

###Contents
- [Status](#status)
- [Roadmap](#roadmap)
- [Install](#install)
- [API](#api)
	- [Overview](#overview)
	- [Client](#client)
	- [Targets](#targets)
	- [Events](#events)
	- [Examples](#examples)
	- [Client Options](#client-options)
- [Resources](#resources)

####Status
_May 6 2014 (Version 0.1.2)_

Client API is only functional at this point
- [x] Connect/Disconnect to server
- [x] Register User
- [x] Alternate nick registration when preferred is taken
- [x] Join/Part Channels
- [x] Send/Receive messages (PRIVMSG on channels or pm)
- [x] Auto-PONG when PING is received from server
- [x] Pipe stream data over PRIVMSG to target. Currently requires stream to be text and `\r\n` delimited, and does not limit the PRIVMSG length.
- [x] Outbound throttling, to avoid spamming, defaults to 4 outbound/sec

Connecting via SSL had been working, but an update to node-js has currently broken this functionality, as it would require accepting self-signed certificates from user. Have looked into workarounds but need to research SSL certificate management for IRC nodes.

###Roadmap
_May 6 2014_
- [ ] Promise-ish - Some manner of promises would be useful not only for basic async i/o handling, but at the IRC message level of request/response.
- [ ] Consistent and Simplified API - Have been working on this some with project layout and API naming and such, once the project expands this will be easier to identify and document. ex: Outbound requests must always be directed at a Target which is currently all managed through convenience methods.
- [ ] Additional IRC Support - Proper state tracking of IRC specifics, such as modes, targets in a channel, etc. Also any extended info from IRC RFCs.
- [ ] JSDoc Documentation/Comments - Would like to supply some form of publishable documentation that is inlined in the code, for API exposure.
- [ ] CTCP - XDCC, etc.
- [ ] IRC Server API - Large project not in the near future.

###Install
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
- IRC Message events emitted from targets are directly named from the message command, but are prefixed with ':' character in order to differentiate from other events emitted from the target. Examples are ':PRIVMSG' or ':433'.

####Client
The `Client` object contains a method `send` for sending an `Outbound` request, which is used by all the convenience methods.
```javascript
var req = require('spirc').Requests;
client.send(new req.Names('#channel'));
```

The `Client` object is what is used to manage a connection to a single server, emitting connection-related events.
- `send` - sends an `Outbound` message, or more accurately queues an outbound message.
- `connect` - connects to the server specified in the options set on client - a `connected` event is emitted once this has completed.
- `disconnect` - disconnect from server, sending PARTs to all known channels, followed by a QUIT to the server - the socket is then closed and a `disconnected` event is emitted.
- `registered` event - fired when it's been determined that the client's user credentials were successfully registered - by default the client will attempt to register with the provided user credentials after a connection has been made.
- `error` event - fired when a connection error occurs or if an IRC inbound message indicates an error.

The `Client` object also provides methods for registering listeners for when any inbound event is received, regardless of target. These events are fired before the specified target has its events fired.
- `onInboundEvent` - receives inbounds for a specific event
- `onceInboundEvent` - receives inbounds for a specific event, but is only fired once

The client's socket reading, as well as the target's `pipe` method use `TokenReader` object. This is a simple object that emits `token` events with data based on a given delimiter. The default delimiter is the newline character.

####Targets
__Target__ defines several convenience methods
- `say` - sends a PRIVMSG command to the target.
- `onSaid` - register a listener for PRIVMSG messages directed at this target.
- `onInbound` - register a listener for all inbound messages directed at this target.
- `pipe` - pipe data from a stream to the target via PRIVMSG commands.
- IRC Message Events - targets will emit events for IRC messages directed at them. These events will contain the inbound message as the only parameter. The event name is the IRC command prefixed by a colon - ex: `.on(':PRIVMSG', cb)`

__Channel__ is a Target and also contains these convenience methods
- `join` - join the channel
- `part` - leave the channel, can provide leaving message.

__Host__ is a Target and also contains these convenience methods
- `quit` - disconnect from the irc server, can provide leaving message.
- `onPing` - convenience for registering a listener whena PING message is received

####Events
When an inbound message is received these events are fired:
- If the inbound message could not properly be parsed as an IRC message, an `error` event is fired.
- The `_allTargets` emits an `inbound` event with the inbound message.
- The target the message is directed to emits an `inbound` event with the inbound message.
- The `_allTargets` emits an event named after the parsed command, with the inbound message.
- The target the message is directed to emits an event named after the parsed command, with the inbound message.

When an outbound message is sent, the client emits an `outbound` event with the outbound message.

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
`Client` constructor parses the object parameter as a `ClientOpts`, and can specify:
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

	// use SSL connection
	"secure": false,

	// some additional options
	"autoPong": true,				// most servers will kick if PINGs are not replied to
	"autoAltNick": true,			// automatically loop through registering the nicks under the 'altnicks' option
	"autoRegister": true,			// auto-register the user after client connects to server
	"sendsPerSec": 4				// throttling commands sent per sec
	"log": new Log(process.stdout),	// log for output, this will like be removed altogeter
}
```


###Resources
- [RFC 1459: Internet Relay Chat Protocol (pdf)](http://tools.ietf.org/pdf/rfc1459.pdf)
- [RFC 2810: Internet Relay Chat: Architecture (pdf)](http://tools.ietf.org/pdf/rfc2810.pdf)
- [RFC 2811: Internet Relay Chat: Channel Management (pdf)](http://tools.ietf.org/pdf/rfc2811.pdf) 
- [RFC 2812: Internet Relay Chat: Client Protocol (pdf)](http://tools.ietf.org/pdf/rfc2812.pdf)
- [RFC 2813: Internet Relay Chat: Server Protocol (pdf)](http://tools.ietf.org/pdf/rfc2813.pdf)
- [CTCP Specification (html)](http://www.irchelp.org/irchelp/rfc/ctcpspec.html)
- [IRCv3 Working Group (html)](http://ircv3.atheme.org/)
- [EFnet Docs: Protocols (html)](http://www.efnet.org/?module=docs)
- [irc.org Techie Docs (html)](http://www.irc.org/techie.html)
- [irclib: Python IRC Library (bitbucket)](https://bitbucket.org/jaraco/irc/src)
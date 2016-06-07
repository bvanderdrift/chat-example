var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];

var userDataConstructor = function(){
	return {
		loggedIn: false,
		username: ""
	};
};

var usernameTakenCheck = function(username){
	return false;
};

var	makeMessage = function(sender, message){
	return {
		id: getUniqueMessageId(),
		sender: sender,
		message: message
	};
};

var getUniqueMessageId = function(){
	var id = 0;

	while(messages.filter(mo => (mo.id == id)).length > 0){
		id++;
	};

	return id;
};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket._userdata = userDataConstructor();
	console.log("User connected");

	socket.on('login', function(username){
		console.log("Received login request from: " + username);
		if(username === ""){
			this.emit("login_failed", "Username empty");
			console.log("Sent response: Username empty!");
			return;
		}

		if(!usernameTakenCheck(username)){
			this._userdata.loggedIn = true;
			this._userdata.username = username;
			this.emit("login_succes");
			console.log("Sent response: Login succes!");
			return;
		}else{
			this.emit("login_failed", "Username already taken");
			console.log("Sent response: Username taken!");
			return;
		}
	});

	socket.on('chat message', function(msg){
		if(!socket._userdata.loggedIn) return;

		var messageObj = makeMessage(this._userdata.username, msg);

		console.log("Received chatmessage from someone!");
		io.emit('chat message', messageObj);
		console.log("Send message to all listeners!");
	});	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
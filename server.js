    var express  = require('express');
    var app      = express();                            
    var bodyParser = require('body-parser');
    var http = require('http');
    var server = http.createServer(app);
    var io = require('socket.io').listen(server);
	  var https = require('https');
	  var OAuth = require('OAuth');
    var stream = null;

    // twitter authentication
  	var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        'rj3Jn9ltlDZjjuiHXdmAOTFzZ', // consumer key
        '6SzP5n7n9O3zXpUFM49UaQvysi6MrrRjFxsRlHMGnj9MBfuWYx', // consumer secret
        '1.0',
        null,
        'HMAC-SHA1'
      );


    // configuration 
    app.use(express.static(__dirname + '/app'));                 // set the static files location /public/img will be /img for users
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json

    // start server ======================================
    server.listen(8080);
    console.log("App listening on port 8080");


    // api 
    app.get('/api', function (req, res)
    {
    	res.sendFile(__dirname + '/app/templates/api.html');
    });

    // get tweets with search API
    app.get('/api/tweets', function (req, res)
    {
      oauth.get(
        'https://api.twitter.com/1.1/search/tweets.json?'+req.query.query,
          '2882833407-SMCE0MTVNzZ3yQSH6mJ3qxn86b03CAwrWNw09hS', // access token
          'LhkHhOxwlengo6GLzncy804gTBPqkOEwPv0oL3xzw48a9', // access token secret
        function (e, data)
        {
          if (e) 
            console.error(e);
          res.json(JSON.parse(data));   
          console.log("Data sent!");
        });
    });

    // web main page
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/app/index.html');
    });

    //Create web sockets connection.
    io.sockets.on('connection', function (socket) 
    {
      socket.on("get tweets", function() 
      {
        console.log((new Date()).toUTCString() + ' s : send tweets');  

          //Connect to twitter stream passing in filter for entire world.
            oauth.get(
            'https://api.twitter.com/1.1/search/tweets.json?q=championsleague&result_type=popular&count=20', //+req.query.query,
              '2882833407-SMCE0MTVNzZ3yQSH6mJ3qxn86b03CAwrWNw09hS', // access token
              'LhkHhOxwlengo6GLzncy804gTBPqkOEwPv0oL3xzw48a9', // access token secret
            function (e, data)
            {
              if (e) 
                console.error(e);            
              socket.broadcast.emit("twitter-stream", JSON.parse(data));
              //Send out to web sockets channel.
              socket.emit('twitter-stream', JSON.parse(data));
              console.log((new Date()).toUTCString() + ' s : tweets sent!');  
            });      
      })

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
      console.log((new Date()).toUTCString() + ' s : connected!');
      socket.emit("connected");
    });
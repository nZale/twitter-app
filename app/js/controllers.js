  	// search API params
    var data = {
      q : 'championsleague',
	  count : '20',
	  result_type : 'popular'
    };

	var app = angular.module('twitterApp', []); // register module

	function mainController($scope, $http, $interval) {
	  $scope.query = data;
	  $scope.refreshInterval = 10;	
	  $scope.tweets = {};
	  $scope.date;
	  $scope.count = null;
	  $scope.greeting = '#championsleague Tweets';
	  $scope.predicate = '-retweet_count';


	  // connect to the server and setup listener
	  function connect()
	  {
	  	if(io !== undefined) 
	  	{
	  		// server connection
		    var socket = io.connect('http://localhost:8080');

		    // set listener for 'twitter-stream' message that will store incoming data
		    socket.on('twitter-stream', function (data) {
		    	console.log(getDateTime() + ' c : getting tweets');
		    	$scope.tweets = data.statuses;
		    	$scope.count = $scope.tweets.length;
		    	$scope.$apply();
		    });

		    // if the connection is made it will request for tweets by sending "get tweets" message
		    socket.on("connected", function(r) {
		   		console.log(getDateTime() + ' c : connected!');
		   		console.log(getDateTime() + ' c : request tweets!');
		     	socket.emit("get tweets");
		    });

		    // 
		    socket.on('disconnect', function () {
			    socket.emit('client disconnected');
			    console.log(getDateTime() + ' c : client disconnected!');
			});
		}
	  }

      //get current time
      function getTime() {
	    $scope.date = new Date().toLocaleTimeString();
	  }

	  function getDateTime()
	  {
	  	return (new Date()).toUTCString(); 
	  }

	  connect();
      getTime();

      //refresh tweets
      $interval(function() {
	    getTime();
	    connect();
	  	}, $scope.refreshInterval * 1000 * 60);
	}
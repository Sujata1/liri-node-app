require("dotenv").config();

var fs = require("fs");
var request = require("request");

var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var option = process.argv[2].toLowerCase();
var searh_string = process.argv.slice(3).join(" ");

var currentDate = new Date();
var divider = "\n------------------------------------------------------------------------------------------------------------------------------------\n\n"
var consoleDivider = "\n---------------------------------------\n\n"

selectOption(option, searh_string);


function selectOption(option, ss) {
  switch (option) {
    case "my-tweets":
      twitterFeeds(ss);
      break;
    case "spotify-this-song":
      spotifySong(ss);
      break;
    case "movie-this":
      omdbMovie(ss);
      break;
    case "do-what-it-says":
      liri();
      break;
    default:
      console.log("Sorry no such operation");
  }
};

function spotifySong(songName) {
  if (!songName) {
    songName = "The Sign";
  };
  spotify.search({ type: 'track', query: songName, market: 'US', limit: '1' }, function (error, data) {
    if (!error) {
      var album_type = JSON.stringify(data.tracks.items[0].album.album_type, null, 2);
      var artist_name = JSON.stringify(data.tracks.items[0].artists[0].name, null, 2);
      var albm_Name = JSON.stringify(data.tracks.items[0].album.name);
      var Preview_URL = JSON.stringify(data.tracks.items[0].preview_url);
      
      var showData = [
        "Album Type: " + album_type,
        "Artist Name: " + artist_name,
        "Album Name: " + albm_Name,
        "Preview URL: " + Preview_URL
      ].join("\n\n");
      processData(process.argv,showData);
      
    } else {
      throw (error);
    }
  });
};

function omdbMovie(movieName) {
  if (!movieName) {
    movieName = "Mr. Nobody.";
  };
  var queryUrl = "https://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&page=1&apikey=trilogy"
  request(queryUrl, function (error, response, body) {

    if (!error && response.statusCode === 200) {

      var jsonData = JSON.parse(body);
      var rating = JSON.parse(body).Ratings;
      var rottenTomatoes_rating = ""
      Object.keys(rating).forEach(function (key) {
        if (rating[key].Source === 'Rotten Tomatoes') {
          rottenTomatoes_rating = rating[key].Value;
        }
      });

      var showData = [
        "Title of the movie: " + jsonData.Title,
        "Year the movie came out: " + jsonData.Year,
        "Country movie was produced: " + jsonData.Country,
        "Language of the movie: " + jsonData.Language,
        "Plot of the movie: " + jsonData.Plot,
        "Actors in the movie: " + jsonData.Actors,
        "IMDB Rating : " + jsonData.imdbRating,
        "Rotten Tomatoes Rating: " + rottenTomatoes_rating
      ].join("\n\n");
      processData(process.argv,showData);

    } else {
      throw (error);
    }
  });
};

function twitterFeeds(searh_tweet) {
  if (!searh_tweet) {
    searh_tweet = "*";
  };
  var params = {
    q: searh_tweet,
    count: 20,
    result_type: 'recent',
    lang: 'en'
  };
  client.get('search/tweets', params, function (error, tweets, response) {
    if (!error && response.statusCode === 200) {
      var showData = [];
      for (var i = 0; i < tweets.statuses.length; i++) {
        showData.push("Tweet#" + (i + 1) + ":\n" + tweets.statuses[i].text);
      }

      var showTwitterData = showData.join("\n\n");
      processData(process.argv,showTwitterData);
    
    } else {
      throw (error);
    }
  });
};

function liri() {
  var fileName = "random.txt";
  fs.readFile(fileName, "utf8", function (error, data) {
    if (error) {
      return console.log(error);
    }
    var dataArr = data.split(", ");
    var option = dataArr[0];
    var search_string = (dataArr[1]).toString();
    selectOption(option, search_string);
  });
};

function processData(requestData,responseData){
  console.log("\n" + responseData + consoleDivider);
      addLog(requestData, responseData);
};

function addLog(logData, showData) {
  var fileName = "log.txt";
  var currentDate = new Date();
  fs.appendFile(fileName, currentDate + " - " + logData + "\n\n" + showData + divider, function (err) {
    if (err) {
      console.log(err);
    }
  });
}


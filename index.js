/*
@Author Benjamin Rittenhouse
index.js
April 18th, 2022
*/

const fs = require('fs')
var XMLHttpRequest = require('xhr2');


var SpotifyWebApi = require('spotify-web-api-node');
const express = require('express')

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const { engine } = require('express-handlebars');

const path = require('path');

const port = process.env.PORT || 3000;

// Permissions to read via Spotify AUTH
const scopes = [
    'user-top-read'
  ];
  
// Secret spotify API developer app passphrases
var spotifyApi = new SpotifyWebApi({
    clientId: '8b19cf1470e0431ca010a39c59f04e6e',
    clientSecret: 'd4bb4a958f97412dadba25a607558196',
    redirectUri: 'http://localhost:8888/callback'
  });
  
  const app = express();
  

// create and set engine / views
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.use(express.static('public'))

// landing
  app.get('/', (req, res) => {
    res.render("landing", {layout : "landing"});
  });

// login
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
  // callback upon successful authorization
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  

        // Token debug
        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        

        // Get user top 3 tracks 
        var url2 = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=3";

        // create XML requests
        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", url2);

        // set headers
        xhr2.setRequestHeader("Accept", "application/json");
        xhr2.setRequestHeader("Content-Type", "application/json");
        xhr2.setRequestHeader("Authorization", "Bearer " + access_token);

        // render page with information from var url2 & callback
        xhr2.onreadystatechange = function () {
           if (xhr2.readyState === 4) {
              var data2 = xhr2.responseText;
              var arr = getMyData(data2);
              var artists = getArtists(data2);
              var times = getDuration(data2);
              res.render("main", {layout : "index", trackone : arr[0], tracktwo : arr[1], trackthree : arr[2], artists1: artists[0], artists2: artists[1], artists3: artists[2], timeone: times[0], timetwo: times[1], timethree: times[2], timetotal: times[3], date: times[4]});
           }};

        xhr2.send();


        // refresh token if needed
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });

  
  // Listen on Herokuapp (change to localhost for local testing)
  app.listen(8888, () =>
    console.log(
      'HTTP Server up.'
    )
  );



// get user top 3 songs
function getMyData(jsoninp) {
    const obj = JSON.parse(jsoninp); // parse JSON
    let ret = new Array(3);
        for(var i = 0; i < 3; i++){
          var tempstr = "";
   
          if(obj.items[i].name !== 'undefined'){ // edge case: no songs
            tempstr += obj.items[i].name; // add song name to return value
          } else {
            tempstr += "";
          }  

          ret[i] = tempstr;
        }
    
    return ret;
}

// get artists from top 3 songs
function getArtists(jsoninp) {
    const obj = JSON.parse(jsoninp); // parse JSON
    let ret = new Array(3);
    // each song

    for(var i = 0; i < 3; i++){ // iterate over each song
      let temp = new Array(Object.keys(obj.items[i].artists).length); // cast to array

      // artists who made song (2d array)
      for(var j = 0; j < Object.keys(obj.items[i].artists).length; j++){
          temp[j] = obj.items[i].artists[j].name // collect artist names
      }

     ret[i] = temp;
    }
    return ret; // return artist names
}

// get duration of each song
function getDuration(jsoninp){
    const obj = JSON.parse(jsoninp);
    let ret = new Array(5);

    // each song
    var total = 0;
    for(var i = 0; i < 3; i++){
          var millis = obj.items[i].duration_ms;    // convert MS   
          var minutes = Math.floor(millis / 60000);
          var seconds = ((millis % 60000) / 1000).toFixed(0);
          var final = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
          ret[i] = final;
          total += millis;
    }

    var millis2 = total;   
    var minutes2 = Math.floor(millis2 / 60000);
    var seconds2 = ((millis2 % 60000) / 1000).toFixed(0);
    var final2 = minutes2 + ":" + (seconds2 < 10 ? '0' : '') + seconds2;
    
    ret[3] = final2

    ret[4] = dt(); // get current month / year (to be put in serving size)

    return ret;
}

/* Get username (not implemented currently) */
function getUserName(jsoninp){
  const obj = JSON.parse(jsoninp);
  var ret = "";
  console.log(JSON.stringify(obj, null, 2));
  ret = obj.display_name;

  return ret;
}

// calculate month and year
function dt(){
  var today = new Date();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  today = mm + '/' + yyyy;


  return today;
}


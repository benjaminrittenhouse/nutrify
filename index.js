const fs = require('fs')
var XMLHttpRequest = require('xhr2');
//const SpotifyWebApi = require('spotify-web-api-node');
//const token = "BQBQ9G4epaVri8NaJ4THIdgZ7onVKWLux8OVeeVpo_VkGVg7oa4Gamnz4kjTYLpOaEZO53TxU61Jqge7rkjf1I_1NTlZM6ILZx-ETvTO4pfp87ZC6A1IbnYpf9ykxOhzRY2y_csYo6HO29Wk-LI5xp9UQ6a7o69HeqcEcL1_0NQIXixb6Kbt2f63m2H1Ee5UrhLFz0ygjI7_Xc0ybgTZzYKgq2e6BN-WVaSR5WFM6zyKhmNtWAverAXFkAnbfzOAWMV3g9xULBAHNG5snry7LXQc6717oVm_";
//const spotifyApi = new SpotifyWebApi();


var SpotifyWebApi = require('spotify-web-api-node');
const express = require('express')

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const { engine } = require('express-handlebars');

const path = require('path');

const port = process.env.PORT || 8080;

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: 'e00c88461c014f3890e27d7c44aa9603',
    clientSecret: 'b04c0d173286479e9c043017ea692dd6',
    redirectUri: 'http://localhost:8888/callback'
  });
  
  const app = express();
  

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.use(express.static('public'))


  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });

  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
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
  


        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        

/* trying to get username in a 2 way API call
        var index = ["https://api.spotify.com/v1/me", "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=3"];

        var request = new XMLHttpRequest();

        for (var i = 0; i < index.length; i++) {
            console.log("i = " + i);
            var url = index[i];

            request.open("GET", url);

            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Bearer " + access_token);

            
            request.onreadystatechange = function() {
                if(request.readyState === 4) {
                    var data2 = request.responseText;
                    var arr = getMyData(data2);
                    var artists = getArtists(data2);
                    if(i !== 2){
                        var un = getUserName(data2);
                    }
                    res.render("main", {layout : "index", trackone : arr[0], tracktwo : arr[1], trackthree : arr[2], artists1: artists[0], artists2: artists[1], artists3: artists[2], username: un},);
                }
            }
            request.send();
        } 

*/


        /* Get user name 
        var url1 = "https://api.spotify.com/v1/me";

        var xhr1 = new XMLHttpRequest();
        xhr1.open("GET", url1);

        xhr1.setRequestHeader("Accept", "application/json");
        xhr1.setRequestHeader("Content-Type", "application/json");
        xhr1.setRequestHeader("Authorization", "Bearer " + access_token);

        xhr1.onreadystatechange = function () {
           if (xhr1.readyState === 4) {
              var data1 = xhr1.responseText;
              console.log("name: " + data1);
              res.send(getUserName(data1));
           }};

        xhr1.send();
        // end get user name */



        // Get user top 5 tracks 
        var url2 = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=3";

        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", url2);

        xhr2.setRequestHeader("Accept", "application/json");
        xhr2.setRequestHeader("Content-Type", "application/json");
        xhr2.setRequestHeader("Authorization", "Bearer " + access_token);

        xhr2.onreadystatechange = function () {
           if (xhr2.readyState === 4) {
              var data2 = xhr2.responseText;
              var arr = getMyData(data2);
              var artists = getArtists(data2);
              var dur = getDuration(data2);
              res.render("main", {layout : "index", trackone : arr[0], tracktwo : arr[1], trackthree : arr[2], artists1: artists[0], artists2: artists[1], artists3: artists[2]});
           }};

        xhr2.send();

        //console.log("lets go");
        // end get user top 5 tracks


      
        

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
  
  app.listen(8888, () =>
    console.log(
      'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
    )
  );


  //GET MY PROFILE DATA

function getMyData(jsoninp) {
    const obj = JSON.parse(jsoninp);
    let ret = new Array(3);
        for(var i = 0; i < 3; i++){
          var tempstr = "";
          // ret += "<div>";
          //      song name                     album name              
          tempstr += obj.items[i].name; /*obj.items[i].album.name + */

          ret[i] = tempstr;
        }
    
    return ret;
}

function getArtists(jsoninp) {
    const obj = JSON.parse(jsoninp);
    let ret = new Array(3);
    // each song


    for(var i = 0; i < 3; i++){
      let temp = new Array(Object.keys(obj.items[i].artists).length);
      // artists who made song (2d array)
      for(var j = 0; j < Object.keys(obj.items[i].artists).length; j++){
          temp[j] = obj.items[i].artists[j].name
      }

     ret[i] = temp;
    }
    return ret;
}

function getDuration(jsoninp){
    const obj = JSON.parse(jsoninp);
    let ret = new Array(3);
    // each song

    for(var i = 0; i < 3; i++){
          var millis = obj.items[i].duration_ms;      
          var minutes = Math.floor(millis / 60000);
          var seconds = ((millis % 60000) / 1000).toFixed(0);
          var final = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
          ret[i] = final;
    }

    console.log("Final: " + ret);
    return ret;
}

function getUserName(jsoninp){
  const obj = JSON.parse(jsoninp);
  var ret = "";
  console.log(JSON.stringify(obj, null, 2));
  ret = obj.display_name;

  return ret;
}


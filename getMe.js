const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
//const token = "BQBQ9G4epaVri8NaJ4THIdgZ7onVKWLux8OVeeVpo_VkGVg7oa4Gamnz4kjTYLpOaEZO53TxU61Jqge7rkjf1I_1NTlZM6ILZx-ETvTO4pfp87ZC6A1IbnYpf9ykxOhzRY2y_csYo6HO29Wk-LI5xp9UQ6a7o69HeqcEcL1_0NQIXixb6Kbt2f63m2H1Ee5UrhLFz0ygjI7_Xc0ybgTZzYKgq2e6BN-WVaSR5WFM6zyKhmNtWAverAXFkAnbfzOAWMV3g9xULBAHNG5snry7LXQc6717oVm_";
const spotifyApi = new SpotifyWebApi();


//GET MY PROFILE DATA
function getMyData(token) {
  spotifyApi.setAccessToken(token);
  (async () => {
    const me = await spotifyApi.getMe();
  spotifyApi.getMyTopTracks()
  .then(function(data) {
    let topTracks = data.body.items;
    var count = 0;
    for(let track of data.body.items){
      if(count < 5){
        var print = "";
        print = print + track.name + " by ";
        for(var i in track.artists){
          print = print + " " + track.artists[i].name; 
        }
        console.log(print); 
        count++;
      }
    }
  }, function(err) {
    console.log('Something went wrong!', err);
  });
  })().catch(e => {
    console.error(e);
  });
}


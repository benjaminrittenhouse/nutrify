# Link
https://nutrifyy.herokuapp.com

# Nutrify
Spotify API call that creates a "Nutrition" label for users to see their top 3 songs from the month

# Details
This web application uses the Handlebars.js HTML templating framework to insert user values, such as track names, into the index.handlebars file. This is displayed to the user

# API / Authentication
All authentication and login is done by the Spotify OAuth 2.0 authentication on their website in reference to the API: https://developer.spotify.com/documentation/general/guides/authorization/

# XML / API Calls
The Web App was built and tested using Node.js, using Express and XMLHttpRequests in JS. Spotify provides an input/ouput API call generator to easily create curl calls for the command line. These were then translated into XMLHttpRequests (ex. headers). Here is the cool Spotify generator: https://developer.spotify.com/console/get-current-user-top-artists-and-tracks/

# Working Screenshot
![Screen Shot 2022-03-31 at 1 25 12 AM](https://user-images.githubusercontent.com/67079818/160982618-9b9714b3-4a3a-4c6b-b301-4957421b5e3b.png)

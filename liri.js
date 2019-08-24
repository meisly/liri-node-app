require("dotenv").config();

var Spotify = require("node-spotify-api");
var keys = require("./key.js");
var axios = require("axios");
var moment = require("moment");
let fs = require("fs");

var spotify = new Spotify(keys.spotify);

let type = process.argv[2];
let query = process.argv.slice(3).join(" ");

mediaSearch(type, query);

function mediaSearch(searchType, searchTerm) {
    switch (searchType) {
        case "concert-this":
            if (!searchTerm) {
                console.log("\nYou must enter an artist to search. \nType 'node liri.js help' for a list of commands");
            } else {
                concert(searchTerm);
            }
            break;

        case "spotify-this":
            if (!searchTerm) {
                console.log("Can't think of anything?  Try this!   Or if you're having trouble type 'node liri.js help' for search instructions.")
                track("The Sign Ace of Base");
            } else {
                track(searchTerm);
            }
            break;

        case "movie-this":
            if (!searchTerm) {
                console.log("Can't think of anything?  Try this!   Or if you're having trouble type 'node liri.js help' for search instructions.")
                movie("Mr Nobody");
            } else {
                movie(searchTerm);
            }
            break;

        case "simon-says":
            simonSays();
            break;

        case "help":
            console.log(`
            Application Info
            ###################
            Search Format
            ~~~~~~~~~~~~~~~~~~~
            [Search Command] [Search Query] - spaces are allowed.  See below for more info on valid queries

            Search Commands
            ~~~~~~~~~~~~~~~~~~~
            concert-this    Searches online database for concert information.  Valid queries must include artist name
            spotify-this    Searches Spotify for track info. Valid queries may include track titles and/or artist name.
            movie-this      Searches online database for movie info. Valid queries must include movie titles.
            simon-says      Performs searches from a file.  The file must contain both a valid search command and a query
            `);
            break;

        default:
            console.log("That was not a valid command");
            break;

    }
}
//    * `concert-this`
function concert(artist) {
    let url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;
    axios.get(url).then((response) => {
        let data = response.data;

        for (var i = 0; i < data.length; i++) {
            let lineup = data[i].lineup.join(", ");
            let venue = data[i].venue.name;
            let location = data[i].venue.city + ", " + data[i].venue.country;
            let date = moment(data[i].datetime).format("MM/DD/YYYY");

            console.log(
                `Lineup: ${lineup}
            Venue: ${venue}
            Location: ${location}
            Date: ${date}
            `.split("\n").map(x => x.trim()).join("\n")
            )
        }
    })
        .catch((err) => {
            console.error("Error occurred: " + err)
        })
}
//    * `spotify-this-song`
function track(song) {
    spotify
        .search({ type: 'track', query: song })
        .then((data) => {
            let results = data.tracks.items;
            //iterate through all of the results and print info to console
            for (var j = 0; j < results.length; j++) {
                let resultOb = results[j];
                //Assigns info variables
                let album = resultOb.album.name;
                let title = resultOb.name;
                let artists = resultOb.album.artists[0].name;
                let songPreview = resultOb.preview_url;
                //No Preview Message
                if (!songPreview) {
                    songPreview = "Not Available"
                }
                //print info
                console.log(
                    `\n
                Title: ${title}
                Artists: ${artists}
                Album: ${album}
                Preview: ${songPreview}`.split('\n').map(x => x.trim()).join('\n')
                );
            }
        })
        .catch((err) => {
            console.error('Error occurred: ' + err);
        });
}
//    * `movie-this`
function movie(title) {
    let url = "http://www.omdbapi.com/?apikey=trilogy&t=" + title;
    axios
        .get(url).then((response, error) => {
            if (response.data.Response !== 'False') {
                let movie = response.data;
                let ratings = movie.Ratings;

                let title = movie.Title;
                let year = movie.Year;
                let imdbRate = movie.imdbRating;
                let rottenRate = ratings[1].Value;
                let country = movie.Country;
                let language = movie.Language;
                let plot = movie.Plot;
                let actors = movie.Actors;

                console.log(`
                    Title: ${title}

                    Actors: ${actors}
                    Year Released: ${year}
                    IMDB Rating: ${imdbRate}
                    Rotten Tomatoes Score: ${rottenRate}
                    Country: ${country}
                    Languages: ${language}

                    Plot Summary: \n${plot}
                    `.split("\n").map(x => x.trim()).join("\n")
                )
            }
            else {
                console.log(response.data.Error);
            }
        })
        .catch((err) => {
            console.error('Error occurred: ' + err);
        })
}

//    * `do-what-it-says`
function simonSays() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }
        else {
            console.log(data);
            let command = data.split(" ")[0];
            let query = data.split(" ").slice(1).join(" ")
            mediaSearch(command, query);
        }
})
}

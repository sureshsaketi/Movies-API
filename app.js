const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log("DB Error: ${e.message}");
    process.exit(1);
  }
};
initializeDbAndServer();

// convert camelCaseToPascalCase
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertCamelCaseToPascalCase = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};
// GET Method for all movies
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `
    SELECT movie_name FROM movie;
    `;
  const movieNamesArray = await db.all(getMovieNameQuery);
  response.send(
    movieNamesArray.map((eachMovie) => {
      return convertDbObjectToResponseObject(eachMovie);
    })
  );
});

//POST Method
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
    INSERT INTO movie (director_id, movie_name,lead_actor)
    VALUES
    (
    '${directorId}',
    '${movieName}',
    '${leadActor}'
);`;
  const dbResponse = await db.run(updateMovieDetailsQuery);
  response.send("Movie Successfully Added");
  console.log(updateMovieDetailsQuery);
});

// GET Method for one movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
     * 
    FROM 
       movie
    WHERE movie_id LIKE ${movieId};`;
  let getMovie = await db.get(getMovieQuery);
  response.send(convertCamelCaseToPascalCase(getMovie));
});

// PUT Method
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
  UPDATE 
    movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}' 
  WHERE movie_id = ${movieId} ;
  `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
  console.log(updateMovieDetailsQuery);
});

// DELETE Method

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE movie_id = ${movieId} ;
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
// PASCAL CASE NOTATION FOR DIRECTORS

const convertCamelCaseToPascalCaseForDirector = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

// GET Method for all directors
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director;
    `;
  const directorsArray = await db.all(getDirectorQuery);
  response.send(
    directorsArray.map((eachDirector) => {
      return convertCamelCaseToPascalCaseForDirector(eachDirector);
    })
  );
});

// GET Method for all movies directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovie = `
    SELECT movie_name FROM movie
    WHERE director_id =${directorId} ;
    `;
  const moviesArray = await db.all(getDirectorMovie);
  response.send(
    moviesArray.map((eachMovie) => {
      return convertDbObjectToResponseObject(eachMovie);
    })
  );
});

module.exports = app;

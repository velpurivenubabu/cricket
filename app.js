const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(30026, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getall = `
    SELECT * 
    FROM 
    player_details
    ORDER BY player_id;`;
  const venu = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  const array = await db.all(getall);
  response.send(array.map((eachPlayer) => venu(eachPlayer)));
});
module.exports = app;
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayer = `
    select * FROM
    player_details
    WHERE 
    player_id = ${playerId};`;
  const venu = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  const req = await db.get(getplayer);
  response.send(venu(req));
  //response.send(req);
});

app.post("/players/", async (request, response) => {
  const vr = request.body;
  const { playerName } = vr;
  const ob = `
  
  INSERT INTO
   player_details (player_name)
   VALUES
   (
       '${playerName}'
   );`;
  const add = await db.run(ob);
  const player_Id = add.lastID;
  response.send({ player_Id: player_Id });
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const update = `
  UPDATE
  player_details
  SET
  player_name = '${playerName}'

  WHERE 
  player_id = ${playerId};`;
  const v = await db.run(update);

  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId, match, year } = request.params;
  const getplayer = `
    select * FROM
    match_details
    WHERE 
    match_id = ${matchId};`;
  const venu = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };

  const req = await db.get(getplayer);
  response.send(venu(req));
  //response.send(req);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getplayer = `
    select * FROM player_match_score NATURAL JOIN
    match_details
    WHERE 
    player_id = ${playerId};`;
  const venu = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };

  const req = await db.all(getplayer);
  response.send(req.map((each) => venu(each)));
  //response.send(req);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getplayer = `
    select * FROM player_details NATURAL JOIN
    player_match_score
    WHERE 
    match_id = ${matchId};`;
  const venu = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  const req = await db.all(getplayer);
  response.send(req.map((each) => venu(each)));
  //response.send(req);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getplayer = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    GROUP BY
    player_details.player_id
    `;

  const req = await db.all(getplayer);
  response.send(req);
  //response.send(req);
});

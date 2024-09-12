const fs = require('fs');
const axios = require('axios');

// Load the week and game dates from the JSON file
const gameSchedule = JSON.parse(fs.readFileSync('nfl-scores/games.json', 'utf8'));

// Function to fetch scores for a given date
async function fetchScoresForDate(gameDate) {
    const options = {
        method: 'GET',
        url: 'https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com/getNFLScoresOnly',
        params: {
            gameDate: gameDate,
            topPerformers: 'false'
        },
        headers: {
            'x-rapidapi-key': '82e65e7908msh848f9cebc8299b1p19165ajsn96787411d517',
            'x-rapidapi-host': 'tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com'
        }
    };

    try {
        console.log(`Fetching scores for date: ${gameDate}`);
        const response = await axios.request(options);
        const games = response.data.body; // Adjusted based on the example response

        if (!games || Object.keys(games).length === 0) {
            console.log(`No games found for date: ${gameDate}`);
            return [];
        }

        const scores = [];

        for (const [gameId, gameData] of Object.entries(games)) {
            const homeTeam = gameData.home;
            const awayTeam = gameData.away;
            const homeScore = parseInt(gameData.homePts);
            const awayScore = parseInt(gameData.awayPts);
            const status = gameData.gameStatus;

            scores.push({
                gameId: gameId,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeScore: homeScore || 0, // Default score to 0 if null
                awayScore: awayScore || 0, // Default score to 0 if null
                status: status
            });
        }

        return scores;
    } catch (error) {
        console.error(`Error fetching NFL scores for date ${gameDate}:`, error);
        return [];
    }
}

// Function to fetch scores for every week and day in the schedule
async function fetchAllScores() {
    const allWeeks = [];

    for (const weekData of gameSchedule) {
        const weekNumber = weekData.week;
        const weekScores = { week: weekNumber, games: {} };

        // Loop through all the days that have games in the week
        for (const day in weekData) {
            if (day !== 'week') {
                const gameDate = weekData[day];
                const dayScores = await fetchScoresForDate(gameDate);

                // Add scores for the day to the weekly games
                if (dayScores.length > 0) {
                    weekScores.games[day] = dayScores;
                } else {
                    console.log(`No scores found for week ${weekNumber}, day: ${day} (${gameDate})`);
                }
            }
        }

        allWeeks.push(weekScores);
    }

    // Write the weekly scores to a JSON file
    fs.writeFileSync('weekly_scores.json', JSON.stringify(allWeeks, null, 2));
    console.log('Scores for all weeks have been written to weekly_scores.json');
}

// Run the function to fetch and write all the scores
fetchAllScores();

const fs = require('fs');
const path = require('path');

// Load winners and players data
const winnersFilePath = path.join(__dirname, 'winners.json');
const playersFilePath = path.join(__dirname, 'players.json');
const leaderboardFilePath = path.join(__dirname, 'leaderboard.json');

async function calculateScores() {
    try {
        // Read winners and players data
        const winnersData = JSON.parse(fs.readFileSync(winnersFilePath, 'utf8'));
        const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
        
        // Initialize leaderboard object
        const leaderboard = {
            totalScores: {}
        };

        // Initialize total scores object
        const totalScores = {};

        // Process each week
        for (const weekData of winnersData) {
            const weekNumber = weekData.week;
            const weekKey = `Week ${weekNumber}`; // Use the format "Week X"
            const weeklyWinners = weekData.games.reduce((acc, game) => {
                if (game.status === 'Completed') {
                    // Determine the winning team
                    const winningTeam = parseInt(game.homeScore) > parseInt(game.awayScore) ? game.homeTeam : game.awayTeam;
                    acc[winningTeam] = parseInt(game.homeScore) > parseInt(game.awayScore) ? parseInt(game.homeScore) : parseInt(game.awayScore);
                }
                return acc;
            }, {});

            // Process each player's picks
            for (const [player, weeks] of Object.entries(playersData)) {
                const playerPicks = weeks[`week${weekNumber}`];
                
                if (!playerPicks) continue;

                // Initialize player score for this week
                let playerScore = 0;

                playerPicks.forEach((pick, index) => {
                    if (weeklyWinners[pick]) {
                        // Bonus pick score
                        if (index === 0) {
                            playerScore += 10 + weeklyWinners[pick];
                        } else {
                            playerScore += 10;
                        }
                    }
                });

                // Initialize total score if not already
                if (!totalScores[player]) {
                    totalScores[player] = 0;
                }
                totalScores[player] += playerScore;

                // Initialize leaderboard week entry if not already
                if (!leaderboard[weekKey]) {
                    leaderboard[weekKey] = {};
                }
                leaderboard[weekKey][player] = playerScore;
            }
        }

        // Prepare total scores for totalScores entry
        leaderboard.totalScores = Object.entries(totalScores).sort((a, b) => b[1] - a[1]);

        // Write leaderboard to file
        fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
        console.log('Leaderboard has been successfully calculated and saved to leaderboard.json.');
    } catch (error) {
        console.error('Error calculating scores:', error);
    }
}

// Run the calculation
calculateScores();

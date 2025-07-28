const fs = require('fs');
const path = require('path');

// Load data paths
const winnersFilePath = path.join(__dirname, 'winners.json');
const playersFilePath = path.join(__dirname, 'players.json');
const leaderboardFilePath = path.join(__dirname, 'leaderboard_newRules.json');

async function calculateScores() {
    try {
        const winnersData = JSON.parse(fs.readFileSync(winnersFilePath, 'utf8'));
        const playersData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));

        const leaderboard = {
            totalScores: {}
        };
        const totalScores = {};

        for (const weekData of winnersData) {
            const weekNumber = weekData.week;
            const weekKey = `Week ${weekNumber}`;
            const weeklyWinners = weekData.games.reduce((acc, game) => {
                if (game.status === 'Completed') {
                    const homeScore = parseInt(game.homeScore);
                    const awayScore = parseInt(game.awayScore);
                    const homeTeam = game.homeTeam;
                    const awayTeam = game.awayTeam;

                    if (homeScore > awayScore) {
                        acc[homeTeam] = homeScore;
                    } else {
                        acc[awayTeam] = awayScore;
                    }
                }
                return acc;
            }, {});

            for (const [player, weeks] of Object.entries(playersData)) {
                const picks = weeks[`week${weekNumber}`];
                if (!picks) continue;

                let playerScore = 0;

                picks.forEach((pick, index) => {
                    const winningScore = weeklyWinners[pick];
                    if (winningScore !== undefined) {
                        if (index === 0) {
                            // Bonus pick: double the score
                            playerScore += winningScore * 2;
                        } else {
                            // Regular pick: exact score
                            playerScore += winningScore;
                        }
                    }
                });

                if (!totalScores[player]) totalScores[player] = 0;
                totalScores[player] += playerScore;

                if (!leaderboard[weekKey]) leaderboard[weekKey] = {};
                leaderboard[weekKey][player] = playerScore;
            }
        }

        leaderboard.totalScores = Object.entries(totalScores).sort((a, b) => b[1] - a[1]);

        fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
        console.log('New leaderboard (scoring by points scored) saved as leaderboard_newRules.json');
    } catch (error) {
        console.error('Error:', error);
    }
}

calculateScores();

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.pro-football-reference.com/years/2024/';

async function fetchAllWeeks() {
    const allWeeks = [];

    // Loop through all 18 weeks
    for (let week = 1; week <= 18; week++) {
        try {
            console.log(`Fetching Week ${week}...`);
            const response = await axios.get(`${baseUrl}week_${week}.htm`);
            const $ = cheerio.load(response.data);

            const games = [];

            $('div.game_summary').each((index, element) => {
                const teamsTable = $(element).find('table.teams');
                
                // Extract team names; the first team is away, and the second is home
                const awayTeam = teamsTable.find('tr').eq(1).find('td').eq(0).text().trim();
                const homeTeam = teamsTable.find('tr').eq(2).find('td').eq(0).text().trim();

                // Extract date and determine weekday
                const dateText = $(element).find('tr.date td').text().trim();
                let date, weekday;

                // Check if dateText is a weekday or a full date
                if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(dateText)) {
                    // If it's a weekday, use the weekday directly
                    weekday = dateText;
                    date = new Date(); // Default date
                } else {
                    // If it's a full date, parse it
                    date = new Date(dateText);
                    weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
                }

                // Check if the game is completed, in progress, or in preview
                const gameStatusText = teamsTable.find('td.gamelink a').text().trim();
                let homeScore = 0;
                let awayScore = 0;
                let status = 'pending';

                if (gameStatusText === 'Final') {
                    status = 'completed';

                    // Check which team is the winner and assign scores accordingly
                    const winnerTeam = teamsTable.find('tr.winner td').eq(0).text().trim();
                    const winnerScore = parseInt(teamsTable.find('tr.winner td').eq(1).text().trim()) || 0;

                    const loserTeam = teamsTable.find('tr.loser td').eq(0).text().trim();
                    const loserScore = parseInt(teamsTable.find('tr.loser td').eq(1).text().trim()) || 0;

                    // Assign the scores to the correct teams
                    if (homeTeam === winnerTeam) {
                        homeScore = winnerScore;
                        awayScore = loserScore;
                    } else {
                        homeScore = loserScore;
                        awayScore = winnerScore;
                    }
                } else if (gameStatusText === 'Preview') {
                    status = 'preview';
                } else {
                    status = 'in progress';

                    // Extract the current score for each team
                    const homeScoreText = teamsTable.find('tr').eq(2).find('td.right').text().trim();
                    const awayScoreText = teamsTable.find('tr').eq(1).find('td.right').text().trim();

                    homeScore = parseInt(homeScoreText) || 0;
                    awayScore = parseInt(awayScoreText) || 0;
                }

                games.push({
                    homeTeam: homeTeam,
                    homeScore: homeScore,
                    awayTeam: awayTeam,
                    awayScore: awayScore,
                    status: status,
                    date: date.toISOString().split('T')[0], // Store date in YYYY-MM-DD format
                    weekday: weekday
                });
            });

            allWeeks.push({
                week: week,
                games: games
            });

        } catch (error) {
            console.error(`Error fetching Week ${week}:`, error);
        }
    }

    // Write all weeks to winners.json
    fs.writeFileSync('winners.json', JSON.stringify(allWeeks, null, 2));
    console.log('All weeks fetched and stored in winners.json');
    console.log(JSON.stringify(allWeeks, null, 2));
}

fetchAllWeeks();

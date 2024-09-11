const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.pro-football-reference.com/years/2024/';

async function fetchWinners(week) {
    try {
        const response = await axios.get(`${baseUrl}week_${week}.htm`);
        const $ = cheerio.load(response.data);

        const winners = [];

        $('div.game_summary').each((index, element) => {
            const teamsTable = $(element).find('table.teams');
            const homeTeam = teamsTable.find('tr.winner td').eq(0).text().trim();
            const awayTeam = teamsTable.find('tr.loser td').eq(0).text().trim();
            const homeScore = parseInt(teamsTable.find('tr.winner td').eq(1).text().trim());
            const awayScore = parseInt(teamsTable.find('tr.loser td').eq(1).text().trim());

            if (homeScore > awayScore) {
                winners.push({
                    team: homeTeam,
                    score: homeScore
                });
            } else {
                winners.push({
                    team: awayTeam,
                    score: awayScore
                });
            }
        });

        // Write winners to a JSON file
        fs.writeFileSync('../winners.json', JSON.stringify(winners, null, 2));

        console.log(`Winners for Week ${week}:`, winners);
        return winners;
    } catch (error) {
        console.error('Error fetching NFL winners:', error);
        return [];
    }
}

const week = 1; // Example week
fetchWinners(week);

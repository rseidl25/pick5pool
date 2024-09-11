const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.pro-football-reference.com/boxscores/';

async function fetchScores(week) {
    try {
        const response = await axios.get(`${baseUrl}?week=${week}`);
        const $ = cheerio.load(response.data);

        // Assuming the table with scores has the class 'game_summary'
        const scores = [];

        $('div.game_summary').each((index, element) => {
            const homeTeam = $(element).find('.team_name').first().text().trim();
            const awayTeam = $(element).find('.team_name').last().text().trim();
            const homeScore = $(element).find('.score').first().text().trim();
            const awayScore = $(element).find('.score').last().text().trim();

            scores.push({
                homeTeam,
                awayTeam,
                homeScore,
                awayScore
            });
        });

        console.log(`Scores for Week ${week}:`, scores);
        return scores;
    } catch (error) {
        console.error('Error fetching NFL scores:', error);
    }
}

const week = 1; // Example week
fetchScores(week);

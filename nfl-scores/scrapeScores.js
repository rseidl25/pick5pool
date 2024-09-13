const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Mapping of team names to cities
const teamCities = {
    'Cardinals': 'Arizona',
    'Falcons': 'Atlanta',
    'Ravens': 'Baltimore',
    'Bills': 'Buffalo',
    'Panthers': 'Carolina',
    'Bears': 'Chicago',
    'Bengals': 'Cincinnati',
    'Browns': 'Cleveland',
    'Cowboys': 'Dallas',
    'Broncos': 'Denver',
    'Lions': 'Detroit',
    'Texans': 'Houston',
    'Colts': 'Indianapolis',
    'Packers': 'Green Bay',
    'Jaguars': 'Jacksonville',
    'Chiefs': 'Kansas City',
    'Raiders': 'Las Vegas',
    'Chargers': 'Los Angeles',
    'Rams': 'Los Angeles',
    'Dolphins': 'Miami',
    'Vikings': 'Minnesota',
    'Patriots': 'New England',
    'Saints': 'New Orleans',
    'Giants': 'New York',
    'Jets': 'New York',
    'Eagles': 'Philadelphia',
    'Steelers': 'Pittsburgh',
    '49ers': 'San Francisco',
    'Seahawks': 'Seattle',
    'Buccaneers': 'Tampa Bay',
    'Titans': 'Tennessee',
    'Commanders': 'Washington'
};

const baseUrl = 'https://www.espn.com/nfl/scoreboard/';

async function fetchAllWeeks() {
    const allWeeks = [];

    for (let week = 1; week <= 18; week++) {
        try {
            console.log(`Fetching Week ${week}...`);
            const response = await axios.get(`${baseUrl}_/week/${week}/year/2024/seasontype/2`);
            const $ = cheerio.load(response.data);

            const games = [];

            $('.Card.gameModules').each((index, element) => {
                const headerText = $(element).find('.Card__Header__Title.Card__Header__Title--no-theme').text().trim();
                const weekday = headerText.split(',')[0].trim(); // Extracting only the weekday part

                // Loop through each game under the header
                $(element).find('.Scoreboard').each((i, gameElement) => {
                    const homeTeam = $(gameElement).find('.ScoreCell__TeamName').eq(1).text().trim();
                    const awayTeam = $(gameElement).find('.ScoreCell__TeamName').eq(0).text().trim();

                    const homeScore = parseInt($(gameElement).find('.ScoreCell__Score').eq(1).text().trim()) || 0;
                    const awayScore = parseInt($(gameElement).find('.ScoreCell__Score').eq(0).text().trim()) || 0;

                    // Determine the game status
                    let status = 'Preview'; // Default to Preview if not otherwise specified

                    if ($(gameElement).find('.Scoreboard__Callouts a').length === 3) {
                        status = 'Completed';
                    } else if ($(gameElement).find('.ScoreCell__Score').length == 2) {
                        status = homeScore > 0 || awayScore > 0 ? 'Final' : 'In Progress';
                    } else if ($(gameElement).find('.ScoreCell__Time').length) {
                        status = 'Scheduled';
                    }

                    // Prepend city name to team names
                    const homeTeamWithCity = `${teamCities[homeTeam] || ''} ${homeTeam}`;
                    const awayTeamWithCity = `${teamCities[awayTeam] || ''} ${awayTeam}`;

                    games.push({
                        homeTeam: homeTeamWithCity,
                        homeScore: homeScore,
                        awayTeam: awayTeamWithCity,
                        awayScore: awayScore,
                        weekday: weekday,
                        status: status
                    });
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
}

fetchAllWeeks();

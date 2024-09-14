// Import required modules
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

// Function to get current time in Central Time
function getCentralTime() {
    const centralTime = moment.tz("America/Chicago"); // Central Time Zone (CST or CDT depending on DST)
    return centralTime;
}

// Function to format the time in the format 1:20 PM CST or CDT
function formatTime(centralTime) {
    const formattedTime = centralTime.format('h:mm A z'); // 'h:mm A' gives the time in 12-hour format, 'z' gives timezone abbreviation (CST/CDT)
    return formattedTime;  // Returns time like "1:20 PM CST" or "1:20 PM CDT"
}

// Function to format the date in the format September 14, 2024
function formatDate(centralTime) {
    const formattedDate = centralTime.format('MMMM D, YYYY'); // 'MMMM D, YYYY' gives a date like "September 14, 2024"
    return formattedDate;
}

// Function to write date and time data to time.json
function writeTimeToFile(date, time) {
    const filePath = path.join(__dirname, '../time.json');
    const timeData = {
        date: date,
        time: time
    };
    fs.writeFileSync(filePath, JSON.stringify(timeData, null, 2));
    console.log('Date and time written to time.json:', timeData);
}

// Main function
function grabTime() {
    const centralTime = getCentralTime();
    const formattedDate = formatDate(centralTime);
    const formattedTime = formatTime(centralTime);
    writeTimeToFile(formattedDate, formattedTime);
}

// Call the function
grabTime();

const fs = require('fs');
const puppeteer = require('puppeteer');
const emailjs = require('@emailjs/nodejs');

const availableRaceURL = 'https://runsignup.com/Race/Register/?raceId=81266'; // available race for testing
const unavailableRaceURL = 'https://runsignup.com/Race/Register/?raceId=26806'; // desired race for signup
const activeRaceURL = unavailableRaceURL; 
let isEmailSent = false;

const minutesTilRefresh = 30;
const interval = minutesTilRefresh * 60 * 1000;

const templateParams = {
    race_url: activeRaceURL
}

const keyParams = {
    publicKey: 'e938RbWJDbxUezdP6',
    privateKey: ''
}

async function run() {

    const successId = '#raceRegForm';
    const browser = await puppeteer.launch({ args: ['--ignore-certificate-errors'], headless: false, userDataDir: "./user_data" });
    const page = await browser.newPage();
    page.setViewport({ width: 1000, height: 700 });

while(true) {

    
    try {

        await page.goto(activeRaceURL);

        let isSignupAvailable = await page.evaluate((successId) => {
            console.log(successId)
            let el = document.querySelector(successId);
            return el ? true : false;
        }, successId);

        if (isSignupAvailable) {
            log("SIGNUP IS AVAILABLE");
            if (!isEmailSent) {
                emailjs.send("race_check", "template_8c2wuzk", templateParams, keyParams).then((res) => {
                    log(res.status + ' ' + res.text);
                    isEmailSent = true;
                }).catch((err) => {
                    log(err.text)
                    isEmailSent = false;
                })
            }
           
        } else {
            log("SIGNUP NOT AVAILABLE");
        }        
        
    } catch (err) {
        log(err);
    }

    await sleep(interval);
}



}

run();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    const logTime = new Date().toISOString();
    const logFileName = logTime.split('T')[0];
    const output = `\n[${logTime}] ` + message;
    console.log(output);
    fs.appendFileSync(`log-${logFileName}.txt`, output);
}
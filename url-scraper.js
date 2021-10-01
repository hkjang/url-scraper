'use strict';

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const puppeteer = require('puppeteer');
const devices = puppeteer.devices;
app.get("/geturl", (req, res) => {
    (async () => {

        if(!req.query.type){
            req.query.type = 'json';
        }
        if(!req.query.device){
            req.query.device = 'iPhone 6';
        }

        const device = devices[req.query.device];
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.emulate(device);
        const results = []
        const pageClient = page["_client"];
        pageClient.on("Network.responseReceived", event => {
            if (~event.response.url.indexOf(req.query.type)) {
                console.log(event.response.url);
                results.push(event.response.url);
            }else{
                // console.log(event.response.url);
            }
        });

        await page.setRequestInterception(true);
        page.on("request", async request => {
            request.continue();
        });
        await page.goto(req.query.url, { timeout: 0 });
        await browser.close();
        res.json({'status':'ok','list':results});
    })();

});

app.listen(3003, () => console.log("connect to http://localhost:3003 !"));

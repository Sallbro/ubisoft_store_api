const axios = require('axios');
const { Cheerio } = require('cheerio');
const express = require('express');
const { features } = require('process');
const app = express();
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const e = require('express');
dotenv.config();
const port = process.env['PORT'] || 9331;


app.get('/', async (req, res) => {
    res.send("WORKING FINE !...");
});

app.get('/singlegame/:id', async (req, res) => {
    const game_id = req.params.id;
    let act_url = process.env['GET_SINGLE_GAME_URL'];
    act_url = act_url.replace("${game_id}", game_id);

    axios({
        method: "get",
        url: act_url
    }).then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const result = {};

        // title 
        let name = ""
        $("h1.c-pdp-banner__product-title > span").map(function (i, e) {
            if (name != "") {
                name = name + " " + $(e).text().trim();
            } else {
                name = name + $(e).text().trim();
            }
        });
        result.name = name;

        // cell 
        $("#general-information > dl > div.cell").map(function (i, e) {
            $(e).find("div.c-pdp-general-info__group").each(function () {
                const dt = $(this).find("dt.inline").text().trim();

                if (dt == "Description:") {
                    const desc = ($(this).find("dd").text().trim()).replace(/\n/g, "");
                    result.desc = desc;
                }
                else if (dt == "Release date:") {
                    const releaseddate = $(this).find("dd").text().trim();
                    result.releaseddate = releaseddate;
                }
                else if (dt == "Platforms:") {
                    const platform = ($(this).find("dd").text().trim()).split(",");
                    result.platform = platform;

                }
                else if (dt == "Genre:") {
                    const genre = ($(this).find("dd").text().trim()).split("/");
                    result.genre = genre;

                }
            })
        });

        // languages 
        let languages = [];
        $("div.reveal-wrapper > table.c-languages__table > tbody > tr").map(function (i, e) {
            const language = $(e).find("td.c-languages__table-td > span.language-table-name").text().trim();
            languages.push(language);
        });
        result.lang = languages;

        //images
        const images = {};
        // videos 
        const videos = [];
        $("div.experience-pdp-mediaSlider > div.c-pdp-media-slider > div.c-pdp-media-slider__nav > div.slide").map(function (i, e) {
            const videoid = $(e).find("div > img").attr("data-videoid");
            videos.push("https://youtu.be/" + videoid);
        });
        images.videos = videos;

        // screenshot 
        const screenshot = [];
        $("div.experience-pdp-mediaSlider > div.c-pdp-media-slider > div.c-pdp-media-slider__nav > div.c-pdp-thumbnail-slider").map(function (i, e) {
            const paramsData = JSON.parse($(e).find("button.slide > div.slide__content > img").attr("data-params"));
            const screenshoturl = (paramsData.action).split('.jpg')[0] + '.jpg';
            screenshot.push(screenshoturl);
        });
        images.screenshot = screenshot;
        result.images = images;

        // system requirement 
        const sys_req = {};
        $("div.tabs-content > div > div.experience-component").map(function (i, e) {
            
            const sys = $(e).find("div.tabs-panel > li > a").text().trim();
            if (sys != '' && sys != null) {
                const sys_data = {};
                
                $(e).find("div.tabs-panel > dl.tabs-content > div").each(function () {
                    const sysname = $(this).find("dt").text().trim();
                    const sysvalue = $(this).find("dd").text().trim();
                    sys_data[sysname] = sysvalue;
                });
                sys_req[sys] = sys_data;
            }
        });
        result.sys_req = sys_req;

        res.status(200).send(result);
        res.end();
    }).catch((err) => {
        res.send("wrong id!");
        res.end();
    });
});

app.get('/pgno/:page_no', async (req, res) => {
    let page_no = req.params.page_no;
    let act_url = process.env['GET_PAGE_URL'];
    page_no = Number(page_no) * 30;
    let param = process.env['GET_PAGE_URL_PARAM'];
    param = JSON.parse(param.replace("${page_no}", page_no));

    axios.post(act_url, param).then((response) => {
        const result = [];
        for (const resp of response.data.hits) {
            const res = {};
            res.id = resp.dmCustomData.id;
            res.title = resp.dmCustomData.title;
            res.brand = resp.dmCustomData.brand;
            res.content = resp.dmCustomData.content;
            res.websiteLink = resp.dmCustomData.websiteLink;
            res.releaseDate = resp.releaseDate;
            res.platforms = resp.dmCustomData.platforms;
            res.genres = resp.dmCustomData.genres;
            res.assets = resp.assets;
            result.push(res);
        }
        res.status(200).send(result);
    }).catch((err) => {
        res.status(400).send("enter valid page no.");
        res.end();
    });
});

app.get('/search/:sugg', async (req, res) => {
    const sugg = req.params.sugg;
    let act_url = process.env['GET_SEARCH_URL'];
    let param = process.env['GET_SEARCH_URL_PARAM'];
    param = JSON.parse(param.replace("${sugg}", sugg));

    axios.post(act_url, param).then((response) => {
        const result = [];
        for (const resp of response.data.results[0].hits) {
            const res = {};
            res.id = resp.dmCustomData.id;
            res.title = resp.dmCustomData.title;
            res.brand = resp.dmCustomData.brand;
            res.content = resp.dmCustomData.content;
            res.websiteLink = resp.dmCustomData.websiteLink;
            res.releaseDate = resp.releaseDate;
            res.platforms = resp.dmCustomData.platforms;
            res.genres = resp.dmCustomData.genres;
            res.assets = resp.assets;
            result.push(res);
        }
        res.status(200).send(result);
    }).catch((err) => {
        res.status(400).send("enter valid query");
        res.end();
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
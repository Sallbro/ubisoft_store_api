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
    let page_no = req.params.page_no == 1 ? 0 : req.params.page_no;
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

// app.get('/searchparallel/:sugg', async (req, res) => {
//     const sugg = req.params.sugg;
//     let act_url = process.env['GET_SEARCH_URL'];
//     let act_url2 = process.env['GET_SEARCH_URL2'];
//     let param = process.env['GET_SEARCH_URL_PARAM'];
//     let param2 = process.env['GET_SEARCH_URL2_PARAM'];

//     param = JSON.parse(param.replace("${sugg}", sugg));
//     param2 = JSON.parse(param2.replace("${sugg}", sugg));

//     // Define an array of URLs
//     const urls = [
//         {
//             url: act_url,
//             param: param
//         },
//         {
//             url: act_url2,
//             param: param2
//         }
//     ];
//     // Function to make a request for a single URL
//     const fetchData = async (url, param) => {
//         try {
//             const response = await axios.post(url, param);
//             return response.data;
//         } catch (error) {
//             console.error(`Error fetching data from ${url}: ${error.message}`);
//             throw error;
//         }
//     };
//     try {
//         const results = await Promise.all(urls.map((obj) => fetchData(obj.url, obj.param)));
//         console.log('Results:', results);
//         res.send(results);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// });


// app.get('/search2/:sugg', async (req, res) => {
//     const sugg = req.params.sugg;
//     let act_url = process.env['GET_SEARCH_URL'];
//     let param = process.env['GET_SEARCH_URL_PARAM'];
//     param = JSON.parse(param.replace("${sugg}", sugg));
//    act_url = 'https://xely3u4lod-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(3.35.1)%3B%20Browser&x-algolia-application-id=XELY3U4LOD&x-algolia-api-key=5638539fd9edb8f2c6b024b49ec375bd';

//     axios.post(act_url, param).then((response) => {
//         console.log(response.data);
//         const result = [];
//         for (const resp of response.data.results[0].hits) {
//             const res = {};
//             res.id = resp.dmCustomData.id;
//             res.title = resp.dmCustomData.title;
//             res.brand = resp.dmCustomData.brand;
//             res.content = resp.dmCustomData.content;
//             res.websiteLink = resp.dmCustomData.websiteLink;
//             res.releaseDate = resp.releaseDate;
//             res.platforms = resp.dmCustomData.platforms;
//             res.genres = resp.dmCustomData.genres;
//             res.assets = resp.assets;
//             result.push(res);
//         }
//         res.status(200).send(result);
//     }).catch((err) => {
//         res.status(400).send("enter valid query");
//         res.end();
//     });
// });

// app.get('/test', async (req, res) => {
//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: 'https://nimbus.ubisoft.com/api/v1/items?categoriesFilter=all&fallbackLocale=en-gb&limit=8&locale=en-gb&mediaFilter=news&skip=8&startIndex=undefined&tags=BR-ubisoft%20GA-news&environment=master',
//         headers: {
//             'Cookie': 'AWSALB=hgbtK9RQwoiuiUHVBnUszHycg9dOWXWuxVBYoBUO6Uwr9DQKkAIffxHEMdKqbMi711jqZBYCywxTk98RnFyiSHL0HuliTwfPTDqLXvJ923r4xZzHGHchbO5ANvgR; AWSALBCORS=hgbtK9RQwoiuiUHVBnUszHycg9dOWXWuxVBYoBUO6Uwr9DQKkAIffxHEMdKqbMi711jqZBYCywxTk98RnFyiSHL0HuliTwfPTDqLXvJ923r4xZzHGHchbO5ANvgR'
//         }
//     };

//     axios.request(config)
//         .then((response) => {
//             console.log(JSON.stringify(response.data));
//         })
//         .catch((error) => {
//             console.log("error");
//             res.send(error);
//         });
// });


app.get('/news/:category', async (req, res) => {
    const arrcategory = ['all', 'play-free', 'events', 'esports', 'game-updates'];
    const category = arrcategory.includes(req.params.category) ? req.params.category : 'all';
    let page_no = req.query.page_no == undefined || req.query.page_no == 1 ? '0' : req.query.page_no;
    let act_url = process.env.GET_NEWS_URL;
    act_url = act_url.replace("${category}", category);
    act_url=act_url.replace("${page_no}", page_no);

    axios({
        method: "get",
        url: act_url,
        headers: {
            'Authorization': process.env.AUTHORIZATION
        }
    }).then((response) => {
        const result = {};
        result.page = page_no;
        result.category = response.data.categoriesFilter;
        const items = [];
        result.items = items;
        for (const item of response.data.items) {
            const obj_item = {};
            obj_item.id = item.id;
            obj_item.title = item.title;
            obj_item.desc = item.abstract;
            obj_item.date = item.date;
            obj_item.thumbnail = item.thumbnail.url;
            obj_item.categories = item.categories;
            obj_item.authors = item.authors;

            const inputString = item.content;
            const youtubeUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
            const matches = inputString.match(youtubeUrlRegex);

            obj_item.videos = matches || [];

            items.push(obj_item);
        }
        res.status(200).send(result);
    }).catch((err) => {
        res.status(400).send("err");
    })
});

app.get('/entertainment/:category', async (req, res) => {
    const arrcategory = ['music-book', 'film-television', 'education-event'];
    let category = req.params.category;
    if (category == 'music-book') {
        category = 'ubisoft-books-%26-music';
    }
    else if (category == 'film-television') {
        category = 'ubisoft-film-%26-television';
    }
    else {
        category = 'ubisoft-education-%26-events';
    }

    let page_no = req.query.page_no == undefined || req.query.page_no == 1 ? '0' : req.query.page_no;
    let act_url = process.env.GET_NEWS_URL;
    act_url = act_url.replace("${category}", category);
    act_url=act_url.replace("${page_no}", page_no);

    axios({
        method: "get",
        url: act_url,
        headers: {
            'Authorization': process.env.AUTHORIZATION
        }
    }).then((response) => {
        const result = {};
        result.page = page_no;
        result.category = response.data.categoriesFilter;
        const items = [];
        result.items = items;
        for (const item of response.data.items) {
            const obj_item = {};
            obj_item.id = item.id;
            obj_item.title = item.title;
            obj_item.desc = item.abstract;
            obj_item.date = item.date;
            obj_item.thumbnail = item.thumbnail.url;
            obj_item.categories = item.categories;
            obj_item.authors = item.authors;

            const inputString = item.content;
            const youtubeUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
            const matches = inputString.match(youtubeUrlRegex);

            obj_item.videos = matches || [];

            items.push(obj_item);
        }
        res.status(200).send(result);
    }).catch((err) => {
        res.status(400).send("err");
    })
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
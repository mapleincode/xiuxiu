"use strict";

const wmdl = require("wmdl");
const async = require("async");
const request = require("request");
const _ = require("lodash");

function crawl(url, callback) {

    // let url = "http://www.xiumm.org/photos/XiuRen-16992.html";

    // http://www.xiumm.org/photos/UGirls-17391-2.html

    const request = require("request");

    let aa = true;

    let title;

    let number = 1;

    let n = 1;

    let sameTimes = 0;

    const hashMap = {};

    async.whilst(function () { return sameTimes <= 1 && aa && number < 100; }, function (callback) {
        let newUrl = url;
        if (number > 1) {
            newUrl = url.replace(".html", `.html?page=${number}`);
        }
        console.log(newUrl);
        number++;

        request.get(newUrl, function (err, res, body) {
            if (err) {
                aa = false;
                return callback(err);
            }

            // console.log(body);
            // console.log(body);
            if (!title) {
                try {
                    // let t = body.match(/inline">[ \n\W\w\[\]]+?</)[0];
                    // t = t.match(/>[ \n\W\w\[\]]+?</)[0];
                    // t = t.slice(1, t.length - 1).replace("\n", "").trim();
                    let t = body.match(/<h1 class="title">.+<\/h1>/)[0];
                    t = t.slice(18, t.length - 5);
                    console.log(t);
                    title = t;
                } catch(e) {
                    aa = false;
                }
            }

            let pic = body.match(/[0-9]{4}\/[0-9]{2}\/[0-9]+/g);

            if (!pic) {
                aa = false;
                return callback();
            }
            pic = pic[0];

            if(hashMap[pic]) {
                sameTimes ++;
            } else {
                hashMap[pic] = true;
            }
            // async.each(pic, function (p, callback) {
            //     // console.log(pic);
            //     // const a = p.match(/\w+\.(jpg|jpeg|png)/)[0];
                
            // }, callback);

            wmdl.wmdl(`https://www.lunu8.com/zb_users/upload/${pic}.jpg`, `Downloads/${title}/${number - 1}.jpg`, function(err) {
                    if(err) {
                        return wmdl.wmdl(`https://www.lunu8.com/zb_users/upload/${pic}.jpg`, `Downloads/${title}/${number - 1}.jpg`, function(err) {
                            if(err) {
                                console.error(err);
                            }
                            callback();
                        });
                    }
                    callback();
                });
        });

    }, function (err) {
        callback(err);
    });
}

// crawl('https://www.lunu8.com/web/1090.html', console.log);

let baseUri = "https://www.lunu8.com"
let page = 1;
// http://www.xiumm.org/albums/page-2.html
async.whilst(() => { return page < 31 }, function (callback) {
    if (page > 1) {
        baseUri = `https://www.lunu8.com/page_${page}.html`;
    }
    page++;
    console.log(baseUri);
    request.get(baseUri, function (err, res, body) {
        if (err) {
            page --;
            return callback();
        }
        let urls = body.match(/https\:\/\/www\.lunu8\.com\/web\/[0-9\-\/]+\.html/g);
        urls = _.union(urls);
        console.log(urls);
        console.log(urls.length);
        async.eachSeries(urls, function (url, callback) {
            crawl(url, function(err) {
                callback();
            });
        }, callback)
    });
}, function (err) {
    console.log(err);
});



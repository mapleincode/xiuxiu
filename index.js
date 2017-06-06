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

    async.whilst(function () { return aa; }, function (callback) {
        let newUrl = url;
        if (number > 1) {
            newUrl = url.replace(".html", "") + `-${number}.html`;
        }
        console.log(newUrl);
        number++;

        request.get(newUrl, function (err, res, body) {
            if (err) {
                aa = false;
                return callback(err);
            }
            // console.log(body);
            if (!title) {
                try {
                    let t = body.match(/inline">[ \n\W\w\[\]]+?</)[0];
                    t = t.match(/>[ \n\W\w\[\]]+?</)[0];
                    t = t.slice(1, t.length - 1).replace("\n", "").trim();
                    // console.log(t);
                    title = t;
                } catch(e) {
                    aa = false;
                }
            }

            let pic = body.match(/\/data[0-9\/\.jpg]+/g);

            if (!pic) {
                aa = false;
            }
            async.each(pic, function (p, callback) {
                // console.log(pic);
                const a = p.match(/\w+\.jpg/)[0];
                wmdl.wmdl(`http://www.xiumm.org/${p}`, `${title}/${a}`, callback);
            }, callback);
        });

    }, function (err) {
        callback(err);
    });
}

let baseUri = "http://www.xiumm.org"
let page = 1;
// http://www.xiumm.org/albums/page-2.html
async.whilst(() => { return page < 200 }, function (callback) {
    if (page > 1) {
        baseUri = `http://www.xiumm.org/albums/page-${page}.html`;
    }
    page++;
    console.log(baseUri);
    request.get(baseUri, function (err, res, body) {
        if (err) {
            return callback(err);
        }
        let urls = body.match(/http\:\/\/www\.xiumm\.org\/photos\/[A-Za-z0-9\-\/]+\.html/g);
        urls = _.union(urls);
        console.log(urls);
        console.log(urls.length);
        async.eachSeries(urls, function (url, callback) {
            crawl(url, callback);
        }, callback)
    });
}, function (err) {
    console.log(err);
});
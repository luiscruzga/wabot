// Modules to install separately
const request = require('request');
const base64 = require('node-base64-image');
const feed = require("feed-read");
const scrape = require('html-metadata');
const urlThumbDefault = 'https://st2.depositphotos.com/3837271/6711/i/950/depositphotos_67114347-stock-photo-news-piece-of-paper.jpg';
var timeRefresh = 10;
var contMaxNotice = 3;
var contNews = 0;
var newsArray = [];

var thumbDefault = '';
base64.encode(urlThumbDefault, {string: true}, (err, data64) => {
    if(!err) thumbDefault = data64;
})

const loadNewsCache = (feeds) => {
    newsArray = [];
    feeds.forEach(source => {
        feed(source, (err, articles) => {
            if(!err){
                if(articles.length > 0)
                {
                    articles.forEach(article => {
                        newsArray.push(article);
                    })
                }
            }
        });
    })
}

const getNews = (search) => {
    return new Promise((resolve, reject) => {
        if(search.trim() === ''){
            let indexNew = Math.floor(Math.random() * newsArray.length);
            let urlThumb = newsArray[indexNew].link;
            scrape(urlThumb, (error, metadata) => {
                if(!error){
                    if(typeof metadata.openGraph != 'undefined' && metadata.openGraph != undefined){
                        const title = metadata.openGraph.title || "News";
                        const description = metadata.openGraph.description || "";
                        const urlNews = metadata.openGraph.url || urlThumb;
                        let options = {string: true}
                        let urlImage;
                        if(typeof metadata.openGraph.image.url != "undefined" && metadata.openGraph.image.url != undefined && metadata.openGraph.image.url != ""){
                            urlImage = metadata.openGraph.image.url;
                        }else{
                            urlImage = urlThumbDefault;
                        }

                        base64.encode(urlImage, options, (err, data64) => {
                            if(err){
                                resolve({
                                    "thumb": thumbDefault,
                                    "urlNews": urlNews,
                                    "title": title,
                                    "description": description
                                });
                            }else{
                                resolve({
                                    "thumb": data64,
                                    "urlNews": urlNews,
                                    "title": title,
                                    "description": description
                                });
                            }
                        })
                    }
                }else{
                    resolve({
                        "thumb": '',
                        "urlNews": urlThumb,
                        "title": '',
                        "description": ''
                    });
                }
            });
        }else{
            let newsFilter = [];
            newsArray.forEach(news => {
                if(news.title.toUpperCase().indexOf(search.trim().toUpperCase()) !== -1 ){
                    newsFilter.push(news);
                }
            })

            if(newsFilter.length > 0){
                let indexNew = Math.floor(Math.random() * newsFilter.length);
                let urlThumb = newsFilter[indexNew].link;
                scrape(urlThumb, function(error, metadata){
                    if(!error){
                        if(typeof metadata.openGraph != 'undefined' && metadata.openGraph != undefined){
                            const title = metadata.openGraph.title || "News";
                            const description = metadata.openGraph.description || "";
                            const urlNews = metadata.openGraph.url || urlThumb;
                            let options = {string: true}
                            let urlImage;
                            if(typeof metadata.openGraph.image.url != "undefined" && metadata.openGraph.image.url != undefined && metadata.openGraph.image.url != ""){
                                urlImage = metadata.openGraph.image.url;
                            }else{
                                urlImage = thumbDefault;
                            }
                            base64.encode(urlImage, options, (err, data64) => {
                                if(err){
                                    reject(err);
                                }else{
                                    resolve({
                                        "thumb": data64,
                                        "urlNews": urlNews,
                                        "title": title,
                                        "description": description
                                    });
                                }
                            })
                        }
                    }else{
                        resolve({
                            "thumb": '',
                            "urlNews": urlThumb,
                            "title": '',
                            "description": ''
                        });
                    }
                });
            }
        }
    });
}

const defaultConfig = {
    idChat: '',
    search: '',
    messageError: '*Ooops, an error occurred while trying to get news, try again later*'
}
/**
 * Plugin to get news from the different rss sources that are configured
 * @function news
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Customer search parameter
 * @param {string} messageError - Message to send in case of error
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'news',
    /**
    * Initial setting function
    * @param {object} data - Initial information for the plugin
    * @param {number} data.timeRefresh - Time in minutes to refresh the news in cache memory
    * @param {string[]} data.feeds - Rss sources for getting news
    */
    setup(data) {
        if (typeof data.feeds !== 'undefined' && Array.isArray(data.feeds)) {
            if (data.timeRefresh) {
                timeRefresh = data.timeRefresh;
            }
            // REFRESH NEWS EVERY X MINUTES
            loadNewsCache(data.feeds);
            setInterval(() => {
                loadNewsCache(data.feeds);
            }, 60000 * timeRefresh);
        }
    },
    plugin(_args) {
        const _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            getNews(args.search.trim()) 
            .then(data => {
                _this.sendLink({
                    "idChat": args.idChat,
                    "description": data.description,
                    "title": data.title,
                    "thumb": data.thumb,
                    "link": data.urlNews
                });
            })
            .catch(err => {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageError
                });
            })
        }
    }
};

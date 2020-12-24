// Modules to install separately
const ConvertBase64 = require('../lib/convertBase64');
const convert64 = new ConvertBase64();
const base = "https://www.instagram.com/";
const gqlUri = "https://www.instagram.com/graphql/query";
const cheerio = require('cheerio');
const rp = require('request-promise');
const profiles = {
    "en": "5.min.crafts",
    "es": "ideas.en.5.minutos"
}
var profilePosts = {
    "en": [],
    "es": []
}

getLastPosts = async (username) => {
    return new Promise(async (resolve, reject) => {
        let profile = await getProfile(base + username);
        if (profile !== false) {
            let mediaLite = [];
            let media = profile.graphql.user.edge_owner_to_timeline_media.edges;
            for (let i = 0; i < media.length; i++) {
                mediaLite.push(media[i].node)
            }
            resolve(mediaLite);
        } else {
            reject("User not found!");
        }
    });
}

getProfile = async (url) => {
    try {
        let html = await rp(url);
        let $ = cheerio.load(html);
        let data;
        for (let i = 0; i < $('script').length; i++) {
            if ($('script')[i].children.length > 0) {
                if ($('script')[i].children[0].data.startsWith("window._sharedData =")) {
                    data = $('script')[i].children[0].data;
                }
            }
        }
        if (data) {
            data = data.replace("window._sharedData = ", "").slice(0, -1);
            data = JSON.parse(data);
            let profile = data.entry_data.ProfilePage[0]
            return profile;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

getProfileByLogged = async params => {
    try {
        const profileleUri = `https://www.instagram.com/${params.username}/?__a=1`
        let options = {
            uri: profileleUri,
            headers: {
                'user_agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.3",
                'cookie': params.cookie
            },
            json: true
        };
        let profile = await rp(options);
        if (profile.graphql.user.is_private) {
            throw new Error("Profile is private!")
        } else {
            return profile;
        }

    } catch (error) {
        if (error.statusCode === 404) {
            throw new Error("User not found!");
        } else throw error;
    }
}

getAllPosts = async params => {
    try {

        let profile = await getProfileByLogged(params);
        let options = {
            uri: gqlUri,
            qs: {
                query_hash: params.query_hash,
                first: params.media_count,
                id: profile.graphql.user.id
            },
            headers: {
                'user_agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.3",
                'cookie': params.cookie
            },
            json: true
        };

        let endCursor = profile.graphql.user.edge_owner_to_timeline_media.page_info.end_cursor;
        let hasNextPage = profile.graphql.user.edge_owner_to_timeline_media.page_info.has_next_page;

        if ((params.media_count <= 50 && params.media_count > -1) || hasNextPage === false) {
            options.qs.first = 50;
            let media = await rp(options);
            let m = [];
            let edges = media.data.user.edge_owner_to_timeline_media.edges;
            for (let i = 0; i < edges.length; i++) {
                m.push(edges[i].node)
            }
            return m;
        } else {

            let rParams = {
                endCursor, hasNextPage
            }
            let media = await pullAllMedia(rParams, options);
            let m = [];
            let edges = media.data.user.edge_owner_to_timeline_media.edges;
            for (let i = 0; i < edges.length; i++) {
                m.push(edges[i].node)
            }
            return m;
        }

    } catch (error) {
        throw error;
    }
}


pullAllMedia = async (params, options) => {
    try {
        let mediaLimit = options.qs.first;
        let endCursor = params.endCursor;
        let hasNextPage = params.hasNextPage;
        options.qs.first = 50;
        let results = [];
        let r;
        while (hasNextPage) {
            let result = await rp(options);
            const pageInfo = result.data.user.edge_owner_to_timeline_media.page_info;
            hasNextPage = pageInfo.has_next_page
            endCursor = pageInfo.end_cursor;
            options.qs.after = endCursor;
            let edges = result.data.user.edge_owner_to_timeline_media.edges;
            results.push.apply(results, edges);
            if (hasNextPage === false) {
                r = result;
                break;
            } else {
                if (mediaLimit !== -1 && results.length >= mediaLimit) {
                    r = result;
                    break;
                }
            }
        }

        if (results.length > mediaLimit && mediaLimit !== -1) {
            results = results.slice(0, mediaLimit);
        }
        r.data.user.edge_owner_to_timeline_media.edges = results;
        return r;
    } catch (error) {
        throw error;
    }
}

loadCachePosts = async (language, params) => {
    getAllPosts({
        username: profiles[language],
        query_hash: params.query_hash,
        media_count: params.media_count || -1,
        cookie: params.cookie
    })
    .then(posts => {
        let mediaPosts = posts.filter(el => el.is_video);
        profilePosts[language] = mediaPosts;
    })
    .catch(err => {
        console.error('Error loading instagram posts', err);
    })
}

const defaultConfig = {
    idChat: '',
    language: 'en',
    messageError: '*Ooops, an error occurred while trying to get the video, try again later*',
}
/**
 * Plugin to get videos from life hacks
 * @function lifehacks
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} language - Language to search
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageBadLanguage - Message to send when the indicated language is not supported
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'lifehacks',
    /**
    * Initial setting function
    * @param {object} data - Initial information for the plugin
    * @param {string} data.query_hash 
    * @param {string} data.cookie
    * @param {number} data.media_count
    * @param {number} data.timeRefresh
    */
    setup(data) {
        if (
            data.query_hash && data.query_hash !== ''
            && data.cookie && data.cookie !== ''
        ) {
            let timeRefresh = data.timeRefresh || 120;
            for (var key in profiles) {
                loadCachePosts(key, {
                    query_hash: data.query_hash,
                    media_count: data.media_count || 1001,
                    cookie: data.cookie
                });
            }
            setInterval(() => {
                for (var key in profiles) {
                    loadCachePosts(key, {
                        query_hash: data.query_hash,
                        media_count: data.media_count || 1001,
                        cookie: data.cookie
                    });
                }
            }, 60000 * timeRefresh);
        }
    },
    plugin(_args) {
        const _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            let profile = profiles[args.language];
            if (typeof profile !== 'undefined' && profile !== '') {
                if (profilePosts[args.language].length === 0) {
                    getLastPosts(profile)
                    .then(data => {
                        let mediaPosts = data.filter(el => el.is_video);
                        let index = Math.floor(Math.random() * mediaPosts.length);

                        convert64.convert(mediaPosts[index].video_url)
                        .then(async (res) => {
                            let base64Video = res.split(';base64,').pop();
                            _this.sendVideo({
                                "idChat": args.idChat, 
                                "caption": "",
                                "file": base64Video
                            })
                        })
                        .catch(err => {
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageError
                            });
                        })
                    })
                    .catch(err => {
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageError
                        });
                    })
                } else {
                    let index = Math.floor(Math.random() * profilePosts[args.language].length);

                    convert64.convert(profilePosts[args.language][index].video_url)
                    .then(async (res) => {
                        let base64Video = res.split(';base64,').pop();
                        _this.sendVideo({
                            "idChat": args.idChat, 
                            "caption": "",
                            "file": base64Video
                        })
                    })
                    .catch(err => {
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageError
                        });
                    })
                }
                
            } else {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageBadLanguage
                });
            }
        }
    }
};
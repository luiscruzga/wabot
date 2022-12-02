// Modules to install separately
const request = require('request');
const ConvertBase64 = require('../lib/convertBase64');
const convert64 = new ConvertBase64();

const subreddits = {
    "en": ['dankmemes', 'wholesomeanimemes', 'wholesomememes', 'AdviceAnimals', 'MemeEconomy', 'memes', 'terriblefacebookmemes', 'teenagers', 'historymemes'],
    "es": ['LatinoPeopleTwitter', 'chistes', 'Divertido', 'memexico']
}

const evaluateMeme = (_info) => {
    return new Promise((resolve, reject) => {
        let type = '';
        if (_info.url.indexOf(".mp4") !== -1) {
            type = 'video';
        } else if (_info.url.indexOf(".gif") !== -1) {
            type = 'gif';
        } else if (_info.url.indexOf(".jpg") !== -1
            || _info.url.indexOf(".jpeg") !== -1
            || _info.url.indexOf(".png") !== -1
        ) { 
            type = 'image';
        }

        if (type !== ''){
            resolve({
                'type': type, 
                'caption': _info.title, 
                'meme': _info.url
            });
        } else {
            resolve({
                'type': '', 
                'caption': '', 
                'meme': ''
            });
        }
    });
}

const defaultConfig = {
    idChat: '',
    language: 'en',
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
    messageNoSubReddit: '*No subreddits found for the indicated language*',
    messageTypeNoSupport: '*Type of meme not supported*'
}
/**
 * Plugin that allows you to send different memes from subreddits in English and Spanish
 * @function meme
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} language - Language to search memes (en / es)
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoSubReddit - Message to send when no subreddits are found for the indicated language
 * @param {string} messageTypeNoSupport - Message to send when the received meme is not supported
 */
module.exports = {
	/**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'meme',
    plugin(_args) {
        const _this = this;
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            args.language = args.language.toLowerCase();
            if (subreddits[args.language] !== undefined) {
                const _sub = subreddits[args.language][Math.floor(Math.random() * subreddits[args.language].length)] || subreddits[args.language][0];
                request('https://meme-api.com/gimme/' + _sub, (error, response, body) => {
                    if (error) { 
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageError
                        });        
                    } else {
                        let _info = JSON.parse(body.toString('utf8'));
                        evaluateMeme(_info) 
                        .then((data) => {
                            if (data.type === '') {
                                _this.sendMessage({
                                    "idChat": args.idChat, 
                                    "message": args.messageTypeNoSupport
                                });    
                            } else if (data.type === 'image') {
                                _this.sendImage({
                                    "idChat": args.idChat,
                                    "caption": data.caption,
                                    "file": data.meme
                                });
                            } else if (data.type === 'gif') { 
                                _this.sendGif({
                                    "idChat": args.idChat,
                                    "caption": data.caption,
                                    "file": data.meme
                                })
                            } else if (data.type === 'video') { 
                                _this.sendVideo({
                                    "idChat": args.idChat,
                                    "caption": data.caption,
                                    "file": data.meme
                                })
                            }
                        })
                        .catch((err) => {
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageError
                            });
                        })
                    }
                })
            } else {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageNoSubReddit
                });
            }
        }
    }
};

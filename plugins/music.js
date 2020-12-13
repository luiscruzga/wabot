// Modules to install separately
const request = require('request');
const fs = require('fs');
const path = require('path');

const musicPath = './files/';
var clientId = '';

function randomUUI(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, term, replacement) {
  	return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

function replaceEspecialCharacter(str){
	var chars={
		"á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u",
		"à":"a", "è":"e", "ì":"i", "ò":"o", "ù":"u",
		"Á":"A", "É":"E", "Í":"I", "Ó":"O", "Ú":"U",
		"À":"A", "È":"E", "Ì":"I", "Ò":"O", "Ù":"U"}
	var expr=/[áàéèíìóòúù]/ig;
	var res=str.replace(expr,function(e){return chars[e]});
	return res;
}

var downloadMp3 = async function(in_url){
	return new Promise(function(resolve, reject) {
		let uui = randomUUI();
		let mp3File = path.join(__dirname, `${musicPath}${uui}.mp3`);
        request(in_url)
		.on('error', (err) => {
			reject('Error');
		})
		.pipe(fs.createWriteStream(mp3File))
		.on('close', () => resolve(mp3File))
		.on('error', error => reject('Error'))
    })
}

var searchProgressiveMp3 = async function(in_url, client_id){
	return new Promise(function(resolve, reject) {
        request(`${in_url}?client_id=${client_id}`, { json: true }, (err, res, body) => {
            if (err) {                
                reject('Error');
            }else{
                resolve(body);
            }
        });
    })
}

var searchTrack = async function (in_search, client_id){
    return new Promise(function(resolve, reject) {
        request(`https://api-v2.soundcloud.com/search/tracks?kind=%27user%27&client_id=${client_id}&q=${replaceEspecialCharacter(in_search)}`, { json: true }, (err, res, body) => {
            if (err) {
                reject('Error');
            }else{
                resolve(body);
            }
        });
    })
}

const defaultConfig = {
    idChat: '',
    search: '',
    messageError: '*Ooops, An error occurred while trying to get the requested song, please try again later*',
    messageNoDataFound: '*The requested song could not be found, please try another*',
    messageValidClientId: '*A valid clientId must be provided*'
}
/**
 * Plugin to get a song in mp3 format directly from soundcloud
 * @function music
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Customer search parameter
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send in case of not finding information
 * @param {string} messageValidClientId - Message to send when a clientId is not indicated in the initial configuration
 * @see {@link https://soundcloud.com|SoundCloud}
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'music',
    /**
    * Initial setting function
    * @param {object} data - Initial information for the plugin
    * @param {string} data.clientId
    */
    setup(data) {
        if (typeof data.clientId !== 'undefined') {
            clientId = data.clientId
        }
    },
    plugin(_args) {
        let _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.search !== '') {
            if (clientId !== ''){
                searchTrack(args.search.toLowerCase().trim(), clientId.trim())
                .then(data => {
                    if(typeof data.collection === 'undefined' || data.collection === undefined || data.collection.length === 0){
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageNoDataFound
                        });
                    }else{
                        let track, media, progressiveUrl;
                        let found_ = false;
                        for(var x=0; x < data.collection.length; x++){
                            track = data.collection[x];
                            // Para prevenir descargar canciones Preview
                            if (track.duration > 30000){
                                media = track.media.transcodings.find(obj => obj.format.protocol === 'progressive');
                                if(media !== undefined){
                                    found_ = true;
                                    progressiveUrl = media.url;
                                    break;
                                }
                            }
                        }

                        if(!found_){
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageNoDataFound
                            });
                        }else {
                            searchProgressiveMp3(progressiveUrl, clientId.trim())
                            .then(dataMp3 => {
                                downloadMp3(dataMp3.url)
                                .then(file_ => {
                                    var bitmap = fs.readFileSync(file_);
                                    var encodedstring = new Buffer.from(bitmap).toString('base64');
                                    fs.unlinkSync(file_);
                                    _this.sendMusic({
                                        "idChat": args.idChat,
                                        "file": encodedstring
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
                        }
                    }
                })
                .catch(err => {
                    _this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageError
                    });
                })
            } else {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageValidClientId
                });
            }
        }
    }
};

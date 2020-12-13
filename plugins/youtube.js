// Modules to install separately
const request = require('request');
const base64 = require('node-base64-image');
const yts = require('yt-search');
const youtubeUrl = 'https://youtube.com/watch/';

function searchYoutube(search_){
    return new Promise(async (resolve, reject) => {
        const r = await yts( search_ );
        resolve(r.videos || []);
    })
}

const defaultConfig = {
    idChat: '',
    search: '',
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
    messageNoDataFound: '*No information about your search could be found*'
}
/**
 * Plugin that allows you to search for videos directly from YouTube
 * @function youtube
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Search parameter to perform
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send in case of not finding information
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'youtube',
    plugin(_args) {
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.search !== '') {
            searchYoutube(args.search.trim())
            .then(data => {
                if(data.length > 0){
                    let videoYt = data[0];
                    let options = {string: true}
                    base64.encode(videoYt.thumbnail, options, (err, data64) => {
                        if (err) {
                            this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageError
                            });
                        } else {
                            this.sendLink({
                                "idChat": args.idChat,
                                "caption": "",
                                "description": videoYt.description,
                                "title": videoYt.title,
                                "thumb": data64,
                                "link": videoYt.url
                            });
                        }
                    });
                }else {
                    this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageNoDataFound
                    });
                }
            })
        }
    }
};

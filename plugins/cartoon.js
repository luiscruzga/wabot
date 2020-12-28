// Modules to install separately
const toonify = require('toonify');
var cartoon;
var apiKey = '';

const defaultConfig = {
    idChat: '',
    photo: '',
    messageError: '*Ooops, an error occurred while trying to transform the image, try again later*',
    messageNoImage: '*You need to attach an image to continue*'
}
/**
 * Plugin to transform your selfie into an cartoon portrait using 
 * @function cartoon
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} photo - Url, path to base64 image
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoImage - Message to send in case of not receiving an image
 * @see {@link https://deepai.org/machine-learning-model/toonify|DeepAiToonify}
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'cartoon',
    /**
    * Initial setting function
    * @param {object} data - Initial information for the plugin
    * @param {string} data.apiKey
    */
    setup(data) {
        if (data.apiKey && data.apiKey !== '') {
            apiKey = data.apiKey;
            cartoon = new toonify(data.apiKey);
        }
    },
    plugin(_args) {
        const _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            if (typeof args.photo !== 'undefined' && args.photo !== '') {
                if (apiKey === '') {
                    console.error('An api key must be provided.');
                } else {
                    cartoon.transform({ photo: args.photo })
                    .then(data => {
                        _this.sendImage({
                            "idChat": args.idChat, 
                            "caption": "",
                            "file": data.base64Image
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
                    "message": args.messageNoImage
                });
            }
        }
    }
};

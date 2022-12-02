const anime = require('selfietoanime');

const defaultConfig = {
    idChat: '',
    photo: '',
    messageError: '*Ooops, an error occurred while trying to transform the image, try again later*',
    messageNoImage: '*You need to attach an image to continue*'
}

/**
 * Plugins to complement and add new functionalities
 * @namespace Plugins
 */

/**
 * Plugin to transform your selfie into an anime portrait using minivision photo2cartoon 
 * @function anime
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} photo - Url, path to base64 image
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoImage - Message to send in case of not receiving an image
 * @see {@link https://github.com/minivision-ai/photo2cartoon|Photo2Cartoon}
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @memberof function:anime
    * @property {string}  id - Name of the plugin to use
    */
    id: 'anime',
    /**
    * Initial function triggered only if the user adds this plugin to the initial configuration
    * @memberof function:anime
    */
    init() {},
    plugin(_args) {
        const _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            if (typeof args.photo !== 'undefined' && args.photo !== '') {
                anime.transform({
                    photo: args.photo
                })
                .then(image => {
                    _this.sendImage({
                        "idChat": args.idChat, 
                        "caption": "",
                        "file": image.image
                    })
                })
                .catch(err => {
                    console.error(err);
                    _this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageError
                    });
                })
            } else {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageNoImage
                });
            }
        }
    }
};

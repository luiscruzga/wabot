// Modules to install separately
const stableDiffusion = require('stable-difussion-js');
const translate = require('@vitalets/google-translate-api');

const defaultConfig = {
    idChat: '',
    apiKey: '',
    search: '',
    language: 'en',
    messageError: '*Ooops, an error occurred while trying to make image, try again later*',
}
/**
 * Plugin that allows you to send different memes from subreddits in English and Spanish
 * @function aiimage
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} apiKey - API key to make image from dreamstudio
 * @param {string} search - Text to make image
 * @param {string} language - Language
 * @param {string} messageError - Message to send in case of error
 */
module.exports = {
	/**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'aiimage',
    plugin(_args) {
        const _this = this;
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.apiKey !== '' && args.search !== '') {
            args.language = args.language.toLowerCase();
            const SD = new stableDiffusion(args.apiKey);

            translate(args.search.toLowerCase(), { 'to': args.language })
            .then(translation => {
                SD.makeImage({
                    search: translation.text,
                })
                .then(image => {
                    _this.sendImage({
                        "idChat": args.idChat, 
                        "caption": args.search,
                        "file": image
                    })
                })
                .catch(err => {
                    _this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageError
                    });
                });
            })
			.catch(err => {
				_this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageError
                });
			});
        }
    }
};

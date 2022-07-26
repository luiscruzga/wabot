// Modules to install separately
const translate = require('@vitalets/google-translate-api');

const defaultConfig = {
    idChat: '',
    text: '',
    to: 'en',
    messageError: '*Ooops, an error occurred while trying to search, try again later*'
}
/**
 * Plugin that allows you to translate the desired text into any language
 * @function translate
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} text - Text to translate
 * @param {string} to - Target language to translate
 * @param {string} messageError - Message to send in case of error
 */
module.exports = {
	/**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'translate',
    plugin(_args) {
        const _this = this;
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.text !== '') {
            args.to = args.to.toLowerCase();
            translate(args.text.toLowerCase(), { 'to': args.to })
            .then(translation => {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": `*${translation.text}*`
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

// Modules to install separately
const PerplexityAI = require('perplexityai');

const defaultConfig = {
    idChat: '',
    prompt: '',
    debug: false,
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
}
/**
 * Plugin that allows you to send different memes from subreddits in English and Spanish
 * @function aiimage
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} prompt - Text to search
 * @param {string} messageError - Message to send in case of error
 */
module.exports = {
	/**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'perplexityai',
    async plugin(_args) {
        const _this = this;
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.prompt !== '') {
          try {
            const response = await PerplexityAI.search(args.prompt);
            if (response.error) {
              return _this.sendMessage({
                "idChat": args.idChat, 
                "message": response.error
              });
            }
            const message = `- ${args.prompt}

${response.detailed}
- Fuentes:
${response.sources.map(el => `
- ${el.name}: ${el.url}
`)}
`;
            _this.sendMessage({
              "idChat": args.idChat, 
              "message": message
            });  
          } catch (error) {
            if (args.debug) console.error(error);
            _this.sendMessage({
              "idChat": args.idChat, 
              "message": args.messageError
            });
          }
        }
    }
};

// Modules to install separately
const ChatGPT = require('./utils/chatgpt-io-new');
let sessionToken = '';
function talkChatgpt(prompt){
  return new Promise(async (resolve, reject) => {
    try {
      const bot = new ChatGPT(sessionToken);
      await bot.waitForReady();
      
      let response = await bot.ask(prompt);
      if (!response) response = "Failed to send the question. Please try again later.";

      bot.disconnect();
      resolve(response);
    } catch(err) {
      reject(err.message || err);
    }
  })
}

const defaultConfig = {
    idChat: '',
    search: '',
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
    messageNoDataFound: '*No information about your search could be found*'
}
/**
 * Plugin that allows you talk with chatgpt
 * @function youtube
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} prompt - Search parameter to perform
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send in case of not finding information
 */
module.exports = {
  /**
  * Id - Name of the plugin to use
  * @property {string}  id - Name of the plugin to use
  */
  id: 'chatgpt',
  setup(data) {
    if (data.token && data.token !== '') {
      sessionToken = data.token;
    }
  },
  plugin(_args) {
    const args = this.mergeOpts(defaultConfig, _args);
    if (args.idChat !== '' && args.prompt !== '') {
      try {
        talkChatgpt(args.prompt.trim())
        .then(data => {
          this.sendMessage({
            "idChat": args.idChat, 
            "message": data
          });
        })
        .catch(err => {
          this.sendMessage({
            "idChat": args.idChat, 
            "message": args.messageError
          });  
        });
      } catch(err) {
        this.sendMessage({
          "idChat": args.idChat, 
          "message": args.messageError
        });
      }
    }
  }
};

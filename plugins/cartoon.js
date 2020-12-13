// Modules to install separately
const deepai = require('deepai');
const fs = require('fs');
const path = require('path');
const base64 = require('node-base64-image');
const ConvertBase64 = require('../lib/convertBase64');
const convert64 = new ConvertBase64();
var apiKey = '';

function randomUUI(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

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
            deepai.setApiKey(apiKey);
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
                    convert64.convert(args.photo)
                    .then(async (res) => {
                        let nameFile = randomUUI();
                        let pathImage = path.join(__dirname, `./images/${ nameFile }.jpeg`);
                        let base64Image = res.split(';base64,').pop();
                        fs.writeFileSync(pathImage, base64Image, {encoding: 'base64'}, (err) => {
                            if(err) log.error('File created with error');
                        });
                        var resp = await deepai.callStandardApi("toonify", {
                            image: fs.createReadStream(pathImage)
                        });
                        fs.unlinkSync(pathImage);
                        if (typeof resp.output_url !== 'undefined'){
                            let options = {string: true}
                            base64.encode(resp.output_url, options, function(err, data64){
                                if(err){
                                    _this.sendMessage({
                                        "idChat": args.idChat, 
                                        "message": args.messageError
                                    });
                                }else{
                                    _this.sendImage({
                                        "idChat": args.idChat, 
                                        "caption": "",
                                        "file": data64
                                    })
                                }
                            })
                        }
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

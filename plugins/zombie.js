// Modules to install separately
const request = require('request');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ConvertBase64 = require('../lib/convertBase64');
const convert64 = new ConvertBase64();

function randomUUI(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

const defaultConfig = {
    idChat: '',
    photo: '',
    messageError: '*Ooops, an error occurred while transforming the image, please try again later*',
    messageNoFace: '*It was not possible to identify a face in the image, try sending a profile image*',
    messageNoImage: '*You need to attach an image to continue*'
}
/**
 * Plugin that allows you to transform your selfie into a zombie
 * @function zombie
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} photo - Url, path to base64 image
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoFace - Message to send when a face is not detected in the image
 * @param {string} messageNoImage - Message to send in case of not receiving an image
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'makeZombie',
    plugin(_args) {
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            if (args.photo === '') {
                this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageNoImage
                });
            } else {
                convert64.convert(args.photo)
                .then(res => {
                    let base64Image = res.split(';base64,').pop();
                    let nameFile = randomUUI();
                    let pathImage = path.join(__dirname, `./images/${ nameFile }.jpeg`);
                    fs.writeFileSync(pathImage, base64Image, {encoding: 'base64'}, (err) => {
                        if(err) console.error('File created with error');
                    });
                    
                    request.post({
                        url: 'https://zombieapi.azurewebsites.net/transform',
                        contentType: false,
                        formData: {
                            image: fs.createReadStream(pathImage)
                        }
                    }, async (error, response, body) => {
                        // Delete image
                        fs.unlinkSync(pathImage);

                        if (error){
                            this.sendMessage({
                                "idChat": args.idChat,
                                "message": args.messageError
                            });
                        } else {
                            if (body === 'No face found') {
                                this.sendMessage({
                                    "idChat": args.idChat,
                                    "message": args. messageNoFace
                                });
                            } else {
                                let imgBuffer =  Buffer.from(body, 'base64');
                                sharp(imgBuffer)
                                .extract({ width: 512, height: 512, left: 512, top: 0 })
                                .resize(720, 720)
                                .toBuffer()
                                .then( buffer => {
                                    this.sendImage({
                                        "idChat": args.idChat, 
                                        "caption": "",
                                        "file": buffer.toString('base64')
                                    })
                                })
                                .catch( err => {
                                    this.sendMessage({
                                        "idChat": args.idChat,
                                        "message": args.messageError
                                    });
                                })

                            }
                        }
                    });
                })
                .catch(err => {
                    console.error(`Error converting to base64.`);
                    this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageError
                    });
                })
            }
        }
    }
};

// Modules to install separately
const makemeazombie = require('makemeazombie');
const zombie = new makemeazombie();

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
                zombie.transform({ photo: args.photo })
                .then(data64 => {
                    this.sendImage({
                        "idChat": args.idChat, 
                        "caption": "",
                        "file": data64
                    })
                })
                .catch(err => {
                    if (error === 'It was not possible to identify a face in the image, try sending a profile image') {
                        this.sendMessage({
                            "idChat": args.idChat,
                            "message": args. messageNoFace
                        });
                    } else {
                        this.sendMessage({
                            "idChat": args.idChat,
                            "message": args.messageError
                        });
                    }
                })
            }
        }
    }
};

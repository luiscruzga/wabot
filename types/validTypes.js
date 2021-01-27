const typeMessage = require('./message.json');
const typeFile = require('./file.json');
const typeSticker = require('./sticker.json');
const typeText2Image = require('./text2image.json');
const typeLink = require('./link.json');
const typeLocation = require('./location.json');
const typeVcard = require('./vcard.json');

class Types {
    valid(in_type, in_data){
        let requiredFields = [];
        let _data;
        let response = {
            "isValid": true,
            "messageInvalid": ""
        }
        if (in_data.replyMessage){
            if (typeof in_data.idMessage === 'undefined' || in_data.idMessage === ''){
                response.isValid = false;
                response.messageInvalid = "idMessage is required for reply message.";
            }
        }

        if (response.isValid){
            let typeDefault;
            switch(in_type){
                case 'text':
                    typeDefault = typeMessage;
                    break;
                case 'text2image':
                    typeDefault = typeText2Image;
                    break;
                case 'image': case 'video': case 'gif': case 'music': case 'document':
                    typeDefault = typeFile;
                    break;
                case 'sticker':
                    typeDefault = typeSticker;
                    break;
                case 'link':
                    typeDefault = typeLink;
                    break;
                case 'location':
                    typeDefault = typeLocation;
                    break;
                case 'vcard': 
                    typeDefault = typeVcard;
                    break;
                default:
                    typeDefault = typeMessage;
                    break;
            }

            _data = Object.assign(typeDefault.spec, in_data);
            _data.type = in_type;
            if(typeDefault.required.length > 0){
                typeDefault.required.forEach(type => {
                    if(_data[type] === ''){
                        requiredFields.push(type);
                    }
                })
            }
        }

        if(requiredFields.length > 0){
            response.isValid = false;
            response.messageInvalid = `The following fields ${ JSON.stringify(requiredFields) } are required.`
        }else{
            response.data = _data;
        }

        return response;
    }
}

module.exports = Types;
const base64 = require('node-base64-image');
var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

function isBase64(str) {
    return str.length % 4 == 0 && /^[A-Za-z0-9+/]+[=]{0,3}$/.test(str);
}

class Base64 {
    convert(_url){
        return new Promise(function(resolve, reject) {
            if (_url.indexOf(';base64,') !== -1 || isBase64(_url)){
                resolve(_url);
            }else {
                let options;
                if (_url.indexOf('http') !== -1){
                    options  = {string: true}
                }else {
                    options  = {string: true, local: true}
                }
                base64.encode(_url, options, (err, data64) => {
                    if(!err){
                        resolve(data64);
                    }else {
                        reject(err);
                    }
                });
            }
        });
    }
}

module.exports = Base64;
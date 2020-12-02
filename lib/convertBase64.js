const base64 = require('node-base64-image');

class Base64 {
    convert(_url){
        return new Promise(function(resolve, reject) {
            if (_url.indexOf(';base64,') !== -1){
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
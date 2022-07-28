const convertBase64 = require('./convertBase64');
const convert64 = new convertBase64();
const request = require('request');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const fs = require('fs');
const path = require('path');

const randomUUI = (a,b) => {for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

class Sticker {
    constructor(apiKeys = []){
        this.removebgApikeys = apiKeys;
        this.apiKeyData = [];

        this.validApiKeys();
        let _this = this;
        /*CADA UNA HORA SE ACTUALIZA LA INFO DE LAS APIKEYS*/
        setInterval(function(){
            _this.validApiKeys();
        }, 60000 * 60);
    }

    getInfoAccount(in_apiKey){
        return new Promise(function(resolve, reject) {
            request({
                url: 'https://api.remove.bg/v1.0/account',
                headers: {
                    'X-Api-Key': in_apiKey
                },
                encoding: null
            }, function(error, response, body) {
                if(error){
                    reject(error);
                }else if(response.statusCode != 200){
                    reject(body.toString('utf8'));
                }else{
                    let info_ = JSON.parse(body);
                    resolve({'apiKey': in_apiKey, 'info': info_.data.attributes.api});
                }
            });
        })
    }

    validApiKeys(){
        this.removebgApikeys.forEach(apiKey => {
            this.getInfoAccount(apiKey)
            .then(data => {
                if(this.apiKeyData.length > 0){
                    let exists_ = false;
                    for(var x=0; x<this.apiKeyData.length; x++){
                        if(this.apiKeyData[x].apiKey === data.apiKey){
                            exists_ = true;
                            this.apiKeyData[x].credits = data.info.free_calls
                        }
                    }
    
                    if(!exists_){
                        this.apiKeyData.push({'apiKey': data.apiKey, 'credits': data.info.free_calls});
                    }
                }else{
                    this.apiKeyData.push({'apiKey': data.apiKey, 'credits': data.info.free_calls});
                }
            })
        })
    }

    getApiValid(){
        let apis_ = this.apiKeyData.filter(obj => (obj.credits > 0));
        let apiKey = '';
        if(apis_.length > 0){
            let index = Math.floor(Math.random() * apis_.length);
            apiKey = apis_[index].apiKey;
            console.log('Remaining Credits for Api', apis_[index].credits);
        }
        return apiKey;
    }
    
    updCreditsKey(in_apiKey){
        for(var x=0; x<this.apiKeyData.length; x++){
            if(this.apiKeyData[x].apiKey === in_apiKey){
                this.apiKeyData[x].credits = this.apiKeyData[x].credits -1;
            }
        }
    }

    removeBg(in_imageBase64, contIntentos){
        let _this = this;
        return new Promise(function(resolve, reject) {
            let apiKey = _this.getApiValid();
            if(apiKey === ''){
                reject({'error': 'There are no apiKey available that contain enough credits'})
            }else{
                request.post({
                    url: 'https://api.remove.bg/v1.0/removebg',
                    formData: {
                        image_file_b64: in_imageBase64,
                        size: 'auto'
                    },
                    headers: {
                        'X-Api-Key': apiKey
                    },
                    encoding: null
                }, async function(error, response, body) {
                    if(error) { 
                        /*EN CASO DE QUE NOS HAYAMOS QUEDADOS SIN CREDITOS O SE HAYA INTENTADO MÁS DE 3 VECES SE REPORTA ERROR*/
                        let err_ = JSON.stringify(error);
                        if(err_.toUpperCase().indexOf('credits') !== -1 || contIntentos >= 3){
                            reject({"error": error}) 
                        }else{
                            contIntentos++;
                            _this.removeBg(in_url, contIntentos)
                            .then(data => {
                                resolve(data)
                            })
                            .catch(err => {
                                reject(err)
                            })
                        }
                    }else{ 
                        if(response.statusCode != 200) { 
                            reject({"error": body.toString('utf8')}) 
                        }else{
                            _this.updCreditsKey(apiKey);
                            resolve(body);
                        }
                    }
                });
            }
        })
    }

    makeSticker(_url){
        let _this = this;
        return new Promise((resolve, reject) => {
            convert64.convert(_url)
            .then((res) => {
                let contIntentos = 0;
                _this.removeBg(res, contIntentos)
                .then(async (body) => {
                    let _uui = randomUUI();
                    let nameFile = path.join(__dirname,`./stickers/sticker${_uui}.png`);
                    let nameSticker = path.join(__dirname, `./stickers/sticker${_uui}.webp`);
                    // Create image
                    fs.writeFileSync(nameFile, body);
                    // Convert image to webp
                    await imagemin([nameFile], {
                        glob: false,
                        destination: path.join(__dirname, `./stickers/`),
                        plugins: [
                            imageminWebp({quality: 50, resize: {width:512,height:512}})
                        ]
                    });
                    // Delete image
                    fs.unlinkSync(nameFile);
                    // Convert webp to base64
                    convert64.convert(nameSticker)
                    .then((data) => {
                        // Delete webp
                        fs.unlinkSync(nameSticker);
                        resolve({"file": data.split(';base64,').pop()})
                    })
                    .catch((err) => {
                        // Delete webp
                        fs.unlinkSync(nameSticker);
                        reject(err);
                    });
                })
                .catch(async (err) => {
                    let _uui = randomUUI();
                    let nameFile = path.join(__dirname, `./stickers/sticker${_uui}.jpeg`);
                    let nameSticker = path.join(__dirname, `./stickers/sticker${_uui}.webp`);
                    // Create image
                    fs.writeFileSync(nameFile, res.split(';base64,').pop(), {encoding: 'base64'}, (err) => {
                        if (err) console.error(err);
                    })
                    // Convert image to webp
                    await imagemin([nameFile], {
                        glob: false,
                        destination: path.join(__dirname, `./stickers/`),
                        plugins: [
                            imageminWebp({quality: 50, resize: {width:512,height:512}})
                        ]
                    });
                    // Delete image
                    fs.unlinkSync(nameFile);
                    // Convert webp to base64
                    convert64.convert(nameSticker)
                    .then((data) => {
                        // Delete webp
                        fs.unlinkSync(nameSticker);
                        resolve({"file": data.split(';base64,').pop()})
                    })
                    .catch((err) => {
                        // Delete webp
                        fs.unlinkSync(nameSticker);
                        reject(err);
                    });
                });
            })
            .catch(err => {
                reject(err);
            })
            
        });
    }
}

module.exports = Sticker;
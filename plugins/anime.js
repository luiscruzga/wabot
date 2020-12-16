const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');
const path = require('path');
const ConvertBase64 = require('../lib/convertBase64');
const convert64 = new ConvertBase64();
var timeRefresh = 120;
var config = {
    token: '',
    appKey: '',
    timestamp: ''
}

function randomUUI(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

const getConfigInfo = async() => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      if (request.url() === 'https://ai.minivision.cn/apiagw/api/v1/cartoon/self_cartoon'){
          const _headers = request.headers();
          const _postData = request.postData();
          config.token = _headers.token;
          config.appKey = JSON.parse(_postData).appKey;
          config.timestamp = JSON.parse(_postData).timestamp;
      }
      request.continue();
    });
  
    await page.goto('https://ai.minivision.cn/#/coreability/cartoon', {
      waitUntil: 'load',
      timeout: 0
    });
  
    await browser.close();
}

var getAnime = (in_url_image) => {
    return new Promise(function(resolve, reject) {
        //Custom Header pass
        var headersOpt = {
            "content-type": "application/json",
            "token": config.token
        };
        request(
                {
                method:'post',
                url:'https://ai.minivision.cn/apiagw/api/v1/cartoon/self_cartoon',
                body: {
                    "needFilter": false
                    ,"filterName": ''
                    ,"appKey": config.appKey
                    ,"timestamp": config.timestamp
                    ,"imageUrl": in_url_image
                },
                headers: headersOpt,
                json: true,
            }, function (error, response, body) {
                if(error){
                    reject(error);
                }else {
                    resolve(body);
                }
        });
    });
}

var uploadImage = (in_image) => {
    return new Promise(function(resolve, reject) {
        const options = {
            method: "POST",
            url: "https://file.miniclouds.cn:27777/file/upload",
            headers: {
                "mvusername": "mini-ai",
                "sysname": "mini-ai",
                "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryuoHFA0U7s9C0KOZE"
            },
            formData : {
                "isHttps": "true",
                "file" : fs.createReadStream(in_image)
            }
        };

        request(options, function (err, res, body) {
            if(err){
                reject(err);
            }else {
                resolve(JSON.parse(JSON.parse(body)))
            }
        });
    })
}

const defaultConfig = {
    idChat: '',
    photo: '',
    messageError: '*Ooops, an error occurred while trying to transform the image, try again later*',
    messageNoImage: '*You need to attach an image to continue*'
}

/**
 * Plugins to complement and add new functionalities
 * @namespace Plugins
 */

/**
 * Plugin to transform your selfie into an anime portrait using minivision photo2cartoon 
 * @function anime
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} photo - Url, path to base64 image
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoImage - Message to send in case of not receiving an image
 * @see {@link https://github.com/minivision-ai/photo2cartoon|Photo2Cartoon}
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @memberof function:anime
    * @property {string}  id - Name of the plugin to use
    */
    id: 'anime',
    /**
    * Initial setting function to pass the parameters manually (no longer necessary, there is a process that does it)
    * @memberof function:anime
    * @param {object} data - Initial information for the plugin
    * @param {string} data.token
    * @param {string} data.appKey
    * @param {string} data.timestamp
    * @see {@link https://ai.minivision.cn/#/coreability/cartoon|MiniVisionPhoto2Cartoon}
    */
    setup(data) {
        if (typeof data === 'object') {
            config.token = data.token || '';
            config.appKey = data.appKey || '';
            config.timestamp = data.timestamp || '';
        }
    },
    /**
    * Initial function triggered only if the user adds this plugin to the initial configuration
    * @memberof function:anime
    */
    init() {
        // REFRESH Config Info EVERY X MINUTES
        getConfigInfo();
        setInterval(() => {
            getConfigInfo();
        }, 60000 * timeRefresh);
    },
    plugin(_args) {
        const _this = this;
        const args = _this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            if (typeof args.photo !== 'undefined' && args.photo !== '') {
                if (config.token === '' || config.appKey === '' || config.timestamp === '') {
                    console.error('You must indicate the necessary data to continue (token, appKey and timestamp)');
                } else {
                    convert64.convert(args.photo)
                    .then(async (res) => {
                        let imageDelete = false;
                        let base64Image = res.split(';base64,').pop();
                        let nameFile = randomUUI();
                        let pathImage = path.join(__dirname, `./images/${ nameFile }.jpeg`);
                        fs.writeFileSync(pathImage, base64Image, {encoding: 'base64'}, (err) => {
                            console.log('File created');
                        });
                        uploadImage(pathImage)
                        .then(dataImage => {
                            imageDelete = true;
                            fs.unlinkSync(pathImage);
                            if (dataImage.resCode === 1 && dataImage.resData !== undefined && dataImage.resData.fileUrl !== undefined && dataImage.resData.fileUrl !== ''){
                                getAnime(dataImage.resData.fileUrl)
                                .then(data => {
                                    if(data.status === 0 && data.data !== undefined && data.data.base64 !== undefined && data.data.base64 !== ''){
                                        _this.sendImage({
                                            "idChat": args.idChat, 
                                            "caption": "",
                                            "file": data.data.base64
                                        })
                                    }else {
                                        _this.sendMessage({
                                            "idChat": args.idChat, 
                                            "message": args.messageError
                                        });
                                    }
                                })
                                .catch(err => {
                                    _this.sendMessage({
                                        "idChat": args.idChat, 
                                        "message": args.messageError
                                    });
                                })
                            }else {
                                _this.sendMessage({
                                    "idChat": args.idChat, 
                                    "message": args.messageError
                                });
                            }
                        })
                        .catch(err => {
                            if(!imageDelete){
                                fs.unlinkSync(pathImage);
                            }
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageError
                            });
                        })
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

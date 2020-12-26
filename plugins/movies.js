// Modules to install separately
const Xray = require('x-ray');
const cheerio = require('cheerio');
const base64 = require('node-base64-image');
const urlImage = 'https://res.cloudinary.com/drvp1jbjl/image/upload/v1590417729/maxresdefault_plwtyc.jpg';

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const replaceAll = (str, term, replacement) => {
  	return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

const replaceEspecialCharacter = (str) => {
	var chars={
		"á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u",
		"à":"a", "è":"e", "ì":"i", "ò":"o", "ù":"u",
		"Á":"A", "É":"E", "Í":"I", "Ó":"O", "Ú":"U",
		"À":"A", "È":"E", "Ì":"I", "Ò":"O", "Ù":"U"}
	var expr=/[áàéèíìóòúù]/ig;
	var res=str.replace(expr,function(e){return chars[e]});
	return res;
}

const searchDetail = (in_url) => {
	return new Promise(function(resolve, reject) {
		var xray = Xray();
		var ofertas = [];
        xray(in_url, 'body@html')(function(err, body){
            if (!err){
                var $ = cheerio.load(body);
				let directors = [];
				let actors = [];
				let metadata = {
					url: in_url,
					title: '',
					director: '',
					image: '',
					actors: '',
					year: '',
					duration: '',
					punctuation: '',
					description: ''
				}

				$('#ficha > div > div > div > div.col-md-9.col-md-offset-1.col-xs-12.col-sm-offset-1 > h1').each((index, element) => {
					metadata.title = $(element).text().trim() || '';
				});
				$("span[itemprop='director']").each((index, element) => {
					directors.push($(element).text().trim() || '');
				});
				metadata.director = directors.join(' - ');
				$("meta[itemprop='image']").each((index, element) => {
					metadata.image = $(element).attr('content') || '';
				});
				$("span[itemprop='actor']").each((index, element) => {
					actors.push($(element).text().trim() || '');
				});
				metadata.actors = actors.join(' - ');
				$("meta[itemprop='dateCreated']").each((index, element) => {
					metadata.year = $(element).attr('content') || '';
				});
				let displayDuration = false;
				$('#ficha > div > div > div > div.col-lg-5.col-md-7.col-md-offset-1.col-sm-8.col-sm-offset-1 > div:nth-child(1) > div').each((index, element) => {
					if(displayDuration){
						metadata.duration = $(element).text().trim();
						displayDuration = false;
					}else {
						if (!isNaN($(element).text().trim())){
							displayDuration = true;
						}else {
							displayDuration = false;
						}
					}
				});
				$('div.inforating > div.rating.pull-left').each((index, element) => {
					metadata.punctuation = $(element).data('score') || '';
				});
				$('#ficha > div > div > div > div.col-lg-5.col-md-7.col-md-offset-1.col-sm-8.col-sm-offset-1 > div:nth-child(2)').each((index, element) => {
					metadata.description = $(element).text().trim() || '';
				});

				if (metadata.description !== ''){
					resolve(metadata);
				}else {
					reject('No data found');
				}
            }else {
				reject('Error');
			}
        })
	})
}

const searchMovies = (in_search) => {
	return new Promise(function(resolve, reject) {
		var xray = Xray();
		var movies = [];
		let url = `https://playview.io/search/${ encodeURI(in_search) }`;
        xray(url, 'body@html')(function(err, body){
            if (!err){
                var $ = cheerio.load(body);
				let movieUrl, node;
				$('.container-fluid > .row > .covers').children('.spotlight_container').each((index, element) => {
					node = $(element);
					movieUrl = node.children('a').attr('href');
					if (movieUrl.indexOf('ver-temporadas') === -1){
						movies.push(movieUrl);
					}
				});

				if (movies.length > 0){
					searchDetail(movies[Math.floor(Math.random() * movies.length)])
					.then(movie => {
						resolve(movie);
					})
					.catch(err => {
						reject(err);
					})
				}else {
					reject('No data found');
				}
            }else {
				reject('Error');
			}
        })
	})
}

const defaultConfig = {
    idChat: '',
    photo: '',
    messageError: '*Ooops, an error occurred while transforming the image, please try again later*',
    messageNoDataFound: '*The requested movie could not be found*'
}
/**
 * Plugin that allows you to obtain movies to watch online in different qualities
 * @function movie
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Movie to search
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send when no movie is found
 */
module.exports = {
    /**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'movie',
    plugin(_args) {
        const _this = this;
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '') {
            if (args.search === '') {
                _this.sendMessage({
                    "idChat": args.idChat, 
                    "message": args.messageNoDataFound
                });
            } else {
                searchMovies(args.search.trim())
                .then(data => {
                    let message = `*-Title:* _${data.title}_ \n`;
                    message += `*-Director:* _${data.director}_ \n`;
                    message += `*-Year:* _${data.year}_ \n`;
                    message += `*-Duration:* _${data.duration}_ \n`;
                    message += `*-Punctuation:* _${data.punctuation} / 5_ \n`;
                    message += `*-Actors:* _${data.actors}_ \n`;
                    message += `*-Description:* _${data.description}_ \n`;

                    let options = {string: true};
                    base64.encode(urlImage, options, function(err, data64){
                        if(!err){
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": message
                            });
                            _this.sendLink({
                                "idChat": args.idChat,
                                "description": data.description,
                                "title": data.title,
                                "thumb": data64,
                                "link": data.url
                            });
                        }else {
                            _this.sendMessage({
                                "idChat": args.idChat, 
                                "message": args.messageError
                            });
                        }
                    })
                })
                .catch(err => {
                    if(err == 'Error'){
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageError
                        });
                    }else{
                        _this.sendMessage({
                            "idChat": args.idChat, 
                            "message": args.messageNoDataFound
                        });
                    }
                })
            }
        }
    }
};

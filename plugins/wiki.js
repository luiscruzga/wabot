// Modules to install separately
const request = require('request');
const fs = require('fs');
const path = require('path');
var Xray = require('x-ray');
var cheerio = require('cheerio');
const googleIt = require('google-it');

const urlWiki = 'https://{{language}}.wikipedia.org/wiki/';

function escapeRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, term, replacement) {
  	return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

var searchWikipedia = function(in_url, in_language){
	return new Promise(function(resolve, reject) {
		var xray = Xray();

		var metadata = {
			'TITLE': decodeURIComponent(replaceAll(in_url.replace(urlWiki.replace('{{language}}', in_language), ''), '_', ' ')),
			'DEFINITION': '',
			'IMAGE': ''
		};
		
        xray(in_url, 'body@html')(function(err, body){
            if (!err){
                var $ = cheerio.load(body);
                var results = [];
                var definicion = '';

				const summaries = [];
				let display = true;
				let title
				$('div#mw-content-text > .mw-parser-output').children('div,p').each((index, element) => {
					if (display){
						const node = $(element)
						const text = node.text().trim()
						if(text.indexOf('Índice') === -1 || text.indexOf('Index') === -1){
							if (text.length >= 100){
								summaries.push(text)
							}
						}else{
							display = false;
						}
					}
				})
				metadata.DEFINITION = summaries.join('\n')
            }
            resolve(metadata);
        })
	})
}

var searchGoogle = function(in_search, in_language){
	return new Promise(function(resolve, reject) {
		googleIt({ query: in_language+'.wikipedia '+in_search, limit: 3, 'only-urls': true, 'no-display': true })
		.then(results => {
			let url_ = results.find(obj => obj.link.indexOf(urlWiki.replace('{{language}}', in_language)) !== -1);
			if (url_ != undefined){				
				searchWikipedia(url_.link, in_language)
				.then(data => {
					if (data.DEFINITION !== ''){
						resolve(data);
					}else {
						reject('Definition not found');
					}
				})
				.catch(err => {
					reject('error');
				})
			}else {
				reject('Definition not found');
			}
		})
		.catch(e => {
			reject('error');
		});
	})
}

const defaultConfig = {
    idChat: '',
    search: '',
    language: 'en',
    messageError: '*Ooops, an error occurred while trying to search, try again later*',
    messageNoDataFound: '*No information about your search could be found*'
}
/**
 * Plugin that allows the search of different things in wikipedia
 * @function wiki
 * @memberof Plugins
 * @param {string} idChat - Chat id to send the new image to
 * @param {string} search - Search parameter to perform
 * @param {string} language - Language in which to search
 * @param {string} messageError - Message to send in case of error
 * @param {string} messageNoDataFound - Message to send in case of not finding information
 */
module.exports = {
	/**
    * Id - Name of the plugin to use
    * @property {string}  id - Name of the plugin to use
    */
    id: 'wiki',
    plugin(_args) {
        const args = this.mergeOpts(defaultConfig, _args);
        if (args.idChat !== '' && args.search !== '') {
            args.language = args.language.toLowerCase();
            searchGoogle(args.search.trim(), args.language)
			.then(data => {
                let msg = `*${ data.TITLE }* \n\n ${ data.DEFINITION }`
                this.sendMessage({
                    "idChat": args.idChat,
                    "message": msg
                });
			})
			.catch(err => {
				if (err === 'Definition not found'){
                    this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageNoDataFound
                    });
				}else {
					this.sendMessage({
                        "idChat": args.idChat, 
                        "message": args.messageError
                    });
				}
			});
        }
    }
};

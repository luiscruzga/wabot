# WABOT!

Wabot is a nodejs module which allows you to connect with whatsapp web by using Puppeteer.

It is not an official whatsapp module so I am not responsible for any ban. Although I have tried a lot and have not been banned, I cannot guarantee that this is the case for everyone or that in the future restrictions will apply to prevent its use.

# Installation

    npm i wabot

NOTE: Node 10.15.0+ is required

## Documentation

You can find all documentation here [Documentation](https://luiscruzga.github.io/wabot/)

## Supported features

| Feature  | Status |
| ------------- | ------------- |
| Send messages  | ✅  |
| Receive messages  | ✅  |
| Send media (images/audio/documents)  | ✅  |
| Send media (video)  | ✅  |
| Send stickers | ✅ |
| Send stickers without background | ✅ |
| Receive media (images/audio/video/documents)  | ✅  |
| Send contact cards | ✅ |
| Send location | ✅ |
| Receive location | ✅ | 
| Message replies | ✅ |
| Join groups by invite  | ✅ |
| Get invite for group  | ✅ |
| Modify group info (subject, description)  | ✅  |
| Add group participants  | ✅  |
| Kick group participants  | ✅  |
| Promote/demote group participants | ✅ |
| Mention users | ✅ |
| Mute/unmute chats | ✅ |
| Get contact info | ✅ |
| Get profile pictures | ✅ |
| Set user status message | ✅ |
| Send Text to Image | ✅ |
| Ban user by spam | ✅ |
| Permission control | ✅ |
| Custom commands | ✅ |
| Valid responses | ✅ |
| Add plugins | ✅ |


## Plugins 

The creation of new plugins is allowed to automate some tasks and achieve incorporation as a new method of the wabot class.

To create a new plugin it is required to export an object with the following properties:

 - Id: Plugin identifier (name)
 - setup: Initial configuration function with configuration parameters (optional function)
 - plugin: Function that contains the actions to be performed by the plugin, this function will have access to all the methods of the wabot function by using "this"

Once the plugin is created, the "plugins" parameter must be configured at the time of instantiating WABOT through intentsConfig, then the possible modules to be used by the plugin must be installed separately through the console by "npm install module_name".

Below is a list of the plugins that come by default incorporated with the module:

| Plugin| Description |
| ------------- | ------------- |
| Anime | Plugin to transform your selfie into an anime portrait using minivision photo2cartoon |
| Cartoon | Plugin to transform your selfie into an cartoon portrait using |
| Coronavirus | Plugin to obtain information on the coronavirus by countries, cases, deaths, etc |
| Music | Plugin to get a song in mp3 format directly from soundcloud |
| Meme | Plugin that allows you to send various memes from subreddits in Spanish and English |
| News | Plugin to get news from the different rss sources that are configured |
| Translate | Plugin that allows you to translate a text to the language that is requested |
| Wiki | Plugin that allows the search of different things in wikipedia |
| Youtube | Plugin that allows you to search for videos directly from YouTube |
| Zombie | Plugin that allows you to transform your selfie into a zombie |


## Example usage

```js
const  WABOT = require('wabot');
const  path = require('path');
const  commands = [
	{
		"name":  "diffSiebel",
		"contains": [],
		"exact": ["@diff_siebel", "diferencias siebel", "difierencias con siebel", "diferencias migracion siebel", "diff siebel"],
		"params": [
			{
				"name":  "idOnda",
				"isNumber":  true,
				"request": [
					"*Indicame el id de onda a consultar:*",
					"*Dame el id de onda a revisar:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingrese un valor válido.",
					"Id Onda incorrecto, favor ingresa un valor válido."
				]
			},
			{
				"name":  "ambienteMig",
				"request": [
					"Indicame el ambiente de migración al cual deseas consultar:",
					"Seleccione el ambiente de migración a consultar:"
				],
				"values": ["DESA", "TEST", "PROD"],
				"badResponse": [
					"El ambiente indicado no es correcto, por favor indica un ambiente válido."
				]
			},
			{
				"name":  "ambienteSiebel",
				"request": [
					"Indicame el ambiente de Siebel al cual deseas consultar:",
					"Seleccione el ambiente de Siebel a consultar:"
				],
				"values": ["QA", "MIGRACION", "INTEGRADO", "PROD", "CLOUD", "PREPROD"],
				"badResponse": [
					"El ambiente indicado no es correcto, por favor indica un ambiente válido."
				]
			}
		]
	},
	{
		"name":  "status_onda",
		"contains": [],
		"exact": ["@status_onda", "status_onda", "/status_onda", "estatus onda", "status onda"],
		"params": [
			{
				"name":  "ambiente",
				"request": [
				"*Indicame el ambiente al cual deseas consultar:*",
				"*Seleccione el ambiente a consultar:*"
				],
				"values": ["DESA", "TEST", "PROD"],
				"badResponse": [
				"*El ambiente indicado no es correcto, por favor indica un ambiente válido.*"
				]
			},
			{
				"name":  "idOnda",
				"isNumber":  true,
				"request": [
					"*Indicame el id de onda a consultar:*",
					"*Dame el id de onda a revisar:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingrese un valor válido.",
					"Id Onda incorrecto, favor ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "help",
		"contains": [],
		"exact": ["@help", "@ayuda", "ayuda", "help", "@comandos", "comandos"]
	},
	{
		"name":  "chiste",
		"contains": [],
		"exact": ["@chiste", "@chistes", "chiste", "chistes"]
	},
	{
		"name":  "getImage",
		"contains": [],
		"exact": ["@image", "@images", "image", "images"]
	},
	{
		"name":  "news",
		"contains": [],
		"exact": ["@noticias", "@noticia", "noticia", "noticias"]
	},
	{
		"name":  "sticker",
		"contains": [],
		"exact": ["@makesticker", "@sticker", "sticker", "makesticker"]
	},
	{
		"name":  "location",
		"contains": [],
		"exact": ["@lugar", "@location", "lugar", "location"]
	},
	{
		"name":  "contacto",
		"contains": [],
		"exact": ["contacto", "@contacto"]
	},
	{
		"name":  "makeZombie",
		"contains": [],
		"exact": ["@makezombie", "@zombie", "zombie", "makezombie"]
	},
	{
		"name":  "getWiki",
		"contains": [],
		"exact": ["@wiki", "wiki", "wikipedia", "@wikipedia"],
		"params": [
			{
				"name":  "search",
				"isNumber":  false,
				"request": [
					"*Indicame que quieres buscar:*",
					"*¿Qué deseas buscar?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido.",
					"Tu busqueda es incorrecta, ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getCoronavirus",
		"contains": [],
		"exact": ["@coronavirus", "coronavirus", "covid", "covid", "@virus", "virus"],
		"params": [
			{
				"name":  "search",
				"required": false,
				"isNumber":  false,
				"request": [
					"*Indicame que quieres buscar:*",
					"*¿Qué deseas buscar?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido.",
					"Tu busqueda es incorrecta, ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getYoutube",
		"contains": [],
		"exact": ["@youtube", "youtube"],
		"params": [
			{
				"name":  "search",
				"required": true,
				"isNumber":  false,
				"request": [
					"*Indicame que quieres buscar:*",
					"*¿Qué deseas buscar?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido.",
					"Tu busqueda es incorrecta, ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getCartoon",
		"contains": [],
		"exact": ["@cartoon", "cartoon"]
	},
	{
		"name":  "getMusic",
		"contains": [],
		"exact": ["@music", "music", "@musica", "musica", "música", "@song", "song"],
		"params": [
			{
				"name":  "search",
				"required": true,
				"isNumber":  false,
				"request": [
					"*Indicame que canción quieres buscar:*",
					"*¿Qué canción deseas buscar?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido.",
					"Tu búsqueda es incorrecta, ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getAnime",
		"contains": [],
		"exact": ["@anime", "anime"]
	},
	{
		"name":  "getNews",
		"contains": [],
		"exact": ["@news", "news", "@noticias", "noticias", "@noticia", "noticia"],
		"params": [
			{
				"name":  "search",
				"required": false,
				"isNumber":  false,
				"request": [
					"*Indicame que quieres buscar:*",
					"*¿Qué deseas buscar?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido.",
					"Tu busqueda es incorrecta, ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getTranslation",
		"contains": [],
		"exact": ["@translate", "translate", "@traduccion", "traduccion", "traducción"],
		"params": [
			{
				"name":  "text",
				"required": false,
				"isNumber":  false,
				"request": [
					"*Indicame que quieres traducir:*",
					"*¿Qué deseas traducir?:*"
				],
				"values":  "any",
				"badResponse": [
					"Por favor ingresa un valor válido."
				]
			}
		]
	},
	{
		"name":  "getMeme",
		"contains": [],
		"exact": ["@meme", "@memes", "meme", "memes"]
	}
];

const  wabot = new  WABOT({
	puppeteerConfig: {viewBrowser:  true, opendevtools:  true},
	intentsConfig: {
		debug: true,
		bann: {
			active:  false,
		},
		whiteList: ["56954372453@c.us", "56961464765@c.us"],
		executions: {
			simulateTyping:  true,
		},
		removeBgApis: [ "pUXZvFuC7ZE4y3FcroP56fdf" ],
		plugins: {
			folder: "../plugins",
			plugins: ['makeZombie', 'wiki', 'coronavirus', 'youtube', 'cartoon', 'music', 'anime', 'news', 'translate', 'meme'],
			setup: {
				"news": { 
					"timeRefresh": 10,
					"feeds": [
						"http://feeds.feedburner.com/soychilecl-todas",
						"https://feeds.feedburner.com/fayerwayer",
						"http://www.bbc.co.uk/mundo/ultimas_noticias/index.xml",
						"https://news.google.com/news/rss/?ned=es_cl&gl=CL&hl=es-419"
					]
				},
				"cartoon": {
					"apiKey": "7dc8f27d-1aae-4b13-92e3-76d1abde2529"
				},
				"anime": {
					"appKey": "118a0c9f6df048fe86bd415c8d1cdcb8",
					"token": "34a575f44c23a915969317ffac1ef60f",
					"timestamp": "1607695579320"
				},
				"music": {
					"clientId": "ymSs5c4hxrRu3yuA6ZyOORoADJI2tVPD"
				}
			}
		},
		commands:  commands
	}
});

// Default when no assignment is found for the message
wabot.on('message', (res) => {
    if (res.data.type === 'document' || res.data.type === 'video'){
        wabot.sendMessage({
            "idChat": res.data.from,
            "message": `Thanks for your file.`
        });

        wabot.downloadFile(res.data.id)
        .then((file) => {
            console.log('file downloaded...', file);
        })
        .catch((err) => {
            console.log('error downloading file', err);
        })
    } else {
        wabot.sendMessage({
            "idChat": res.data.from,
            "message": `You say: ${res.data.body}`
        });
    }
});
  
wabot.on('vcard', (res) => {
	wabot.sendMessage({
	"idChat":  res.data.from,
	"message":  "This is a response to vcard"
	});
});

wabot.on('help', (res) => {
	wabot.sendMessage({
	"idChat":  res.data.from,
	"message":  "*This is a help.*"
	});
});

wabot.on('chiste', (res) => {
	wabot.sendMessage({
	"idChat":  res.data.from,
	"message":  "This is a joke"
	});
});

wabot.on('getImage', (res) => {
	wabot.sendImage({
	"idChat":  res.data.from,
	"caption":  "This is a image.",
	"file":  path.join(__dirname, "meme.jpg")
	});
});

wabot.on('news', (res) => {
	wabot.sendLink({
	"idChat":  res.data.from,
	"caption":  "This is a description",
	"link": "http://feedproxy.google.com/~r/fayerwayer/~3/w3C_M7uD-No/ios-14-punto-verde-o-naranja-en-iphone"
	});
});

wabot.on('sticker', (res) => {
	wabot.sendSticker({
	"idChat":  res.data.from,
	"file":  res.media
	});
});

wabot.on('location', (res) => {
	wabot.sendLocation({
	"idChat":  res.data.from,
	"lat":  "-33.0467291",
	"lng":  "-71.6169808",
	"title":  "Freire 470, Hogar"
	});
});

wabot.on('contacto', (res) => {
	wabot.sendVcard({
		"idChat":  res.data.from,
		"contactName":  "Luis Cruz",
		"vcard": {
			firstName:  "Luis",
			lastName:  "Cruz",
			birthday:  "29-02-1990",
			url:  "https://github.com/luiscruzga",
			nickname:  "Luis Cruz",
			cellPhone:  "+56961467583",
			email:  "luis.xxxxxxx@gmail.com",
			photo:  path.join(__dirname, "test.jpg")
		}
	});
});
  
wabot.on('onAddedToGroup', (res) => {
	console.log('Added to a group', res);
});
  
wabot.on('onRemovedFromGroup', (res) => {
	console.log('Removed from a group', res);
});

wabot.on('diffSiebel', (res) => {
	wabot.sendMessage({
	"idChat":  res.data.from,
	"message":  `You entered the parameters: AmbienteMig: ${res.params.ambienteMig}, idOnda: ${res.params.idOnda}, ambienteSiebel: ${res.params.ambienteSiebel}`
	});
});

wabot.on('status_onda', (res) => {
	wabot.sendMessage({
	"idChat":  res.data.from,
	"message":  `You entered the parameters: Ambiente: ${res.params.ambiente}, idOnda: ${res.params.idOnda}`
	});
});

wabot.on('makeZombie', (res) => {
    wabot.makeZombie({
        "idChat": res.data.from,
        "photo": res.media
    });
});

wabot.on('getWiki', (res) => {
    wabot.wiki({
		"idChat": res.data.from,
		"language": "es",
        "search": res.params.search
    });
});

wabot.on('getCoronavirus', (res) => {
    wabot.coronavirus({
		"idChat": res.data.from,
		"headers": ["Pais", "Casos", "Hoy", "Muertes", "Recuperados", "Activos"],
        "search": res.params.search || ''
    });
});

wabot.on('getYoutube', (res) => {
    wabot.youtube({
		"idChat": res.data.from,
        "search": res.params.search
    });
});

wabot.on('getCartoon', (res) => {
    wabot.cartoon({
        "idChat": res.data.from,
		"photo": res.media || ''
    });
});

wabot.on('getMusic', (res) => {
    wabot.music({
		"idChat": res.data.from,
        "search": res.params.search
    });
});

wabot.on('getAnime', (res) => {
    wabot.anime({
        "idChat": res.data.from,
		"photo": res.media || ''
    });
});

wabot.on('getNews', (res) => {
    wabot.news({
		"idChat": res.data.from,
        "search": res.params.search || ''
    });
});

wabot.on('getTranslation', (res) => {
    wabot.translate({
		"idChat": res.data.from,
		"text": res.params.text,
		"to": 'en'
    });
});

wabot.on('getMeme', (res) => {
    wabot.meme({
		"idChat": res.data.from,
		"language": "es"
    });
});

wabot.on('ready', (session) => {
	console.log('READY', session);
	//console.log('Clossing Session');
	//wabot.closeSession();
});

wabot.start();
```

## Default Options

Wabot accepts different startup options, then the default options.
**puppeteerConfig**: 
```json
{
	"WAUrl": "https://web.whatsapp.com",
	"viewBrowser": false,
	"opendevtools": false,
	"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36",
	"width": 1000,
	"heigth": 800,
	"dowloadChromeVersion": false,
	"chromeVersion": 737027,
	"localChromePath": "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
	"args": [
		"--log-level=3",
		"--no-default-browser-check",
		"--disable-site-isolation-trials",
		"--no-experiments",
		"--ignore-gpu-blacklist",
		"--ignore-certificate-errors",
		"--ignore-certificate-errors-spki-list",
		"--disable-extensions",
		"--disable-default-apps",
		"--enable-features=NetworkService",
		"--disable-setuid-sandbox",
		"--no-sandbox",
		"--disable-infobars",
		"--window-position=0,0",
		"--ignore-certifcate-errors",
		"--ignore-certifcate-errors-spki-list",
		"--disable-threaded-animation",
		"--disable-threaded-scrolling",
		"--disable-histogram-customizer",
		"--disable-composited-antialiasing",
		"--disable-dev-shm-usage",
		"--disable-notifications"
	]
}
```
**intentsConfig**: 
```json
{
	"showContent": false,
	"debug": false,
	"removeBgApis": [],
	"plugins": {
        "folder": "../plugins",
        "plugins": [],
        "setup": {}
    },
	"executions": {
		"reponseUsers": true,
		"simulateTyping": false,
		"timeSimulate": 3000,
		"contorlExecutions": false,
		"maxExecutions": 30,
		"timeInterval": 10,
		"timePending": 3,
		"sendSeen": true,
		"sendSeenFull": false,
		"intervalSendSeen": 10
	},
	"bann": {
		"active": true,
		"timeInterval": 10,
		"maxBann": 3,
		"timeBann": 10,
		"timeInactive": 5,
		"whiteList": []
	},
	"messages":{
		"userBanned": "⛔😡 *We report that you have been temporarily banned for misusing our services * \n _Please try again after {{TIMEBANN}} minutes_ 🤬",
		"groupBanned": "⛔😡 *We report that this group has been temporarily banned for misuse of our services by '{{USER_NAME}}' (+ {{USER_NUMBER}}) * \n _Please try again after {{TIMEBANN}} minutes_ 🤬",
		"privileges": "⛔ *Unfortunately you do not have privileges, contact the system administrator* ⛔"
	},
	"blocked": [],
	"whiteList": [],
	"commands": []
}
```

## Disclaimer

This module is not official WhatsApp so you must be careful with the number of interactions per minute to avoid possible bans, this module has the option of queuing responses to avoid such a situation but does not ensure that actions cannot occur on the part of the company.

This project is inspired by [Wbot](https://github.com/vasani-arpit/WBOT) I just dedicate myself to adding new options to it.
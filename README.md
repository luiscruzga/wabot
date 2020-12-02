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
		"name":  "meme",
		"contains": [],
		"exact": ["@meme", "@memes", "meme", "memes"]
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
		commands:  commands
	}
});

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

wabot.on('meme', (res) => {
	wabot.sendImage({
	"idChat":  res.data.from,
	"caption":  "This is a meme.",
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
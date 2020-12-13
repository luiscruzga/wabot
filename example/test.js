const WABOT = require('../src/WABOT');
const path = require('path');
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
		"name":  "link",
		"contains": [],
		"exact": ["@link", "@links", "link", "link", "@url", "url"]
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

const wabot = new WABOT({
    puppeteerConfig: {viewBrowser: true, opendevtools: true},
    intentsConfig: {
        debug: true,
        bann: {
            active: false,
        },
        whiteList: ["56954372453@c.us", "56961429861@c.us"],
        executions: {
            simulateTyping: true,
		},
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
        commands: commands
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
        "idChat": res.data.from,
        "message": "This is a reponse to vcard"
    });
});

wabot.on('help', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
        "message": "*This is a help.*"
    });
});

wabot.on('chiste', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
        "message": "This is a joke"
    });
});

wabot.on('getImage', (res) => {
    wabot.sendImage({
        "idChat": res.data.from,
        "caption": "This is a image.",
        "file": path.join(__dirname, "meme.jpg")
    });
});

wabot.on('link', (res) => {
    wabot.sendLink({
        "idChat": res.data.from,
        "caption": "This is a description",
        "link": "http://feedproxy.google.com/~r/fayerwayer/~3/w3C_M7uD-No/ios-14-punto-verde-o-naranja-en-iphone"
    });
});

wabot.on('sticker', (res) => {
    wabot.sendSticker({
        "idChat": res.data.from,
        "file": res.media
    });
});

wabot.on('location', (res) => {
    wabot.sendLocation({
        "idChat": res.data.from,
        "lat": "-33.0467291",
        "lng": "-71.6169808",
        "title": "Freire 470, Hogar"
    });
});

wabot.on('contacto', (res) => {
    wabot.sendVcard({
        "idChat": res.data.from,
        "contactName": "Luis Cruz",
        "vcard": {
            firstName: "Luis",
            lastName: "Cruz",
            birthday: "29-02-1990",
            url: "https://github.com/luiscruzga",
            nickname: "Luis Cruz",
            cellPhone: "+56961467583",
            email: "luis.xxxxxxx@gmail.com",
            photo: path.join(__dirname, "test.jpg")
        }
    });
});

wabot.on('onAddedToGroup', (res) => {
    console.log('Agregado a un grupo', res);
});

wabot.on('onRemovedFromGroup', (res) => {
    console.log('Eliminado de un grupo', res);
});

wabot.on('diffSiebel', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
        "message": `You entered the parameters: AmbienteMig: ${res.params.ambienteMig}, idOnda: ${res.params.idOnda}, ambienteSiebel: ${res.params.ambienteSiebel}`
    });
});

wabot.on('status_onda', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
        "message": `You entered the parameters: Ambiente: ${res.params.ambiente}, idOnda: ${res.params.idOnda}`
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
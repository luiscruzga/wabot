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
        
        commands: commands
    }
});

wabot.on('message', (res) => {
	// Example for download file
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

wabot.on('meme', (res) => {
    wabot.sendImage({
        "idChat": res.data.from,
        "caption": "This is a meme.",
        "file": path.join(__dirname, "meme.jpg")
    });
});

wabot.on('news', (res) => {
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

wabot.on('ready', (session) => {
    console.log('READY', session);
    //console.log('Clossing Session');
    //wabot.closeSession();
});

wabot.start(); 
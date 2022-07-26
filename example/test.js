const WABOT = require('../src/WABOT');
const path = require('path');

const wabot = new WABOT({
    puppeteerConfig: {
        viewBrowser: true,
        opendevtools: true,
    },
    intentsConfig: {
        showContent: true,
        commands: [
            {
                "name":  "question",
                "contains": [],
                "exact": ["@question", "question", "about me"],
                "params": [
                    {
                        "name":  "age",
                        "isNumber":  true,
                        "request": [
                            "*Tell me your age:*",
                            "*How old are you?*"
                        ],
                        "values":  "any",
                        "badResponse": [
                            "*The indicated value is invalid*",
                            "*Give me a valid value*"
                        ]
                    },
                    {
                        "name":  "sex",
                        "request": [
                            "*What is your gender?*",
                            "*Tell me your gender:*"
                        ],
                        "values": ["MALE", "FEMALE"],
                        "badResponse": [
                            "*The indicated sex is not valid*"
                        ]
                    }
                ]
            }
        ]
    }
});

wabot.on('question', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
		"message": `Your sex is "${res.params.sex}" and you are "${res.params.age}" years old`
    });
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
    } else if (res.data.body === 'image') {
        // Send Image from path
        wabot.sendImage({
            "idChat":  res.data.from,
            "caption":  "Image from path",
            "file":  path.join(__dirname, "./img/image0.jpg")
        });

        // Send image from url
        wabot.sendImage({
            "idChat":  res.data.from,
            "caption":  "Image from url",
            "file": "https://cdn-3.expansion.mx/dims4/default/7026739/2147483647/strip/true/crop/763x1024+0+0/resize/1800x2416!/quality/90/?url=https%3A%2F%2Fcdn-3.expansion.mx%2Fbe%2Fee%2Fd232acf4438aa185d2ca23b44cde%2Fgettyimages-1035090740.jpg"
        });
    } else if (res.data.caption === 'image') {
        // Send image base64
        wabot.sendImage({
            "idChat":  res.data.from,
            "caption":  "Image from base64",
            "file": res.media
        });
    } else if (res.data.caption === 'sticker') {
        wabot.sendSticker({
            "idChat":  res.data.from,
            "file":  res.media
        });   
    } else if (res.data.body === 'location') {
        wabot.sendLocation({
			"idChat": res.data.from,
			"lat": "-33.0467291",
			"lng": "-71.6169808",
			"title": "Home"
		});
    } else if (res.data.body === 'contact') {
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
    } else if (res.data.body === 'news') {
        wabot.sendLink({
            idChat:  res.data.from,
            caption:  "This is a description",
            link: "http://feedproxy.google.com/~r/fayerwayer/~3/w3C_M7uD-No/ios-14-punto-verde-o-naranja-en-iphone"
        });
    } else {
        wabot.sendMessage({
            "idChat": res.data.from,
            "message": `You say: ${res.data.body}`
        });
    }
});

wabot.on('ready', (session) => {
	console.log('Ready');
    //console.log('Clossing Session');
    //wabot.closeSession();
});

wabot.start(); 
const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
			plugins: ['anime']
		},
        commands: [
            {
                "name":  "getAnime",
                "description": "Make a selfie in a anime",
                "exact": ["@anime", "anime"]
            }
        ]
    }
});

wabot.on('getAnime', (res) => {
    wabot.anime({
        "idChat": res.data.from,
		"photo": res.media || ''
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
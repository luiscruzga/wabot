const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['meme']
        },
        commands: [
            {
                "name":  "getMeme",
                "exact": ["@meme", "@memes", "meme", "memes"]
            }
        ]
    }
});

wabot.on('getMeme', (res) => {
    wabot.meme({
		"idChat": res.data.from,
		"language": "en"
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
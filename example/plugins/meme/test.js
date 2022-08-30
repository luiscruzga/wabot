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
                "description": "Get a random meme from reddit",
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
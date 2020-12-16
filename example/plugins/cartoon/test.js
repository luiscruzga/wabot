const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['cartoon'],
            setup: {
                "cartoon": {
					"apiKey": "YOUR_API_KEY"
				}
            }
        },
        commands: [
            {
                "name":  "getCartoon",
                "exact": ["@cartoon", "cartoon"]
            }
        ]
    }
});

wabot.on('getCartoon', (res) => {
    wabot.cartoon({
        "idChat": res.data.from,
		"photo": res.media || ''
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
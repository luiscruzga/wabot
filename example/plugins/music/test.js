const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
			plugins: ['music']
		},
        commands: [
            {
                "name":  "getMusic",
                "description": "Get a song in mp3",
                "exact": ["@music", "music", "@musica", "musica", "música", "@song", "song"],
                "params": [
                    {
                        "name":  "search",
                        "required": true,
                        "isNumber":  false,
                        "request": [
                            "*Tell me what song you want to search:*",
                            "*What song do you want to search?:*"
                        ],
                        "values":  "any",
                        "badResponse": [
                            "*Please enter a valid value.*",
                            "*Your search is incorrect, please enter a valid value.*"
                        ]
                    }
                ]
            }
        ]
    }
});

wabot.on('getMusic', (res) => {
    wabot.music({
		"idChat": res.data.from,
        "search": res.params.search
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['wiki']
		},
        commands: [
            {
                "name":  "getWiki",
                "description": "Get info from wikipedia",
                "exact": ["@wiki", "wiki", "wikipedia", "@wikipedia"],
                "params": [
                    {
                        "name":  "search",
                        "required": false,
                        "request": [
                            "*Tell me what you want to search:*",
                            "*What do you want to look for?*"
                        ],
                        "values":  "any",
                        "badResponse": [
                            "*Please enter a valid value.*",
                            "*Your search is wrong, please enter a valid value.*"
                        ]
                    }
                ]
            }
        ]
    }
});

wabot.on('getWiki', (res) => {
    wabot.wiki({
		"idChat": res.data.from,
		"language": "en",
        "search": res.params.search
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
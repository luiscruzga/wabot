const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['youtube']
		},
        commands: [
            {
                "name":  "getYoutube",
                "exact": ["@youtube", "youtube"],
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

wabot.on('getYoutube', (res) => {
    wabot.youtube({
        "idChat": res.data.from,
        "search": res.params.search
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
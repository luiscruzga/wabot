const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['movie']
        },
        commands: [
            {
                "name":  "getMovie",
                "exact": ["@movie", "@pelicula", "movie", "pelicula", "peliculas", "movies"],
                "params": [
                    {
                        "name":  "search",
                        "required": true,
                        "isNumber":  false,
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

wabot.on('getMovie', (res) => {
    wabot.movie({
		"idChat": res.data.from,
		"search": res.params.search
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
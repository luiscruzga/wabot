const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['coronavirus']
		},
        commands: [
            {
                "name":  "getCoronavirus",
                "exact": ["@coronavirus", "coronavirus", "covid", "covid", "@virus", "virus"],
                "params": [
                    {
                        "name":  "search",
                        "required": false,
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

wabot.on('getCoronavirus', (res) => {
    wabot.coronavirus({
		"idChat": res.data.from,
		"headers": ["Pais", "Casos", "Hoy", "Muertes", "Recuperados", "Activos"],
        "search": res.params.search || ''
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
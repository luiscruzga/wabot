const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['translate']
		},
        commands: [
            {
                "name":  "getTranslation",
                "exact": ["@translate", "translate", "@traduccion", "traduccion", "traducción"],
                "params": [
                    {
                        "name":  "text",
                        "required": false,
                        "isNumber":  false,
                        "request": [
                            "*Tell me what you want to translate:*",
                            "*What do you want to translate?*"
                        ],
                        "values":  "any",
                        "badResponse": [
                            "*Please enter a valid value.*"
                        ]
                    }
                ]
            }
        ]
    }
});

wabot.on('getTranslation', (res) => {
    wabot.translate({
		"idChat": res.data.from,
		"text": res.params.text,
		"to": 'en'
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
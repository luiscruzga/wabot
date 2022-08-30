const WABOT = require('../../../src/WABOT');
const API_KEY = 'YOUR_API_KEY'; // get the API key from https://beta.dreamstudio.ai/dream

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['aiimage']
        },
        commands: [
          {
            "name":  "makeImage",
            "exact": ["@makeimage", "make image", "@image", "image", "imagen"],
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

wabot.on('makeImage', (res) => {
    wabot.aiimage({
      "idChat": res.data.from,
      "apiKey": API_KEY,
      "seach": res.params.search
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
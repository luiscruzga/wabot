const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['lifehacks'],
            setup: {
                'lifehacks': {
                    query_hash: 'YOUY_QUERY_HASH',
                    cookie: 'YOUR_COOKIE',
                    media_count: 101
                }
            }
        },
        commands: [
            {
                "name":  "getLifehacks",
                "exact": ["@lifehack", "@lifehacks", "lifehacks", "lifehack", "life hacks", "life hacks"]
            }
        ]
    }
});

wabot.on('getLifehacks', (res) => {
    wabot.lifehacks({
		"idChat": res.data.from,
		"language": "es"
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
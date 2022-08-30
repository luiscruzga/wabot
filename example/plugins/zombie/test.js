const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
			plugins: ['makeZombie']
		},
        commands: [
            {
                "name":  "makeZombie",
                "description": "Make a selfie in a zombie",
                "exact": ["@makezombie", "@zombie", "zombie", "makezombie"]
            }
        ]
    }
});

wabot.on('makeZombie', (res) => {
    wabot.makeZombie({
        "idChat": res.data.from,
        "photo": res.media
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
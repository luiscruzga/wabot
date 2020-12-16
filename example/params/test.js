const WABOT = require('../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
        commands: [
            {
                "name":  "question",
                "contains": [],
                "exact": ["@question", "question", "about me"],
                "params": [
                    {
                        "name":  "age",
                        "isNumber":  true,
                        "request": [
                            "*Tell me your age:*",
                            "*How old are you?*"
                        ],
                        "values":  "any",
                        "badResponse": [
                            "*The indicated value is invalid*",
                            "*Give me a valid value*"
                        ]
                    },
                    {
                        "name":  "sex",
                        "request": [
                            "*What is your gender?*",
                            "*Tell me your gender:*"
                        ],
                        "values": ["MALE", "FEMALE"],
                        "badResponse": [
                            "*The indicated sex is not valid*"
                        ]
                    }
                ]
            }
        ]
    }
});

wabot.on('question', (res) => {
    wabot.sendMessage({
        "idChat": res.data.from,
		"message": `Your sex is "${res.params.sex}" and you are "${res.params.age}" years old`
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
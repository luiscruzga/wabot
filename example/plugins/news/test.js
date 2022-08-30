const WABOT = require('../../../src/WABOT');

const wabot = new WABOT({
    intentsConfig: {
		plugins: {
			folder: "../plugins",
            plugins: ['news'],
            setup: {
                "news": { 
					"timeRefresh": 10,
					"feeds": [
						"http://feeds.feedburner.com/soychilecl-todas",
						"https://feeds.feedburner.com/fayerwayer",
						"http://www.bbc.co.uk/mundo/ultimas_noticias/index.xml",
						"https://news.google.com/news/rss/?ned=es_cl&gl=CL&hl=es-419"
					]
				}
            }
		},
        commands: [
            {
                "name":  "getNews",
                "description": "Get a news",
                "exact": ["@news", "news", "@noticias", "noticias", "@noticia", "noticia"],
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

wabot.on('getNews', (res) => {
    wabot.news({
		"idChat": res.data.from,
        "search": res.params.search || ''
    });
});

wabot.on('ready', (session) => {
	console.log('Ready');
});

wabot.start(); 
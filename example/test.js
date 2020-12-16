const WABOT = require('../src/WABOT');
const path = require('path');

const wabot = new WABOT();

// Default when no assignment is found for the message
wabot.on('message', (res) => {
    if (res.data.type === 'document' || res.data.type === 'video'){
        wabot.sendMessage({
            "idChat": res.data.from,
            "message": `Thanks for your file.`
        });

        wabot.downloadFile(res.data.id)
        .then((file) => {
            console.log('file downloaded...', file);
        })
        .catch((err) => {
            console.log('error downloading file', err);
        })
    } else {
        wabot.sendMessage({
            "idChat": res.data.from,
            "message": `You say: ${res.data.body}`
        });
    }
});

wabot.on('ready', (session) => {
	console.log('READY', session);
    //console.log('Clossing Session');
    //wabot.closeSession();
});

wabot.start(); 
const flagSendSeen = intents.executions.sendSeenFull;
const timeIntervalSendSeen = intents.executions.intervalSendSeen;
var intervalSendSeen;

window.sendSeenAllPending = async function(){
    if (flagSendSeen){
        let chats = WAPI.getAllChatsWithNewMsg();
        for(var i=0; i<chats.length;i++){
            WAPI.sendSeen(chats[i].id._serialized);
            await sleep(1000);
        }
    }
}

if(flagSendSeen){
    sendSeenAllPending();
    intervalLeave = setInterval(sendSeenAllPending, 60000 * timeIntervalSendSeen);
}
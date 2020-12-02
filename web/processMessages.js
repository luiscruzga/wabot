var pendingMessages = [];
var executingMessage = [];
const controlExecutions = intents.executions.controlExecutions;
const messageParallel = intents.executions.maxExecutions;
const timeIntervalExecutions = intents.executions.timeInterval; //Seconds
const timePending = intents.executions.timePending; //minutes

window.enqueueMessage = (type, message, params) => {
    pendingMessages[message.id] = {
        'type': type,
        'message': message,
        'params': params
    };
    if (executingMessage.length < messageParallel) {
        executingMessage.push(message.id);
        evaluateResponse(message.from, message.id, params, message);
    }
}

window.processPendingMessage = () => {
    let totalExecuting = executingMessage.length;
    if (totalExecuting > 0) {
        let now = new Date();
        // delete all unanswered messages after x minutes
        executingMessage.forEach(message => {
            if(pendingMessages[message]){
                let date = new Date(pendingMessages[message].message.timestamp + 1000);
                if (Math.round(((now - date)/1000)/60) >= timePending){
                    releaseMessage(message);
                }
            }
        })
        totalExecuting = executingMessage.length;
    }

    if (pendingMessages.length > 0) {
        if(totalExecuting < messageParallel){
            let cont=0;
            for (var key in pendingMessages){
                cont++;
                if((totalExecuting+cont) <= messageParallel){
                    pending = pendingMessages[key];
                    executingMessage.push(key);
                    evaluateResponse(pending.message.from, pending.message.id, pending.params, message);
                }else{
                    break;
                }
            }
        }
    }
}

window.releaseMessage = (id) => {
    if (controlExecutions && id !== undefined){
        delete pendingMessages[id];
        //delete executingMessage[id];
        executingMessage.splice(executingMessage.indexOf(id), 1);
    }
}

if (controlExecutions){
    setInterval(() => {
        processPendingMessage();
    }, 1000 * timeIntervalExecutions);
}

window.executeModule = (type, message, params) => {
    if(!validBann(message.sender.id.user, message.timestamp, message.isGroupMsg, message.from)){
        if(!controlExecutions){
            evaluateResponse(message.from, message.id, params, message);
        }else {
            enqueueMessage(type, message, params);
        }
    }else{
        reportBann(message.from, message.sender.id.user, message.isGroupMsg, message.sender.pushname);
    }
}

window.processNewMessages = (data) => {
    data.forEach((message) => {
        if (intents.debug){
            console.log('new message', message);
        }
        if ((intents.whiteList.length > 0 && intents.whiteList.indexOf(message.from) >= 0) || intents.whiteList.length === 0) {
            if (intents.blocked.indexOf(message.from) >= 0) {
                onMessageFromBloqued(message);
                return;
            }
            /*SEND SEEN TO CHAT*/
            if (intents.executions.sendSeen){
                WAPI.sendSeen(message.from);
            }
    
            if (!isUserBanned(message.sender.id.user, message.isGroupMsg, message.from)){
                if(!message.isMedia && !message.isGif){
                    switch (message.type) {
                        case "chat": case "vcard":
                            executeModule(message.type, message, message.body.trim());    
                            break;
                        case "location":
                            executeModule(message.type, message, message.loc.trim());
                            break;
                        default:
                            if(allowedMediaTypes.indexOf(message.type) !== -1){
                                let caption = message.caption ? message.caption.trim() : '';
                                executeModule(message.type, message, caption);
                            }
                            break;
                    }
                }else{
                    if(allowedMediaTypes.indexOf(message.type) !== -1){
                        let caption = message.caption ? message.caption.trim() : '';
                        executeModule(message.type, message, caption);
                    }
                }
            }
        }else if(intents.whiteList.length > 0 && intents.whiteList.indexOf(message.from) === -1){
            if (intents.messages.privileges !== ''){
                onMessageFromNoPrivileges(message);
                WAPI.sendMessage2(message.from, intents.messages.privileges);
            }
        }
    });
}

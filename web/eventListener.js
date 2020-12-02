
window.WAPI.onStateChanged(onStateChanged);

window.WAPI.waitNewAcknowledgements(waitNewAcknowledgements);

window.WAPI.onBattery(onBattery);

window.WAPI.onPlugged(onPlugged);

window.WAPI.onAddedToGroup(onAddedToGroup);

window.WAPI.onRemovedFromGroup(onRemovedFromGroup);

window.WAPI.getAllGroups().forEach((group) => {
    window.WAPI.onParticipantsChanged(group.id._serialized, onParticipantsChanged);
});

window.Store.Msg.on('change:isUnsentMedia', (msg, unsent) => { 
    if (msg.id.fromMe && !unsent){
        onMessageMediaUploadedEvent(msg);
    } 
});
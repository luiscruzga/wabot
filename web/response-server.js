function randomUUI(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

window.text2Image = (in_text) => {
    // create new TextImage object with customize style
    var style = {
        padding: 10,
        font: 'Courier New',
        align: 'center',
        color: 'black',
        size: 8,
        background: 'white',
        stroke: 1,
        strokeColor: 'rgba(0, 0, 0, 0)',
        lineHeight: '1.5em',
        bold: true,
        italic: false
    };
    var textImage = TextImage(style);

    // convert text message to base64 dataURL
    var data = textImage.toDataURL(in_text);
    return data;
}
window.responseServer = async (response) => {
    var _uui, _image, _chats, _fileName, _image, _file_, _encrypted, _idChat_, _dataArray;
    if (intents.executions.simulateTyping){
        window.WAPI.simulateTyping(response.idChat, true);
        setTimeout(()=>{
            window.WAPI.simulateTyping(response.idChat, false);
        }, intents.executions.timeSimulate);
    }
    switch (response.type) {
        case 'spam':
            _chats_ = WAPI.getAllChats();
            for(var i=0; i<_chats_.length;i++){
                if (!_chats_[i].isReadOnly){
                    WAPI.sendMessage2(_chats_[i].id._serialized, response.message);
                    WAPI.sendSeen(_chats_[i].id._serialized);
                    await sleep(3000);
                }
            }
            break;
        case 'text':
            if (response.replyMessage){
                WAPI.ReplyMessage(response.idMessage, response.message);
            }else {
                WAPI.sendMessage2(response.idChat, response.message);
            }
            break;
        case 'text2image':
            _uui = randomUUI();
            _fileName = "image"+_uui+".jpeg";
            _image = text2Image(response.message);
            if (response.replyMessage){
                WAPI.sendImage(_image, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendImage(_image, response.idChat, _fileName, response.caption, '');
            }
            break;
        case 'music':
            _uui = randomUUI();
            _fileName = "mp3"+_uui+".mp3";
            if (response.replyMessage){
                WAPI.sendMusic("data:audio/mpeg;base64,"+response.file, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendMusic("data:audio/mpeg;base64,"+response.file, response.idChat, _fileName, response.caption);
            }
            break;
        case 'image':
            _uui = randomUUI();
            _fileName = "image"+_uui+".jpeg";
            if (response.replyMessage && response.isAlbum){
                WAPI.sendImage("data:image/jpeg;base64,"+response.file, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendImage("data:image/jpeg;base64,"+response.file, response.idChat, _fileName, response.caption, '');
            }
            break;
        case 'document': 
            _uui = randomUUI();
            
            _fileName = response.fileName || "file"+_uui;
            if (response.replyMessage){
                WAPI.sendFile("data:audio/mpeg;base64,"+response.file, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendFile("data:audio/mpeg;base64,"+response.file, response.idChat, _fileName, response.caption);
            }
            break;
        case 'video': 
            _uui = randomUUI();
            _fileName = "video"+_uui+".mp4";
            if (response.replyMessage){
                WAPI.sendImage("data:video/mp4;base64,"+response.file, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendImage("data:video/mp4;base64,"+response.file, response.idChat, _fileName, response.caption);
            }
            break;
        case 'gif':
            _uui = randomUUI();
            _fileName = "video"+_uui+".mp4";
            if (response.replyMessage){
                WAPI.sendVideoAsGif("data:video/mp4;base64,"+response.file, response.idChat, _fileName, response.caption, response.idMessage);
            }else {
                WAPI.sendVideoAsGif("data:video/mp4;base64,"+response.file, response.idChat, _fileName, response.caption);
            }
            break;
        case 'sticker':
            _uui = randomUUI();
            _image = {
                "mimetype": "image/webp",
                "type": "sticker",
                "url": "",
                "mediaKey": "",
                "mediaKeyTimestamp": "",
                "filehash": "",
                "uploadhash": "",
                "directPath": ""
            }
            _file_ = window.WAPI.base64ImageToFile("data:image/webp;base64,"+response.file, `sticker${_uui}.webp`);
            _encrypted = await WAPI.encryptAndUploadFile("sticker", _file_);
            _image.clientUrl = _encrypted.clientUrl;
            _image.url = _encrypted.clientUrl;
            _image.deprecatedMms3Url = _encrypted.clientUrl;
            _image.mediaKey = _encrypted.mediaKey;
            _image.mediaKeyTimestamp = _encrypted.mediaKeyTimestamp;
            _image.filehash = _encrypted.filehash;
            _image.uploadhash = _encrypted.uploadhash;
            _image.directPath = _encrypted.directPath;
            _image.type = 'sticker';
            const _sticker = {
                ..._image,
                ..._encrypted,
            }
            if (response.replyMessage){
                WAPI.sendSticker(_sticker, response.idChat, response.idMessage);
            }else {
                WAPI.sendSticker(_sticker, response.idChat);
            }
            break;
        case 'link':
            if (response.replyMessage){
                if (response.thumb && response.thumb !== ''){
                    WAPI.sendMessageWithThumb(
                        response.thumb
                        ,response.link
                        ,response.title || ''
                        ,response.description || ''
                        ,response.idChat
                        ,response.idMessage
                    );
                } else {
                    WAPI.sendLinkWithAutoPreview(response.idChat, response.link, response.caption, response.idMessage);
                }
            }else {
                if (response.thumb && response.thumb !== ''){
                    WAPI.sendMessageWithThumb(
                        response.thumb
                        ,response.link
                        ,response.title || ''
                        ,response.description || ''
                        ,response.idChat
                    );
                } else {
                    WAPI.sendLinkWithAutoPreview(response.idChat, response.link, response.caption);
                }
            }
            break;
        case 'location':
            if (response.replyMessage){
                WAPI.sendLocation(response.idChat, response.lat, response.lng, response.title, response.idMessage);
            }else {
                WAPI.sendLocation(response.idChat, response.lat, response.lng, response.title);
            }
            break;
        case 'vcard':
            if (response.replyMessage && response.isAlbum){
                WAPI.sendVCard(response.idChat, response.vcard, response.contactName, response.idMessage);
            }else {
                WAPI.sendVCard(response.idChat, response.vcard, response.contactName);
            }
            break;
        default:
            break;
    }
}

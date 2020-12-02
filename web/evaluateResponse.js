window.evaluateResponse = async function(idChat, idMessage, params, reportVariable){
    if(allowedMediaTypes.indexOf(reportVariable.type) === -1){
        newMessage({"data": reportVariable});
    }else {
        reportVariable.body = '';
        if(reportVariable.type === 'image'){
            WAPI.downloadFileAndDecrypt(reportVariable.clientUrl, reportVariable.type, reportVariable.mediaKey, reportVariable.mimetype, async (data) => {
                newMessage({ "media": data.result, "data": reportVariable });
            })
        }else {
            newMessage({"data": reportVariable});
        }
    }
}
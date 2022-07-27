window.evaluateResponse = async function(idChat, idMessage, params, reportVariable){
    if(allowedMediaTypes.indexOf(reportVariable.type) === -1){
        newMessage({"data": reportVariable});
    }else {
        reportVariable.body = '';
        if(reportVariable.type === 'image'){
            WAPI.downloadFileAndDecryptNew(reportVariable.id)
            .then((res) => {
                newMessage({ "media": res.data, "data": reportVariable });
            });
        }else {
            newMessage({"data": reportVariable});
        }
    }
}
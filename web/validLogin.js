var isLogged = false;
var imageQr = "";
var intervalLogin;

var hideMessageScreen = function(type){
    if(type){
        document.getElementById("app").style.display = 'none';
    }else {
        document.getElementById("app").style.display = 'block';
    }
}

var validLogin = function (){
    if(!isLogged){
        if(typeof WAPI === 'undefined' || !WAPI.isLoggedIn()){
            const canvasImage = document.querySelector("#app > div > div > div.landing-window > div.landing-main > div > div > div > canvas");
            // Refresh Image
            let refreshQr = document.querySelectorAll('[data-testid="refresh-large"]');
            if (refreshQr.length > 0){
                refreshQr[0].click();
            }
            // Get QR Image
            let imageQr_ = canvasImage.parentElement.getAttribute("data-ref") || '';
            if(imageQr_ != ''){
                evaluateLogin({"imageQr": imageQr_, "isLoggedIn": false});
            }
        }else{
            isLogged = true;
            const session = {
                WABrowserId: localStorage.WABrowserId,
                WASecretBundle: localStorage.WASecretBundle,
                WAToken1: localStorage.WAToken1,
                WAToken2: localStorage.WAToken2
            }
            evaluateLogin({"imageQr": "", "isLoggedIn": true, "session": session});
            // Hide page content
            if (!intents.showContent){
                hideMessageScreen(true);
            }
            // Solo si está logeado se llama al procesamiento de mensajes
            if (intents.executions.reponseUsers){
                WAPI.waitNewMessages(false, (data) => {
                    processNewMessages(data);
                });
            }

            clearInterval(intervalLogin);
        }
    }
}

intervalLogin = setInterval(validLogin, 5000);
var validWapi = function (){
    if (typeof WAPI === 'undefined' || typeof WAPI.isLoggedIn() === 'undefined'){
        injectWapi();
    }else {
        clearInterval(intervalWapi);
    }
}

intervalWapi = setInterval(validWapi, 5000);
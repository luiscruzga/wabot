const LVB_APLICA_BANEO = intents.bann.active;
var userList = {};
var groupsBanned = {};
const interval = intents.bann.timeInterval;//segundos
const maxBann = intents.bann.maxBann;
const timeBann = intents.bann.timeBann;//minutos
const timeInactive = intents.bann.timeInactive;//minutos
const whiteList = intents.bann.whiteList;

window.breakFreeBann = function(){
    let listaUsuarios = [userList];
    let listaGrupos = [groupsBanned];
    let now = new Date();
    listaUsuarios.forEach(function(user){
        for (var key in user) {
            let usuario = user[key];
            if(usuario.banned){
                if(Math.round(((now - usuario.timeBanned)/1000)/60) >= timeBann){
                	// WAPI.contactUnblock(key);
                    userList[key].banned = false;
                    userList[key].flood = false;
                    userList[key].contBann = 0;
                    userList[key].reportBanned = false;
                }

            }
        }
    });

    listaGrupos.forEach(function(group){
        for (var key in group) {
            let grupo = group[key];
            if(Math.round(((now - grupo.timeBanned)/1000)/60) >= timeBann){
                delete groupsBanned[key];
            }
        }
    });
}

// LImpiamos la lista de usuarios para poder hacer más rapido el proceso y no consumir tantos recursos
window.clearUserList = function(){
    let listaUsuarios = [userList];
    let now = new Date();
    listaUsuarios.forEach(function(user){
        for (var key in user) {
            let usuario = user[key];
            if(!usuario.banned){
                if(Math.round(((now - usuario.lastTime)/1000)/60) >= timeInactive){
                    delete userList[key];
                }
            }
        }
    });
}

if(LVB_APLICA_BANEO){
    setInterval(function(){
        breakFreeBann();
    }, 60000);
}

setInterval(function(){
    clearUserList();
}, 65000);

window.isUserBanned = function(idUser, isGroupMsg, idChat){
	if (isGroupMsg) {
		if (groupsBanned[idChat]){
			return true;
		}else {
			if (userList[idUser]){
				return userList[idUser].banned;
			}else {
				return false;
			}
		}
	}else {
		if (userList[idUser]){
			return userList[idUser].banned;
		}else {
			return false;
		}
	}
}

window.validBann = function(idUser, timestamp, isGroupMsg, idChat){
    if(LVB_APLICA_BANEO && whiteList.indexOf(idUser) === -1){
        var user = userList[idUser];
        const now = new Date(timestamp + 1000);
        if (user) {
            if(user.banned){
                return true;
            }else{
                const diff = Math.round((now - user.lastTime)/1000);
                user.lastTime = now;
                if (diff <= interval) {
                    if (!user.flood) {
                        if(user.contBann > maxBann){
                            user.banned = true;
                            user.flood = true;
                            user.timeBanned = now;
                            if (isGroupMsg){
                            	if (!groupsBanned[idChat]){
                            		groupsBanned[idChat] = {
                            			idUser: idUser,
                            			timeBanned: now
                            		};
                            	}
                            }
                            // WAPI.contactBlock(idUser);
                            return true;
                        }else{
                            user.contBann++;
                        }
                    }
                }else{
                    if(user.contBann > 0){
                        user.contBann--;
                    }else{
                        user.contBann = 0;
                    }
                    user.flood = false;
                }
                if(user.banned){
                    return true;
                }else{
                    return false;
                }
            }
        }else {
            userList[idUser] = {
                            lastTime: now,
                            contBann: 1,
                            flood: false,
                            banned: false,
                            timeBanned: now,
                            reportBanned: false
                        };
            return false;
        }
    }else{
        return false;
    }
}

window.reportBann = function(idChat, idBaneo, isGroupMsg, userName){
    if(!userList[idBaneo].reportBanned){
        console.log('User Banned', idBaneo);
        let mensaje;
        if (isGroupMsg){
        	mensaje = intents.messages.groupBanned;
        	mensaje = mensaje.replace('{{USER_NAME}}', userName);
        	mensaje = mensaje.replace('{{USER_NUMBER}}', idBaneo);
        	mensaje = mensaje.replace('{{TIMEBANN}}', timeBann);
        }else {
        	mensaje = intents.messages.userBanned;
        	mensaje = mensaje.replace('{{TIMEBANN}}', timeBann);
        }
        WAPI.sendMessage2(idChat, mensaje);
        userList[idBaneo].reportBanned = true;
    }
}
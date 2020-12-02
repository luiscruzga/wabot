var intervalUpdate;
var validaUpdate = function (){
    let newUpdate = Array.from(document.querySelectorAll("span")).find(el => el.textContent === "Haz clic para actualizar WhatsApp");
    if(typeof newUpdate !== 'undefined' && newUpdate !== undefined){
        console.log("Nueva Actualizacion de Whatsapp!");
		newUpdate.click();
        clearInterval(intervalUpdate);
	}
}
intervalUpdate = setInterval(validaUpdate, 20000);
var crypto_ = require("crypto");
window.generateMediaKey = async function(length){
	//return crypto_.randomBytes(32).toString('base64');
	var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

window.getFileHash = async (data) => {
    //let buffer = await data.arrayBuffer();
    let buffer = new ArrayBuffer(data);
    var sha = new jsSHA("SHA-256", "ARRAYBUFFER");
    sha.update(buffer);
    return sha.getHash("B64");
};
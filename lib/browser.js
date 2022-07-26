const puppeteer = require('puppeteer');
const EventEmitter = require('events');
const qrcode = require('qrcode-terminal');
const path = require('path');
const _cliProgress = require('cli-progress');
const spinner = require("../util/step");

const arrayScripts = [
	path.join(__dirname, '../web/polyfill.js'),
	path.join(__dirname, '../web/validUpdate.js'),
	path.join(__dirname, '../web/text-image.js'),
    path.join(__dirname, '../web/moduleRaid.js'),
	path.join(__dirname, '../web/WAPI.js'),
	path.join(__dirname, '../web/bann.js'),
	path.join(__dirname, '../web/response-server.js'),
	path.join(__dirname, '../web/evaluateResponse.js'),
	path.join(__dirname, '../web/processMessages.js'),
	path.join(__dirname, '../web/validLogin.js'),
    path.join(__dirname, '../web/sendSeenFull.js'),
    path.join(__dirname, '../web/validWapi.js')
];
const eventListeners = path.join(__dirname, '../web/eventListener.js');
const logo = require("../util/welcome");
console.log(logo);

// Read Line for qr refresh
const CaptureStdout = require('../util/capture-stdout');
const captureStdout = new CaptureStdout();	

var browser;
var page;

/*EVALUA_LOGIN*/
var imageQr = '';
var linesImage = 0;
var displayMessageQr = true;

const injectWapi = async() => {
    await page.addScriptTag({path: require.resolve('../web/WAPI.js')});
}

async function main(args){
    let revisionInfo; 
    
	if (args.puppeteerConfig.dowloadChromeVersion){
		spinner.start("Downloading chrome");
		const browserFetcher = puppeteer.createBrowserFetcher({
			path: process.cwd()
		});
		const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_grey);
		progressBar.start(100, 0);
		revisionInfo = await browserFetcher.download(args.puppeteerConfig.chromeVersion, (download, total) => {
			var percentage = (download * 100) / total;
			progressBar.update(percentage);
		});
		progressBar.update(100);
		spinner.stop("Downloading chrome ... done!");
    }
    
    spinner.start("Launching Chrome");
    
    if (args.session) {
        await page.evaluateOnNewDocument((session) => {
                localStorage.clear();
                localStorage.setItem('WABrowserId', session.WABrowserId);
                localStorage.setItem('WASecretBundle', session.WASecretBundle);
                localStorage.setItem('WAToken1', session.WAToken1);
                localStorage.setItem('WAToken2', session.WAToken2);
        }, args.session);
    }
    
	browser = await puppeteer.launch({
		executablePath: args.puppeteerConfig.dowloadChromeVersion ? revisionInfo.executablePath : args.puppeteerConfig.localChromePath,
		headless: !args.puppeteerConfig.viewBrowser, // Se inicia en true porque whatsapp lo requiere para poder iniciar session, luego lo ocultamos
		userDataDir: args.puppeteerConfig.sessionPath,
		devtools: args.puppeteerConfig.opendevtools,
		ignoreHTTPSErrors: true,
        dumpio: false,
		args: args.puppeteerConfig.args
    });
    
	browser.on('disconnected', async () => {
		browser = null;
		process.exit(1);
    });
	spinner.stop("Launching Chrome ... done!");
    spinner.start("Opening Whatsapp");
    
    page = await browser.newPage();
    await page.setUserAgent(args.puppeteerConfig.userAgent);
    await page.setViewport({width: args.puppeteerConfig.width, height: args.puppeteerConfig.heigth});
    await page.goto(args.puppeteerConfig.WAUrl, {
        waitUntil: 'networkidle0',
        timeout: 0
    });
    // Wait 15 seconds for continue 
    await page.waitForTimeout(15000);
    //await page.waitForNavigation({timeout: 60000 * 5, waitUntil: 'load'});
    
    await page.evaluate(`var intents = ${JSON.stringify(args.botJson)}`);
    await page.evaluate(`const allowedMediaTypes = ['image', 'video', 'gif', 'sticker', 'document'];`);
    for(var x=0; x<arrayScripts.length;x++){
        await page.addScriptTag({path: require.resolve(arrayScripts[x])});
    }

    await page.exposeFunction('evaluateLogin', args.evaluateLogin);
    await page.exposeFunction('onMessageFromBloqued', args.onMessageFromBloqued);
    await page.exposeFunction('onMessageFromNoPrivileges', args.onMessageFromNoPrivileges);
    await page.exposeFunction('newMessage', args.newMessage);
    await page.exposeFunction('downloadFile', args.downloadFile);
    await page.exposeFunction('injectWapi', injectWapi);

    // Event Listeners 
    await page.exposeFunction('onStateChanged', args.onStateChanged);
    await page.exposeFunction('waitNewAcknowledgements', args.waitNewAcknowledgements);
    await page.exposeFunction('onBattery', args.onBattery);
    await page.exposeFunction('onPlugged', args.onPlugged);
    await page.exposeFunction('onAddedToGroup', args.onAddedToGroup);
    await page.exposeFunction('onRemovedFromGroup', args.onRemovedFromGroup);
    await page.exposeFunction('onParticipantsChanged', args.onParticipantsChanged);
    await page.exposeFunction('onMessageMediaUploadedEvent', args.onMessageMediaUploadedEvent);
    await page.addScriptTag({ path: require.resolve(eventListeners) });

    spinner.stop("Opening Whatsapp ... done!");
    if (args.puppeteerConfig.getInitScreenshot) {
        await page.screenshot({ path: args.puppeteerConfig.pathScreenshot, fullPage: true });
    }
}

class WABOT extends EventEmitter {
    constructor(opts){
        super();
        const puppeteerConfig = opts.puppeteerConfig || {};
        const intentConfig = opts.intentConfig || {};
        this.puppeteerConfig = puppeteerConfig;
        this.botJson = intentConfig;
        this.session = opts.session;

        this.newMessage = async (arg) => {
            this.emit('message', arg);
        };

        this.onStateChanged = (arg) => {
            this.emit('onStateChanged', arg);
        }
    
        this.waitNewAcknowledgements = (arg) => {
            this.emit('waitNewAcknowledgements', arg);
        }
    
        this.onBattery = (arg) => {
            this.emit('onBattery', arg);
        }
    
        this.onPlugged = (arg) => {
            this.emit('onPlugged', arg);
        }
    
        this.onAddedToGroup = (arg) => {
            this.emit('onAddedToGroup', arg);
        }
    
        this.onRemovedFromGroup = (arg) => {
            this.emit('onRemovedFromGroup', arg);
        }
    
        this.onParticipantsChanged = (arg) => {
            this.emit('onParticipantsChanged', arg);
        }
    
        this.onMessageMediaUploadedEvent = (arg) => {
            this.emit('onMessageMediaUploadedEvent', arg);
        }
        
        this.onMessageFromBloqued = (arg) => {
            this.emit('onMessageFromBloqued', arg);
        }

        this.onMessageFromNoPrivileges = (arg) => {
            this.emit('onMessageFromNoPrivileges', arg);
        }

        this.evaluateLogin = async (arg) => {
            if(arg.isLoggedIn){
                spinner.stop("Process started successfully!");
                this.emit('ready', arg.session);
            }else{
                if(arg.imageQr !== imageQr){
                    if (displayMessageQr){
                        spinner.stop("You are not logged in, please scan the following QR code!");
                        displayMessageQr = false;
                    }
                    if(imageQr !== ''){
                        for(var i=1; i <= linesImage; i++){
                            process.stdout.moveCursor(0,-1);
                            process.stdout.clearLine();
                            process.stdout.cursorTo(0);	
                        }
                    }
                    imageQr = arg.imageQr;
                    // Init capture log for qr refresh
                    captureStdout.startCapture();
                    // Generate Qr Code
                    qrcode.generate(arg.imageQr, { small: true });
                    // Print Qr Code
                    captureStdout.stopCapture();
                    linesImage = (captureStdout.getCapturedText()[0].split('\n').length -1) + 1;
                    console.log(captureStdout.getCapturedText()[0]);
                    captureStdout.clearCaptureText();
                }
            }
        }
    }

    async sendMessage(arg){
        await page.evaluate((arg) => {
            responseServer(arg);
        }, arg);
    }

    async downloadFile(idMessage) {
        return await page.evaluate(async (idMessage) => {
            return new Promise(async (resolve, reject) => {
                if (typeof idMessage === 'string' && idMessage !== ''){
                    let message = window.WAPI.getMessageById(idMessage);
                    if (message) {
                        if(allowedMediaTypes.indexOf(message.type) !== -1){
                            window.WAPI.downloadFileAndDecrypt(message.clientUrl, message.type, message.mediaKey, message.mimetype, async (data) => {
                                resolve(data.result);
                            });
                        } else {
                            reject('Message is not a valid for download!');
                        }
                    } else {
                        reject('Message not found!');
                    }
                } else {
                    reject('Message Id not valid!');
                }
            })
        }, idMessage);
    }

    async getMe() {
        return await page.evaluate(() => {
            return window.WAPI.getMe();
        });
    }

    async getWAVersion() {
        return await page.evaluate(() => {
            return window.WAPI.getWAVersion();
        });
    }

    async getBatteryLevel() {
        return await page.evaluate(() => {
            return window.WAPI.getBatteryLevel();
        });
    }

    async getAllChats() {
        return await page.evaluate(() => {
            return window.WAPI.getAllChats();
        });
    }

    async getAllChatsWithNewMsg() {
        return await page.evaluate(() => {
            return window.WAPI.getAllChatsWithNewMsg();
        });
    }

    async getChatById(chatId) {
        return await page.evaluate(chatId => {
            return window.WAPI.getChatById(chatId);
        }, chatId);
    }

    async getMessageById(messageId) {
        return await page.evaluate(messageId => {
            return window.WAPI.getMessageById(messageId);
        }, messageId);
    }

    async getAllUnreadMessages() {
        return await page.evaluate(async () => {
            return window.WAPI.getAllUnreadMessages();
        });
    }

    async getAllGroupMetadata() {
        return await page.evaluate(() => {
            return window.WAPI.getAllGroupMetadata();
        });
    }

    async getGroupMetadata(groupId) {
        return await page.evaluate(async (groupId) => {
            return await window.WAPI.getGroupMetadata(groupId);
        }, groupId);
    }

    async createGroup(name, contactsId) {
        if (!Array.isArray(contactsId) || contactsId.length == 0) {
            throw 'You need to add at least one other participant to create the group';
        }

        const createRes = await page.evaluate(async (name, contactsId) => {
            const res = await window.WAPI.createGroup(name, contactsId);

            if (!res.status === 200) {
                throw 'An error occurred while creating the group!';
            }

            return res;
        }, name, contactsId);

        const missingParticipants = createRes.participants.reduce(((missing, c) => {
            const id = Object.keys(c)[0];
            const statusCode = c[id].code;
            if (statusCode != 200) return Object.assign(missing, { [id]: statusCode });
            return missing;
        }), {});

        return { gid: createRes.gid, missingParticipants };
    }

    async getAllContacts() {
        return await page.evaluate(() => {
            return window.WAPI.getAllContacts();
        });
    }

    async getMyContacts() {
        return await page.evaluate(() => {
            return window.WAPI.getMyContacts();
        });
    }

    async getContactById(contactId) {
        return await page.evaluate(contactId => {
            return window.WAPI.getContact(contactId);
        }, contactId);
    }

    async getInviteInfo(inviteCode) {
        return await page.evaluate(inviteCode => {
            return window.Store.WapQuery.groupInviteInfo(inviteCode);
        }, inviteCode);
    }

    async getGroupInviteLink(chatId) {
        return await page.evaluate(async (chatId) => {
            return await window.WAPI.getGroupInviteLink(chatId);
        }, chatId);
    }

    async joinGroupViaLink(inviteCode) {
        return await page.evaluate(async inviteCode => {
            return await window.WAPI.joinGroupViaLink(inviteCode);
        }, inviteCode);
    }

    async setStatus(newStatus){
        return await page.evaluate((newStatus) => {
            return window.WAPI.setMyStatus(newStatus);
        }, newStatus);
    }

    async getStatus(){
        return await page.evaluate(async () => {
            return await window.WAPI.getStatus();
        });
    }

    async archiveChat(idChat, archive){
        return await page.evaluate(async (idChat, archive) => {
            return await window.WAPI.archiveChat(idChat, archive);
        }, idChat, archive);
    }

    async setPresence(presence){
        return await page.evaluate((presence) => {
            return window.WAPI.setPresence(presence);
        }, presence);
    }

    async setDisplayName(newName){
        return await page.evaluate(async (newName) => {
            return await window.WAPI.setMyName(newName);
        }, newName);
    }

    async validNumberExists(id){
        return await page.evaluate(async (id) => {
            const result = await window.Store.WapQuery.queryExist(id);
            return result.jid !== undefined;
        }, id);
    }

    async muteChat(chatId, unmuteDate) {
        await page.evaluate(async (chatId, timestamp) => {
            let chat = await window.Store.Chat.get(chatId);
            await chat.mute.mute(timestamp, !0);
        }, chatId, unmuteDate.getTime() / 1000);
    }

    async unmuteChat(chatId) {
        await page.evaluate(async chatId => {
            let chat = await window.Store.Chat.get(chatId);
            await window.Store.Cmd.muteChat(chat, false);
        }, chatId);
    }

    async pinChat(chatId) {
        return page.evaluate(async chatId => {
            let chat = window.Store.Chat.get(chatId);
            if (chat.pin) {
                return true;
            }
            const MAX_PIN_COUNT = 3;
            if (window.Store.Chat.models.length > MAX_PIN_COUNT) {
                let maxPinned = window.Store.Chat.models[MAX_PIN_COUNT - 1].pin;
                if (maxPinned) {
                    return false;
                }
            }
            await window.Store.Cmd.pinChat(chat, true);
            return true;
        }, chatId);
    }

    async unpinChat(chatId) {
        return page.evaluate(async chatId => {
            let chat = window.Store.Chat.get(chatId);
            if (!chat.pin) {
                return false;
            }
            await window.Store.Cmd.pinChat(chat, false);
            return false;
        }, chatId);
    }

    async archiveChat(chatId) {
        return await page.evaluate(async chatId => {
            let chat = await window.Store.Chat.get(chatId);
            await window.Store.Cmd.archiveChat(chat, true);
            return chat.archive;
        }, chatId);
    }

    async unarchiveChat(chatId) {
        return await page.evaluate(async chatId => {
            let chat = await window.Store.Chat.get(chatId);
            await window.Store.Cmd.archiveChat(chat, false);
            return chat.archive;
        }, chatId);
    }


    async getState(){
        return await page.evaluate(() => {
            return window.Store.State.default.state;
        });
    }

    async resetState(){
        return await page.evaluate(() => {
            window.Store.State.default.phoneWatchdog.shiftTimer.forceRunNow();
        });
    }

    async logout() {
        return await page.evaluate(() => {
            return window.Store.State.default.logout();
        });
        console.log('Logout from Whatsapp!');
    }

    async destroy() {
        await browser.close();
    }
    /*
    async closeSession(){
        if(page){
            await page.close();
            try{
                await del(path.join(__dirname, "../ChromeSession"));
            }catch{
                console.log('Directory deleted');
            }
            await browser.close();
            console.log('Logout from Whatsapp!');
        }
    }
    */

    start(){
        main({
            newMessage: this.newMessage,
            downloadFile: this.downloadFile,
            puppeteerConfig: this.puppeteerConfig, 
            botJson: this.botJson, 
            session: this.session,
            evaluateLogin: this.evaluateLogin,
            onMessageFromBloqued: this.onMessageFromBloqued,
            onMessageFromNoPrivileges: this.onMessageFromNoPrivileges,
            onStateChanged: this.onStateChanged,
            waitNewAcknowledgements: this.waitNewAcknowledgements,
            onBattery: this.onBattery,
            onPlugged: this.onPlugged,
            onAddedToGroup: this.onAddedToGroup,
            onRemovedFromGroup: this.onRemovedFromGroup,
            onParticipantsChanged: this.onParticipantsChanged,
            onMessageMediaUploadedEvent: this.onMessageMediaUploadedEvent
        });
    }
}

module.exports = WABOT;
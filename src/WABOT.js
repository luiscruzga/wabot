const EventEmitter = require('events');
const Merge = require('merge-anything');
const fs = require('fs');
const path = require('path');
var scrape = require('html-metadata');
const _WABOT = require('../lib/browser');
const ConvertBase64 = require('../lib/convertBase64');
const Stickers = require('../lib/stickers');
const Vcards = require('../lib/vcards');
const TYPES = require('../types/validTypes');
const types = new TYPES();
const convert64 = new ConvertBase64();
const vcard = new Vcards();
const puppeteerDefault = require('../types/puppeteer.config.json');
const intentsDefault = require('../types/intents.json');

THUMB_DEFAULT_URL = 'https://icon-library.com/images/url-icon-png/url-icon-png-20.jpg'

const Params = require('./params');
const getRandomItem = (array) => {
    return array[Math.floor(Math.random()*array.length)]
}

const randomUUI = (a,b) => {for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'');return b}

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const replaceAll = (str, term, replacement) => {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}
/**
 *WABOT class for interact whit whatsapp web
 *
 * @class WABOT
 * @extends {EventEmitter}
 * @param {object} opts - Wabot options
 * @param {object} opts.puppeteerConfig - Puppeteer launch options
 * @param {string} opts.puppeteerConfig.WAUrl - Whatsapp Web Url
 * @param {string} opts.puppeteerConfig.sessionPath - Path to save the session info for restore this in the future
 * @param {boolean} opts.puppeteerConfig.viewBrowser - Show browser (headless)
 * @param {boolean} opts.puppeteerConfig.opendevtools - Show devtools (console)
 * @param {string} opts.puppeteerConfig.userAgent - User Agent for web browser 
 * @param {number} opts.puppeteerConfig.width - Width for web browser 
 * @param {number} opts.puppeteerConfig.heigth - Height for web browser
 * @param {boolean} opts.puppeteerConfig.dowloadChromeVersion - Download chromium browser or use local google chome
 * @param {number} opts.puppeteerConfig.chromeVersion - Version of chromium to download
 * @param {string} opts.puppeteerConfig.localChromePath - Google chrome executable path
 * @param {string} opts.puppeteerConfig.getInitScreenshot - Allows you to take a screenshot when you start WhatsApp in order to detect problems when running in headless mode
 * @param {string} opts.puppeteerConfig.localChromePath - File name to save the screenshot
 * @param {string} opts.puppeteerConfig.args - Args to open the web browser
 * @param {object} opts.intentConfig - Execution and internal options
 * @param {boolean} opts.intentConfig.showContent - Display chats in browser
 * @param {string} opts.intentConfig.debug - Debug mode for view console logs
 * @param {string[]} opts.intentConfig.removeBgApis - Api keys for https://www.remove.bg
 * @param {object} opts.intentConfig.plugins - Options for plugins config 
 * @param {string} opts.intentConfig.plugins.folder - Folder containing the plugins
 * @param {string[]} opts.intentConfig.plugins.plugins - Array containing the plugin names to use
 * @param {object} opts.intentConfig.plugins.setup - Configuration of each plugin
 * @param {object} opts.intentConfig.executions - Options for control chats
 * @param {boolean} opts.intentConfig.executions.reponseUsers - Control response to users 
 * @param {boolean} opts.intentConfig.executions.simulateTyping - Simulate typing in chat 
 * @param {number} opts.intentConfig.executions.timeSimulate - Time in ms for simulate typing 
 * @param {boolean} opts.intentConfig.executions.contorlExecutions - Control chats to enqueue messages 
 * @param {number} opts.intentConfig.executions.maxExecutions - Max messages to process in the same time
 * @param {number} opts.intentConfig.executions.timeInterval - Time in seconds to queue messages
 * @param {number} opts.intentConfig.executions.timePending - Time in minutes to search for pending messages
 * @param {boolean} opts.intentConfig.executions.sendSeen - Send seen ticket 
 * @param {boolean} opts.intentConfig.executions.sendSeenFull - Send seen ticket to all pending messages on login
 * @param {number} opts.intentConfig.executions.intervalSendSeen - Time in minutes for search pending messages to send seen
 * @param {object} opts.intentConfig.bann - Bann options 
 * @param {boolean} opts.intentConfig.bann.active - Control bann users
 * @param {number} opts.intentConfig.bann.timeInterval - Time in seconds to validate spam messages
 * @param {number} opts.intentConfig.bann.maxBann - Maximum number of messages allowed in the indicated amount of time
 * @param {number} opts.intentConfig.bann.timeBann - Time in minutes for temporary ban
 * @param {number} opts.intentConfig.bann.timeInactive - Time in minutes to release banned users who are inactive for the specified time
 * @param {string[]} opts.intentConfig.bann.whiteList - List of users who will not be banned
 * @param {object} opts.intentConfig.messages - Message settings
 * @param {string} opts.intentConfig.messages.userBanned - Message to display when a user is banned
 * @param {string} opts.intentConfig.messages.groupBanned - Message to display when a group is banned
 * @param {string} opts.intentConfig.messages.privileges - Message to display when you do not have privileges to use the bot
 * @param {string[]} opts.intentConfig.blocked - List of users who cannot use the bot
 * @param {string[]} opts.intentConfig.whiteList - List of users who can use the bot
 * @param {object[]} opts.intentConfig.commands - List of commands to evaluate in user messages
 * @param {string} opts.intentConfig.commands.name - Name of the command
 * @param {string[]} opts.intentConfig.commands.contains - Contains word on message
 * @param {string[]} opts.intentConfig.commands.exact - Message is the same as what is contained here
 * @param {object[]} opts.intentConfig.commands.params - Parameters to require
 * @param {string} opts.intentConfig.commands.params.name - Name of the param
 * @param {boolean} opts.intentConfig.commands.params.isNumber - Is a number param
 * @param {string[]} opts.intentConfig.commands.params.request - Questions to request the parameter
 * @param {string[]} opts.intentConfig.commands.params.values - Allowed values. If any is allowed, "any" must be indicated
 * @param {string[]} opts.intentConfig.commands.params.badResponse - Messages to send in case of illegal values
 * @param {object} opts.session - Object containing session information. Can be used to restore the session.
 * @param {string} opts.session.WABrowserId
 * @param {string} opts.session.WASecretBundle
 * @param {string} opts.session.WAToken1
 * @param {string} opts.session.WAToken2
 * 
 * @fires WABOT#ready
 * @fires WABOT#onStateChanged
 * @fires WABOT#onMessageFromBloqued
 * @fires WABOT#onMessageFromNoPrivileges
 * @fires WABOT#waitNewAcknowledgements
 * @fires WABOT#onBattery
 * @fires WABOT#onPlugged
 * @fires WABOT#onRemovedFromGroup
 * @fires WABOT#onParticipantsChanged
 * @fires WABOT#onMessageMediaUploadedEvent
 * @fires WABOT#vcard
 * @fires WABOT#message
 * @fires WABOT#command
 */
class WABOT extends EventEmitter {
    constructor(opts = {}){
        super();
        // Messages callbacks history
        this.callbacks = [];
        this.isLogged = false;
        if(opts !== undefined && typeof opts === 'object'){
            this.puppeterConfig = opts.puppeteerConfig || {}; 
            this.intentConfig = opts.intentsConfig || {};
        }else {
            this.puppeterConfig = puppeteerDefault;
            this.intentConfig = intentsDefault;
        }

        this.puppeteerConfig = this.mergeOpts(puppeteerDefault, this.puppeterConfig);
        this.intentConfig = this.mergeOpts(intentsDefault, this.intentConfig);

        this.sticker = new Stickers(this.intentConfig.removeBgApis);

        // Add plugins
        if (this.intentConfig.plugins.plugins.length > 0) {
            this.addPlugins(this.intentConfig.plugins);
        }

        this._wabot = new _WABOT({
            puppeteerConfig: this.puppeteerConfig,
            intentConfig: this.intentConfig,
            session: opts.session
        });

        this._wabot.on('message', (arg) => {
            this.getNewMessages(arg);
        });

        this._wabot.on('onStateChanged', (arg) => {
            /**
            * Emitted when the connection state changes
            * @event WABOT#onStateChanged
            * @param {object} arg - State info
            */
            this.emit('onStateChanged', arg);
        });

        this._wabot.on('onMessageFromBloqued', (arg) => {
            /**
             * Emitted when a message is received from a bloqued user
             * @event WABOT#onMessageFromBloqued
             * @param {object} arg - Message info
             */
            this.emit('onMessageFromBloqued', arg);
        });

        this._wabot.on('onMessageFromNoPrivileges', (arg) => {
            /**
             * Emitted when a message is received from a non-privileged user
             * @event WABOT#onMessageFromNoPrivileges
             * @param {object} arg - Message info
             */
            this.emit('onMessageFromNoPrivileges', arg);
        });
    
        this._wabot.on('waitNewAcknowledgements', (arg) => {
            /**
             * Emitted when a the acknowledgement state of a message changes.
             * @event WABOT#waitNewAcknowledgements
             * @param {object} arg 
             */
            this.emit('waitNewAcknowledgements', arg);
        });
    
        this._wabot.on('onBattery', (arg) => {
            /**
             * Emitted when the battery percentage for the attached device changes
             * @event WABOT#onBattery
             * @param {number} arg - The current battery percentage
             */
            this.emit('onBattery', arg);
        });
    
        this._wabot.on('onPlugged', (arg) => {
            /**
             * Emitted when add a participant of the group 
             * @event WABOT#onPlugged
             * @param {boolean} arg - True or False
             */
            this.emit('onPlugged', arg);
        });
    
        this._wabot.on('onAddedToGroup', (arg) => {
            /**
             * Emitted when add a participant of the group 
             * @event WABOT#onAddedToGroup
             * @param {object} arg 
             */
            this.emit('onAddedToGroup', arg);
        });
    
        this._wabot.on('onRemovedFromGroup', (arg) => {
            /**
             * Emitted when remove a participant of the group 
             * @event WABOT#onRemovedFromGroup
             * @param {object} arg 
             */
            this.emit('onRemovedFromGroup', arg);
        });
    
        this._wabot.on('onParticipantsChanged', (arg) => {
            /**
             * Emitted when a participant of the group change 
             * @event WABOT#onParticipantsChanged
             * @param {object} arg 
             * @param {string} arg.by 
             * @param {string} arg.action - Promote or Demote
             * @param {string} arg.who - Id of the user  
             */
            this.emit('onParticipantsChanged', arg);
        });
        
        this._wabot.on('onMessageMediaUploadedEvent', (arg) => {
            /**
             * Emitted when media has been uploaded for a message sent by the client.
             * @event WABOT#onMessageMediaUploadedEvent
             * @param {object} message - The message with media that was uploaded
             */
            this.emit('onMessageMediaUploadedEvent', arg);
        });

        this._wabot.on('ready', (session) => {
            this.isLogged = true;
            /**
             * Emitted when WABOT is ready to work
             * @event WABOT#ready
             * @param {object} session Object containing session information. Can be used to restore the session.
             * @param {string} session.WABrowserId
             * @param {string} session.WASecretBundle
             * @param {string} session.WAToken1
             * @param {string} session.WAToken2
             */
            this.emit('ready', session);
        })

        process.on('SIGINT', async () => {
            console.log('Unexpected closure, we will close the browser for greater security!');
            await this._wabot.destroy();
        });

        process.on('SIGQUIT', async () => {
            console.log('Unexpected closure, we will close the browser for greater security!');
            this._wabot.destroy();
        });
    }

    mergeOpts (defaultOpts, customOpts) {
        return Merge.merge(defaultOpts, customOpts);
    }

    emitMessage (type, arg){
        switch (type) {
            case 'message': 
                /**
                * Emitted when an uncontrolled message is received
                * @event WABOT#message
                * @param {object} arg - Message Info
                */
                this.emit('message', arg); 
                break;
            case 'vcard': 
                /**
                * Emitted when a vcard pis received
                * @event WABOT#vcard
                * @param {object} arg - Message Info
                */
                this.emit('message', arg); 
                break;
            default: 
                /**
                * Emitted when a command is detected
                * @event WABOT#command
                * @param {object} arg - Message Info
                */
                this.emit(type, arg); 
                break;
        }
        
    }

    async getNewMessages(arg) {
        let _this = this;
        if (this.intentConfig.commands.length === 0) {
            switch (arg.data.type) {
                case "vcard":
                    vcard.extractVcard(arg.data.content)
                    .then(res => {
                        arg.data.vcard = res; 
                        _this.emitMessage('vcard', arg);
                    });
                    break;
                case "document": case "sticker": case "video": case "gif":
                    _this.emitMessage('message', arg);
                    break;
                default:
                    _this.emitMessage('message', arg);
                    break;
            }
        } else {
            switch (arg.data.type) {
                case "vcard":
                    vcard.extractVcard(arg.data.content)
                    .then(res => {
                        arg.data.vcard = res; 
                        _this.emitMessage('vcard', arg);
                    });
                    break;
                case "sticker": case "video": case "gif":
                    _this.emitMessage('message', arg);
                    break;
                case "document": 
                    if (!await _this.validCallbackResponse({
                        idChat: arg.data.from, 
                        message: arg
                    })){
                        _this.emitMessage('message', arg);
                    }
                    break;
                default:
                    
                    let exactMatch, PartialMatch, _match, _find;
                    let response = arg;
                    _find = false;
                    let _message; 
                    if (arg.data.type === 'chat'){
                        _message = arg.data.body;
                    }else {
                        _message = arg.data.caption;
                    }
                    exactMatch = this.intentConfig.commands.find(obj => obj.exact.find(ex => ex.toLowerCase() == _message.toLowerCase()));
                    if (exactMatch !== undefined) {
                        response.params = Params.getParams(exactMatch, '');
                        _match = exactMatch;
                        _find = true;
                    }else{
                        let exactMatch = this.intentConfig.commands.find(obj => obj.exact.find(ex => _message.toLowerCase().trim().indexOf(ex.toLowerCase().trim()) === 0));
                        if (exactMatch != undefined && exactMatch.params) {
                            let initCommand = exactMatch.exact.find(ex => _message.toLowerCase().trim().indexOf(ex.toLowerCase().trim()) === 0);
                            let _arguments = _message.toLowerCase().replace(initCommand.toLowerCase(), "").trim();
                            response.params = Params.getParams(exactMatch, _arguments);
                            if (typeof exactMatch.params !== 'undefined' && exactMatch.params.length > 0){
                                _match = exactMatch;
                                _find = true;
                            }
                        }else{
                            PartialMatch = this.intentConfig.commands.find(obj => obj.contains !== undefined && obj.contains.find(ex => _message.toLowerCase().search(ex.toLowerCase()) > -1));
                            if (PartialMatch != undefined) {
                                if (PartialMatch.isFile) PartialMatch['values'] = "any";
                                _match = PartialMatch;
                                _find = true;
                            }
                        }
                    }

                    if (!_find) {
                        if (!await _this.validCallbackResponse({
                            idChat: arg.data.from, 
                            message: arg
                        })) {
                            _this.emitMessage('message', arg);
                        }
                    } else {
                        _this.releaseCallback(arg.data.from);
                        // Request first param else emit intent
                        if (_match.params && Array.isArray(_match.params) && _match.params.length > 0){                            
                            let index = Params.getNextPendingValue(_match, response.params);
                            if (index === 'no_data') {
                                _this.emitMessage(_match.name, response);
                            } else {
                                if (typeof _match.params[index] === 'object'){
                                    _this.executeCallback({
                                        idChat: arg.data.from, 
                                        message: arg.data, 
                                        intent: _match,
                                        idParam: index,
                                        values: response.params
                                    });
                                } else {
                                    _this.emitMessage(_match.name, response);
                                }
                            }
                        } else {
                            _this.emitMessage(_match.name, response);
                        }
                    }
                    break;
            }
        }
    }

    validCallback(args){
        if (typeof this.callbacks[args.idChat] !== 'undefined'){
            if (this.callbacks[args.idChat].isFinished) {
                this.releaseCallback(args.idChat);
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    async validCallbackResponse(args){
        if (this.validCallback({idChat: args.idChat})){
            let caption = "";
            if (args.message.data.type === 'chat'){
                caption = args.message.data.body;
            } else {
                caption = args.message.data.caption;
            }
            caption = caption.trim().toLowerCase();
            const _possibleValues = this.callbacks[args.idChat].possibleValues;
            let currentParam = this.callbacks[args.idChat].currentParam;
            const requireFile = this.callbacks[args.idChat].requireFile;
            let response;
            if (requireFile) {
                if (args.message.data.type === 'document') {
                    const file = await this.downloadFile(args.message.data.id);
                    const pathFile = path.join(this.intentConfig.downloadPath, `${randomUUI()}${path.extname(args.message.data.filename)}`);
                    fs.writeFileSync(pathFile, file.split(';base64,').pop(), {encoding: 'base64'});
                    response = pathFile;
                }
            } else if (typeof _possibleValues === 'object'){
                response = Object.keys(_possibleValues).find(key => _possibleValues[key].find(obj => obj.toLowerCase() == caption));
            } else {
                if ( _possibleValues === 'any' ) {
                    if (this.callbacks[args.idChat].intent.params[currentParam].isNumber){
                        try {
                            response = isNaN(parseInt(caption)) ? '' : parseInt(caption);
                        } catch (e) {
                            response = '';
                        }
                    } else {
                        response = caption;
                    }
                }
            }
            if (response !== undefined && response !== '') {
                let param = this.callbacks[args.idChat].intent.params[currentParam].name;
                let value;
                if (requireFile) value = response;
                else if (typeof _possibleValues === 'object'){
                    if (this.callbacks[args.idChat].customValues.length > 0) {
                        value = this.callbacks[args.idChat].customValues[response].value;
                    } else {
                        if (typeof this.callbacks[args.idChat].intent.params[currentParam].values[response] === 'object') {
                            value = this.callbacks[args.idChat].intent.params[currentParam].values[response].value;
                        } else {
                            value = this.callbacks[args.idChat].intent.params[currentParam].values[response];
                        }
                    }
                } else {
                    value = response;
                }
                this.callbacks[args.idChat].values[param] = value;
                currentParam = Params.getNextPendingValue(this.callbacks[args.idChat].intent, this.callbacks[args.idChat].values);
                if (currentParam === 'no_data') {
                    this.callbacks[args.idChat].isFinished = true;
                    let _message = args.message;
                    _message.params = this.callbacks[args.idChat].values;
                    this.emitMessage(this.callbacks[args.idChat].intent.name, _message);
                } else {
                    this.callbacks[args.idChat].currentParam = currentParam;
                    this.executeCallback({
                        idChat: args.idChat, 
                        message: args.message, 
                        intent: this.callbacks[args.idChat].intent,
                        idParam: currentParam,
                        values: this.callbacks[args.idChat].values
                    });
                }
            } else {
                let text = getRandomItem(this.callbacks[args.idChat].intent.params[currentParam].badResponse);
                this.sendMessage({
                    "idChat": args.idChat,
                    "message": text
                });
            }
            return true;
        } else {
            return false;
        }
    }

    releaseCallback(idChat){
        if (typeof this.callbacks[idChat] !== 'undefined'){
            delete this.callbacks[idChat];
        }
    }

    executeCallback(args){
        let index = args.idParam;
        let _values = {};
        let _possibleValues = {};
        let _customValues = [];
        let cont = 0;
        if (this.validCallback({idChat: args.idChat})){
            _values = this.callbacks[args.idChat].values;
        } else {
            _values = args.values;
        }

        let isFile = false;
        if (args.intent.params[index].isFile) {
            isFile = args.intent.params[index].isFile;
        } else if (Array.isArray(args.intent.params[index].values)){
            // If custom values ​​are configured
            let valuesToDisplay = [];
            if (args.intent.params[index].customValues && args.intent.params[index].customValues.length > 0) {
                args.intent.params[index].customValues.forEach(customValue => {
                    if (_values[customValue.param] !== undefined 
                        && _values[customValue.param] === customValue.paramValue
                    ) {
                        _customValues.push(customValue);
                        valuesToDisplay.push(customValue);
                    }
                })
            }
            if (valuesToDisplay.length === 0) {
                valuesToDisplay = args.intent.params[index].values;
            }
            valuesToDisplay.forEach((value) => {
                if (typeof value === 'object'){
                    _possibleValues[cont] = [(cont+1).toString(), value.display, value.value];
                } else {
                    _possibleValues[cont] = [(cont+1).toString(), value];
                }
                ++cont;
            });
        } else {
            if (args.intent.params[index].values === 'any'){
                _possibleValues = "any";
            }
        }

        this.callbacks[args.idChat] = {
            message: args.message,
            intent: args.intent, 
            currentParam: index,
            isFinished: false,
            requireFile: isFile,
            possibleValues: _possibleValues,
            values: _values,
            customValues: _customValues
        }

        let text = getRandomItem(args.intent.params[index].request) + String.fromCharCode(10);
        for (var i=0; i<cont; i++){
            let options = [];
            options.push(_possibleValues[(i).toString()][0]);
            options.push(_possibleValues[(i).toString()][1]);
            //text += _possibleValues[(i).toString()].join('.- ') + String.fromCharCode(10);
            text += options.join('.- ') + String.fromCharCode(10);
        }
        
        this.sendMessage({
            "idChat": args.idChat,
            "message": text
        });
    }

    addPlugins (plugins) {
        if (Array.isArray(plugins.plugins)) {
            // Read plugins folder
            const pathPlugins = path.join(__dirname, plugins.folder || '../plugins/');
            fs.readdir(pathPlugins, (err, files) => {
                if (err) { 
                    console.error('Error reading plugins directory'); 
                } else {
                    let pluginsFiles = [];
                    files.forEach(file => {
                        if (file.indexOf('.js') !== -1){
                            const {id, setup, plugin, init} = require(path.join(pathPlugins, file));
                            const metadata = {
                                id: id,
                                setup: setup,
                                init: init,
                                plugin: plugin
                            };
                            pluginsFiles.push(metadata);
                        }
                    });

                    plugins.plugins.forEach(plugin => {
                        const pluginFile = pluginsFiles.find(el => el.id === plugin);
                        if (pluginFile !== undefined) {
                            Object.assign(this, {
                                [pluginFile.id]: pluginFile.plugin
                            });
                            if (typeof pluginFile.init !== 'undefined') {
                                pluginFile.init();
                            }
                            if (typeof plugins.setup[plugin] !== 'undefined') {
                                pluginFile.setup(plugins.setup[plugin]);
                            }
                        }
                    })
                }
            });
        }
    }

    /**
     * Send list of commands
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.prefix - Prefix message
     * @param {string} args.postfix - Postfix message
     */
     sendCommands(args) {
        if (this.intentConfig.commands && this.intentConfig.commands.length > 0) {
            let helpText = `${args.prefix || ''} \n `;
            this.intentConfig.commands.forEach(command => {
                if (command.description && command.description !== '') {
                    if (command.exact && command.exact.length > 0) {
                        helpText += `- *${command.exact[0]}* - ${command.description} \n `;
                    } else {
                        helpText += `- ${command.description} \n `;
                    }
                }
            });

            helpText += `${args.postfix || ''}`;

            if (helpText !== '') {
                this.sendMessage({
                    "idChat": args.idChat, 
                    "message": helpText
                });
            }
        }
    }

    addCommand (command) {
        this.intentConfig.commands.push(command);
    }

    deleteCommand (commandName) {
        this.intentConfig.commands = this.intentConfig.commands.filter(el => el.name !== commandName);
    }
    /**
     * Send text as image 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.message - Message to send
     */
    sendMessage(args){
        let data = types.valid('text', args);
        if (data.isValid){
            this._wabot.sendMessage(data.data);
        }else {
            console.error(data.messageInvalid);
        }
    }

    /**
     * Download file from message received from others users
     * @param {string} idMessage - Message id containing the file to download
     * 
     * @returns {Promise<string>} file in base64 or error message
     */
    async downloadFile(idMessage){
        return new Promise(async (resolve, reject) => {
            this._wabot.downloadFile(idMessage)
            .then((file) => {
                resolve(file);
            })
            .catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * Send text as image 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.message - Message to convert into image
     */
    sendText2Image(args){
        let data = types.valid('text2image', args);
        if (data.isValid){
            this._wabot.sendMessage(data.data);
        }else {
            console.error(data.messageInvalid);
        }
    }

    /**
     * Send a image file 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.file - Url, base64 or path to the file
     */
    sendImage(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            convert64.convert(args.file)
            .then(res => {
                args.file = res;
                let data = types.valid('image', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error converting to base64.`, err);
            })
        }
    }

    /**
     * Send a file 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.file - Url, base64 or path to the file
     */
    sendFile(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            convert64.convert(args.file)
            .then(res => {
                args.file = res;
                let data = types.valid('document', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error converting to base64.`, err);
            })
        }
    }

    /**
     * Send a video file 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.file - Url, base64 or path to the file
     */
    sendVideo(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            convert64.convert(args.file)
            .then(res => {
                args.file = res;
                let data = types.valid('video', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error converting to base64.`, err);
            })
        }
    }

    /**
     * Send a gif file 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.file - Url, base64 or path to the file
     */
    sendGif(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            convert64.convert(args.file)
            .then(res => {
                args.file = res;
                let data = types.valid('gif', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error converting to base64.`, err);
            })
        }
    }

    /**
     * Send a music file 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.file - Url, base64 or path to the file
     */
    sendMusic(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            convert64.convert(args.file)
            .then(res => {
                args.file = res;
                args.fileType = 'music';
                let data = types.valid('music', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error converting to base64.`, err);
            })
        }
    }

    /**
     * Send a link
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.caption - Caption to display in the message 
     * @param {string} args.link - Url to send
     */
    sendLink(args){
        let data = types.valid('link', args);
        if (data.isValid){
            if (args.thumb && args.thumb !== '') {
                this._wabot.sendMessage(data.data);
            } else {
                const _this = this;
                scrape(args.link, function(error, metadata){
                    if(!error){
                        if(typeof metadata.openGraph != 'undefined' && metadata.openGraph != undefined){
                            const title = metadata.openGraph.title || "News";
                            const description = metadata.openGraph.description || "";
                            const urlNews = metadata.openGraph.url || args.link;
                            let urlImage;
                            if(typeof metadata.openGraph.image.url != "undefined" && metadata.openGraph.image.url != undefined && metadata.openGraph.image.url != ""){
                                urlImage = metadata.openGraph.image.url;
                            }else{
                                urlImage = THUMB_DEFAULT_URL;
                            }

                            const info = data.data;
                            info.description = description;
                            info.title = title;
                            info.link = urlNews;
                            
                            convert64.convert(urlImage)
                            .then(res => {
                                info.thumb = res;
                                _this._wabot.sendMessage(info);
                            })
                            .catch(err => {
                                info.thumb = '';
                                _this._wabot.sendMessage(info);
                            })
                        }
                    } else {
                        console.error(data.messageInvalid);
                    }
                });
            }
        }else {
            console.error(data.messageInvalid);
        }
    }

    /**
     * Send a sticker
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.file - Url, base64 or Path of the image (with or without background)
     */
    sendSticker(args){
        if (typeof args.file !== 'undefined' && args.file !== ''){
            this.sticker.makeSticker(args.file)
            .then(res => {
                args.file = res.file;
                let data = types.valid('sticker', args);
                if (data.isValid){
                    this._wabot.sendMessage(data.data);
                }else {
                    console.error(data.messageInvalid);
                }
            })
            .catch(err => {
                console.error(`Error creating sticker.`, err);
            })
        }
    }

    /**
     * Send a location 
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.lat - Latitude of the location
     * @param {string} args.lng - Location of the location
     * @param {string} args.title - Title to display
     */
    sendLocation(args){
        let data = types.valid('location', args);
        if (data.isValid){
            this._wabot.sendMessage(data.data);
        }else {
            console.error(data.messageInvalid);
        }
    }

    /**
     * Send a contact as vcard
     * @param {object} args - The message info
     * @param {string} args.idChat - Id Chat
     * @param {string} args.idMessage - Id of message to reply
     * @param {string} args.contactName - Contact Name to display 
     * @param {object} args.vcard - Contact info
     * @param {string} args.vcard.firstName - First Name 
     * @param {string} args.vcard.middleName - Middle Name 
     * @param {string} args.vcard.lastName - Last Name 
     * @param {string} args.vcard.organization - Organization
     * @param {string} args.vcard.birthday - Dirthday date
     * @param {string} args.vcard.title - Title to display
     * @param {string} args.vcard.url - Url
     * @param {string} args.vcard.note - Note
     * @param {string} args.vcard.nickname - Nickname
     * @param {string} args.vcard.namePrefix - Name Prefix 
     * @param {string} args.vcard.nameSuffix - Name Suffix
     * @param {string} args.vcard.gender - Gender
     * @param {string} args.vcard.role - Role
     * @param {string} args.vcard.homePhone - Home Phone
     * @param {string} args.vcard.workPhone - Work Phone
     * @param {string} args.vcard.cellPhone - Cell Phone
     * @param {string} args.vcard.pagerPhone - Pager Phone
     * @param {string} args.vcard.homeFax - Home Fax
     * @param {string} args.vcard.workFax - Work Fax
     * @param {string} args.vcard.email - Email
     * @param {string} args.vcard.workEmail - Work Email
     * @param {string} args.vcard.socialUrlsFacebook - Social Urls Facebook
     * @param {string} args.vcard.socialUrlsLinkedin - Social Urls Linkedin
     * @param {string} args.vcard.socialUrlsTwitter - Social Urls Twitter
     * @param {string} args.vcard.socialUrlsFlickr - Social Urls Flickr
     * @param {string} args.vcard.socialUrlsCustom - Social Urls Custom
     * @param {string} args.vcard.homeAddressLabel - Home Address Label
     * @param {string} args.vcard.homeAddressStreet - Home Address Street
     * @param {string} args.vcard.homeAddressCity - Home Address City
     * @param {string} args.vcard.homeAddressStateProvince - Home Address State Province
     * @param {string} args.vcard.homeAddressPostalCode - Home Address Postal Code
     * @param {string} args.vcard.homeAddressCountryRegion - Home Address Country Region
     * @param {string} args.vcard.workAddressLabel - Work Address Label
     * @param {string} args.vcard.workAddressStreet - Work Address Street
     * @param {string} args.vcard.workAddressCity - Work Address City
     * @param {string} args.vcard.workAddressStateProvince - Work Address State Province
     * @param {string} args.vcard.workAddressPostalCode - Work Address Postal Code
     * @param {string} args.vcard.workAddressCountryRegion - Work Address Country Region
     * @param {string} args.vcard.photo - Photo (url or path)
     */
    sendVcard(args){
        let data = types.valid('vcard', args);
        if (data.isValid){
            let _vcard = vcard.createVcard(data.data.vcard);
            data.data.vcard = _vcard;
            this._wabot.sendMessage(data.data);
        }else {
            console.error(data.messageInvalid);
        }
    }

    /**
     * Returns an object with all of your host device details
     * @returns {Promise<object>}
     */
    async getMe() {
        return this._wabot.getMe();
    }

    /**
     * Returns the version of WhatsApp Web currently being run
     * @returns {Promise<string>}
     */
    async getWAVersion() {
        return this._wabot.getWAVersion();
    }

    /**
     * Get current battery percentage and charging status for the attached device
     * @returns {number} battery - The current battery percentage
     */
    async getBatteryLevel() {
        return this._wabot.getBatteryLevel();
    }

    /**
     * Get all chats
     * @returns {Promise<Object[]>}
     */
    async getAllChats() {
        return this._wabot.getAllChats();
    }
    
    /**
     * Get all chats with pending messages
     * @returns {Promise<Object[]>}
     */
    async getAllChatsWithNewMsg() {
        return this._wabot.getAllChatsWithNewMsg();
    }

    /**
     * Get chat instance by ID
     * @param {string} chatId 
     * @returns {Promise<Chat>}
     */
    async getChatById(chatId) {
        return this._wabot.getChatById(chatId);
    }

    /**
     * Get message by Id
     * @param {string} messageId - Message Id
     * 
     * @returns {Promise<Object[]>}
     */
    async getMessageById(messageId) {
        return this._wabot.getMessageById(messageId);
    }

    /**
     * Get all unread messages
     * @returns {Promise<Object[]>}
     */
    async getAllUnreadMessages() {
        return this._wabot.getAllUnreadMessages();
    }

    /**
     * Fetches all group metadata objects from store
     *
     * @returns {Array|*} List of group metadata
     */
    async getAllGroupMetadata() {
        return this._wabot.getAllGroupMetadata();
    }

    /**
     * Fetches group metadata object from store by ID
     *
     * @param {string} groupId - ID of group
     * @returns {T|*} Group metadata object
     */
    async getGroupMetadata(groupId) {
        return this._wabot.getGroupMetadata(groupId);
    }

    /**
     * Create a new group
     * @param {string} name group title
     * @param {Array<Contact|string>} contactsId an array of Contacts or contact IDs to add to the group
     * @returns {Object} createRes
     * @returns {string} createRes.gid - ID for the group that was just created
     * @returns {Object.<string,string>} createRes.missingParticipants - participants that were not added to the group. Keys represent the ID for participant that was not added and its value is a status code that represents the reason why participant could not be added. This is usually 403 if the user's privacy settings don't allow you to add them to groups.
     */
    async createGroup(name, contactsId) {
        return this._wabot.createGroup(name, contactsId);
    }

    /**
     * Gets the list of all users
     * @param {string} contactId
     * @returns {Promise<Contact[]>}
     */
    async getAllContacts() {
        return this._wabot.getAllContacts();
    }

    /**
     * Get the user's registered contact list
     * @param {string} contactId
     * @returns {Promise<Contact[]>}
     */
    async getMyContacts() {
        return this._wabot.getMyContacts();
    }

    /**
     * Get contact instance by ID
     * @param {string} contactId
     * @returns {Promise<Contact>}
     */
    async getContactById(contactId) {
        return this._wabot.getContactById(contactId);
    }

    /**
     * Returns an object with information about the invite code's group
     * @param {string} inviteCode 
     * @returns {Promise<object>} Invite information
     */
    async getInviteInfo(inviteCode) {
        return this._wabot.getInviteInfo(inviteCode);
    }

    /**
     * Get the invite code's group
     * @param {string} chatId
     * @returns {Promise<string>} Invite Code
     */
    async getGroupInviteLink(chatId) {
        return this._wabot.getGroupInviteLink(chatId);
    }

    /**
     * Accepts an invitation to join a group
     * @param {string} inviteCode Invitation code
     */
    async joinGroupViaLink(inviteCode) {
        return this._wabot.joinGroupViaLink(inviteCode);
    }

    /**
     * Sets the current user's status message
     * @param {string} status New status message
     */
    async setStatusMessage(newStatus){
        return this._wabot.logout(newStatus);
    }

    /**
     * Gets the current status message
     * @returns {string} status message
     */
    async getStatus(){
        return this._wabot.getStatus();
    }

    /**
     * Enables and returns the archive state of the Chat
     * @returns {boolean}
     */
    async archiveChat(idChat, archive){
        return this._wabot.archiveChat(idChat, archive);
    }

    /**
     * Marks the client as online or offline
     * @param {boolean} - true for online false for offline
     */
    async setPresence(presence){
        return this._wabot.setPresence(presence);
    }

    /**
     * Sets the current user's display name. 
     * This is the name shown to WhatsApp users that have not added you as a contact beside your number in groups and in your profile.
     * @param {string} displayName New display name
     */
    async setDisplayName(newName){
        return this._wabot.setDisplayName(newName);
    }

    /**
     * Check if a given ID is registered in whatsapp
     * @param {string} id the whatsapp user's ID
     * @returns {Promise<Boolean>}
     */
    async validNumberExists(id){
        return this._wabot.validNumberExists(id);
    }

    /**
     * Mutes the Chat until a specified date
     * @param {string} chatId ID of the chat that will be muted
     * @param {Date} unmuteDate Date when the chat will be unmuted
     */
    async muteChat(chatId, unmuteDate) {
        this._wabot.muteChat(chatId, unmuteDate);
    }

    /**
     * Unmutes the Chat
     * @param {string} chatId ID of the chat that will be unmuted
     */
    async unmuteChat(chatId) {
        this._wabot.unmuteChat(chatId);
    }

    /**
     * Pins the Chat
     * @returns {Promise<boolean>} New pin state. Could be false if the max number of pinned chats was reached.
     */
    async pinChat(chatId) {
        return this._wabot.pinChat(chatId);
    }

    /**
     * Unpins the Chat
     * @returns {Promise<boolean>} New pin state
     */
    async unpinChat(chatId) {
        return this._wabot.unpinChat(chatId);
    }

    /**
     * Enables and returns the archive state of the Chat
     * @returns {boolean}
     */
    async archiveChat(chatId) {
        return this._wabot.archiveChat(chatId);
    }

    /**
     * Changes and returns the archive state of the Chat
     * @returns {boolean}
     */
    async unarchiveChat(chatId) {
        return this._wabot.unarchiveChat(chatId);
    }

    /**
     * Gets the current connection state for the client
     * @returns WAState
     */
    async getState(){
        return this._wabot.getState();
    }

    /**
     * Force reset of connection state for the client
     */
    async resetState(){
        return this._wabot.resetState();
    }

    /**
     * Logs out the client, closing the current session
     */
    logout(){
        if(this.isLogged){
            this._wabot.logout();
        }else{
            console.info("You must first be logged in.");
        }
    }
    /**
     * To know if the process is ready
     */
    isReady() {
        return this.isLogged;
    }
    /**
     * Start session on whatsapp web 
     */
    start(){
        this._wabot.start();
    }
}

module.exports = WABOT;
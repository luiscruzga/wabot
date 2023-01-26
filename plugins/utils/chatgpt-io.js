const { randomUUID } = require("node:crypto");
const { io } = require("socket.io-client");
const fs = require("fs");

function getCurrentTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const ErrorType = {
	Timeout: 1,
	AccountRateLimitExceeded: 2,
	AnotherMessageInProgress: 3,
	SessionTokenExpired: 4,
	MessageTooLong: 5,
	UnknownError: 6,
}

class ChatGPT {
  constructor(
    sessionToken = '',
    options = {
      name: "default",
      reconnection: true,
      forceNew: false,
      bypassNode: "https://gpt.pawan.krd",
      proAccount: false
    }
  ) {
    var { reconnection, forceNew, proAccount, name } = options;
    this.name = name;
    this.path = `./${this.name}-chatgpt-io.json`;
    this.proAccount = proAccount;
    this.ready = false;
    this.socket = io(options.bypassNode ?? "https://gpt.pawan.krd", {
      query: {
        client: "nodejs",
        version: "1.1.0",
        versionCode: "110",
      },
      transportOptions: {
        websocket: {
          pingInterval: 10000,
          pingTimeout: 5000,
        },
      },
      reconnection: reconnection ?? true,
      reconnectionAttempts: 100,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
      upgrade: false,
      forceNew: forceNew ?? false,
    });
    this.sessionToken = sessionToken;
    this.conversations = [];
    this.auth = null;
    this.expires = Date.now();
    this.pauseTokenChecks = true;
    this.load();
    this.socket.on("connect", () => {
      if (this.onConnected) this.onConnected();
      console.log("Connected to server");
    });
    this.socket.on("disconnect", () => {
      if (this.onDisconnected) this.onDisconnected();
      console.log("Disconnected from server");
    });
    this.socket.on("serverMessage", (data) => {
      console.log(`[SERVER MESSAGE] ${getCurrentTime()} ${data}`);
    });
    setInterval(async () => {
      if (this.pauseTokenChecks) return;
      this.pauseTokenChecks = true;
      if(!this.auth){
        await this.getTokens();
        this.pauseTokenChecks = false;
        return;
      }
      const now = Date.now();
      const offset = 2 * 60 * 1000;
      if (this.expires < now - offset || !this.auth) {
        await this.getTokens();
      }
      this.pauseTokenChecks = false;
    }, 500);
    setInterval(() => {
      const now = Date.now();
      this.conversations = this.conversations.filter((conversation) => {
        return now - conversation.lastActive < 1800000; // 2 minutes in milliseconds
      });
    }, 60000);
		this.intervalId = setInterval(() => {
			this.save();
		}, this.saveInterval);
    process.on('beforeExit', async () => {
      clearInterval(this.intervalId);
      if(this.ready) await this.save();
    });
  }

	async load() {
    this.pauseTokenChecks = true;
		if (!fs.existsSync(this.path)) {
      await this.wait(1000);
      this.pauseTokenChecks = false;
      return;
    }
		let data = await fs.promises.readFile(this.path, "utf8");
		let json = JSON.parse(data);
    for (let key in json) {
      this[key] = json[key];
    }
		await this.wait(1000);
    if(this.auth) this.ready = true;
		this.pauseTokenChecks = false;
	}

	async save() {
		let result = {};
		for (let key in this) {
      if (key === "pauseTokenChecks") continue;
      if (key === "ready") continue;
      if (key === "name") continue;
      if (key === "path") continue;
      if (key === "saveInterval") continue;
			if (this[key] instanceof Array || typeof this[key] === "string" || typeof this[key] === "number" || typeof this[key] === "boolean") {
				result[key] = this[key];
			}
		}
		await fs.promises.writeFile(this.path, JSON.stringify(result, null, 4));
	}

  addConversation(id) {
    let conversation = {
      id: id,
      conversationId: null,
      parentId: randomUUID(),
      lastActive: Date.now(),
    };
    this.conversations.push(conversation);
    this.save();
    return conversation;
  }

  getConversationById(id) {
    let conversation = this.conversations.find(
      (conversation) => conversation.id === id
    );
    if (!conversation) {
      conversation = this.addConversation(id);
    } else {
      conversation.lastActive = Date.now();
    }
    return conversation;
  }

  resetConversation(id = "default") {
    let conversation = this.conversations.find(
      (conversation) => conversation.id === id
    );
    if (!conversation) return;
    conversation.conversationId = null;
  }

  wait(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async waitForReady() {
    while (!this.ready) await this.wait(25);
    if (this.onReady) this.onReady();
    console.log("Ready!");
  }

  async ask(prompt, id = "default") {
    if (!this.auth || !this.validateToken(this.auth)) await this.getTokens();
    let conversation = this.getConversationById(id);
    let data = await new Promise((resolve) => {
      this.socket.emit(
        this.proAccount ? "askQuestionPro" : "askQuestion",
        {
          prompt: prompt,
          parentId: conversation.parentId,
          conversationId: conversation.conversationId,
          auth: this.auth,
        },
        (data) => {
          resolve(data);
        }
      );
    });

    if (data.error) {
      console.error(data.error);
      this.processError(data.error, prompt, id);
      throw new Error(data.error);
    }

    conversation.parentId = data.messageId;
    conversation.conversationId = data.conversationId;

    return data.answer;
  }

  processError(error, prompt = null, conversationId = null) {
    let errorType = ErrorType.UnknownError;
    if (!error) {
      errorType = ErrorType.UnknownError;
    }
    if (typeof error !== "string") {
      errorType = ErrorType.UnknownError;
    }
    if (error.toLowerCase().includes("too many requests")) {
      errorType = ErrorType.AccountRateLimitExceeded;
    }
    if (error.toLowerCase().includes("try refreshing your browser")) {
      errorType = ErrorType.UnknownError;
    }
    if (error.toLowerCase().includes("too long")) {
      errorType = ErrorType.MessageTooLong;
    }
    if (error.toLowerCase().includes("one message at a time")) {
      errorType = ErrorType.AnotherMessageInProgress;
    }
    if (error.toLowerCase().includes("expired")) {
      errorType = ErrorType.SessionTokenExpired;
    }
    
    if (this.onError) this.onError(errorType, prompt, conversationId);
  }

  validateToken(token) {
    if (!token) return false;
    const parsed = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    return Date.now() <= parsed.exp * 1000;
  }

  async getTokens() {
    await this.wait(1000);
    let data = await new Promise((resolve) => {
      this.socket.emit("getSession", this.sessionToken, (data) => {
        resolve(data);
      });
    });
    if (data.error) {
      console.error(data.error);
      this.processError(data.error);
      throw new Error(data.error);
    }
    this.sessionToken = data.sessionToken;
    this.auth = data.auth;
    this.expires = data.expires;
    this.ready = true;
    await this.save();
  }

  async disconnect() {
		clearInterval(this.intervalId);
		await this.save();
    return await this.socket.disconnect(true);
  }
}

module.exports = ChatGPT;

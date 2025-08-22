const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');

// Config dosyasını oku
let config;
if (fs.existsSync('./config.json')) {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} else {
    config = {
        token: "",
        prefix: ".",
        logChannelId: "",
        categoryId: "",
        supportRoleId: "",
        transcriptChannelId: "",
        botName: "ShadowTicket"
    };
}

const TOKEN = process.env.TOKEN || '';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ] 
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

require('./handlers/events')(client);
require('./handlers/commands')(client);

if (!fs.existsSync('./config.json')) {
    fs.writeFileSync('./config.json', JSON.stringify({
        token: "",
        prefix: ".",
        logChannelId: "",
        categoryId: "",
        supportRoleId: "",
        transcriptChannelId: "",
        botName: "Ticket"
    }, null, 4));
    console.log('Created config.json file. Please fill in the required IDs and token.');
}

if (!fs.existsSync('./tickets')) {
    fs.mkdirSync('./tickets', { recursive: true });
    console.log('Created tickets directory for transcript storage.');
}

module.exports = { config };

client.login(config.token || process.env.TOKEN);

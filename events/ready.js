module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is now online!`);
        
        client.user.setPresence({
            activities: [{ name: 'Destek Talepleri', type: 3 }],
            status: 'online'
        });
        
        console.log(`Bot is in ${client.guilds.cache.size} servers`);
    }
};

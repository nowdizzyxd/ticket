const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        
        if (command.data) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        
        if (command.name) {
            client.commands.set(command.name, command);
        }
    }
    
    client.on('ready', async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            
            const { config } = require('../index');
            
            const rest = new REST({ version: '10' }).setToken(config.token || process.env.TOKEN);
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            
            console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    });
    
    client.on('messageCreate', async message => {
        if (message.author.bot) return;
        
        const { config } = require('../index');
        const prefix = config.prefix || '.';
        
        if (!message.content.startsWith(prefix)) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = client.commands.get(commandName);
        if (!command) return;
        
        try {
            if (command.run) {
                await command.run(client, message, args);
            }
        } catch (error) {
            console.error(error);
            message.reply('Komutu çalıştırırken bir hata oluştu.');
        }
    });
};

const { InteractionType } = require('discord.js');
const ticketSystem = require('../utils/ticketSystem');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'Komutu çalıştırırken bir hata oluştu.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'Komutu çalıştırırken bir hata oluştu.',
                        ephemeral: true
                    });
                }
            }
        }
        
        else if (interaction.isButton()) {
            if (interaction.customId === 'create_ticket') {
                await ticketSystem.handleTicketCreation(interaction, client);
            } else if (interaction.customId === 'close_ticket') {
                await ticketSystem.handleTicketClose(interaction, client);
            } else if (interaction.customId === 'close_with_transcript' || 
                       interaction.customId === 'close_with_zip' || 
                       interaction.customId === 'cancel_close' || 
                       interaction.customId === 'confirm_close') {
ticketSystem.js
            }
        }
        
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_category') {
                await ticketSystem.handleTicketCategory(interaction, client);
            }
        }
    }
};

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Ticket sistemini kurar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    name: 'setup',
    description: 'Ticket sistemini kurar',
    
    async execute(interaction) {
        await setupTicketSystem(interaction);
    },
    
    async run(client, message, args) {
        await setupTicketSystem(message);
    }
};

async function setupTicketSystem(interaction) {
    const isSlash = interaction.commandId ? true : false;
    const guild = isSlash ? interaction.guild : interaction.guild;
    
    try {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Destek Talebi')
            .setDescription('Bir destek talebi oluşturmak için aşağıdaki düğmeye tıklayın.\n\n**Not:** Gereksiz yere botu meşgul eden kullanıcıların ticket açması yasaklanacaktır.')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Destek Talebi Oluştur')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        if (isSlash) {
            await interaction.reply({ embeds: [embed], components: [row] });
        } else {
            await interaction.channel.send({ embeds: [embed], components: [row] });
        }
    } catch (error) {
        console.error('Setup error:', error);
        
        const errorMessage = 'Ticket sistemini kurarken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        } else {
            await interaction.channel.send(errorMessage);
        }
    }
}

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun yanıt süresini gösterir'),
    
    name: 'ping',
    description: 'Botun yanıt süresini gösterir',
    
    async execute(interaction) {
        const startTime = Date.now();
        
        const initialEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ping Ölçülüyor...')
            .setDescription('Ölçüm yapılıyor, lütfen bekleyin.')
            .setTimestamp();
        
        const message = await interaction.reply({ 
            embeds: [initialEmbed],
            fetchReply: true
        });
        
        const endTime = Date.now();
        const ping = endTime - startTime;
        const apiPing = Math.round(interaction.client.ws.ping);
        
        const resultEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong!')
            .setDescription(`**Bot Yanıt Süresi:** ${ping}ms\n**API Yanıt Süresi:** ${apiPing}ms`)
            .setFooter({ text: 'Ticket', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
        
        await interaction.editReply({ 
            embeds: [resultEmbed]
        });
    },
    
    async run(client, message, args) {
        const startTime = Date.now();
        
        const initialEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ping Ölçülüyor...')
            .setDescription('Ölçüm yapılıyor, lütfen bekleyin.')
            .setTimestamp();
        
        const botMsg = await message.channel.send({ embeds: [initialEmbed] });
        
        const endTime = Date.now();
        const ping = endTime - startTime;
        const apiPing = Math.round(client.ws.ping);
        
        const resultEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong!')
            .setDescription(`**Bot Yanıt Süresi:** ${ping}ms\n**API Yanıt Süresi:** ${apiPing}ms`)
            .setFooter({ text: 'Ticket', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
        
        await botMsg.edit({ embeds: [resultEmbed] });
    }
};

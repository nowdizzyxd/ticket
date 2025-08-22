const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits, 
    ChannelType,
    StringSelectMenuBuilder,
    AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const discordTranscripts = require('discord-html-transcripts');
const archiver = require('archiver');

let config;
try {
    config = require('../config.json');
} catch (error) {
    config = {
        logChannelId: "",
        categoryId: "",
        supportRoleId: ""
    };
    console.error('Error loading config.json');
}

async function handleTicketCreation(interaction, client) {
    try {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_category')
                    .setPlaceholder('Destek türünü seçin')
                    .addOptions([
                        {
                            label: 'Partnerlik',
                            description: 'Partnerlik ile ilgili destek talebi',
                            value: 'partnership',
                            emoji: '🤝'
                        },
                        {
                            label: 'Destek',
                            description: 'Genel destek talebi',
                            value: 'support',
                            emoji: '❓'
                        },
                        {
                            label: 'Bot',
                            description: 'Bot ile ilgili destek talebi',
                            value: 'bot',
                            emoji: '🤖'
                        },
                    ]),
            );

        await interaction.reply({
            content: 'Lütfen destek talebinizin türünü seçin:',
            components: [row],
            ephemeral: true
        });
    } catch (error) {
        console.error('Error creating ticket selection:', error);
        await interaction.reply({
            content: 'Destek talebi oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            ephemeral: true
        });
    }
}

async function handleTicketCategory(interaction, client) {
    try {
        const category = interaction.values[0];
        const guild = interaction.guild;
        const user = interaction.user;

        const categoryNames = {
            'partnership': 'Partnerlik',
            'support': 'Destek',
            'bot': 'Bot'
        };

        const categoryName = categoryNames[category];

        if (!config.categoryId) {
            return await interaction.update({
                content: 'Ticket sistemi doğru yapılandırılmamış. Lütfen bir yöneticiyle iletişime geçin.',
                components: [],
                ephemeral: true
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `${categoryName.toLowerCase()}-${user.username}`,
            type: ChannelType.GuildText,
            parent: config.categoryId || null,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }
            ]
        });

        if (config.supportRoleId) {
            await ticketChannel.permissionOverwrites.create(config.supportRoleId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }

        const ticketEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${categoryName} Destek Talebi`)
            .setDescription(`${user} tarafından oluşturuldu.\n\nLütfen sorununuzu detaylı bir şekilde açıklayın. Destek ekibimiz en kısa sürede size yardımcı olacaktır.`)
            .setTimestamp()
            .setFooter({ text: `Ticket ID: ${ticketChannel.id}` });

        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Talebi Kapat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await ticketChannel.send({
            content: `${user} ${config.supportRoleId ? `<@&${config.supportRoleId}>` : ''}`,
            embeds: [ticketEmbed],
            components: [closeButton]
        });

        if (config.logChannelId) {
            const logChannel = guild.channels.cache.get(config.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Yeni Destek Talebi Oluşturuldu')
                    .setDescription(`**Kullanıcı:** ${user}\n**Tür:** ${categoryName}\n**Kanal:** ${ticketChannel}\n**Zaman:** ${new Date().toLocaleString()}`)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        await interaction.update({
            content: `Destek talebiniz başarıyla oluşturuldu: ${ticketChannel}`,
            components: [],
            ephemeral: true
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.update({
            content: 'Destek talebi oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            components: [],
            ephemeral: true
        });
    }
}

async function handleTicketClose(interaction, client) {
    try {
        const channel = interaction.channel;
        const guild = interaction.guild;
        const user = interaction.user;

        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_with_transcript')
                    .setLabel('Dökümle Kapat')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('close_with_zip')
                    .setLabel('Zip ile Kapat')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🗂️'),
                new ButtonBuilder()
                    .setCustomId('cancel_close')
                    .setLabel('İptal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        const confirmMessage = await interaction.reply({
            content: 'Bu destek talebini nasıl kapatmak istiyorsunuz?',
            components: [confirmRow],
            fetchReply: true
        });

        const collector = confirmMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'close_with_transcript') {
                await i.update({
                    content: 'Ticket dökümü oluşturuluyor...',
                    components: []
                });

                try {
                    const transcript = await discordTranscripts.createTranscript(channel, {
                        limit: 100,
                        fileName: `transcript-${channel.name}.html`,
                        poweredBy: false,
                        saveImages: true,
                        footerText: `${guild.name} | Oluşturulma: ${new Date().toLocaleString()}`
                    });

                    const transcriptChannelId = config.transcriptChannelId || config.logChannelId;
                    if (transcriptChannelId) {
                        const transcriptChannel = guild.channels.cache.get(transcriptChannelId);
                        if (transcriptChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('Destek Talebi Kapatıldı - Döküm')
                                .setDescription(
                                    `**Kanal:** ${channel.name}\n` +
                                    `**Kapatan:** ${user}\n` +
                                    `**Zaman:** ${new Date().toLocaleString()}`
                                )
                                .setTimestamp();

                            await transcriptChannel.send({
                                embeds: [logEmbed],
                                files: [transcript]
                            });
                        }
                    }

                    await channel.send({
                        content: 'Ticket dökümü oluşturuldu ve kaydedildi. Bu kanal 5 saniye içinde silinecek...'
                    });
                } catch (err) {
                    console.error('Transcript creation error:', err);
                    await channel.send('Döküm oluşturulurken bir hata oluştu. Kanal yine de kapatılacak.');
                }

                setTimeout(async () => {
                    try {
                        await channel.delete();
                    } catch (err) {
                        console.error('Error deleting channel:', err);
                    }
                }, 5000);

            } else if (i.customId === 'close_with_zip') {
                await i.update({
                    content: 'Ticket arşivi (ZIP) oluşturuluyor...',
                    components: []
                });

                try {
                    const ticketDir = path.join(__dirname, '../tickets');
                    const ticketFilePath = path.join(ticketDir, `${channel.name}.zip`);

                    if (!fs.existsSync(ticketDir)) {
                        fs.mkdirSync(ticketDir, { recursive: true });
                    }

                    const output = fs.createWriteStream(ticketFilePath);
                    const archive = archiver('zip', {
                        zlib: { level: 9 }
                    });

                    archive.pipe(output);

                    const messages = await channel.messages.fetch({ limit: 100 });
                    let messageLog = 'Ticket Geçmişi\n\n';

                    messages.reverse().forEach(msg => {
                        const time = new Date(msg.createdTimestamp).toLocaleString();
                        const content = msg.content || "[Mesaj içeriği yok (Muhtemelen bir embed veya dosya)]"; 
                        messageLog += `[${time}] ${msg.author.tag}: ${content}\n\n`;
                    });

                    archive.append(messageLog, { name: 'messages.txt' });

                    const transcript = await discordTranscripts.createTranscript(channel, {
                        limit: 100,
                        fileName: 'transcript.html',
                        poweredBy: false,
                        saveImages: true
                    });

                    const transcriptPath = path.join(ticketDir, 'transcript-temp.html');
                    fs.writeFileSync(transcriptPath, await transcript.arrayBuffer());

                    archive.file(transcriptPath, { name: 'transcript.html' });

                    await archive.finalize();

                    await new Promise(resolve => {
                        output.on('close', resolve);
                    });

                    if (fs.existsSync(transcriptPath)) {
                        fs.unlinkSync(transcriptPath);
                    }

                    const transcriptChannelId = config.transcriptChannelId || config.logChannelId;
                    if (transcriptChannelId) {
                        const transcriptChannel = guild.channels.cache.get(transcriptChannelId);
                        if (transcriptChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('Destek Talebi Kapatıldı - ZIP Arşivi')
                                .setDescription(
                                    `**Kanal:** ${channel.name}\n` +
                                    `**Kapatan:** ${user}\n` +
                                    `**Zaman:** ${new Date().toLocaleString()}`
                                )
                                .setTimestamp();

                            const zipAttachment = new AttachmentBuilder(ticketFilePath, {
                                name: `${channel.name}.zip`,
                                description: `${channel.name} kanalının arşivi`
                            });

                            await transcriptChannel.send({
                                embeds: [logEmbed],
                                files: [zipAttachment]
                            });
                        }
                    }

                    await channel.send({
                        content: 'Ticket arşivi ZIP olarak oluşturuldu ve kaydedildi. Bu kanal 5 saniye içinde silinecek...'
                    });

                    if (fs.existsSync(ticketFilePath)) {
                        fs.unlinkSync(ticketFilePath);
                    }

                } catch (err) {
                    console.error('ZIP archive creation error:', err);
                    await channel.send('ZIP arşivi oluşturulurken bir hata oluştu. Kanal yine de kapatılacak.');
                }

                setTimeout(async () => {
                    try {
                        await channel.delete();
                    } catch (err) {
                        console.error('Error deleting channel:', err);
                    }
                }, 5000);

            } else if (i.customId === 'cancel_close') {
                await i.update({
                    content: 'Ticket kapatma işlemi iptal edildi.',
                    components: []
                });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: 'Ticket kapatma işlemi zaman aşımına uğradı.',
                    components: []
                });
            }
        });
    } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.reply({
            content: 'Destek talebi kapatılırken bir hata oluştu.',
            ephemeral: true
        });
    }
}

module.exports = {
    handleTicketCreation,
    handleTicketCategory,
    handleTicketClose
};

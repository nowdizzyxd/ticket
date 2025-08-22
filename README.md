# Ticket (with NowDizzy)

Türkçe arayüze sahip, kolay kurulumlu ticket (destek talebi) botu.

## Özellikler

- Slash komut desteği (`/setup`, `/ping`)
- Legacy komut desteği (`.setup`, `.ping`)
- Destek talebi oluşturma butonu
- Destek türü seçme menüsü (Partnerlik, Destek, Bot)
- Transcript (döküm) özelliği (HTML formatında)
- ZIP arşivleme özelliği
- Ayarlanabilir konfigürasyon (config.json)

## Kurulum

1. config.json dosyasını açın ve gerekli ayarları yapın:

```json
{
    "token": "DISCORD_BOT_TOKEN",
    "prefix": ".",
    "logChannelId": "LOG_KANAL_ID",
    "categoryId": "KATEGORI_ID",
    "supportRoleId": "DESTEK_ROL_ID",
    "transcriptChannelId": "TRANSKRIPT_KANAL_ID",
    "botName": "Bot ismi"
}
```

- `token`: Discord bot token'i (varsayılan olarak ortam değişkeninden alınır, boş bırakılabilir)
- `prefix`: Legacy komutlar için ön ek (varsayılan: `.`)
- `logChannelId`: Log mesajlarının gönderileceği kanal ID
- `categoryId`: Ticket kanallarının oluşturulacağı kategori ID
- `supportRoleId`: Ticket kanallarına erişim verilecek rol ID
- `transcriptChannelId`: Ticket dökümlerinin gönderileceği kanal ID (boş bırakılırsa log kanalı kullanılır)
- `botName`: Bot ismi

2. Node.js modüllerini kurun:

```
npm install discord.js discord-html-transcripts archiver fs
```

3. Botu başlatın:

```
node index.js
```

## Kullanım

1. `.setup` veya `/setup` komutunu kullanarak ticket sistemini kurabilirsiniz. Bu komut, bir mesaj ve "Destek Talebi Oluştur" butonu oluşturacaktır.

2. `.ping` veya `/ping` komutunu kullanarak botun yanıt süresini ölçebilirsiniz.

3. Kullanıcılar "Destek Talebi Oluştur" butonuna tıkladığında, destek türünü seçebilecekleri bir menü görüntülenecektir.

4. Destek talebi kapatılırken, kullanıcılar HTML döküm veya ZIP arşivi oluşturma seçeneğine sahip olacaktır.

## Geliştirici

NowDizzy (nowdizzyxd) (id = 1233853570546270208)

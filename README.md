[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![logo](https://github.com/user-attachments/assets/adcad4ff-7755-4d9d-abe6-821cdd472fa0)

# 🤖 RevoBot (Discord Music Bot)

This repository is a **direct continuation** of the original project [eritislami/evobot](https://github.com/eritislami/evobot).
The original codebase has been preserved, but we are continuing its development with improvements, updated dependencies, compatibility adjustments for modern libraries, and bug fixes. Our goal is to keep the bot functional, up to date, and to introduce new features as needed by the community.
All credit for the original foundation goes to the contributors of the original project. This version aims to maintain that work while evolving it to meet current needs.

> RevoBot is a Discord Music Bot built with TypeScript, discord.js & uses Command Handler from [discordjs.guide](https://discordjs.guide)

## Requirements

1. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**  
   1.1. Enable 'Message Content Intent' in Discord Developer Portal
2. Node.js 20.x or newer

## 🚀 Getting Started

```sh
git clone https://github.com/eritislami/revobot.git
cd revobot
npm install
```

After installation finishes follow configuration instructions then run `npm run start` to start the bot.

## ⚙️ Configuration

Copy or Rename `config.json.example` to `config.json` and fill out the values:

⚠️ **Note: Never commit or share your token or api keys publicly** ⚠️

```json
{
  "TOKEN": "",
  "MAX_PLAYLIST_SIZE": 10,
  "PRUNING": false,
  "LOCALE": "en",
  "DEFAULT_VOLUME": 100,
  "STAY_TIME": 30
}
```

## 📝 Features & Commands

- 🎶 Play music from YouTube via url

`/play https://www.youtube.com/watch?v=GLvohMXgcBo`

- 🔎 Play music from YouTube via search query

`/play under the bridge red hot chili peppers`

- 🔎 Search and select music to play

`/search Pearl Jam`

- 📃 Play youtube playlists via url

`/playlist https://www.youtube.com/watch?v=YlUKcNNmywk&list=PL5RNCwK3GIO13SR_o57bGJCEmqFAwq82c`

- 🔎 Play youtube playlists via search query

`/playlist linkin park meteora`

- Now Playing (/nowplaying)
- Queue system (/queue)
- Loop / Repeat (/loop)
- Shuffle (/shuffle)
- Volume control (/volume)
- Lyrics (/lyrics)
- Pause (/pause)
- Resume (/resume)
- Skip (/skip)
- Skip to song # in queue (/skipto)
- Move a song in the queue (/move)
- Remove song # from queue (/remove)
- Show ping to Discord API (/ping)
- Show bot uptime (/uptime)
- Toggle pruning of bot messages (/pruning)
- Help (/help)
- Command Handler from [discordjs.guide](https://discordjs.guide/)
- Media Controls via Buttons

![image](https://github.com/user-attachments/assets/d88e2eeb-9589-45c6-b54c-a4b4cfb846e4)


## 🌎 Locales

Currently available locales are:

- English (en)
- Arabic (ar)
- Brazilian Portuguese (pt_br)
- Bulgarian (bg)
- Romanian (ro)
- Czech (cs)
- Dutch (nl)
- French (fr)
- German (de)
- Greek (el)
- Indonesian (id)
- Italian (it)
- Japanese (ja)
- Korean (ko)
- Minionese (mi)
- Persian (fa)
- Polish (pl)
- Russian (ru)
- Simplified Chinese (zh_cn)
- Singaporean Mandarin (zh_sg)
- Spanish (es)
- Swedish (sv)
- Traditional Chinese (zh_tw)
- Thai (th)
- Turkish (tr)
- Ukrainian (uk)
- Vietnamese (vi)
- Check [Contributing](#-contributing) if you wish to help add more languages!
- For languages please use [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) two letter format

## 🤝 Contributing

1. [Fork the repository](https://github.com/cesarzxk/revobot/fork)
2. Clone your fork: `git clone https://github.com/your-username/revobot.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Stage changes `git add .`
5. Commit your changes: `cz` OR `npm run commit` do not use `git commit`
6. Push to the branch: `git push origin my-new-feature`
7. Submit a pull request

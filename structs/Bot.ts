import {
  ApplicationCommandDataResolvable,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  Interaction,
  REST,
  Routes,
  Snowflake
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "../interfaces/Command";
import { checkPermissions, PermissionResult } from "../utils/checkPermissions";
import { config } from "../utils/config";
import { i18n } from "../utils/i18n";
import { MissingPermissionsException } from "../utils/MissingPermissionsException";
import { MusicQueue } from "./MusicQueue";
import { pausePlayer } from "../utils/pause";
import { resumePlayer } from "../utils/resume";

import NodeCache from "node-cache";

export const antiSpamCache = new NodeCache();

export class Bot {
  public readonly prefix = "/";
  public commands = new Collection<string, Command>();
  public slashCommands = new Array<ApplicationCommandDataResolvable>();
  public slashCommandsMap = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();
  public queues = new Collection<Snowflake, MusicQueue>();
  public lastChannelId = "";

  public constructor(public readonly client: Client) {
    this.client.login(config.TOKEN);

    this.client.on("ready", () => {
      console.log(`${this.client.user!.username} ready!`);

      this.registerSlashCommands();
    });

    this.client.on("warn", (info) => console.log(info));
    this.client.on("error", console.error);

    this.onVoiceStateUpdate();
    this.onInteractionCreate();
  }

  private async registerSlashCommands() {
    const rest = new REST({ version: "9" }).setToken(config.TOKEN);

    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));

    for (const file of commandFiles) {
      const command = await import(join(__dirname, "..", "commands", `${file}`));

      this.slashCommands.push(command.default.data);
      this.slashCommandsMap.set(command.default.data.name, command.default);
    }

    await rest.put(Routes.applicationCommands(this.client.user!.id), { body: this.slashCommands });
  }

  private async onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
      if (!interaction.isChatInputCommand()) return;
      this.lastChannelId = interaction.channelId;

      const command = this.slashCommandsMap.get(interaction.commandName);

      if (!command) return;

      if (!this.cooldowns.has(interaction.commandName)) {
        this.cooldowns.set(interaction.commandName, new Collection());
      }

      const now = Date.now();
      const timestamps = this.cooldowns.get(interaction.commandName)!;
      const cooldownAmount = (command.cooldown || 1) * 1000;

      const timestamp = timestamps.get(interaction.user.id);

      if (timestamp) {
        const expirationTime = timestamp + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: i18n.__mf("common.cooldownMessage", {
              time: timeLeft.toFixed(1),
              name: interaction.commandName
            }),
            flags: "Ephemeral"
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        const permissionsCheck: PermissionResult = await checkPermissions(command, interaction);

        if (permissionsCheck.result) {
          command.execute(interaction as ChatInputCommandInteraction);
        } else {
          throw new MissingPermissionsException(permissionsCheck.missing);
        }
      } catch (error: any) {
        if (error.message.includes("permissions")) {
          interaction.reply({ content: error.toString(), flags: "Ephemeral" }).catch(console.error);
        } else {
          interaction.reply({ content: i18n.__("common.errorCommand"), flags: "Ephemeral" }).catch(console.error);
        }
      }
    });
  }

  private async onVoiceStateUpdate() {
    this.client.on("voiceStateUpdate", (oldState, newState) => {
      const botVoiceChannel = newState?.guild?.members?.me?.voice.channel;
      const guild = newState.guild;
      const userChangedChannel = oldState.channelId != newState.channelId;

      if (!botVoiceChannel) return;
      if (userChangedChannel) return;

      if (newState.channelId === botVoiceChannel.id) {
        const members = botVoiceChannel.members.filter((member) => !member.user.bot);
        const allDeaf = members.every((member) => member.voice.selfDeaf);
        const channel = guild.channels.cache.find((ch) => ch.id === this.lastChannelId);

        const isChannelTextBased = channel?.isTextBased();

        if (allDeaf && members.size > 0 && isChannelTextBased) {
          pausePlayer(newState.guild.id, members.first()!.id);
          if (!antiSpamCache.has(`muted-${guild.id}`)) {
            channel?.send(i18n.__("pause.everybodydeaf"));
            antiSpamCache.set(`muted-${guild.id}`, true, 5);
          }
        } else {
          resumePlayer(newState.guild.id, members.first()!.id);
        }
      }
    });
  }
}

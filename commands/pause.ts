import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { i18n } from "../utils/i18n";
import { safeReply } from "../utils/safeReply";
import { pausePlayer } from "../utils/pause";

export default {
  data: new SlashCommandBuilder().setName("pause").setDescription(i18n.__("pause.description")),
  execute(interaction: ChatInputCommandInteraction) {
    const { success, message } = pausePlayer(interaction.guild!.id, interaction.user.id);
    safeReply(interaction, message);
    return success;
  }
};

// utils/resumePlayer.ts
import { bot } from "../index";
import { i18n } from "../utils/i18n";
import { canModifyQueue } from "../utils/queue";

export function resumePlayer(guildId: string, userId: string) {
  const guild = bot.client.guilds.cache.get(guildId);
  if (!guild) return { success: false, message: "Guild not found" };

  const member = guild.members.cache.get(userId);
  if (!member) return { success: false, message: i18n.__("common.errorNotChannel") };

  const queue = bot.queues.get(guildId);
  if (!queue) return { success: false, message: i18n.__("resume.errorNotQueue") };

  if (!canModifyQueue(member)) return { success: false, message: i18n.__("common.errorNotChannel") };

  if (queue.player.unpause()) {
    const message = i18n.__mf("resume.resultNotPlaying", { author: userId });
    return { success: true, message };
  }

  return { success: false, message: i18n.__("resume.errorPlaying") };
}

import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import youtube from "youtube-sr";
import { i18n } from "../utils/i18n";
import { videoPattern, isURL } from "../utils/patterns";
import ytdl from "@distube/ytdl-core";

export interface SongData {
  url: string;
  title: string;
  duration: number;
}

export class Song {
  public readonly url: string;
  public readonly title: string;
  public readonly duration: number;

  public constructor({ url, title, duration }: SongData) {
    this.url = url;
    this.title = title;
    this.duration = duration;
  }

  public static async from(url: string = "", search: string = "") {
    const isYoutubeUrl = videoPattern.test(url);

    let songInfo;

    if (isYoutubeUrl) {
      songInfo = await ytdl.getInfo(url);

      return new this({
        url: songInfo.videoDetails?.video_url,
        title: songInfo.videoDetails.title,
        duration: parseInt(songInfo.videoDetails.lengthSeconds)
      });
    } else {
      const result = await youtube.searchOne(search);

      result ? null : console.log(`No results found for ${search}`);

      if (!result) {
        let err = new Error(`No search results found for ${search}`);

        err.name = "NoResults";

        if (isURL.test(url)) err.name = "InvalidURL";

        throw err;
      }

      songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);

      return new this({
        url: songInfo.videoDetails?.video_url,
        title: songInfo.videoDetails?.title,
        duration: parseInt(songInfo.videoDetails?.lengthSeconds)
      });
    }
  }

  public async makeResource(): Promise<AudioResource<Song | null> | void> {
    let playStream;

    const source = this.url.includes("youtube") ? "youtube" : "soundcloud";

    try {
      if (source === "youtube") {
        const info = await ytdl.getInfo(this.url); // Obtém metadados do vídeo

        playStream = await ytdl(this.url, {
          filter: "audioonly", // Filtra apenas o áudio
          quality: "highestaudio", // Pega a melhor qualidade disponível
          highWaterMark: 1 << 25 // Evita buffering
        });
      }
    } catch (e) {
      console.log(e);
    }

    if (!playStream || playStream === null) {
      return;
    }

    return createAudioResource<any>(playStream, { metadata: this });
  }

  public startMessage() {
    return i18n.__mf("play.startedPlaying", { title: this.title, url: this.url });
  }
}

import { AudioResource, createAudioResource } from "@discordjs/voice";
import youtube from "youtube-sr";
import { i18n } from "../utils/i18n";
import { videoPattern, isURL } from "../utils/patterns";
import { Innertube, Platform, Types } from "youtubei.js";

import { PassThrough, Readable } from "stream";
import { spawn } from "child_process";
const path = require("path");
const fs = require("fs");
import ffmpeg from "fluent-ffmpeg";
import ytdl from "@distube/ytdl-core";

function webStreamToNodeReadable(webStream: ReadableStream<Uint8Array>) {
  return Readable.fromWeb(webStream as any);
}

Platform.shim.eval = async (data: Types.BuildScriptResult) => {
  return new Function(data.output)();
};

// const innertube = await Innertube.create({ generate_session_locally: true });

let innertube: Innertube | null = null;

async function getInnertube() {
  if (!innertube) {
    innertube = await Innertube.create({});
  }

  return innertube;
}

export interface SongData {
  url: string;
  title: string;
  duration: number;
  soundPath?: string;
  meta?: any;
}

export class Song {
  public url: string;
  public title: string;
  public duration: number;
  public soundPath: string | undefined;
  private meta: any;

  public constructor({ url, title, duration, soundPath, meta }: SongData) {
    this.url = url;
    this.title = title;
    this.duration = duration;
    this.soundPath = soundPath;
    this.meta = meta;
  }

  public static async from(url: string = "", search: string = "") {
    const isYoutubeUrl = videoPattern.test(url);
    const isSpotify = url.includes("spotify");
    const innertube = await Innertube.create({ generate_session_locally: true });

    let songInfo;

    if (isSpotify) {
      const result = (await new Promise(async (resolve, reject) => {
        let soundPath = path.join(__dirname, "../", ``);
        const command = `/venv/bin/spotdl --output ${soundPath} download ${url}`;
        let fileName = "";
        let meta: any;
        let title = "";

        const processo = spawn(command, { shell: true });

        processo.stderr.on("data", (data) => {
          reject();
        });

        processo.stdout.on("data", (data) => {
          if (data.toString().includes("Skipping")) {
            fileName = data.toString().replace("Skipping", "");
            fileName = fileName.split("(")[0];
            fileName = fileName.trim();
            fileName = fileName + ".mp3";
          }

          if (data.toString().includes("Downloaded")) {
            fileName = data.toString().split(`"`);
            fileName = fileName[1];
            fileName = fileName + ".mp3";
          }
        });

        processo.on("close", async (code) => {
          soundPath = path.join(__dirname, "../", `${fileName}`);

          ffmpeg.ffprobe(soundPath, (err: any, metadata: any) => {
            if (err) {
              return reject("Erro ao obter informações do arquivo de áudio: " + err.message);
            }

            title = fileName.replace(".mp3", "");

            if (!fs.existsSync(soundPath)) {
              console.log("❌ Esse som não existe!");
            }

            meta = metadata.format; // Duração do áudio em segundos
            resolve({ title: fileName, meta, soundPath });
          });
        });
      })) as any;

      return new this({
        url: url ?? "",
        ...result
      });
    }

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
    let result;
    const isSpotify = this.url.includes("spotify");
    const source = this.url.includes("youtube") ? "youtube" : "soundcloud";

    try {
      const id = this.url.split("v=")[1];

      if (source === "youtube") {
        const webStream = (await getInnertube()).download(id, {
          type: "audio",
          client: "TV"
        });

        result = webStreamToNodeReadable(await webStream);
      }

      playStream = await ffmpeg(result)
        .audioCodec("libopus")
        .audioFrequency(48000)
        .toFormat("opus")
        .on("start", (cmd) => console.log("FFmpeg iniciado:", cmd))
        .on("error", (err) => console.error("Erro no FFmpeg:", err))
        .on("end", () => console.log("FFmpeg finalizado."))
        .pipe(new PassThrough());
    } catch (e: any) {
      console.log("error:", e);
    }

    if (!playStream || playStream === null) {
      return;
    }

    return createAudioResource<any>(playStream as any, { metadata: this });
  }

  public startMessage() {
    return i18n.__mf("play.startedPlaying", { title: this.title, url: this.url });
  }
}

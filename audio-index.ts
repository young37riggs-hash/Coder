export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: 'wav' | 'mp3' | 'ogg' | 'flac';
}

export class AudioEngine {
  private config: AudioConfig;
  private audioContext: AudioContext | null = null;

  constructor(config: Partial<AudioConfig> = {}) {
    this.config = {
      sampleRate: config.sampleRate ?? 44100,
      channels: config.channels ?? 2,
      bitDepth: config.bitDepth ?? 16,
      format: config.format ?? 'wav',
    };
  }

  async init(): Promise<void> {
    if (typeof AudioContext !== 'undefined' && !this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
    }
  }

  async play(url: string): Promise<void> {
    if (!this.audioContext) await this.init();
    if (!this.audioContext) throw new Error('AudioContext not available');

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  async stop(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }

  getConfig(): AudioConfig {
    return { ...this.config };
  }
}

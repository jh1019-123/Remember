import { SoundTrackId } from '../types';

class StudySoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: SoundTrackId = 'lofi_piano';
  private volume: number = 0.5;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private loopTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): SoundTrackId {
    return this.currentTrack;
  }

  public play(trackId?: SoundTrackId) {
    this.initContext();
    if (trackId) {
      this.currentTrack = trackId;
    }
    this.stopNodes();
    this.isPlaying = true;

    switch (this.currentTrack) {
      case 'lofi_piano':
        this.startLofiPiano();
        break;
      case 'gentle_rain':
        this.startGentleRain();
        break;
      case 'alpha_wave':
        this.startAlphaWave();
        break;
      case 'white_noise':
        this.startWhiteNoise();
        break;
      case 'night_chimes':
        this.startNightChimes();
        break;
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopNodes();
  }

  private stopNodes() {
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    for (const item of this.activeNodes) {
      if (typeof item === 'number') {
        window.clearTimeout(item);
      } else {
        try {
          if ('stop' in item && typeof (item as AudioScheduledSourceNode).stop === 'function') {
            (item as AudioScheduledSourceNode).stop();
          }
          item.disconnect();
        } catch {
          // ignore disconnect errors on ended nodes
        }
      }
    }
    this.activeNodes = [];
  }

  /* 1. Lo-Fi Study Chords */
  private startLofiPiano() {
    if (!this.ctx || !this.masterGain) return;

    // Chord progressions in frequency (Hz)
    // 1: Cmaj9 (C3, E3, G3, B3, D4)
    // 2: Am9   (A2, C3, E3, G3, B3)
    // 3: Dm9   (D3, F3, A3, C4, E4)
    // 4: G13   (G2, F3, B3, E4)
    const chords = [
      [130.81, 164.81, 196.00, 246.94, 293.66],
      [110.00, 130.81, 164.81, 196.00, 246.94],
      [146.83, 174.61, 220.00, 261.63, 329.63],
      [98.00, 174.61, 246.94, 329.63]
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      currentChord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Mellow triangle/sine blend for warm Rhodes/piano feel
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        // Lowpass filter for warm, cozy lo-fi texture
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + Math.random() * 200, now);
        filter.Q.setValueAtTime(1.5, now);

        // Slow attack and long gentle decay
        const startTime = now + i * 0.04;
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.08 / (i + 1), startTime + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 4.5);
      });
    };

    playChord();
    this.loopTimer = window.setInterval(playChord, 4600);
  }

  /* 2. Gentle Rain */
  private startGentleRain() {
    if (!this.ctx || !this.masterGain) return;

    // Buffer with pink noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoiseSource = this.ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    whiteNoiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoiseSource.start();
    this.activeNodes.push(whiteNoiseSource, filter, rainGain);

    // Periodic soft raindrop droplets
    const playDroplet = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const dropFilter = this.ctx.createBiquadFilter();

      const freq = 1200 + Math.random() * 1400;
      const now = this.ctx.currentTime;

      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(freq, now);
      dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);

      dropFilter.type = 'bandpass';
      dropFilter.frequency.setValueAtTime(freq, now);

      dropGain.gain.setValueAtTime(0.012, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      dropOsc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(this.masterGain);

      dropOsc.start(now);
      dropOsc.stop(now + 0.15);
    };

    this.loopTimer = window.setInterval(playDroplet, 600);
  }

  /* 3. Alpha Wave Focus (432Hz & Binaural Beat) */
  private startAlphaWave() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Carrier 432 Hz
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, now); // Warm base octave

    // Binaural offset for 10Hz Alpha state
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(226, now);

    // Gentle sub-bass
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(108, now);

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const subGain = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.08, now);
    gain2.gain.setValueAtTime(0.08, now);
    subGain.gain.setValueAtTime(0.04, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    subOsc.connect(subGain);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    subGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    subOsc.start();

    this.activeNodes.push(osc1, osc2, subOsc, gain1, gain2, subGain);
  }

  /* 4. White Noise / Muffled Library */
  private startWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, noiseGain);
  }

  /* 5. Night Sky Pentatonic Chimes */
  private startNightChimes() {
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6

    const playRandomChime = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.8);
    };

    playRandomChime();
    this.loopTimer = window.setInterval(playRandomChime, 2200);
  }

  /* Play gentle chime for study alerts */
  public playCompletionChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - High C
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.15;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  }
}

export const soundEngine = new StudySoundEngine();

export const STUDY_TRACKS: { id: SoundTrackId; name: string; description: string }[] = [
  { id: 'lofi_piano', name: '차분한 로파이 피아노', description: '따뜻한 재즈 코드로 마음을 안정시키는 공부 음악' },
  { id: 'gentle_rain', name: '창가에 내리는 봄비', description: '창밖 빗소리와 빗방울로 잡념을 없애는 소리' },
  { id: 'alpha_wave', name: '집중 딥포커스 432Hz', description: '기억력과 집중력을 깨우는 알파파 바이노럴 사운드' },
  { id: 'white_noise', name: '조용한 도서관 소음', description: '주변 소음을 덮어주는 잔잔한 화이트 노이즈' },
  { id: 'night_chimes', name: '밤하늘 앰비언트 차임', description: '맑고 고요한 공명으로 뇌를 맑게 하는 차임벨' },
];

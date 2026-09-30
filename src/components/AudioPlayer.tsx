import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Timer, Sparkles, X } from 'lucide-react';
import { soundEngine, STUDY_TRACKS } from '../utils/soundEngine';
import { SoundTrackId } from '../types';

interface AudioPlayerProps {
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<SoundTrackId>('lofi_piano');
  const [volume, setVolume] = useState<number>(0.5);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  // Timer states
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [timerInitialMinutes, setTimerInitialMinutes] = useState<number>(25);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = window.setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            soundEngine.playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundEngine.stop();
      setIsPlaying(false);
    } else {
      soundEngine.play(currentTrack);
      setIsPlaying(true);
    }
  };

  const handleChangeTrack = (trackId: SoundTrackId) => {
    setCurrentTrack(trackId);
    if (isPlaying) {
      soundEngine.play(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleStartTimer = (minutes: number) => {
    setTimerInitialMinutes(minutes);
    setTimerSecondsLeft(minutes * 60);
    setIsTimerRunning(true);
    setShowTimerModal(false);

    // Auto start music if not playing
    if (!isPlaying) {
      soundEngine.play(currentTrack);
      setIsPlaying(true);
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(null);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeTrackObj = STUDY_TRACKS.find((t) => t.id === currentTrack) || STUDY_TRACKS[0];

  return (
    <div className="relative">
      {/* Mini Player Bar */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-slate-700/60 shadow-sm text-xs">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
            isPlaying ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? 'BGM 일시정지' : '집중 BGM 재생'}
          aria-label={isPlaying ? 'BGM 일시정지' : '집중 BGM 재생'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Track Info & Popover Trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[190px] text-left hover:text-indigo-200 transition-colors"
        >
          <Music className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="truncate font-medium text-slate-200">{activeTrackObj.name}</span>
        </button>

        {/* Visualizer bars when playing */}
        {isPlaying && (
          <div className="hidden sm:flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
            <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
            <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
          </div>
        )}

        {/* Volume popover trigger / slider */}
        <div className="hidden md:flex items-center gap-1.5 pl-1 border-l border-slate-700">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            title="볼륨 조절"
          />
        </div>

        {/* Pomodoro Timer Badge */}
        {timerSecondsLeft !== null && (
          <button
            onClick={() => setShowTimerModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono font-semibold text-[11px] tracking-tight hover:bg-indigo-900 transition-colors"
          >
            <Timer className="w-3 h-3 text-indigo-400" />
            <span>{formatTimer(timerSecondsLeft)}</span>
          </button>
        )}

        {timerSecondsLeft === null && (
          <button
            onClick={() => setShowTimerModal(true)}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            title="집중 타이머 설정"
            aria-label="집중 타이머 설정"
          >
            <Timer className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Track Selector Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                공부 집중 BGM 선택
              </span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-1">
              {STUDY_TRACKS.map((track) => {
                const isSelected = track.id === currentTrack;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      handleChangeTrack(track.id);
                      if (!isPlaying) {
                        soundEngine.play(track.id);
                        setIsPlaying(true);
                      }
                      setShowMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-100 text-indigo-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isSelected ? 'text-indigo-700 font-semibold' : ''}`}>
                        {track.name}
                      </span>
                      {isSelected && isPlaying && (
                        <span className="text-[10px] text-indigo-600 font-medium">재생 중</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{track.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 px-2.5 pb-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">볼륨</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </>
      )}

      {/* Focus Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">뽀모도로 집중 타이머</h3>
                  <p className="text-xs text-slate-500">BGM과 함께 공부에 몰입해보세요</p>
                </div>
              </div>
              <button
                onClick={() => setShowTimerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {timerSecondsLeft !== null ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-4xl font-bold font-mono tracking-tight text-indigo-600">
                    {formatTimer(timerSecondsLeft)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {timerSecondsLeft === 0 ? '집중 시간이 종료되었습니다! 수고하셨어요.' : '현재 집중 시간 진행 중'}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {isTimerRunning ? (
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        일시정지
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTimerRunning(true)}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                      >
                        계속하기
                      </button>
                    )}
                    <button
                      onClick={handleStopTimer}
                      className="px-4 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      타이머 리셋
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-600">집중 시간 선택</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 25, 50].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleStartTimer(mins)}
                        className="py-3 px-2 text-center rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                      >
                        <div className="text-lg font-bold text-slate-800 group-hover:text-indigo-600">{mins}분</div>
                        <div className="text-[11px] text-slate-500">
                          {mins === 25 ? '추천 집중' : mins === 50 ? '깊은 몰입' : '짧은 암기'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTimerModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/assetUrl';

interface Props {
  src: string;
  label?: string;
  autoResetKey?: string | number;
}

export default function AudioPlayer({ src, label = '오디오', autoResetKey }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const url = assetUrl(src);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
    setError(false);
  }, [autoResetKey, url]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onErr = () => setError(true);
    a.addEventListener('ended', onEnded);
    a.addEventListener('pause', onPause);
    a.addEventListener('play', onPlay);
    a.addEventListener('error', onErr);
    return () => {
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('error', onErr);
    };
  }, [url]);

  async function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      return;
    }
    try {
      await a.play();
    } catch {
      setError(true);
    }
  }

  function replay() {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    void a.play().then(() => setPlaying(true)).catch(() => setError(true));
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="audio-controls">
        <button type="button" className="action primary audio-btn" onClick={() => void toggle()}>
          {playing ? '⏸ 일시정지' : `▶ ${label} 재생`}
        </button>
        <button type="button" className="action audio-btn secondary" onClick={replay}>
          ↻ 다시 듣기
        </button>
      </div>
      {error && <p className="hint">오디오를 불러오지 못했습니다. 네트워크를 확인해 주세요.</p>}
    </div>
  );
}

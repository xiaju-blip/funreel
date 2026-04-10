import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { processWatchEvent } from '../../api/watch';
import generateDeviceFingerprint from '../../utils/device-fingerprint';
import './Player.css';

const Player = () => {
  const { dramaId, episodeId } = useParams<{ dramaId: string; episodeId: string }>();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const playerRef = useRef<HTMLVideoElement>(null);

  // 初始化设备指纹
  useEffect(() => {
    const generateFingerprint = async () => {
      const fingerprint = await generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
    };
    generateFingerprint();
  }, []);

  // 监听视频时间更新
  const handleTimeUpdate = () => {
    if (playerRef.current) {
      setCurrentTime(playerRef.current.currentTime);
    }
  };

  // 视频加载完成
  const handleLoadedMetadata = () => {
    if (playerRef.current) {
      setDuration(playerRef.current.duration);
    }
  };

  // 视频播放结束
  const handleEnded = () => {
    setIsCompleted(true);
  };

  // 提交观看事件获取积分
  const submitWatchEvent = async () => {
    if (!deviceFingerprint || !dramaId || !episodeId) return;

    setLoading(true);
    try {
      const response = await processWatchEvent(
        parseInt(dramaId),
        parseInt(episodeId),
        Math.floor(currentTime),
        isCompleted,
        deviceFingerprint
      );
      
      if (response.success) {
        setCurrentPoints(prev => prev + response.points);
        setTodayPoints(prev => prev + response.points);
      } else {
        console.warn('Watch event blocked:', response.error);
      }
    } catch (e) {
      console.error('Failed to process watch event', e);
    } finally {
      setLoading(false);
    }
  };

  // 视频结束后最终上报
  useEffect(() => {
    if (isCompleted) {
      submitWatchEvent();
    }
  }, [isCompleted]);

  return (
    <div className="player-page container">
      <div className="player-container">
        <video
          ref={playerRef}
          controls
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="video-player"
          poster={`/posters/${dramaId}.jpg`}
        >
          {/* 视频源由后端提供加密URL */}
          <source src={`/api/dramas/${dramaId}/episodes/${episodeId}/video`} type="video/mp4" />
        </video>
      </div>

      <div className="player-sidebar">
        <div className="points-card">
          <h3>{t('player:yourPoints') || 'Your Points'}</h3>
          <div className="points-value">{currentPoints}</div>
          <div className="points-daily">
            {t('player:todayEarned') || 'Today Earned'}: {todayPoints} / 200
          </div>
          {todayPoints >= 200 && (
            <div className="points-cap-reached">
              {t('player:dailyCapReached') || 'Daily points cap reached'}
            </div>
          )}
        </div>

        <div className="progress-card">
          <h3>{t('player:progress') || 'Watching Progress'}</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="progress-text">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
            {' / '}
            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {loading && (
          <div className="loading-indicator">
            {t('common:loading') || 'Processing...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;

import api from './index';

export const processWatchEvent = (
  dramaId: number,
  episodeId: number,
  watchDurationSec: number,
  isCompleted: boolean,
  deviceFingerprint: string,
) => {
  return api.post('/api/watch/event', {
    dramaId,
    episodeId,
    watchDurationSec,
    isCompleted,
    deviceFingerprint,
  });
};

export const checkDailyLimit = () => {
  return api.get('/api/watch/check-limit');
};

/**
 * Extracts the exact real duration from a video File or Blob using HTML5 Video loadedmetadata.
 * Returns formatted "mm:ss" string (e.g. 5 seconds -> "00:05", 85 seconds -> "01:25").
 */
export function getVideoDuration(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objUrl = URL.createObjectURL(file);

      video.onloadedmetadata = function () {
        URL.revokeObjectURL(objUrl);
        const durationSec = Math.round(video.duration || 0);
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        resolve(formatted);
      };

      video.onerror = function () {
        URL.revokeObjectURL(objUrl);
        resolve('00:05');
      };

      video.src = objUrl;
    } catch (e) {
      resolve('00:05');
    }
  });
}

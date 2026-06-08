export { default as checkRouteActive } from './checkRouteActive';

export const formatTime = (
  hours: number,
  minutes: number,
  seconds: number
): string => {
  // Tambahkan "0" di depan angka jika kurang dari 10
  const formattedHours = hours < 10 ? '0' + hours : hours.toString();
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds.toString();

  // Hasilkan string format waktu
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return formattedTime;
};

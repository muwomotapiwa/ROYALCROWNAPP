export const MEETING_TIMEZONE = 'Africa/Johannesburg';
export const MEETING_DAYS = [2, 3]; // Tuesday, Wednesday

const buildDateForTime = (baseDate, hour, minute) =>
  new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute, 0, 0);

export const getSastNow = () =>
  new Date(new Date().toLocaleString('en-US', { timeZone: MEETING_TIMEZONE }));

export const getMeetingState = (now = getSastNow()) => {
  const isMeetingDay = MEETING_DAYS.includes(now.getDay());
  const meetingStart = buildDateForTime(now, 20, 15);
  const meetingReady = buildDateForTime(now, 20, 10);
  const meetingEnd = buildDateForTime(now, 22, 0);
  const musicPause = buildDateForTime(now, 20, 13);

  const isMeetingWindow = isMeetingDay && now >= meetingReady && now <= meetingEnd;
  const showCountdown = isMeetingDay && now < meetingReady;
  const isMusicPaused = isMeetingDay && now >= musicPause && now <= meetingEnd;
  const secondsUntilStart = Math.max(0, Math.floor((meetingStart - now) / 1000));

  return {
    now,
    isMeetingDay,
    meetingStart,
    meetingReady,
    meetingEnd,
    isMeetingWindow,
    showCountdown,
    isMusicPaused,
    secondsUntilStart,
  };
};

import { useEffect, useState, useRef } from 'react';
import { onTimerUpdate } from '../../sockets/socket.js';
import { formatTime } from '../../utils/formatCurrency.js';
import { playCountdownSound, stopCountdownSound } from '../../utils/countdownSound.js';
import './timer.css';

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const lastPlayedSecond = useRef(null);
  useEffect(() => {
    const cleanup = onTimerUpdate(({remainingTime}) => {
      setTimeLeft(remainingTime);
    });
    return() => {
      if(cleanup) {
        cleanup();
      }
    };
    },[]);

    useEffect(() => {
    if (timeLeft > 0) {
      if (lastPlayedSecond.current !== timeLeft) {
        playCountdownSound();
        lastPlayedSecond.current = timeLeft;
      }
    }

    if (timeLeft === 0) {
      stopCountdownSound();
      lastPlayedSecond.current = null;
    }
  }, [timeLeft]);

  

  const isLowTime = timeLeft <= 5 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className={`timer ${isLowTime ? 'warning' : ''} ${isTimeUp ? 'expired' : ''}`}>
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      <p className="timer-label">Time Remaining</p>
    </div>
  );
}

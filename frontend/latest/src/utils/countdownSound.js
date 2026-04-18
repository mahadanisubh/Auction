import countdownSound from "../assets/sounds/countdown.mp3";
import playerSoldSound from "../assets/sounds/playerSold.mp3";
import bidSound from "../assets/sounds/bid.wav";
import pauseSound from "../assets/sounds/pause.wav";

const countdownAudio = new Audio(countdownSound);
const soldAudio = new Audio(playerSoldSound);
const bidAudio = new Audio(bidSound);
const pauseAudio = new Audio(pauseSound);

export const playCountdownSound = () => {
  try {
    countdownAudio.currentTime = 0;
    countdownAudio.play();
  } catch (err) {
    console.log("Countdown sound error:", err);
  }
};

export const stopCountdownSound = () => {
  try {
    countdownAudio.pause();
    countdownAudio.currentTime = 0
  } catch (err) {
    console.log("Countdown sound error:", err);
  }
};

export const playPlayerSoldSound = () => {
  try {
    soldAudio.currentTime = 0;
    soldAudio.play();
  } catch (err) {
    console.log("Sold sound error:", err);
  }
};

export const playBidSound = () => {
  stopCountdownSound();
  bidAudio.currentTime = 0;
  bidAudio.play();
};

export const playPauseSound = () => {
  stopCountdownSound();
  pauseAudio.currentTime = 0;
  pauseAudio.play();
}


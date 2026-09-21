// For the design of mechanisms of media player, first of all, I created the basic function of the player, including start, pause buttons，volumes and progress bars. 
// Then I added a loops function, in order to satisfy longer time need.
const music = document.querySelector("#music");
const playButton = document.querySelector("#play-button");
const loopButton = document.querySelector("#loop-button");
const seek = document.querySelector("#seek");
const volume = document.querySelector("#volume");
const musicMessage = document.querySelector("#music-message");

music.volume = 0.5;
music.controls = false;
document.querySelector("#music-controls").hidden = false;

// Turning seconds into minutes seconds,for example: 65 seconds becomes 1:05.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return minutes + ":" + String(remainder).padStart(2, "0");
}


// If playback fails, this displays an error message so the user knows the music has not started.
function showMusicError() {
  musicMessage.textContent = "Cannot play music. Check assets/quiet-moment.mp3.";
}

playButton.addEventListener("click", function () {
  if (music.paused) {
    music.play().catch(showMusicError);
  } else {
    music.pause();
  }
});

music.addEventListener("play", function () {
  playButton.textContent = "Pause";
  musicMessage.textContent = "Playing. Take your time.";
});
music.addEventListener("pause", function () {
  playButton.textContent = "Play";
  musicMessage.textContent = "Music paused.";
});
music.addEventListener("ended", function () {
  playButton.textContent = "Play";
  musicMessage.textContent = "Track finished. Play again whenever you like.";
});
music.addEventListener("error", showMusicError);



// Seeking is enabled after the track duration is available.

function updateProgress() {
  if (Number.isFinite(music.duration) && music.duration > 0) {
    seek.disabled = false;
    seek.value = music.currentTime / music.duration * 100;
    document.querySelector("#elapsed").textContent = formatTime(music.currentTime);
    document.querySelector("#duration").textContent = formatTime(music.duration);
  }
}
music.addEventListener("loadedmetadata", updateProgress);
music.addEventListener("timeupdate", updateProgress);
seek.addEventListener("input", function () {
  music.currentTime = Number(seek.value) / 100 * music.duration;
  updateProgress();
});

// The Volume ranges from 0 to 1. Loop repeats the short recording. 
// // The looping fuction lets the short music continue during longer study sessions, but users can turn it off at anytime.
volume.addEventListener("input", function () {
  music.volume = Number(volume.value) / 100;
});
loopButton.addEventListener("click", function () {
  music.loop = !music.loop;
  loopButton.setAttribute("aria-pressed", music.loop);
  if (music.loop) {
    loopButton.textContent = "Loop: on";
  } else {
    loopButton.textContent = "Loop: off";
  }
});

// The Timer variables: chosen length, time left, and the repeating update task.
const timer = document.querySelector("#timer");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const timerMessage = document.querySelector("#timer-message");
const timeButtons = document.querySelectorAll("[data-minutes]");
let totalSeconds = 25 * 60;
let secondsLeft = totalSeconds;
let interval = null;
let endTime = 0;

function displayTimer() {
  timer.textContent = formatTime(secondsLeft);
}

// Reset and duration selection affect only the timer, not the music.
function resetTimer() {
  clearInterval(interval);
  interval = null;
  secondsLeft = totalSeconds;
  startButton.textContent = "Start timer";
  timerMessage.textContent = "Ready for a fresh start.";
  displayTimer();
}
resetButton.addEventListener("click", resetTimer);

// The presets and custom minutes use the same function, choosing a duration only resets the timer.
// The HTML checks the custom input before the form applies it, which avoids extra duplicate code.

function selectMinutes(minutes) {
  totalSeconds = minutes * 60;
  resetTimer();

  timeButtons.forEach(function (button) {
    const selected = Number(button.dataset.minutes) === minutes;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", selected);
  });

  timerMessage.textContent = minutes + " minutes selected. Timer reset.";
}

timeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectMinutes(Number(button.dataset.minutes));
    document.querySelector("#custom-minutes").value = "";
  });
});

// A form allows both the Set button and Enter key to apply the time.
// HTML checks the minimum, maximum and half-minute step before running.
document.querySelector("#custom-time-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Stay on this page instead of reloading the form.
  const input = document.querySelector("#custom-minutes");
  selectMinutes(Number(input.value));
});


// The timer uses an end time to reduce timing drift between updates.

function updateTimer() {
  secondsLeft = Math.max(0, (endTime - Date.now()) / 1000);
  timer.textContent = formatTime(Math.ceil(secondsLeft));
  if (secondsLeft === 0) {
    clearInterval(interval);
    interval = null;
    startButton.textContent = "Start again";
    timerMessage.textContent = "Session complete. Time for a gentle break.";
    music.pause(); 
  }
}

startButton.addEventListener("click", function () {
  if (interval !== null) {
    updateTimer();
    clearInterval(interval);
    interval = null;
    if (secondsLeft > 0) {
      startButton.textContent = "Resume timer";
      timerMessage.textContent = "Timer paused. Music is controlled separately.";
    }
  } else {
    if (secondsLeft === 0) {
      secondsLeft = totalSeconds;
    }
    endTime = Date.now() + secondsLeft * 1000;
    interval = setInterval(updateTimer, 250);
    startButton.textContent = "Pause timer";
    timerMessage.textContent = "Timer running. Press Play separately to hear music.";
  }
});

  
 
  // A CSS class that switches themes. Refreshing restores light mode because preferences are not saved.

const themeButton = document.querySelector("#theme-button");
themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  themeButton.setAttribute("aria-pressed", dark);
  if (dark) {
    themeButton.textContent = "Day mode";
  } else {
    themeButton.textContent = "Night mode";
  }
});

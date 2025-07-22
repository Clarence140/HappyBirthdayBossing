document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const birthdayMessage = document.querySelector(".candle-count-display");
  const birthdayLettersTab = document.getElementById("birthdayLettersTab");
  const notesContainer = document.getElementById("notesContainer");
  const notesOverlay = document.getElementById("notesOverlay");
  const notesClose = document.querySelector(".notes-close");
  const fairyLights = document.getElementById("fairyLights");
  const giftBoxContainer = document.getElementById("giftBoxContainer");
  const giftBox = document.querySelector(".gift-box");
  const mascot = document.getElementById("mascot");
  const mascotTooltip = document.getElementById("mascotTooltip");
  const instructionModal = document.getElementById("instructionModal");
  const instructionButton = document.getElementById("instructionButton");
  const closeModal = document.querySelector(".close-modal");
  const allowMicBtn = document.getElementById("allowMic");
  const declineMicBtn = document.getElementById("declineMic");
  const floatingTooltip = document.getElementById("floatingTooltip");

  // Variables
  const candles = [];
  let audioContext;
  let analyser;
  let microphone;
  const audio = new Audio("hbd.mp3");
  const confetti = window.confetti;
  let candleCount = 0;
  let micAllowed = false;

  // Initialize
  createFairyLights();
  addInitialCandles();
  initMascotTooltip();

  // Show instructions on first load
  setTimeout(() => {
    instructionModal.classList.add("show");
    document.body.classList.add("no-scroll");
  }, 1000);

  // Instruction modal controls
  instructionButton.addEventListener("click", () => {
    instructionModal.classList.add("show");
    document.body.classList.add("no-scroll");
  });

  closeModal.addEventListener("click", () => {
    closeInstructionModal();
  });

  instructionModal.addEventListener("click", (e) => {
    if (e.target === instructionModal) {
      closeInstructionModal();
    }
  });

  function closeInstructionModal() {
    instructionModal.classList.remove("show");
    document.body.classList.remove("no-scroll");
  }

  // Enhanced tooltip function
  function showTooltip(message) {
    floatingTooltip.textContent = message;
    floatingTooltip.classList.add("show");

    setTimeout(() => {
      floatingTooltip.classList.remove("show");
    }, 4000);
  }

  // Microphone permission handling
  allowMicBtn.addEventListener("click", async () => {
    try {
      micAllowed = true;
      await initMicrophone();
      closeInstructionModal();
      showTooltip(
        "🎤 Microphone access granted! You can now blow the candles! 🕯️"
      );
    } catch (error) {
      console.error("Microphone access error:", error);
      showTooltip(
        "❌ Couldn't access microphone. Click the test button instead! 🔘"
      );
      addTestButton();
      closeInstructionModal();
    }
  });

  declineMicBtn.addEventListener("click", () => {
    micAllowed = false;
    closeInstructionModal();

    // Add test button immediately
    setTimeout(() => {
      addTestButton();
      showTooltip(
        "🔘 Microphone not enabled. Use the test button to blow candles! 💨"
      );
    }, 500);
  });

  async function initMicrophone() {
    if (!micAllowed) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      setInterval(blowOutCandles, 200);
    } catch (error) {
      console.error("Microphone initialization error:", error);
      showTooltip("❌ Microphone setup failed. Using test button instead! 🔘");
      addTestButton();
    }
  }

  // Create fairy lights
  function createFairyLights() {
    const colors = ["#ff9ff3", "#feca57", "#ff6b6b", "#48dbfb"];

    for (let i = 0; i < 25; i++) {
      const light = document.createElement("div");
      light.className = "fairy-light";
      light.style.left = `${Math.random() * 100}%`;
      light.style.top = `${Math.random() * 70}%`;
      light.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      light.style.animationDelay = `${Math.random() * 3}s`;
      fairyLights.appendChild(light);
    }
  }

  // Activate fairy lights
  function activateFairyLights() {
    const lights = document.querySelectorAll(".fairy-light");
    lights.forEach((light) => {
      light.classList.add("active");
    });
  }

  // Show gift box
  function showGiftBox() {
    giftBoxContainer.classList.add("show");

    setTimeout(() => {
      giftBox.classList.add("open");
    }, 1000);
  }

  // Show mascot tooltip automatically
  function showMascotTooltip() {
    mascotTooltip.classList.add("show");

    setTimeout(() => {
      mascotTooltip.classList.remove("show");
    }, 5000);
  }

  // Candle functions
  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(x, y) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = `${x}px`;
    candle.style.top = `${y}px`;

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    candleCount++;
    updateCandleCount();
  }

  function addInitialCandles() {
    addCandle(50, 0);
    addCandle(125, 0);
    addCandle(200, 0);
  }

  function isBlowing() {
    if (!analyser || !micAllowed) return false;

    try {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      return average > 50;
    } catch (error) {
      console.error("Audio analysis error:", error);
      return false;
    }
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (
      candles.length > 0 &&
      candles.some((candle) => !candle.classList.contains("out"))
    ) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out");
            blownOut++;
          }
        });
      }

      if (blownOut > 0) {
        updateCandleCount();
      }

      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(() => {
          triggerConfetti();
          endlessConfetti();
          birthdayMessage.classList.add("fade-in");
          activateFairyLights();
          showGiftBox();
          showMascotTooltip();

          setTimeout(() => {
            birthdayLettersTab.classList.add("visible");
          }, 3000);
        }, 200);

        // Play audio with error handling
        audio.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    }
  }

  function addTestButton() {
    // Check if test button already exists
    if (document.querySelector(".test-btn")) return;

    const testBtn = document.createElement("button");
    testBtn.textContent = "Blow Candles (Test)";
    testBtn.className = "test-btn";

    testBtn.addEventListener("click", () => {
      // Blow out all candles immediately
      candles.forEach((candle) => {
        candle.classList.add("out");
      });

      updateCandleCount();

      // Trigger celebration sequence
      setTimeout(() => {
        triggerConfetti();
        endlessConfetti();
        birthdayMessage.classList.add("fade-in");
        activateFairyLights();
        showGiftBox();
        showMascotTooltip();

        // Show Birthday Letters tab after 3 seconds
        setTimeout(() => {
          birthdayLettersTab.classList.add("visible");
        }, 3000);
      }, 500);

      // Play audio with error handling
      audio.play().catch((error) => {
        console.log("Audio play failed:", error);
      });

      // Remove test button after use
      testBtn.remove();
    });

    document.body.appendChild(testBtn);
  }

  function openNotes() {
    notesContainer.classList.add("open");
    document.body.classList.add("no-scroll");
  }

  function closeNotes() {
    notesContainer.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  // Birthday Letters Tab Event Listeners
  birthdayLettersTab.addEventListener("click", (e) => {
    e.stopPropagation();
    openNotes();
  });

  notesClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeNotes();
  });

  // Click outside to close notes
  notesOverlay.addEventListener("click", (e) => {
    if (e.target === notesOverlay) {
      closeNotes();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && notesContainer.classList.contains("open")) {
      closeNotes();
    }
  });
});

function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

function endlessConfetti() {
  if (!window.confetti) return;

  const interval = setInterval(() => {
    if (document.hidden) {
      clearInterval(interval);
      return;
    }

    window.confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0 },
      colors: [
        "#ff0a54",
        "#ff477e",
        "#ff7096",
        "#ff85a1",
        "#fbb1bd",
        "#f9bec7",
      ],
    });
  }, 2000);
}

function initMascotTooltip() {
  const messages = [
    "Happy Birthday! 💙",
    "Enjoy your day po! ✨",
    "Enjoy every moment! 💖",
    "You deserve all the good things!🌟",
    "Make a wish! 🌟",
    "Celebrate today! 🎉",
  ];

  const tooltip = document.querySelector(".mascot-tooltip");
  let messageIndex = 0;

  // Cycle through messages every 4 seconds
  setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    tooltip.textContent = messages[messageIndex];
  }, 4000);
}
// Commit

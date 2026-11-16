type NetworkInformation = EventTarget & { saveData?: boolean };

const PLAY_THRESHOLD = 0.5;

export function viewportLoop(video: HTMLVideoElement, src: string) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  let inView = false;
  let running = false;
  let generation = 0;
  let frame = 0;

  video.dataset.playState = "waiting";
  video.muted = true;
  video.playbackRate = 1.12;

  function showPlaying() {
    if (!running) return;
    video.classList.add("is-playing");
    video.dataset.playState = "playing";
  }

  video.addEventListener("playing", showPlaying);

  function stop() {
    generation++;
    running = false;
    video.pause();
    if (video.readyState > 0) {
      try {
        video.currentTime = 0;
      } catch {
        // Some browsers cannot seek until metadata arrives.
      }
    }
    video.classList.remove("is-playing");
    video.dataset.playState = motion.matches || connection?.saveData ? "still" : "paused";
  }

  function sync() {
    const shouldPlay = inView && !document.hidden && !motion.matches && !connection?.saveData;
    if (!shouldPlay) {
      if (running) stop();
      else if (motion.matches || connection?.saveData) video.dataset.playState = "still";
      return;
    }
    if (running) return;
    running = true;
    const playGeneration = ++generation;
    video.dataset.playState = "starting";
    if (!video.getAttribute("src")) video.src = src;
    try {
      if (video.readyState > 0) video.currentTime = 0;
      const play = video.play();
      if (play) {
        void play
          .then(() => {
            if (running && generation === playGeneration) showPlaying();
          })
          .catch(() => {
            if (generation === playGeneration) {
              running = false;
              video.dataset.playState = "unavailable";
            }
          });
      }
    } catch {
      running = false;
      video.dataset.playState = "unavailable";
    }
  }

  function measure() {
    frame = 0;
    const rect = video.getBoundingClientRect();
    const visibleX = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const visibleY = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    inView =
      rect.width > 0 &&
      rect.height > 0 &&
      visibleX * visibleY >= rect.width * rect.height * PLAY_THRESHOLD;
    sync();
  }

  function scheduleMeasure() {
    if (!frame) frame = requestAnimationFrame(measure);
  }

  let observer: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= PLAY_THRESHOLD;
        sync();
      },
      { threshold: [0, PLAY_THRESHOLD] }
    );
    observer.observe(video);
  } else {
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    measure();
  }

  document.addEventListener("visibilitychange", sync);
  if (motion.addEventListener) motion.addEventListener("change", sync);
  else motion.addListener(sync);
  connection?.addEventListener("change", sync);

  return {
    destroy() {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("playing", showPlaying);
      if (motion.removeEventListener) motion.removeEventListener("change", sync);
      else motion.removeListener(sync);
      connection?.removeEventListener("change", sync);
      if (frame) cancelAnimationFrame(frame);
      stop();
      video.removeAttribute("src");
      video.load();
    }
  };
}

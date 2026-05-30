function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function buildPlayer(audio: HTMLAudioElement): HTMLElement {
  const wrapper = document.createElement("div")
  wrapper.className = "audio-player"

  audio.removeAttribute("controls")
  wrapper.appendChild(audio)

  // Play/pause button
  const playBtn = document.createElement("button")
  playBtn.className = "audio-play-btn"
  playBtn.setAttribute("aria-label", "Riproduci")
  playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>`
  wrapper.appendChild(playBtn)

  // Progress bar
  const progressWrap = document.createElement("div")
  progressWrap.className = "audio-progress-wrap"
  const progressBar = document.createElement("input")
  progressBar.type = "range"
  progressBar.className = "audio-progress"
  progressBar.min = "0"
  progressBar.max = "100"
  progressBar.value = "0"
  progressBar.step = "0.1"
  progressBar.setAttribute("aria-label", "Posizione")
  progressWrap.appendChild(progressBar)
  wrapper.appendChild(progressWrap)

  // Time display
  const timeDisplay = document.createElement("span")
  timeDisplay.className = "audio-time"
  timeDisplay.textContent = "0:00 / 0:00"
  wrapper.appendChild(timeDisplay)

  // Volume
  const volumeWrap = document.createElement("div")
  volumeWrap.className = "audio-volume-wrap"
  const volumeIcon = document.createElement("span")
  volumeIcon.className = "audio-volume-icon"
  volumeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`
  const volumeSlider = document.createElement("input")
  volumeSlider.type = "range"
  volumeSlider.className = "audio-volume"
  volumeSlider.min = "0"
  volumeSlider.max = "1"
  volumeSlider.step = "0.05"
  volumeSlider.value = "1"
  volumeSlider.setAttribute("aria-label", "Volume")
  volumeWrap.appendChild(volumeIcon)
  volumeWrap.appendChild(volumeSlider)
  wrapper.appendChild(volumeWrap)

  // Speed selector
  const speedSelect = document.createElement("select")
  speedSelect.className = "audio-speed"
  speedSelect.setAttribute("aria-label", "Velocità")
  for (const rate of [0.5, 0.75, 1, 1.25, 1.5, 2]) {
    const opt = document.createElement("option")
    opt.value = String(rate)
    opt.textContent = rate === 1 ? "1×" : `${rate}×`
    if (rate === 1) opt.selected = true
    speedSelect.appendChild(opt)
  }
  wrapper.appendChild(speedSelect)

  // --- Event wiring ---

  let seeking = false

  function setPct(el: HTMLInputElement, pct: number) {
    el.style.setProperty("--pct", `${pct}%`)
  }

  function updateProgress() {
    if (!audio.duration || seeking) return
    const pct = (audio.currentTime / audio.duration) * 100
    progressBar.value = String(pct)
    setPct(progressBar, pct)
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
  }

  function setPlayIcon(playing: boolean) {
    if (playing) {
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      playBtn.setAttribute("aria-label", "Pausa")
    } else {
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>`
      playBtn.setAttribute("aria-label", "Riproduci")
    }
  }

  function onPlay() { setPlayIcon(true) }
  function onPause() { setPlayIcon(false) }
  function onEnded() { setPlayIcon(false) }

  audio.addEventListener("timeupdate", updateProgress)
  audio.addEventListener("loadedmetadata", updateProgress)
  audio.addEventListener("play", onPlay)
  audio.addEventListener("pause", onPause)
  audio.addEventListener("ended", onEnded)

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play()
    else audio.pause()
  })

  // Seeking: block timeupdate interference during drag.
  // Listen on window for pointerup so it fires even if pointer leaves the element.
  progressBar.addEventListener("pointerdown", () => { seeking = true })

  function onWindowPointerUp() { seeking = false }
  window.addEventListener("pointerup", onWindowPointerUp)

  progressBar.addEventListener("input", () => {
    if (!audio.duration) return
    const pct = Number(progressBar.value)
    setPct(progressBar, pct)
    audio.currentTime = (pct / 100) * audio.duration
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
  })

  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value)
    setPct(volumeSlider, Number(volumeSlider.value) * 100)
  })
  setPct(volumeSlider, 100)

  speedSelect.addEventListener("change", () => {
    audio.playbackRate = Number(speedSelect.value)
  })

  window.addCleanup(() => {
    audio.removeEventListener("timeupdate", updateProgress)
    audio.removeEventListener("loadedmetadata", updateProgress)
    audio.removeEventListener("play", onPlay)
    audio.removeEventListener("pause", onPause)
    audio.removeEventListener("ended", onEnded)
    window.removeEventListener("pointerup", onWindowPointerUp)
  })

  return wrapper
}

function setupAudioPlayers() {
  const audios = document.querySelectorAll<HTMLAudioElement>("audio[controls]")
  for (const audio of audios) {
    const parent = audio.parentNode
    if (!parent) continue
    const placeholder = document.createComment("")
    parent.insertBefore(placeholder, audio)
    const player = buildPlayer(audio)
    parent.insertBefore(player, placeholder)
    parent.removeChild(placeholder)
  }
}

document.addEventListener("nav", setupAudioPlayers)

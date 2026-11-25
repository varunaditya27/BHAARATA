"""Builds the interface sounds in public/sfx/ from scratch with numpy, so they need no download or licence.
Run: ~/.venvs/bhaarata-audio/bin/python scripts/generate-sfx.py
Each sound models a real source: a struck bell, a plucked string, a wooden tap, moving air.
"""
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack=0.004, decay=0.2):
    """Fast attack, exponential decay: how struck and plucked things behave."""
    x = np.arange(n) / SR
    return np.minimum(x / attack, 1.0) * np.exp(-x / decay)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = (1 - a) * x[i] + a * y[i - 1]
    return y


def bell(freq, seconds, decay):
    """A struck bell is a stack of inharmonic partials, each fading at its own rate."""
    x = t(seconds)
    out = np.zeros_like(x)
    for ratio, amp, shorten in [(1, 1.0, 1.0), (2.0, 0.55, 0.8), (2.76, 0.7, 0.65), (5.4, 0.35, 0.4), (8.93, 0.2, 0.25)]:
        out += amp * np.sin(2 * np.pi * freq * ratio * x + rng.uniform(0, 6.28)) * np.exp(-x / (decay * shorten))
    return out * np.minimum(x / 0.002, 1.0)


def pluck(freq, seconds):
    """Karplus-Strong: noise circulating in a delay line is a plucked string; the buzz is a sitar-ish edge."""
    n = int(SR * seconds)
    period = int(SR / freq)
    buf = rng.uniform(-1, 1, period)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.4985 * (buf[i % period] + buf[(i + 1) % period])
    return out * np.exp(-t(seconds) / (seconds * 0.55))


def whoosh(seconds):
    """Air moving past: noise whose brightness rises and falls."""
    n = int(SR * seconds)
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    block = 2048
    for start in range(0, n, block):
        p = start / n
        cutoff = 300 + 2600 * np.sin(np.pi * p)
        out[start:start + block] = lowpass(noise[start:start + block], cutoff)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * shape


def tap(freq, seconds=0.12):
    """A fingertip on wood: a short noise click and a quickly dying low tone."""
    x = t(seconds)
    click = lowpass(rng.normal(0, 1, len(x)), 3500) * np.exp(-x / 0.004)
    body = np.sin(2 * np.pi * freq * x) * np.exp(-x / 0.03)
    return 0.6 * click + body


def save(name, signal, peak_db=-4.0):
    signal = signal / (np.max(np.abs(signal)) + 1e-9) * (10 ** (peak_db / 20))
    fade = int(SR * 0.004)
    signal[:fade] *= np.linspace(0, 1, fade)
    signal[-fade:] *= np.linspace(1, 0, fade)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f"{name}.wav"
        sf.write(wav, signal, SR)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "64k", str(OUT / f"{name}.mp3")],
            check=True,
        )


def tail(signal, extra):
    return np.concatenate([signal, np.zeros(int(SR * extra))])


save("click", tap(520))
save("hover", tap(1900, 0.05) * 0.5)
save("tick", tap(1250, 0.04) * 0.6)
save("whoosh", whoosh(0.55) * 0.8)
save("bell", bell(392, 3.0, 0.9))
save("gong", bell(110, 4.5, 1.5))
save("pluck", pluck(146.8, 1.8))
chime = np.zeros(int(SR * 1.6))
for delay, f in [(0.0, 587.3), (0.14, 880.0)]:
    note = bell(f, 1.3, 0.35)
    chime[int(SR * delay):int(SR * delay) + len(note)] += note
save("chime", chime)
print("wrote", sorted(p.name for p in OUT.glob("*.mp3")))

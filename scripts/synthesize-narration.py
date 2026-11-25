"""Turns public/narration/scripts.json into one spoken clip per page, public/narration/<key>.mp3, with Kokoro on the GPU.
Run: LD_LIBRARY_PATH=<venv>/lib/python3.12/site-packages/nvidia/cublas/lib:<...>/cudnn/lib ~/.venvs/bhaarata-audio-gpu/bin/python scripts/synthesize-narration.py [--only prefix] [--limit N] [--force]
Existing clips are kept, so an interrupted run resumes. Voice: af_heart (Kokoro's top-graded English voice).
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from kokoro import KPipeline
from num2words import num2words

ROOT = Path(__file__).resolve().parent.parent
NARRATION = ROOT / "public" / "narration"
VOICE = "af_heart"
SPEED = 0.95
RATE = 24000
GAP = np.zeros(int(RATE * 0.22), dtype=np.float32)

ORDINALS = {"I": "the First", "II": "the Second", "III": "the Third", "IV": "the Fourth", "V": "the Fifth",
            "VI": "the Sixth", "VII": "the Seventh", "VIII": "the Eighth", "IX": "the Ninth", "X": "the Tenth"}

# Respellings for names the model reads badly; checked by listening with scripts/check-narration.py.
RESPELL = {"Chalukya": "Chalookya", "Pandya": "Paandya", "Rashtrakuta": "Rashtrakoota", "Maitraka": "Mai-tra-ka", "Gahadavala": "Gaha-dah-vala"}


def speakable(text):
    """Writes numbers and numerals the way a person says them: years as 'nine eighty-five', rulers as 'the First'."""
    text = re.sub(r"\b([A-Z][a-z]+)\s(I{1,3}|IV|V|VI{0,3}|IX|X)\b", lambda m: f"{m.group(1)} {ORDINALS[m.group(2)]}", text)
    text = re.sub(r"\b(\d{3,4})\b(?!\s+(?:rulers?|tables?|rows?))", lambda m: num2words(int(m.group(1)), to="year"), text)
    text = re.sub(r"\b(\d{1,2})(st|nd|rd|th)\b", lambda m: num2words(int(m.group(1)), to="ordinal"), text)
    text = text.replace("—", ", ").replace("–", " to ")
    for name, spoken in RESPELL.items():
        text = re.sub(rf"\b{name}", spoken, text)
    return text


def synthesize(pipeline, text):
    parts = []
    for _, _, audio in pipeline(speakable(text), voice=VOICE, speed=SPEED, split_pattern=r"\n+"):
        parts.extend([audio.cpu().numpy() if hasattr(audio, "cpu") else np.asarray(audio), GAP])
    return np.concatenate(parts[:-1])


def encode(samples, target):
    """Mono MP3 at a steady loudness, so no page is louder than another."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "clip.wav"
        sf.write(wav, samples, RATE)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "loudnorm=I=-19:TP=-2:LRA=7",
             "-ac", "1", "-ar", str(RATE), "-codec:a", "libmp3lame", "-b:a", "40k", str(target)],
            check=True,
        )


def refresh_manifest():
    """Tells the web app which clips exist."""
    subprocess.run(["node", str(ROOT / "scripts" / "index-audio.mjs")], check=True, cwd=ROOT)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    scripts = json.loads((NARRATION / "scripts.json").read_text())
    todo = [k for k in scripts if k.startswith(args.only) and (args.force or not (NARRATION / f"{k}.mp3").exists())]
    if args.limit:
        todo = todo[: args.limit]
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"{len(todo)} clips to make on {device}", flush=True)
    pipeline = KPipeline(lang_code="a", device=device)
    for i, key in enumerate(todo, 1):
        encode(synthesize(pipeline, scripts[key]), NARRATION / f"{key}.mp3")
        if i % 25 == 0 or i == len(todo):
            refresh_manifest()
            print(f"{i}/{len(todo)}", flush=True)
    refresh_manifest()


if __name__ == "__main__":
    main()

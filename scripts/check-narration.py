"""Listens to the narration clips and reports what is wrong with them: mispronounced words, wrong length, uneven loudness.
Run with the same LD_LIBRARY_PATH as synthesize-narration.py (Whisper needs the CUDA 12 libraries): ~/.venvs/bhaarata-audio-gpu/bin/python scripts/check-narration.py [--sample 40] [--only prefix]
Speech is transcribed with Whisper, and the transcript is compared with the script that was spoken.
"""
import argparse
import difflib
import json
import random
import re
import subprocess
from pathlib import Path

from faster_whisper import WhisperModel
from num2words import num2words

NARRATION = Path(__file__).resolve().parent.parent / "public" / "narration"


def words(text):
    text = re.sub(r"\b(\d{3,4})\b", lambda m: num2words(int(m.group(1)), to="year"), text.lower())
    return re.findall(r"[a-z']+", text.replace("-", " "))


def measure(path):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true,silencedetect=n=-45dB:d=1.2", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    loudness = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    peak = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)
    return float(loudness[-1]) if loudness else None, float(peak[-1]) if peak else None, out.count("silence_end")


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True).stdout)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=40)
    parser.add_argument("--only", default="")
    args = parser.parse_args()
    scripts = json.loads((NARRATION / "scripts.json").read_text())
    keys = sorted(k for k in scripts if k.startswith(args.only) and (NARRATION / f"{k}.mp3").exists())
    random.Random(3).shuffle(keys)
    keys = keys[: args.sample]
    try:
        model = WhisperModel("small.en", device="cuda", compute_type="float16")
    except Exception:
        model = WhisperModel("small.en", device="cpu", compute_type="int8")

    misheard = {}
    rows = []
    for key in keys:
        path = NARRATION / f"{key}.mp3"
        heard = words(" ".join(s.text for s in model.transcribe(str(path), language="en")[0]))
        said = words(scripts[key])
        match = difflib.SequenceMatcher(None, said, heard)
        for tag, a0, a1, b0, b1 in match.get_opcodes():
            if tag in ("replace", "delete") and a1 - a0 <= 3:
                misheard.setdefault(" ".join(said[a0:a1]), set()).add(" ".join(heard[b0:b1]) or "(nothing)")
        lufs, peak, pauses = measure(path)
        rows.append((key, duration(path), match.ratio(), lufs, peak, pauses))

    print(f"{'clip':44} {'secs':>5} {'match':>6} {'LUFS':>6} {'peak':>6} {'long pauses':>11}")
    for key, secs, ratio, lufs, peak, pauses in sorted(rows, key=lambda r: r[2]):
        flag = " <- too short" if secs < 8 else " <- too long" if secs > 30 else ""
        print(f"{key[:44]:44} {secs:5.1f} {ratio:6.2f} {lufs if lufs is not None else 0:6.1f} {peak if peak is not None else 0:6.1f} {pauses:11d}{flag}")
    secs = [r[1] for r in rows]
    print(f"\n{len(rows)} clips: {min(secs):.1f}-{max(secs):.1f}s (mean {sum(secs) / len(secs):.1f}s), mean match {sum(r[2] for r in rows) / len(rows):.2f}")
    print("\nWords that were heard differently (candidates for RESPELL in synthesize-narration.py):")
    for said, heard in sorted(misheard.items(), key=lambda kv: -len(kv[1]))[:25]:
        print(f"  {said!r} -> {sorted(heard)}")


if __name__ == "__main__":
    main()


import io
import time
import subprocess
import tempfile
import os
import librosa
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

app = FastAPI(title="WildLens AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

FFMPEG_PATH = r"C:\Users\Susheel\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build-shared\bin\ffmpeg.exe"

MODEL_ID = "laion/clap-htsat-unfused"

# Broad sound descriptions, not a complete bird species database.
CANDIDATE_LABELS = [
    "the sound of a sparrow chirping",
    "the sound of a crow calling",
    "the sound of a pigeon cooing",
    "the sound of a koel or cuckoo calling",
    "the sound of a parrot squawking",
    "the sound of an owl hooting",
    "the sound of a woodpecker drumming",
    "the sound of many birds singing in a forest",
    "the sound of crickets chirping",
    "the sound of a frog croaking",
    "the sound of wind blowing through trees",
    "the sound of flowing water",
    "the sound of traffic and people talking",
]

classifier = None


@app.on_event("startup")
def load_model():
    global classifier

    # The model downloads on first launch.
    # Later, Transformers can use its cached local files.
    classifier = pipeline(
        task="zero-shot-audio-classification",
        model=MODEL_ID,
        device=-1,
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_loaded": classifier is not None,
        "model": MODEL_ID,
    }



@app.post("/api/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    if classifier is None:
        raise HTTPException(503, "AI model is still loading.")

    allowed_types = {
        "audio/wav", "audio/x-wav", "audio/mpeg",
        "audio/mp3", "audio/ogg", "audio/flac",
        "audio/webm", "audio/mp4", "audio/x-m4a",
        "audio/webm;codecs=opus",
        "application/octet-stream",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            415,
            f"Unsupported audio type: {file.content_type}"
        )

    content = await file.read()

    if not content:
        raise HTTPException(400, "The uploaded file is empty.")

    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(413, "Audio must be smaller than 15 MB.")

    temp_input = None
    temp_wav = None

    try:
        started = time.perf_counter()

        # Save uploaded audio temporarily.
        with tempfile.NamedTemporaryFile(
            suffix=".audio", delete=False
        ) as source:
            source.write(content)
            temp_input = source.name

        # Convert WebM/Opus or other supported input to WAV.
        with tempfile.NamedTemporaryFile(
            suffix=".wav", delete=False
        ) as output:
            temp_wav = output.name


        process = subprocess.run(
    [
        FFMPEG_PATH,
        "-nostdin", "-hide_banner", "-loglevel",
        "error", "-y", "-i", temp_input,
        "-t", "10", "-vn", "-ac", "1",
        "-ar", "48000", "-c:a", "pcm_s16le",
        temp_wav,
    ],
    capture_output=True,
    text=True,
    timeout=30,
)


        if process.returncode != 0:
            print("FFmpeg decode error:", process.stderr[-1500:])
            raise HTTPException(
                422,
                "Could not decode this recording. Try recording again."
            )

        audio, sample_rate = librosa.load(
            temp_wav,
            sr=48000,
            mono=True,
            duration=10,
        )

        if len(audio) < 4800:
            raise HTTPException(
                400,
                "Audio is too short. Please record at least 0.1 seconds."
            )

        if not np.isfinite(audio).all():
            raise HTTPException(400, "Audio contains invalid values.")

        if np.max(np.abs(audio)) < 1e-5:
            raise HTTPException(
                400, "This recording appears to be silent."
            )

        results = classifier(
            audio.astype(np.float32),
            candidate_labels=CANDIDATE_LABELS,
        )

        predictions = [
            {
                "label": item["label"],
                "score": round(float(item["score"]), 4),
            }
            for item in results[:5]
        ]

        return {
            "filename": file.filename,
            "model": MODEL_ID,
            "duration_seconds": round(len(audio) / sample_rate, 2),
            "inference_ms": round(
                (time.perf_counter() - started) * 1000
            ),
            "predictions": predictions,
            "notice": (
                "Scores rank candidate descriptions; they are not "
                "calibrated probabilities or confirmed species IDs."
            ),
        }

    except HTTPException:
        raise
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(
            422, "Audio conversion took too long. Try a shorter recording."
        ) from exc
    except Exception as exc:
        print("Audio analysis failed:", repr(exc))
        raise HTTPException(
            422, "Could not decode or analyze this audio."
        ) from exc
    finally:
        for path in (temp_input, temp_wav):
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
        await file.close()

# 🌿 WildLens AI — Discover Nature Through Sound

WildLens AI is an AI-powered nature sound exploration project designed to encourage people to step outside, listen to their surroundings, and explore the natural world using open-source AI.

Upload an audio recording of birds, insects, frogs, wind, flowing water, or other environmental sounds and let an AI model classify the sounds it detects.

## ✨ Features

- 🎧 **Audio Upload:** Upload supported audio files for analysis.
- 🤖 **AI Sound Classification:** Get the model's top predicted sound labels and scores.
- 🐦 **Nature Sound Exploration:** Explore predictions for birds and other environmental sounds.
- 🔊 **Audio Processing:** Convert supported audio formats into a format suitable for model inference.
- ⚡ **Inference Metrics:** View analysis information such as processing time and audio duration.
- 🌱 **Touch Grass:** Use technology as a tool to encourage real-world outdoor exploration.

> **Current status:** The project runs locally. Audio upload and AI analysis are working. Microphone-recording playback and analysis are still being debugged.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- Hugging Face Transformers
- Librosa
- NumPy
- FFmpeg

### AI Model
- **Model:** [`laion/clap-htsat-unfused`](https://huggingface.co/laion/clap-htsat-unfused)
- **Purpose:** Zero-shot audio classification

The model returns predicted labels and scores. These predictions are not guaranteed species identifications or calibrated probabilities.

## 🏗️ How It Works

1. The user uploads an audio recording.
2. The frontend sends the audio to the FastAPI backend.
3. FFmpeg converts the audio into a supported format.
4. Librosa and NumPy prepare the audio for inference.
5. The open-source LAION-CLAP model evaluates the audio against candidate sound labels.
6. The backend returns the top predictions and related analysis information.
7. The frontend displays the results.

## 📁 Project Structure

```text
WildLens-AI/
├── backend/
│   ├── main.py
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

The exact files may vary as development continues.

## ⚙️ Prerequisites

Install the following before running the project:

- Python 3.10 or a compatible version for the project's dependencies
- Node.js and npm
- Git
- FFmpeg

You also need an internet connection for the initial download of model weights if they are not already cached.

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/kashyapanshu3108-ops/WIld-Lens_AI.git
cd WildLens-AI
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Start the backend

Open a terminal:

```bash
cd backend
python -m venv .venv
```

On Windows Command Prompt:

```bat
.venv\Scripts\activate.bat
```

Install the backend dependencies:

```bash
pip install fastapi uvicorn transformers librosa numpy python-multipart
```

Make sure FFmpeg is installed and accessible to the backend. If your code uses a specific FFmpeg executable path, configure it for your own computer.

Start the API:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

The API should be available at:

```text
http://127.0.0.1:8000
```

If enabled by the backend, interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

**Note:** These are general setup commands. Additional dependencies or environment configuration may be needed depending on the current project files.

## 🌍 Why Open-Source AI?

Open-source AI makes it possible for students and independent developers to experiment with real AI models, learn how inference works, and build useful applications without relying entirely on closed, proprietary APIs.

WildLens AI explores how openly available AI can support outdoor learning and help people engage more thoughtfully with their surroundings.

## 🔮 Future Improvements

- Fix microphone recording playback and analysis.
- Improve audio validation and error messages.
- Add more sound labels and improve evaluation.
- Deploy the frontend and backend for public access.
- Explore outdoor sound journals and nature-discovery challenges.

## ⚠️ Limitations

- Predictions depend on the audio quality and the candidate labels provided to the model.
- The model's output should be treated as a prediction, not a definitive identification of a species.
- Microphone recording is still under development.
- The project currently runs locally and is not yet publicly deployed.

## 📜 License

No license has been added yet. A license can be selected and added later.

---

**Built with 🌿 and open-source AI for the Hacktoberfest Open-Source AI Challenge — Week 1: Touch Grass.**
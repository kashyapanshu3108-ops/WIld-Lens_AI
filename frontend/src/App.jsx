
import { useRef, useState } from "react";
import {
  AudioLines,
  Bird,
  CheckCircle2,
  CloudUpload,
  Compass,
  Headphones,
  Leaf,
  LoaderCircle,
  MapPin,
  Play,
  Sparkles,
  TreePine,
  Upload,
  Volume2,
  Waves,
} from "lucide-react";
import "./App.css";

const missions = [
  {
    icon: Bird,
    title: "Listen for a bird",
    description: "Spend 5 minutes listening without looking at your phone.",
    time: "5 min",
  },
  {
    icon: TreePine,
    title: "Find three textures",
    description: "Notice the different textures of leaves and tree bark.",
    time: "10 min",
  },
  {
    icon: Waves,
    title: "Discover natural sounds",
    description: "Listen for water, wind, insects or distant birds.",
    time: "8 min",
  },
];

function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState([]);
 
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  function chooseFile(event) {
    const selected = event.target.files?.[0];

    setResult(null);
    setError("");

    if (!selected) return;

    if (selected.size > 15 * 1024 * 1024) {
      setFile(null);
      setError("Choose an audio file smaller than 15 MB.");
      return;
    }

    if (!selected.type.startsWith("audio/")) {
      setFile(null);
      setError("Please choose an audio file.");
      return;
    }

    setFile(selected);
  }
  


async function startRecording() {
  let stream;

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Microphone recording is unavailable in this browser."
      );
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const supportedType = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
    ].find((type) => MediaRecorder.isTypeSupported(type));

    const recorder = supportedType
      ? new MediaRecorder(stream, { mimeType: supportedType })
      : new MediaRecorder(stream);

    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      try {
        const actualType =
          recorder.mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: actualType,
        });

        if (!blob.size) {
          throw new Error("Recording is empty. Please record again.");
        }

        const extension = actualType.includes("mp4")
          ? "mp4"
          : "webm";

        const audioFile = new File(
          [blob],
          `wildlens-recording.${extension}`,
          { type: actualType }
        );

        setFile(audioFile);
        setResult(null);
        setError("");

        setRecordedUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return URL.createObjectURL(blob);
        });
      } catch (err) {
        console.error("Recording save failed:", err);
        setError(err.message || "Could not save recording.");
      } finally {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      }
    };

    recorder.start();
    
    setError("");

    setRecording(true);
    setError("");
  } catch (err) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    console.error("Microphone recording failed:", err);
    setError(
      err.message || "Please allow microphone access and try again."
    );
  }
}


function stopRecording() {
  const recorder = recorderRef.current;

  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
  }

  setRecording(false);
}




  async function analyzeAudio() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the AI server. Is it running?"
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMission(index) {
    setCompleted((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <Leaf size={24} />
          </span>
          <span>
            <strong>WildLens</strong>
            <small>YOUR NATURE COMPANION</small>
          </span>
        </a>

        <p className="nav-label">EXPLORE</p>

        <a className="nav-item active" href="#home">
          <Compass size={18} /> Discover
        </a>
        <a className="nav-item" href="#identify">
          <AudioLines size={18} /> Sound lab
        </a>
        <a className="nav-item" href="#missions">
          <TreePine size={18} /> Outdoor missions
        </a>

        <div className="sidebar-note">
          <Leaf size={20} />
          <strong>Less scrolling.</strong>
          <p>More noticing. The best discoveries happen outside.</p>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Open AI · Local prototype
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR PERSONAL FIELD GUIDE</span>
            <h1>Nature is calling<span>.</span></h1>
          </div>
          <div className="privacy-pill">
            <span className="status-dot" />
            Local AI workspace
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="hero-tag">
              <Sparkles size={14} /> DISCOVER THE UNHEARD
            </span>
            <h2>Every sound tells a story.</h2>
            <p>
              Step outside, capture a sound and explore the
              natural world around you with open AI.
            </p>
            <a className="hero-link" href="#identify">
              Explore sound lab <Play size={15} />
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun-orb" />
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <div className="bird-symbol">
              <Bird size={88} strokeWidth={1.15} />
            </div>
            <span className="art-caption">LISTEN CLOSELY</span>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon"><Headphones /></span>
            <span className="stat-label">Sound lab</span>
            <strong>AI-powered</strong>
            <small>Compare sound descriptions</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon"><Compass /></span>
            <span className="stat-label">Today's goal</span>
            <strong>Go outside</strong>
            <small>Discover your surroundings</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon"><CheckCircle2 /></span>
            <span className="stat-label">Missions complete</span>
            <strong>{completed.length} / {missions.length}</strong>
            <small>Small steps count</small>
          </article>
        </section>

        <section className="section-block" id="identify">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OPEN-WEIGHT AUDIO AI</span>
              <h2>Sound identification</h2>
            </div>
            <span className="model-pill">
              <span className="status-dot" /> CLAP model
            </span>
          </div>

          <div className="lab-grid">
            <article className="panel upload-panel">
              <div className="panel-heading">
                <span className="panel-icon"><Volume2 /></span>
                <div>
                  <h3>Bring a sound to life</h3>
                  <p>Upload a recording to start exploring.</p>
                </div>
              </div>

              <button
                className="drop-zone"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <span className="upload-icon"><CloudUpload size={26} /></span>
                <strong>Choose an audio file</strong>
                <span>WAV, MP3, OGG or FLAC · Max 15 MB</span>
                <span className="choose-button">
                  <Upload size={15} /> Browse files
                </span>
              </button>



<div className="record-controls">
  {!recording ? (
    <button
      type="button"
      className="record-button"
      onClick={startRecording}
    >
      <span className="record-dot" />
      Record outdoor sound
    </button>
  ) : (
    <button
      type="button"
      className="record-button recording-active"
      onClick={stopRecording}
    >
      <span className="record-dot" />
      Stop recording
    </button>
  )}
  <span className="record-hint">
    Allow microphone access when prompted
  </span>
</div>





              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={chooseFile}
              />

              {file && (
                <div className="selected-file">
                  <AudioLines size={20} />
                  <div>
                    <strong>{file.name}</strong>
                    <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                  <CheckCircle2 size={18} />
                </div>
              )}


{(file || recordedUrl) && (
  <audio
    className="audio-preview"
    controls
    src={recordedUrl || URL.createObjectURL(file)}
  />
)}


              {error && <p className="error-message">{error}</p>}

              <button
                className="primary-button"
                disabled={!file || loading}
                onClick={analyzeAudio}
                type="button"
              >
                {loading ? (
                  <><LoaderCircle className="spin" size={18} /> Analysing audio...</>
                ) : (
                  <><Sparkles size={17} /> Analyse with open AI</>
                )}
              </button>

              <p className="privacy-note">
                Your recording is processed by the local backend.
                This prototype does not save uploaded audio.
              </p>
            </article>

            <article className="panel results-panel">
              <div className="panel-heading">
                <span className="panel-icon"><Sparkles /></span>
                <div>
                  <h3>AI sound insights</h3>
                  <p>Ranked descriptions from your recording.</p>
                </div>
              </div>

              {!result && !loading && (
                <div className="empty-results">
                  <div className="empty-art"><Waves size={36} /></div>
                  <strong>Your discovery starts here</strong>
                  <p>
                    Upload an outdoor recording to see the
                    model's top matching sound descriptions.
                  </p>
                </div>
              )}

              {loading && (
                <div className="empty-results">
                  <LoaderCircle className="spin" size={36} />
                  <strong>Listening to your recording...</strong>
                  <p>The first analysis can take longer while the model warms up.</p>
                </div>
              )}

              {result && (
                <div className="results-list">
                  <div className="result-meta">
                    <span><CheckCircle2 size={15} /> Analysis complete</span>
                    <span>{result.inference_ms} ms</span>
                  </div>
                  {result.predictions.map((prediction, index) => (
                    <div className="prediction" key={prediction.label}>
                      <div className="prediction-top">
                        <span className="rank">0{index + 1}</span>
                        <strong>{prediction.label}</strong>
                        <span className="score">
                          {(prediction.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="score-track">
                        <div
                          className="score-fill"
                          style={{
                            width: `${prediction.score * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="disclaimer">{result.notice}</p>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="section-block" id="missions">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A LITTLE ADVENTURE</span>
              <h2>Your outdoor missions</h2>
            </div>
            <span className="mission-count">
              {completed.length} completed
            </span>
          </div>

          <div className="missions-grid">
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              const done = completed.includes(index);

              return (
                <article className="mission-card" key={mission.title}>
                  <span className="mission-icon"><Icon size={21} /></span>
                  <span className="mission-time">{mission.time}</span>
                  <h3>{mission.title}</h3>
                  <p>{mission.description}</p>
                  <button
                    className={done ? "mission-button done" : "mission-button"}
                    onClick={() => toggleMission(index)}
                  >
                    {done ? <CheckCircle2 size={16} /> : <MapPin size={16} />}
                    {done ? "Completed" : "Mark complete"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="footer">
          <span><Leaf size={16} /> Built for the world beyond your screen.</span>
          <span>WildLens AI · Hacktoberfest 2026</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
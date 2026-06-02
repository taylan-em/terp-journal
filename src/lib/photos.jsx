// In-app camera capture + photo gallery per strain
// Uses <input capture> for mobile, file picker fallback for desktop

import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../constants/colors";

// ── Storage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = "rs_photos";

export function getPhotos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function getStrainPhotos(strainName) {
  const all = getPhotos();
  return all[strainName] || [];
}

export function addStrainPhoto(strainName, dataUrl) {
  const all = getPhotos();
  const photos = all[strainName] || [];
  const photo = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    dataUrl,
    takenAt: new Date().toISOString()
  };
  all[strainName] = [photo, ...photos].slice(0, 20); // max 20 photos
  savePhotos(all);
  return photo;
}

export function deleteStrainPhoto(strainName, photoId) {
  const all = getPhotos();
  if (all[strainName]) {
    all[strainName] = all[strainName].filter(p => p.id !== photoId);
    savePhotos(all);
  }
}

// ── Camera component ─────────────────────────────────────────────────────
export function CameraCapture({ onCapture, onClose }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState("environment"); // rear camera
  const [camError, setCamError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      setCamError(null);
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setCamError("Camera access denied or unavailable. Use the file picker instead.");
    }
  }, [facing]);

  useEffect(() => { startCamera(); return () => { if (stream) stream.getTracks().forEach(t => t.stop()); }; }, [startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
    if (stream) stream.getTracks().forEach(t => t.stop());
    onClose?.();
  };

  const flipCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setFacing(f => f === "environment" ? "user" : "environment");
  };

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onCapture(reader.result); onClose?.(); };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Close */}
      <button onClick={() => { if (stream) stream.getTracks().forEach(t => t.stop()); onClose?.(); }}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10, background: "rgba(0,0,0,0.5)", border: "none",
          color: "#fff", fontSize: 22, borderRadius: 20, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ✕
      </button>

      {/* Camera */}
      {!camError && (
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Flip */}
          <button onClick={flipCamera}
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", border: "none",
              color: "#fff", fontSize: 18, borderRadius: 20, width: 40, height: 40, cursor: "pointer" }}>
            🔄
          </button>

          {/* Capture */}
          <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24, alignItems: "center" }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFilePick}
              style={{ display: "none" }} />
            <label htmlFor="file-pick-btn" style={{ background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: 12, color: "#fff", fontSize: 13, padding: "10px 16px", cursor: "pointer" }}>
              📁 Gallery
            </label>
            <button onClick={capturePhoto} style={{
              width: 70, height: 70, borderRadius: 35, border: "4px solid #fff",
              background: "rgba(255,255,255,0.3)", cursor: "pointer"
            }} />
            <div style={{ width: 60 }} />
          </div>
        </div>
      )}

      {/* Camera error — use file picker */}
      {camError && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 40 }}>📷</div>
          <div style={{ fontSize: 14, color: C.muted, textAlign: "center" }}>{camError}</div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFilePick}
            style={{ display: "none" }} id="file-pick-btn" />
          <label htmlFor="file-pick-btn" style={{
            padding: "12px 24px", borderRadius: 12, border: `2px solid ${C.accent}`,
            color: C.accent, fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>
            Choose Photo
          </label>
        </div>
      )}
    </div>
  );
}

// ── Photo gallery component ──────────────────────────────────────────────
export function StrainPhotoGallery({ strainName, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    setPhotos(getStrainPhotos(strainName));
  }, [strainName]);

  const handleDelete = (id) => {
    deleteStrainPhoto(strainName, id);
    setPhotos(p => p.filter(p => p.id !== id));
  };

  if (viewing) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <button onClick={() => setViewing(null)}
          style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.5)", border: "none",
            color: "#fff", fontSize: 22, borderRadius: 20, width: 40, height: 40, cursor: "pointer" }}>
          ✕
        </button>
        <img src={viewing.dataUrl} alt="Strain" style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: C.bg, overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{strainName}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
            <div>No photos yet. Capture some from the passport screen.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
                <img src={p.dataUrl} alt="" onClick={() => setViewing(p)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none",
                    color: "#fff", fontSize: 12, borderRadius: 10, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

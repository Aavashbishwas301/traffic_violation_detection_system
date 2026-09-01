import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import { 
  Camera, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Layers, 
  Play,
  Square,
  RefreshCw,
  Activity,
  Radio,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

const ZONE_TYPES = [
  { id: "Stop Line", label: "Stop Line", color: "#ef4444", bg: "rgba(239, 68, 68, 0.25)" },
  { id: "Zebra Crossing", label: "Zebra Crossing", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.25)" },
  { id: "Lane", label: "Lane", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.25)" },
  { id: "No Entry Area", label: "No Entry Area", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.25)" },
  { id: "Restricted Area", label: "Restricted Area", color: "#ec4899", bg: "rgba(236, 72, 153, 0.25)" },
];

const CameraCalibration = () => {
  const { addToast } = useToast();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [streamActionLoading, setStreamActionLoading] = useState(false);
  const [syncingHealth, setSyncingHealth] = useState(false);

  // RTSP Feed URL & Sampling
  const [feedUrl, setFeedUrl] = useState("");
  const [sampleRate, setSampleRate] = useState(2);

  // Calibration canvas state
  const [zones, setZones] = useState([]);
  const [activeZoneType, setActiveZoneType] = useState("Stop Line");
  const [newZoneName, setNewZoneName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);
  const [draggingVertex, setDraggingVertex] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch camera configurations
  const fetchCameras = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get("/api/admin/zones");
      if (data?.cameras && data.cameras.length > 0) {
        setCameras(data.cameras);
        if (!selectedCamera) {
          setSelectedCamera(data.cameras[0]);
          setZones(data.cameras[0].zones || []);
          setFeedUrl(data.cameras[0].feedUrl || "");
          setSampleRate(data.cameras[0].sampleRate || 2);
        } else {
          const updated = data.cameras.find(c => c.cameraId === selectedCamera.cameraId) || data.cameras[0];
          setSelectedCamera(updated);
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) addToast("Failed to fetch camera zone configurations.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const syncHealthTelemetry = async () => {
    try {
      setSyncingHealth(true);
      const { data } = await api.get("/api/admin/zones/health/sync");
      if (data?.cameras) {
        setCameras(data.cameras);
        if (selectedCamera) {
          const updated = data.cameras.find(c => c.cameraId === selectedCamera.cameraId);
          if (updated) setSelectedCamera(updated);
        }
      }
      addToast("Camera health telemetry synced with AI stream engine.", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingHealth(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    const interval = setInterval(() => syncHealthTelemetry(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCamera = (cam) => {
    setSelectedCamera(cam);
    setZones(cam.zones || []);
    setFeedUrl(cam.feedUrl || "");
    setSampleRate(cam.sampleRate || 2);
    setIsDrawing(false);
    setCurrentPolygon([]);
    setSelectedZoneIndex(null);
  };

  // Canvas Redraw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Reference Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Configured Zones
    zones.forEach((zone, idx) => {
      if (!zone.polygon || zone.polygon.length < 2) return;
      const zoneConfig = ZONE_TYPES.find(t => t.id === zone.type) || ZONE_TYPES[0];
      const isSelected = selectedZoneIndex === idx;

      ctx.beginPath();
      const firstPt = zone.polygon[0];
      ctx.moveTo(firstPt.x * w, firstPt.y * h);

      for (let i = 1; i < zone.polygon.length; i++) {
        ctx.lineTo(zone.polygon[i].x * w, zone.polygon[i].y * h);
      }
      ctx.closePath();

      ctx.fillStyle = zone.enabled ? (isSelected ? "rgba(255, 255, 255, 0.35)" : zoneConfig.bg) : "rgba(100, 116, 139, 0.15)";
      ctx.fill();

      ctx.strokeStyle = zone.enabled ? zoneConfig.color : "#94a3b8";
      ctx.lineWidth = isSelected ? 3 : 2;
      if (!zone.enabled) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();

      // Handles
      zone.polygon.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, isSelected ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? "#ffffff" : zoneConfig.color;
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Label
      const avgX = (zone.polygon.reduce((acc, p) => acc + p.x, 0) / zone.polygon.length) * w;
      const avgY = (zone.polygon.reduce((acc, p) => acc + p.y, 0) / zone.polygon.length) * h;

      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(`${zone.name} (${zone.type})`, avgX - 30, avgY);
      ctx.shadowBlur = 0;
    });

    // In-Progress Drawing Polygon
    if (currentPolygon.length > 0) {
      const activeConfig = ZONE_TYPES.find(t => t.id === activeZoneType) || ZONE_TYPES[0];
      ctx.beginPath();
      ctx.moveTo(currentPolygon[0].x * w, currentPolygon[0].y * h);
      for (let i = 1; i < currentPolygon.length; i++) {
        ctx.lineTo(currentPolygon[i].x * w, currentPolygon[i].y * h);
      }
      ctx.strokeStyle = activeConfig.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      currentPolygon.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, 5, 0, 2 * Math.PI);
        ctx.fillStyle = activeConfig.color;
        ctx.fill();
        ctx.stroke();
      });
    }
  }, [zones, currentPolygon, isDrawing, selectedZoneIndex, activeZoneType]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = Math.max(0, Math.min(1, clickX / rect.width));
    const normY = Math.max(0, Math.min(1, clickY / rect.height));

    if (isDrawing) {
      setCurrentPolygon((prev) => [...prev, { x: normX, y: normY }]);
    } else {
      let foundZoneIdx = null;
      zones.forEach((zone, zIdx) => {
        zone.polygon.forEach((pt) => {
          const px = pt.x * rect.width;
          const py = pt.y * rect.height;
          if (Math.hypot(px - clickX, py - clickY) < 12) foundZoneIdx = zIdx;
        });
      });
      setSelectedZoneIndex(foundZoneIdx);
    }
  };

  const handleMouseDown = (e) => {
    if (isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    zones.forEach((zone, zIdx) => {
      zone.polygon.forEach((pt, vIdx) => {
        const px = pt.x * rect.width;
        const py = pt.y * rect.height;
        if (Math.hypot(px - clickX, py - clickY) < 12) {
          setDraggingVertex({ zoneIdx: zIdx, vertexIdx: vIdx });
          setSelectedZoneIndex(zIdx);
        }
      });
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingVertex) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setZones((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      clone[draggingVertex.zoneIdx].polygon[draggingVertex.vertexIdx] = {
        x: Math.round(normX * 10000) / 10000,
        y: Math.round(normY * 10000) / 10000
      };
      return clone;
    });
  };

  const handleMouseUp = () => {
    setDraggingVertex(null);
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
    setSelectedZoneIndex(null);
    setNewZoneName(`${activeZoneType} Zone ${zones.length + 1}`);
  };

  const handleFinishPolygon = () => {
    if (currentPolygon.length < 2) {
      return addToast("A zone must have at least 2 points.", "warning");
    }

    const newZone = {
      zoneId: `ZONE_${Date.now().toString().slice(-6)}`,
      name: newZoneName.trim() || `${activeZoneType} Zone`,
      type: activeZoneType,
      polygon: currentPolygon.map(p => ({ x: Math.round(p.x * 10000) / 10000, y: Math.round(p.y * 10000) / 10000 })),
      enabled: true,
      rules: {
        fineType: `${activeZoneType} Violation`,
        triggerOnRedLight: activeZoneType === "Stop Line"
      }
    };

    setZones([...zones, newZone]);
    setCurrentPolygon([]);
    setIsDrawing(false);
    addToast(`Zone "${newZone.name}" created. Remember to save changes.`, "success");
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const handleToggleZone = (idx) => {
    setZones((prev) => {
      const clone = [...prev];
      clone[idx].enabled = !clone[idx].enabled;
      return clone;
    });
  };

  const handleDeleteZone = (idx) => {
    setZones((prev) => prev.filter((_, i) => i !== idx));
    if (selectedZoneIndex === idx) setSelectedZoneIndex(null);
    addToast("Zone removed from calibration.", "info");
  };

  const handleSaveConfiguration = async () => {
    if (!selectedCamera) return;
    setSaving(true);
    try {
      const payload = {
        cameraId: selectedCamera.cameraId,
        name: selectedCamera.name,
        location: selectedCamera.location,
        feedUrl: feedUrl.trim(),
        referenceImageUrl: selectedCamera.referenceImageUrl,
        resolution: selectedCamera.resolution || { width: 1920, height: 1080 },
        sampleRate: Number(sampleRate) || 2,
        zones: zones
      };

      const { data } = await api.post("/api/admin/zones", payload);
      if (data?.success) {
        addToast("Camera zone calibration saved and synchronized with AI engine.", "success");
        fetchCameras(true);
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save zone calibration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStartStream = async () => {
    if (!selectedCamera) return;
    setStreamActionLoading(true);
    try {
      await api.post(`/api/admin/zones/${selectedCamera.cameraId}/start-stream`);
      addToast(`Initiated live RTSP stream ingestion for ${selectedCamera.name}`, "success");
      syncHealthTelemetry();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to start RTSP stream.", "error");
    } finally {
      setStreamActionLoading(false);
    }
  };

  const handleStopStream = async () => {
    if (!selectedCamera) return;
    setStreamActionLoading(true);
    try {
      await api.post(`/api/admin/zones/${selectedCamera.cameraId}/stop-stream`);
      addToast(`Stopped RTSP stream for ${selectedCamera.name}`, "info");
      syncHealthTelemetry();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to stop RTSP stream.", "error");
    } finally {
      setStreamActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Camera Calibration">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  const isStreamOnline = selectedCamera?.rtspStatus === "ONLINE";
  const isStreamReconnecting = selectedCamera?.rtspStatus === "RECONNECTING" || selectedCamera?.rtspStatus === "CONNECTING";

  return (
    <Layout title="Camera Calibration & Live RTSP">
      <div className="space-y-6 pb-20 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Camera className="text-primary-600" size={26} />
              <span>Camera Calibration & Live RTSP CCTV</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Live multi-camera RTSP ingestion with auto-reconnect, dynamic geometric zones, and continuous ByteTrack vehicle enforcement.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={syncHealthTelemetry}
              disabled={syncingHealth}
              className="text-xs flex items-center space-x-1.5"
            >
              <RefreshCw size={14} className={syncingHealth ? "animate-spin text-primary-600" : "text-slate-500"} />
              <span>Sync Health</span>
            </Button>
            <Button
              onClick={handleSaveConfiguration}
              disabled={saving || isDrawing}
              className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2 shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Configuration</span>
            </Button>
          </div>
        </div>

        {/* Camera Selector Bar */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {cameras.map((cam) => {
            const isOnline = cam.rtspStatus === "ONLINE";
            const isRecon = cam.rtspStatus === "RECONNECTING" || cam.rtspStatus === "CONNECTING";

            return (
              <button
                key={cam.cameraId}
                onClick={() => handleSelectCamera(cam)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center space-x-2 shrink-0 ${
                  selectedCamera?.cameraId === cam.cameraId
                    ? "bg-primary-50 border-primary-300 text-primary-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" :
                  isRecon ? "bg-amber-500 animate-ping" : "bg-slate-300"
                }`} />
                <span>{cam.name}</span>
                <Badge variant="secondary" className="text-[10px] ml-1.5 font-mono">
                  {cam.zones?.length || 0} zones
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Stream Telemetry Bar */}
        {selectedCamera && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md border border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  isStreamOnline ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" :
                  isStreamReconnecting ? "bg-amber-400 animate-ping" : "bg-slate-500"
                }`} />
                <span className="font-bold text-sm uppercase tracking-wider">
                  {selectedCamera.rtspStatus || "OFFLINE"}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-700 hidden sm:block" />

              <div className="text-xs text-slate-300 flex items-center space-x-3 font-mono">
                <span>FPS: <strong className="text-emerald-400">{selectedCamera.fps || "0.0"}</strong></span>
                <span>Sample Rate: <strong className="text-primary-300">{sampleRate} fps</strong></span>
                <span>Reconnects: <strong className="text-amber-400">{selectedCamera.reconnectCount || 0}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isStreamOnline ? (
                <Button
                  size="sm"
                  onClick={handleStartStream}
                  disabled={streamActionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center space-x-1.5"
                >
                  {streamActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  <span>Start RTSP Ingestion</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStopStream}
                  disabled={streamActionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs flex items-center space-x-1.5"
                >
                  {streamActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} />}
                  <span>Stop Stream</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Calibration Workspace */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-slate-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-900 text-white px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
                    <Radio className={isStreamOnline ? "text-emerald-400 animate-pulse" : "text-slate-400"} size={18} />
                    <span>{selectedCamera?.name || "Camera Feed View"}</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-0.5 font-mono">
                    {feedUrl || "No RTSP URL configured"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-700 font-mono text-xs">
                  {selectedCamera?.resolution?.width || 1920} x {selectedCamera?.resolution?.height || 1080}
                </Badge>
              </CardHeader>

              <CardContent className="p-0 bg-slate-950 relative" ref={containerRef}>
                <div 
                  className="w-full aspect-[16/9] relative bg-slate-900 bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at center, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.95)), url('/traffic_pattern_bg.svg')`
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                  />
                </div>
              </CardContent>

              {/* Drawing Action Ribbon */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
                {!isDrawing ? (
                  <div className="flex items-center space-x-3">
                    <select
                      value={activeZoneType}
                      onChange={(e) => setActiveZoneType(e.target.value)}
                      className="text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-primary-500"
                    >
                      {ZONE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          + {t.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={handleStartDrawing}
                      className="bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-2 text-sm"
                    >
                      <Plus size={16} />
                      <span>Draw New Zone</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        Drawing: {activeZoneType}
                      </span>
                      <Input
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        placeholder="Zone Identifier Name"
                        className="h-8 text-xs font-medium w-48"
                      />
                      <span className="text-xs text-slate-500">Click canvas to add points ({currentPolygon.length} added)</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelDrawing}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleFinishPolygon}
                        disabled={currentPolygon.length < 2}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Complete Zone</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Zones Registry & RTSP Settings Sidebar */}
          <div className="space-y-4">
            {/* RTSP Stream Settings Card */}
            <Card className="border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Sliders size={16} className="text-primary-600" />
                <span>RTSP Stream Configuration</span>
              </div>

              <div>
                <Label className="text-xs text-slate-600 font-semibold">CCTV RTSP Source URL *</Label>
                <Input
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="rtsp://admin:pass@192.168.1.100:554/live"
                  className="font-mono text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-600 font-semibold">AI Frame Sampling Rate (FPS)</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={sampleRate}
                    onChange={(e) => setSampleRate(parseFloat(e.target.value))}
                    className="flex-1 accent-primary-600"
                  />
                  <span className="font-mono text-xs font-bold text-slate-800 w-12 text-right">{sampleRate} fps</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Recommended: 2.0 fps for real-time intersection enforcement without server lag.</p>
              </div>
            </Card>

            {/* Configured Zones Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="text-primary-600" size={18} />
                  <span>Configured Zones ({zones.length})</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Toggle active status or delete zones.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
                {zones.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No enforcement zones configured for this camera. Click "Draw New Zone" to add one.
                  </div>
                ) : (
                  zones.map((z, idx) => {
                    const zoneConfig = ZONE_TYPES.find(t => t.id === z.type) || ZONE_TYPES[0];
                    const isSelected = selectedZoneIndex === idx;

                    return (
                      <div
                        key={z.zoneId || idx}
                        onClick={() => setSelectedZoneIndex(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "bg-primary-50/50 border-primary-400 shadow-sm ring-2 ring-primary-100"
                            : z.enabled
                            ? "bg-white border-slate-200 hover:border-slate-300"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: z.enabled ? zoneConfig.color : "#94a3b8" }}
                            />
                            <span className="font-bold text-sm text-slate-900">{z.name}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] font-semibold"
                            style={{ color: zoneConfig.color, borderColor: zoneConfig.color }}
                          >
                            {z.type}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                          <span>{z.polygon?.length || 0} Vertices (Normalized)</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleZone(idx);
                              }}
                              className={`p-1 rounded hover:bg-slate-100 ${z.enabled ? "text-emerald-600" : "text-slate-400"}`}
                              title={z.enabled ? "Disable Zone" : "Enable Zone"}
                            >
                              {z.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteZone(idx);
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50"
                              title="Delete Zone"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CameraCalibration;

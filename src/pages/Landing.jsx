import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Landing() {
  const [imageURL, setImageURL] = useState(null);
  const [scans, setScans] = useState([]);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("forkai-scans")) || [];
    setScans(saved);
  }, []);

  const handleStartCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg"); // Gemini supports JPEG best
    setImageURL(dataURL);

    const updated = [dataURL, ...scans];
    setScans(updated);
    localStorage.setItem("forkai-scans", JSON.stringify(updated));

    // Extract base64 without prefix
    const base64 = dataURL.replace(/^data:image\/\w+;base64,/, "");

    setLoading(true);
    try {
      const res = await fetch(
        "https://kharabgpt-backend.onrender.com/api/gemini-vision",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image: base64,
            userGoal: "weight loss", // optional: make this user input later
          }),
        }
      );

      const data = await res.json();
      setAiResult(data.result || "No result from AI.");
    } catch (err) {
      console.error(err);
      setAiResult("❌ Failed to analyze image. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = (idxToDelete) => {
    const updated = scans.filter((_, idx) => idx !== idxToDelete);
    setScans(updated);
    localStorage.setItem("forkai-scans", JSON.stringify(updated));
  };

  return (
    <div className="bg-gradient-to-b from-white to-green-50 min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Scan Your Meals.
            <br />
            <span className="text-green-600">Get Instant Nutrition.</span>
          </h1>
          <p className="text-base sm:text-lg mb-6">
            Fork AI helps you understand your food in seconds. Just snap a
            photo, and let our AI tell you the calories, ingredients, and health
            tips.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button size="base" onClick={handleStartCamera}>
              <Camera className="mr-2 w-5 h-5" /> Open Camera
            </Button>
            <Button size="base">
              Try Fork AI <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/ChatGPT Image Jul 8, 2025, 10_44_32 PM.png"
            alt="Fork AI App Preview"
            className="w-full rounded-2xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* Camera Interface */}
      {showCamera && (
        <section className="px-4 sm:px-6 py-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Take a Photo of Your Food</h2>
          <div className="relative inline-block w-full max-w-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-xl w-full shadow"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button size="lg" className="mt-4" onClick={handleCapture}>
            Capture & Analyze
          </Button>

          {imageURL && (
            <div className="mt-6">
              <img
                src={imageURL}
                alt="Captured food"
                className="w-full max-w-md mx-auto rounded-lg shadow"
              />
              <div className="mt-4 max-w-md mx-auto">
                {loading ? (
                  <div className="text-green-600 font-semibold text-center animate-pulse">
                    Analyzing with AI...
                  </div>
                ) : aiResult ? (
                  <div className="bg-white border border-green-200 rounded-lg shadow p-4 text-left">
                    <h3 className="text-lg font-semibold mb-2 text-green-700">
                      🍽️ Nutrition Breakdown
                    </h3>
                    {aiResult && (
                      <div className="space-y-4 text-sm text-gray-700">
                        {aiResult.split(/\n\s*\n/).map((block, idx) => (
                          <div
                            key={idx}
                            className="bg-green-50 p-3 rounded-lg border-l-4 border-green-300 shadow-sm"
                          >
                            <div
                              dangerouslySetInnerHTML={{
                                __html: block
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>"
                                  )
                                  .replace(/^- /gm, "• "),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Saved Scans */}
      {scans.length > 0 && (
        <section className="px-4 sm:px-6 py-12 bg-white">
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Your Previous Scans
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {scans.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`Scan ${idx + 1}`}
                  className="rounded-lg shadow-md hover:scale-105 transition-transform"
                />
                <button
                  onClick={() => handleDeleteScan(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  title="Delete Scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🍱",
              title: "Snap & Analyze",
              desc: "Click a photo of any meal and our AI will break it down instantly.",
            },
            {
              icon: "📊",
              title: "Track Calories",
              desc: "Automatically calculate calories and macronutrients without any manual entry.",
            },
            {
              icon: "🧠",
              title: "Personal Advice",
              desc: "Get custom food suggestions based on your health goals and region.",
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="p-6 bg-green-50 rounded-xl shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Ready to know what's on your plate?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Button size="lg" className="text-base sm:text-lg px-8 py-4">
            Get Started with Fork AI <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

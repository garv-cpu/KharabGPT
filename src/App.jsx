// App.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("bharatGPT_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(".");

  useEffect(() => {
    localStorage.setItem("bharatGPT_chats", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setTypingDots((dots) => (dots.length >= 3 ? "." : dots + "."));
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  const exportChat = (format) => {
    const data =
      format === "json"
        ? JSON.stringify(messages, null, 2)
        : messages
            .map((m) => `${m.from === "user" ? "You" : "BharatGPT"}: ${m.text}`)
            .join("\n");

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `BharatGPT_Chat.${format === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://kharabgpt-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();
      if (data.result) {
        setMessages((prev) => [...prev, { from: "bot", text: data.result }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Bhai thoda error ho gaya, phir se try karo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-red-400">Kharab GPT</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              msg.from === "user"
                ? "ml-auto bg-green-500 text-black"
                : "mr-auto bg-[#1e222a]"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div className="mr-auto bg-[#1e222a] px-4 py-2 rounded-2xl text-sm text-gray-400">
            BharatGPT soch raha hai{typingDots}
          </motion.div>
        )}
      </main>

      <div className="fixed bottom-0 w-full bg-[#0d1117] border-t border-gray-800 px-4 py-3 flex items-center gap-2">
        <button className="text-gray-400">
          <Mic className="w-5 h-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type in Hindi, Tamil, Hinglish..."
          className="flex-1 bg-[#1e222a] px-4 py-2 rounded-full text-sm text-white focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-400"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-center gap-3 py-2 bg-[#0d1117] text-sm text-gray-400">
        <button onClick={() => exportChat("txt")} className="hover:underline">
          📄 Export as TXT
        </button>
        <button onClick={() => exportChat("json")} className="hover:underline">
          🧾 Export as JSON
        </button>
      </div>
    </div>
  );
}

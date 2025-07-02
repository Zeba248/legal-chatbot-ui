import React, { useState, useRef } from "react";
import axios from "axios";

const App = () => {
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState("");
  const [docId, setDocId] = useState(null);
  const [filename, setFilename] = useState(null);
  const fileInputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData);
      setDocId(res.data.doc_id);
      setFilename(res.data.filename);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `\uD83D\uDCC4 I got your PDF **${res.data.filename}** — Kya karna chahte ho?\n👉 Summarize / Extract legal info / Ask questions`,
        },
      ]);
    } catch (err) {
      alert("Failed to upload PDF");
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    const newChat = [...chat, { role: "user", content: question }];
    setChat(newChat);
    setQuestion("");

    try {
      const res = await axios.post("/ask", {
        question,
        history: newChat,
        doc_id: docId,
      });
      setChat((prev) => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "\u274C Server error. Try again later." },
      ]);
    }
  };

  const handleReset = () => {
    setChat([]);
    setDocId(null);
    setFilename(null);
    setQuestion("");
    fileInputRef.current.value = null;
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 p-4 border-r bg-white">
        <h2 className="font-bold mb-4">📁 Upload PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          ref={fileInputRef}
          className="mb-4"
        />
        <button className="bg-emerald-600 text-white px-4 py-1 rounded w-full" onClick={() => document.body.classList.toggle("dark")}>🌙 Dark Mode</button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b font-bold text-xl">ATOZ Legal Chatbot</div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-xl px-4 py-2 rounded-lg whitespace-pre-line ${msg.role === "user" ? "bg-emerald-100 ml-auto" : "bg-gray-100"}`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex items-center gap-2">
          <button
            onClick={handleUpload}
            className="px-3 py-1 border rounded text-sm"
          >Upload</button>
          <input
            className="flex-1 border px-4 py-2 rounded"
            placeholder="Ask your legal question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="bg-emerald-600 text-white px-4 py-2 rounded">
            Send
          </button>
          <button onClick={handleReset} className="border px-3 py-2 rounded">
            Reset
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => window.open("https://wa.me/919999999999", "_blank")}
          >
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.response || "⚠️ Unexpected reply." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Backend not responding. Please try again later." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 text-xl font-bold shadow">
        ⚖️ ATOZ Legal Chatbot
      </header>

      {/* Chat Body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] px-4 py-2 rounded-lg shadow text-sm ${
              msg.sender === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="bg-white text-gray-500 px-4 py-2 rounded-lg shadow text-sm w-fit">
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input */}
      <footer className="bg-white p-4 border-t flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask your legal question..."
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;

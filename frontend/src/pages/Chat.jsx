import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm ClearPath AI. Ask me anything about US immigration, visas, or OPT/STEM OPT.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  const email = localStorage.getItem("email");
  const sessionId = localStorage.getItem("session_id") || `session_${Date.now()}`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!localStorage.getItem("session_id")) {
      localStorage.setItem("session_id", sessionId);
    }
  }, []);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat/ask", {
        question: input,
        session_id: sessionId,
        user_id: 1, // hardcoded for now, will use JWT later
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send message on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Navbar */}
      <div className="bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-white font-bold text-xl">ClearPath AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{email}</span>
          <button
            onClick={() => navigate("/visa")}
            className="text-blue-400 hover:underline text-sm"
          >
            Visa Predictor
          </button>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:underline text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900 px-4 py-4 border-t border-gray-800 flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about visas, OPT, STEM OPT..."
          rows={1}
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
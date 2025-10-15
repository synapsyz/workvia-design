"use client";

import React, { useState } from "react";
import Head from "next/head";
import { Bell, Settings, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋, I’m your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm processing your request..." },
      ]);
    }, 800);
  };

  return (
    <>
      <Head>
        <title>WorkVia — AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="min-h-screen bg-gray-50 text-gray-900 flex"
        style={{
          fontFamily:
            'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <main className="flex-1 p-6 flex flex-col h-screen">

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-md ${
                      msg.role === "user"
                        ? "bg-[#0A236E] text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* INPUT BOX */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-full bg-[#0A236E] hover:bg-[#0A236E]/90 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

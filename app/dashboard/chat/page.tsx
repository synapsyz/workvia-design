"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  Phone,
  Video,
  Search,
  Paperclip,
  Send,
} from "lucide-react";

/* --------------------------
   Types
   -------------------------- */
type Presence = "online" | "away" | "offline";

interface User {
  id: string;
  name: string;
  avatar?: string;
  presence?: Presence;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  system?: boolean;
}

interface Conversation {
  id: string;
  type: "group" | "dm";
  title: string;
  members: User[];
  lastMessage?: string;
  unread?: number;
  messages: Message[];
}

/* --------------------------
   Mock data
   -------------------------- */
const me: User = {
  id: "u_me",
  name: "You",
  avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  presence: "online",
};

const users: User[] = [
  {
    id: "u1",
    name: "Asha Raman",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    presence: "online",
  },
  {
    id: "u2",
    name: "Rohit Kumar",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    presence: "away",
  },
  {
    id: "u3",
    name: "Sahana",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    presence: "offline",
  },
];

const initialConversations: Conversation[] = [
  {
    id: "g1",
    type: "group",
    title: "Product Team",
    members: [me, users[0], users[1]],
    lastMessage: "Planning sprint tomorrow",
    unread: 2,
    messages: [
      {
        id: "m1",
        senderId: "u1",
        text: "Hey team! Sprint planning tomorrow at 10AM.",
        time: new Date().toISOString(),
      },
      {
        id: "m2",
        senderId: "u_me",
        text: "I'll be there.",
        time: new Date().toISOString(),
      },
    ],
  },
  {
    id: "d1",
    type: "dm",
    title: "Chat with Rohit",
    members: [me, users[1]],
    lastMessage: "Thanks!",
    unread: 1,
    messages: [
      {
        id: "m3",
        senderId: "u2",
        text: "Can you review the PR?",
        time: new Date().toISOString(),
      },
      {
        id: "m4",
        senderId: "u_me",
        text: "On it, will update by EOD.",
        time: new Date().toISOString(),
      },
    ],
  },
];

/* --------------------------
   Component
   -------------------------- */
export default function ChatPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string>(
    initialConversations[0].id
  );
  const [input, setInput] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selected = conversations.find((c) => c.id === selectedId)!;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected.messages.length]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: me.id,
      text: input,
      time: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessage: input,
              unread: 0,
            }
          : c
      )
    );
    setInput("");
    setAttachedFileName("");
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex"
      style={{
        fontFamily:
          'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <main className="flex-1 p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat + Input Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chat Header */}
            <div className="flex items-center justify-between bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
              <div>
                <h3 className="font-semibold">{selected.title}</h3>
                <p className="text-xs text-gray-500">
                  {selected.members.length} members
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md hover:bg-gray-50">
                  <Phone className="w-4 h-4 text-[#0A236E]" />
                </button>
                <button className="p-2 rounded-md hover:bg-gray-50">
                  <Video className="w-4 h-4 text-[#0A236E]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-[60vh] overflow-y-auto flex flex-col gap-3">
              {selected.messages.map((m) => {
                const mine = m.senderId === me.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[78%] ${
                        mine
                          ? "bg-[#0A236E] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="text-sm">{m.text}</div>
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {new Date(m.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachedFileName(f.name);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-md hover:bg-gray-50"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 outline-none border border-gray-100 rounded-md px-3 py-2 text-sm"
                  placeholder={
                    attachedFileName ? attachedFileName : "Type a message..."
                  }
                />
                <button
                  onClick={sendMessage}
                  className="bg-[#0A236E] text-white px-3 py-2 rounded-md text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>

          {/* Right Side Column */}
          <aside className="space-y-4">
            {/* Chat List + Search */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Chats</h4>
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md outline-none"
                />
              </div>
              <div className="space-y-2 max-h-[25vh] overflow-y-auto">
                {filteredConversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-2 rounded-md cursor-pointer ${
                      c.id === selectedId ? "bg-[#F1F5FF]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {c.lastMessage}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-sm mb-3">Details</h4>
              {selected.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 mb-2">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.presence}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-semibold text-sm mb-2">About</h4>
              <p className="text-xs text-gray-500">
                This is a demo chat workspace. Integrate backend or WebRTC for
                real-time messaging and calls.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

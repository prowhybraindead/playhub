"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Pause, Play } from "lucide-react";

interface AIMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

const AUTO_PROMPTS = [
  "Give a brief, dramatic summary of what happened in this specific historical race.",
  "Were there any major rivalries, crashes, or surprising strategic choices in this race?",
  "Who was the Driver of the Day, and who had the biggest disappointment in this event?",
  "What was the championship context going into this specific race weekend?",
];

export function F1AIAssistant({ historicalContext }: { historicalContext?: string }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);
  const [autoIndex, setAutoIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // We rely strictly on the historicalContext from the wrapper
  // Reset chat when race context changes
  useEffect(() => {
    if (historicalContext && historicalContext.includes("Analyzing")) {
      setMessages([
        {
           id: "sys_1",
           role: "assistant",
           content: `🏎️ Context shifted: ${historicalContext.split(":")[1]}. Ready to answer historical stats!`,
           timestamp: new Date()
        }
      ]);
      // Re-enable autopilot with fresh context
      setAutoPilot(true);
      setAutoIndex(0);
    }
  }, [historicalContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAI = useCallback(async (prompt: string, isAutomatic: boolean) => {
    if (isLoading) return;
    setIsLoading(true);

    if (!isAutomatic) {
      // User message - add to chat
      const userMsg: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    try {
      const res = await fetch("/api/f1-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: historicalContext || "General F1 Trivia and Historical Records."
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const aiMsg: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Unable to fetch AI analysis at this moment. Will retry shortly.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Connection error. Will retry shortly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, historicalContext]);

  // Auto-pilot: send a prompt occasionally to discuss history
  useEffect(() => {
    if (!autoPilot) return;

    // Send first auto message after 5 seconds
    const initialTimeout = setTimeout(() => {
      const prompt = AUTO_PROMPTS[autoIndex % AUTO_PROMPTS.length];
      sendToAI(prompt, true);
      setAutoIndex((prev) => prev + 1);
    }, 5000);

    const interval = setInterval(() => {
      const prompt = AUTO_PROMPTS[autoIndex % AUTO_PROMPTS.length];
      sendToAI(prompt, true);
      setAutoIndex((prev) => prev + 1);
    }, 60000); // Every 1 minute for history tour

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [autoPilot, autoIndex, sendToAI]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    setAutoPilot(false); // Disable auto-pilot once user interacts
    sendToAI(input.trim(), false);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            🤖 F1 Archives AI
          </CardTitle>
          <div className="flex items-center gap-2">
            {autoPilot ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <Play className="w-3 h-3" /> Auto-Review
              </span>
            ) : (
               <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
               Paused (User Input)
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2 flex-1 overflow-hidden flex flex-col gap-2">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center p-4">
              <Bot className="w-8 h-8 mb-2 opacity-30" />
              <p>AI Analyst is warming up...</p>
              <p className="text-[10px] mt-1">Select a historical race to begin!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600/30 border border-blue-500/30 text-blue-100"
                    : "bg-slate-800/60 border border-slate-700/30 text-slate-200"
                }`}
              >
                {msg.content}
                <div className="text-[8px] text-slate-500 mt-1">
                  {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi AI về chặng đua này..."
            className="bg-slate-800/60 border-slate-700/50 text-white text-xs h-8 placeholder:text-slate-500"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 h-8 w-8 p-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

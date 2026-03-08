"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Play, Sparkles } from "lucide-react";

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

  // Reset chat when race context changes
  useEffect(() => {
    if (historicalContext && historicalContext.includes("Analyzing")) {
      const racePart = historicalContext.split(":")[1]?.split(".")[0] || "this race";
      setMessages([
        {
           id: "sys_1",
           role: "assistant",
           content: `🏎️ Now reviewing${racePart}. I'll start analyzing shortly — or ask me anything!`,
           timestamp: new Date()
        }
      ]);
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

  // Auto-pilot: send prompts periodically
  useEffect(() => {
    if (!autoPilot) return;

    const initialTimeout = setTimeout(() => {
      const prompt = AUTO_PROMPTS[autoIndex % AUTO_PROMPTS.length];
      sendToAI(prompt, true);
      setAutoIndex((prev) => prev + 1);
    }, 5000);

    const interval = setInterval(() => {
      const prompt = AUTO_PROMPTS[autoIndex % AUTO_PROMPTS.length];
      sendToAI(prompt, true);
      setAutoIndex((prev) => prev + 1);
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [autoPilot, autoIndex, sendToAI]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    setAutoPilot(false);
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
    <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-sm h-full flex flex-col rounded-2xl shadow-2xl overflow-hidden">
      <CardHeader className="pb-2.5 pt-3 px-3 sm:px-4 border-b border-slate-800/30 bg-gradient-to-r from-slate-900/90 to-emerald-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-bold text-white">
              F1 Archives AI
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {autoPilot ? (
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                <Play className="w-2.5 h-2.5" /> Auto
              </span>
            ) : (
               <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-medium bg-slate-800/50 rounded-full px-2 py-0.5">
                Manual
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-2 flex-1 overflow-hidden flex flex-col gap-2">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center p-4 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-emerald-500/40" />
              </div>
              <p className="font-medium text-slate-400">AI Analyst Ready</p>
              <p className="text-[10px] text-slate-600 max-w-[200px]">Select a historical race to begin automated analysis, or ask me anything!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] sm:text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-br-sm"
                    : "bg-slate-800/50 border border-slate-700/20 text-slate-200 rounded-bl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[8px] text-slate-500/60 mt-1.5">
                  {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-slate-800/50 border border-slate-700/20 rounded-xl rounded-bl-sm px-3 py-2.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
            placeholder="Ask about this race..."
            className="bg-slate-800/50 border-slate-700/30 text-white text-xs h-8 sm:h-9 placeholder:text-slate-600 rounded-lg focus-visible:ring-emerald-500/30"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-lg shadow-md shadow-emerald-500/10 transition-all duration-200"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

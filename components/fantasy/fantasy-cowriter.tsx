"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/components/providers/i18n-provider";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function FantasyCoWriter({ universe }: { universe: string }) {
  const { t, locale } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: t("Nhà lữ hành, ngòi bút ma thuật đã sẵn sàng. Hãy viết câu đầu tiên cho chương tiếp theo trong vũ trụ ") + universe + t(", tôi sẽ tiếp nối câu chuyện cùng bạn..."),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build context from last 4 messages to keep context window reasonable
    const storyContext = messages
      .slice(-4)
      .map(m => m.content)
      .join("\n\n");

    try {
      const res = await fetch("/api/fantasy/co-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          storyContext,
          universe,
          language: locale
        })
      });

      const data = await res.json();
      
      if (res.ok && data.message) {
        setMessages((prev) => [
          ...prev, 
          { id: (Date.now() + 1).toString(), role: "ai", content: data.message }
        ]);
      } else {
        throw new Error(data.error || "Failed to generate story");
      }
    } catch (error) {
       setMessages((prev) => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: "ai", content: t("Ngòi bút đã cạn mực, một thế lực hắc ám đang cản trở. Thử lại sau.") }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent z-0" />
      
      <div className="p-4 border-b border-white/10 flex items-center justify-between z-10 bg-black/20">
        <h3 className="font-semibold text-amber-100 flex items-center gap-2">
           <Feather className="w-4 h-4 text-amber-400" />
           {t("Co-writer AI Scribe")}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
          {universe}
        </span>
      </div>

      <ScrollArea className="flex-1 p-4 z-10" ref={scrollRef}>
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className={`w-8 h-8 border shadow-sm ${m.role === "user" ? "border-cyan-500/50" : "border-amber-500/50"}`}>
                  <AvatarFallback className={m.role === "user" ? "bg-cyan-950 text-cyan-200" : "bg-amber-950 text-amber-200"}>
                    {m.role === "user" ? "U" : <Feather className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md
                  ${m.role === "user" 
                    ? "bg-cyan-900/40 text-cyan-50 rounded-tr-sm border border-cyan-500/20" 
                    : "bg-black/40 text-amber-50/90 rounded-tl-sm border border-amber-500/20 italic font-serif"
                  }
                `}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 border border-amber-500/50 shadow-sm">
                <AvatarFallback className="bg-amber-950 text-amber-200">
                  <Feather className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-black/40 rounded-2xl rounded-tl-sm px-4 py-3 border border-amber-500/20 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
                <span className="text-xs text-amber-200/70 italic">{t("Đang dệt nên câu chuyện...")}</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 bg-black/40 border-t border-white/10 z-10 backdrop-blur-md">
        <div className="flex gap-2">
           <Textarea 
             className="min-h-[44px] max-h-32 resize-none bg-black/50 border-white/10 focus-visible:ring-amber-500/50 rounded-xl"
             placeholder={t("Tiếp tục câu chuyện...")}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSubmit();
               }
             }}
           />
           <Button 
             onClick={handleSubmit} 
             disabled={isLoading || !input.trim()}
             size="icon"
             className="h-auto w-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
           </Button>
        </div>
      </div>
    </div>
  );
}

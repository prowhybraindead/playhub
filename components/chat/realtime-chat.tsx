"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Hash, Users, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  user_id: string;
  room_id: string;
  message: string;
  created_at: string;
  profile: { username: string | null; avatar_url: string | null; status: string | null } | null;
};

type OnlineProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  status: string | null;
};

const ROOM_OPTIONS = [
  { id: "global", label: "Global", emoji: "🌍" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "anime", label: "Anime", emoji: "🎌" },
  { id: "books", label: "Books", emoji: "📚" },
  { id: "fantasy", label: "Fantasy", emoji: "🐉" },
];

export function RealtimeChat({ userId, initialRoom }: { userId: string; initialRoom: string }) {
  const { t } = useTranslation();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [activeRoom, setActiveRoom] = useState(ROOM_OPTIONS.some(r => r.id === initialRoom) ? initialRoom : "global");
  const [onlineUsers, setOnlineUsers] = useState<OnlineProfile[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const chatChannelRef = useRef<any>(null);
  const lastTypingBroadcast = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Clear stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, time] of Object.entries(next)) {
          if (now - time > 4000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id,user_id,room_id,message,created_at")
        .eq("room_id", activeRoom)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) {
        toast.error(error.message);
        return;
      }

      const rawMessages = (data ?? []) as any[];
      if (!rawMessages.length) {
        setMessages([]);
        return;
      }

      const userIds = Array.from(new Set(rawMessages.map((m) => m.user_id))).filter(id => id !== null);
      
      let profilesList: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id,username,avatar_url,status")
          .in("id", userIds);
        profilesList = profilesData ?? [];
      }

      const normalized = rawMessages.map((item) => {
        const profile = profilesList.find((p) => p.id === item.user_id) ?? null;
        return {
          ...item,
          profile
        };
      }) as Message[];
      setMessages(normalized);
    };
    void load();
  }, [activeRoom, supabase]);

  useEffect(() => {
    const channel = supabase.channel(`chat-room-${activeRoom}`, {
      config: {
        presence: {
          key: userId
        },
        broadcast: { ack: false }
      }
    });
    chatChannelRef.current = channel;

    const syncOnlineUsers = async () => {
      const state = channel.presenceState();
      const ids = Object.keys(state);
      if (!ids.length) {
        setOnlineUsers([]);
        return;
      }
      const { data } = await supabase.from("profiles").select("id,username,avatar_url,status").in("id", ids);
      setOnlineUsers((data ?? []) as OnlineProfile[]);
    };

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom}` }, async (payload) => {
        const inserted = payload.new as { id: string; user_id: string; room_id: string; message: string; created_at: string };
        
        setMessages((prev) => {
          if (prev.some((m) => m.id === inserted.id)) return prev;
          
          void supabase.from("profiles").select("username,avatar_url,status").eq("id", inserted.user_id).maybeSingle().then(({ data: profile }) => {
            setMessages((current) => current.map((m) => m.id === inserted.id ? { ...m, profile } : m));
          });
          
          return [...prev, { ...inserted, profile: null }];
        });

        // Clear typing indicator when user actually sends a message
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[inserted.user_id || "gemini"];
          return next;
        });
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const { userId: typerId, isTyping } = payload.payload;
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (isTyping) next[typerId] = Date.now();
          else delete next[typerId];
          return next;
        });
      })
      .on("presence", { event: "sync" }, () => {
        void syncOnlineUsers();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await Promise.all([
            channel.track({ online_at: new Date().toISOString(), room: activeRoom }),
            supabase.from("profiles").update({ is_online: true }).eq("id", userId)
          ]);
        }
      });

    return () => {
      supabase.from("profiles").update({ is_online: false }).eq("id", userId);
      channel.unsubscribe();
      chatChannelRef.current = null;
    };
  }, [activeRoom, supabase, userId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const messageText = text.trim();
    setText("");
    
    // Tell others we stopped typing immediately
    if (chatChannelRef.current) {
      chatChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: false }
      });
      lastTypingBroadcast.current = 0;
    }

    const tempId = `temp-${Date.now()}`;
    const me = onlineUsers.find((u) => u.id === userId) || null;
    const tempMsg: Message = {
      id: tempId,
      user_id: userId,
      room_id: activeRoom,
      message: messageText,
      created_at: new Date().toISOString(),
      profile: me
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await supabase.from("chat_messages").insert({ user_id: userId, room_id: activeRoom, message: messageText }).select("id").single();
    
    if (error) {
      toast.error(error.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }
    
    setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: data.id } : m));

    if (messageText.toLowerCase().startsWith("@gemini")) {
      const prompt = messageText.substring(7).trim();
      if (prompt) {
        // Let everyone know Gemini is typing
        if (chatChannelRef.current) {
          chatChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: 'gemini', isTyping: true }
          });
        }
        // Local state as well
        setTypingUsers(prev => ({ ...prev, 'gemini': Date.now() + 10000 })); // 10s timeout buffer
        
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: activeRoom, prompt })
        }).catch(err => console.error("Failed to trigger gemini chat", err));
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    
    const now = Date.now();
    if (chatChannelRef.current && now - lastTypingBroadcast.current > 2000) {
      chatChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: val.length > 0 }
      });
      lastTypingBroadcast.current = now;
    }
    
    // Immediate clear if text becomes empty
    if (val.length === 0 && chatChannelRef.current) {
      chatChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: false }
      });
    }
  };

  const activeRoomInfo = ROOM_OPTIONS.find(r => r.id === activeRoom);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 md:px-8 md:py-6">
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_260px] gap-4">
        {/* Main Chat Area */}
        <Card className="border-slate-800/50 bg-slate-900/60 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[75vh] sm:h-[70vh]">
          {/* Header */}
          <CardHeader className="border-b border-slate-800/30 bg-gradient-to-r from-slate-900 to-slate-800/60 px-3 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-sm sm:text-base font-bold text-white">{activeRoomInfo?.emoji} {t("Realtime Chat")}</CardTitle>
                <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hidden sm:inline-flex">
                  {onlineUsers.length} online
                </Badge>
              </div>
              
              {/* Room Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                {ROOM_OPTIONS.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      activeRoom === room.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <span>{room.emoji}</span>
                    <span className="hidden sm:inline">{room.label}</span>
                  </button>
                ))}

                {/* Mobile: Toggle Online Users */}
                <button
                  onClick={() => setShowUsers(!showUsers)}
                  className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all"
                >
                  <Users className="w-3 h-3" />
                  <span>{onlineUsers.length}</span>
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Mobile Online Users Drawer */}
          {showUsers && (
            <div className="lg:hidden border-b border-slate-800/30 bg-slate-900/80 px-3 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
              {onlineUsers.map((profile) => (
                <div key={profile.id} className="flex items-center gap-1.5 bg-slate-800/60 rounded-full px-2 py-1 shrink-0">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[8px]">{(profile.username?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-300 truncate max-w-[60px]">
                    {profile.id === userId ? t("You") : profile.username ?? "User"}
                  </span>
                </div>
              ))}
              {!onlineUsers.length && <p className="text-[10px] text-slate-500">{t("No active presence yet.")}</p>}
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 overflow-hidden flex flex-col px-0 py-0">
            <div className="flex-1 overflow-auto px-3 sm:px-4 py-3 space-y-3">
              {messages.map((message) => {
                const isGemini = message.user_id === null;
                const isMe = message.user_id === userId;
                return (
                  <div key={message.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 mt-0.5 shadow-sm">
                      {isGemini ? (
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={message.profile?.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 text-xs font-bold">
                            {(message.profile?.username?.[0] ?? "U").toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`max-w-[75%] sm:max-w-[70%] ${isMe ? "text-right" : ""}`}>
                      <p className={`text-[10px] sm:text-xs font-semibold mb-0.5 ${isGemini ? "text-purple-400" : isMe ? "text-cyan-300" : "text-slate-400"}`}>
                        {isGemini ? "Gemini Bot ✨" : isMe ? t("You") : (message.profile?.username ?? t("Unknown"))}
                      </p>
                      <div className={`rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed inline-block text-left ${
                        isGemini 
                          ? "bg-gradient-to-br from-violet-500/15 to-purple-500/10 border border-purple-500/20 text-purple-100 rounded-bl-sm"
                          : isMe
                          ? "bg-gradient-to-br from-cyan-600/20 to-blue-600/15 border border-cyan-500/20 text-cyan-50 rounded-br-sm"
                          : "bg-slate-800/50 border border-slate-700/20 text-slate-200 rounded-bl-sm"
                      }`}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicators */}
            {Object.keys(typingUsers).filter(id => id !== userId).length > 0 && (
              <div className="px-4 pb-2 pt-1 flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] sm:text-xs text-slate-400 italic">
                  {Object.keys(typingUsers).filter(id => id !== userId).map(id => {
                    if (id === 'gemini') return 'Gemini Bot ✨';
                    const user = onlineUsers.find(u => u.id === id);
                    return user?.username || 'Someone';
                  }).join(", ")} {Object.keys(typingUsers).filter(id => id !== userId).length > 1 ? 'are' : 'is'} typing
                </span>
                <span className="flex gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-slate-800/30 bg-slate-900/60 px-3 sm:px-4 py-2.5 flex items-center gap-2">
              <Input
                value={text}
                onChange={handleTextChange}
                placeholder={`${t("Message")} #${activeRoom}...`}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void sendMessage();
                }}
                className="bg-slate-800/50 border-slate-700/30 text-white text-xs sm:text-sm h-9 rounded-xl placeholder:text-slate-600 focus-visible:ring-cyan-500/30"
              />
              <Button 
                onClick={sendMessage} 
                size="icon"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 h-9 w-9 rounded-xl shadow-md shadow-cyan-500/10 transition-all duration-200 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Desktop: Online Users Sidebar */}
        <Card className="hidden lg:flex flex-col border-slate-800/50 bg-slate-900/60 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/30 bg-gradient-to-r from-slate-900 to-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-bold text-white">{t("Online Users")}</CardTitle>
              <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {onlineUsers.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-3 py-3 space-y-1.5">
            {onlineUsers.map((profile) => (
              <div key={profile.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-800/40 transition-colors">
                <Avatar className="h-7 w-7 shadow-sm">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 text-[10px] font-bold">
                    {(profile.username?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span className="text-xs text-white font-medium truncate">
                      {profile.id === userId ? t("You") : profile.username ?? profile.id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 truncate block pl-3.5">
                    {profile.status ?? t("Online")}
                  </span>
                </div>
              </div>
            ))}
            {!onlineUsers.length && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t("No active presence yet.")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

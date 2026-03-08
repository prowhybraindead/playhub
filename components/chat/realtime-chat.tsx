"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
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

const ROOM_OPTIONS = ["global", "music", "anime", "books", "fantasy"];

export function RealtimeChat({ userId, initialRoom }: { userId: string; initialRoom: string }) {
  const { t } = useTranslation();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [activeRoom, setActiveRoom] = useState(ROOM_OPTIONS.includes(initialRoom) ? initialRoom : "global");
  const [onlineUsers, setOnlineUsers] = useState<OnlineProfile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        }
      }
    });

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
        
        // Prevent duplicates from realtime echo if we optimistically added it
        setMessages((prev) => {
          if (prev.some((m) => m.id === inserted.id)) return prev;
          
          // We don't have the profile instantly, so we fetch it async and update state again
          void supabase.from("profiles").select("username,avatar_url,status").eq("id", inserted.user_id).maybeSingle().then(({ data: profile }) => {
            setMessages((current) => current.map((m) => m.id === inserted.id ? { ...m, profile } : m));
          });
          
          return [...prev, { ...inserted, profile: null }];
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
    };
  }, [activeRoom, supabase, userId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const messageText = text.trim();
    setText(""); // Clear input early

    // Optimistic update
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
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }
    
    // Swap temp id with real id
    setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, id: data.id } : m));

    // Handle @gemini command
    if (messageText.toLowerCase().startsWith("@gemini")) {
      const prompt = messageText.substring(7).trim();
      if (prompt) {
        // We don't await this, let it process in the background
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: activeRoom, prompt })
        }).catch(err => console.error("Failed to trigger gemini chat", err));
      }
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_280px] md:px-8">
      <Card className="h-[70vh]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{t("Realtime Chat Room")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((room) => (
                <Button key={room} size="sm" variant={activeRoom === room ? "default" : "ghost"} onClick={() => setActiveRoom(room)}>
                  {room}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex h-[calc(70vh-100px)] flex-col">
          <div className="mb-3 flex-1 space-y-3 overflow-auto pr-2">
            {messages.map((message) => {
              const isGemini = message.user_id === null;
              return (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  {isGemini ? (
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">✨</AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={message.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{(message.profile?.username?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
                  <p className={`text-xs ${isGemini ? "text-purple-400 font-semibold" : "text-cyan-200"}`}>
                    {isGemini ? "Gemini Bot" : (message.profile?.username ?? t("Unknown"))}
                  </p>
                  <p className="text-sm text-foreground">{message.message}</p>
                </div>
              </div>
            )})}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={`${t("Nhắn vào room #")}${activeRoom}`}
              onKeyDown={(event) => {
                if (event.key === "Enter") void sendMessage();
              }}
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Online Users")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {onlineUsers.map((profile) => (
            <div key={profile.id} className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>{(profile.username?.[0] ?? "U").toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="truncate">{profile.id === userId ? t("You") : profile.username ?? profile.id.slice(0, 8)}</span>
              <Badge variant="outline" className="text-[10px]">
                {profile.status ?? t("Online")}
              </Badge>
            </div>
          ))}
          {!onlineUsers.length ? <p className="text-muted-foreground">{t("No active presence yet.")}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

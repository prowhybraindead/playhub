"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
      if (!isEmailFormatValid) {
        throw new Error("Please enter a valid email address.");
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        toast.success("Welcome back to Dolphin Playhub!");
        router.replace("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Signup completed! You're now logged in.");
          router.replace("/dashboard");
          router.refresh();
        } else {
          toast.success("Signup completed! Check your inbox to confirm your email.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-cyan-300/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Dolphin Playhub</CardTitle>
        <CardDescription>Sign in to your personal ocean of fun.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>
        <Button variant="secondary" className="w-full" onClick={loginWithGoogle} disabled={loading}>
          Continue with Google
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setMode(mode === "login" ? "signup" : "login")} disabled={loading}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </Button>
      </CardContent>
    </Card>
  );
}

import { Waves } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,224,255,0.22),transparent_38%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.2),transparent_38%)]" />
      <div className="mb-8 mr-0 hidden max-w-md md:mr-16 md:block">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-cyan-100">
          <Waves className="h-4 w-4" />
          <span>Private Project</span>
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Dolphin Playhub</h1>
        <p className="text-muted-foreground">A futuristic personal dashboard for music, fandoms, chat, and upgrades.</p>
      </div>
      <AuthForm />
    </div>
  );
}

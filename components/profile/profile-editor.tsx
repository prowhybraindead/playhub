"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEditorProps {
  userId: string;
  initial: {
    username: string;
    bio: string;
    status: string;
    avatar_url?: string | null;
    banner_url?: string | null;
  };
}

export function ProfileEditor({ userId, initial }: ProfileEditorProps) {
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [status, setStatus] = useState(initial.status);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(initial.banner_url ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  // VI: Upload ảnh lên Supabase Storage và lấy public URL.
  // EN: Upload image to Supabase Storage and return a public URL.
  const uploadFile = async (file: File, bucket: "avatars" | "banners") => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${userId}/${bucket}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSave = () => {
    // VI: Lưu profile bằng upsert để hỗ trợ cả tạo mới và cập nhật.
    // EN: Persist profile with upsert to support create + update in one flow.
    startTransition(async () => {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          username,
          bio,
          status,
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          is_online: true
        },
        { onConflict: "id" }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Profile updated");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 md:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Customization</CardTitle>
          <CardDescription>Upload your avatar and banner, then update your ocean identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={(event) => setStatus(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, "avatars");
                    setAvatarUrl(url);
                    toast.success("Avatar uploaded");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Upload failed");
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">Banner</Label>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadFile(file, "banners");
                    setBannerUrl(url);
                    toast.success("Banner uploaded");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Upload failed");
                  }
                }}
              />
            </div>
          </div>
          <Button onClick={onSave} disabled={isPending}>
            <Upload className="mr-2 h-4 w-4" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

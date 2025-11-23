"use client";

import * as React from "react";
import Image from "next/image";
import { useState } from "react";
import { Upload, Image as ImageIcon, Info, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/kokonutui/file-upload";
import { prepareImageForUpload } from "@/lib/client-image/prepare";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectedLensLook = "35mm" | "50mm" | "85mm/macro";

export function GenerateForm() {
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [dishPreviewUrl, setDishPreviewUrl] = useState<string | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [lensLook, setLensLook] = useState<SelectedLensLook>("50mm");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  const maxFileSizeBytes = 15 * 1024 * 1024;

  React.useEffect(() => {
    if (!dishFile) {
      setDishPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(dishFile);
    setDishPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [dishFile]);

  React.useEffect(() => {
    if (!backgroundFile) {
      setBackgroundPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(backgroundFile);
    setBackgroundPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [backgroundFile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhance Photo</CardTitle>
        <CardDescription>
          Upload your dish photo and optionally a background and style hint.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex gap-5 max-[991px]:flex-col max-[991px]:gap-0">
          <div className="flex flex-col w-1/2 max-[991px]:w-full">
            <div className="grid gap-2 max-w-[500px] min-h-[200px]">
              <Label>Dish photo (JPEG/PNG/HEIC, up to 15 MB)</Label>
              <FileUpload
                acceptedFileTypes={acceptedTypes}
                maxFileSize={maxFileSizeBytes}
                onUploadSuccessAction={(file) => setDishFile(file)}
                onFileRemoveAction={() => setDishFile(null)}
                uploadDelay={0}
              />
              {dishFile ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded border">
                    {dishPreviewUrl ? (
                      <Image
                        src={dishPreviewUrl}
                        alt="Dish preview"
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{dishFile.name}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Upload className="size-3.5" /> Choose a dish photo to begin</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-1/2 ml-5 max-[991px]:w-full max-[991px]:ml-0">
            <div className="grid gap-2 max-w-[500px]">
              <Label>Background (optional)</Label>
              <FileUpload
                acceptedFileTypes={acceptedTypes}
                maxFileSize={maxFileSizeBytes}
                onUploadSuccessAction={(file) => setBackgroundFile(file)}
                onFileRemoveAction={() => setBackgroundFile(null)}
                uploadDelay={0}
              />
              {backgroundFile ? (
                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded border">
                    {backgroundPreviewUrl ? (
                      <Image
                        src={backgroundPreviewUrl}
                        alt="Background preview"
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{backgroundFile.name}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="size-3.5" /> Or keep original background</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="prompt">Optional style hint</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., bright editorial"
            maxLength={250}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We always preserve your dish. Max 250 characters.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lens">Lens look</Label>
          <Select value={lensLook} onValueChange={(v) => setLensLook(v as SelectedLensLook)}>
            <SelectTrigger id="lens" className="w-full">
              <SelectValue placeholder="50mm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="35mm">35mm</SelectItem>
              <SelectItem value="50mm">50mm</SelectItem>
              <SelectItem value="85mm/macro">85mm/macro</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="size-3.5" /> Choices: 35mm, 50mm, 85mm/macro</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            disabled={!dishFile || isSubmitting}
            onClick={async () => {
              if (!dishFile) return;
              try {
                setIsSubmitting(true);
                // Prepare and compress images before upload (WebP-first, <=2MB, 1280px long edge)
                const preparedDish = await prepareImageForUpload(dishFile);
                const preparedBg = backgroundFile ? await prepareImageForUpload(backgroundFile) : null;
                // Removed verbose logs after confirming payload sizes
                const formData = new FormData();
                formData.append("dish", preparedDish);
                if (preparedBg) formData.append("background", preparedBg);
                formData.append("prompt", prompt);
                formData.append("lensLook", lensLook);

                const res = await fetch("/api/generate", { method: "POST", body: formData });
                if (!res.ok) {
                  // Basic client page: show friendly messages
                  if (res.status === 429) {
                    alert("Too many requests. Please wait a bit and try again.");
                    return;
                  }
                  if (res.status === 413) {
                    alert("Photo too large for the gateway. Try a smaller image.");
                    return;
                  }
                  if (res.status >= 500) {
                    const reqId = res.headers.get("X-Request-Id") || "n/a";
                    alert(`Service is busy. Please retry in a minute. Request ID: ${reqId}`);
                    return;
                  }
                  throw new Error(`Generate failed: ${res.status}`);
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "enhanced.jpg";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error(e);
                const message = e instanceof Error ? e.message : "Generation failed. Please try again.";
                alert(message);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <Sparkles className="size-4" /> {isSubmitting ? "Generating..." : "Generate"}
          </Button>
          <p className="text-xs text-muted-foreground">No storage yet; result downloads directly.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GenerateForm;

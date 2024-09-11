"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const BlueScreenGenerator: React.FC = () => {
  const [text, setText] = useState("we're so back");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    renderImage();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [text]);

  const renderImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = "#0101F9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 36px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = text.split("\n");

    lines.forEach((line, index) => {
      const y = canvas.height / 2 - (lines.length - 1) * 20 + index * 40;
      ctx.fillText(line, canvas.width / 2, y);
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 50 - 25;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      copyImageToClipboard();
    }
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast({
          title: "Image copied!",
          description: "The image has been saved to your clipboard.",
        });
      }
    } catch (err) {
      console.error("Failed to copy image: ", err);
      toast({
        title: "Copy failed",
        description:
          "Failed to copy image. Your browser might not support this feature.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Card className="p-6 space-y-4 w-full max-w-md shadow-lg rounded-3xl">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white text-black placeholder-black resize-none font-serif rounded-2xl"
          style={{ maxHeight: "150px" }}
        />
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-2xl shadow-md"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </Card>
      <p className="text-sm text-neutral-500 mt-4 italic">ctrl + c for copy</p>
    </div>
  );
};

export default BlueScreenGenerator;

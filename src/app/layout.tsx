import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "爱的教育 - AI智能学习助手",
  description: "利用AI的文字解读能力和解题能力，帮助用户理解学习难点",
  keywords: ["爱的教育", "AI教育", "学习助手", "Next.js", "智能学习"],
  authors: [{ name: "爱的教育团队" }],
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
            --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }
        `}</style>
      </head>
      <body className="antialiased bg-background text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

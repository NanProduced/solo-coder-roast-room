import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "杠精剧场",
  description: "模拟微信朋友圈，练习怼人技巧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#EDEDED] min-h-screen">
        <div className="max-w-lg mx-auto bg-white min-h-screen shadow-lg relative">
          {children}
        </div>
      </body>
    </html>
  );
}

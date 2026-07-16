import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LiteRtComparisonInfo } from '@/components/features/home/litert-comparison-info';

const DEMOS = [
  {
    href: '/object-detection',
    title: '物体検出デモ',
    description:
      'ブラウザ内で完結するリアルタイム物体検出（画像アップロード / Webカメラ対応）',
  },
  {
    href: '/background-removal',
    title: '背景削除デモ',
    description: '人物セグメンテーションによる背景の透過・単色置換・ぼかし',
  },
] as const;

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">LiteRT.js Demos</h1>
        <p className="text-sm text-muted-foreground">
          Google LiteRT.js
          を使った、サーバーに送信せずブラウザ内だけで完結するオンデバイスAIのデモ集です。
        </p>
      </div>

      <LiteRtComparisonInfo />

      <div className="flex flex-col gap-4">
        {DEMOS.map((demo) => (
          <Link key={demo.href} href={demo.href}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

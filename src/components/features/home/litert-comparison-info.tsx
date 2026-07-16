'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const COMPARISON_ROWS = [
  {
    axis: '主な対象モデル形式',
    tfjs: 'TF SavedModel / Graph Model（TF.js独自形式に変換）',
    litert: '.tflite（TensorFlow Lite / LiteRT形式）',
  },
  {
    axis: '想定する変換元',
    tfjs: 'TensorFlow中心',
    litert:
      'TensorFlow・PyTorch・JAXなど、TFLiteに変換できるものすべて（マルチフレームワーク）',
  },
  {
    axis: 'GPU実行方式',
    tfjs: 'WebGL（従来）/ WebGPU（新backend）',
    litert:
      'WebGPUネイティブ対応。CPU実行はXNNPACK（モバイル最適化された高速カーネル）',
  },
  {
    axis: '立ち位置',
    tfjs: '汎用の深層学習フレームワークのJS版（学習・柔軟なグラフ操作も可能）',
    litert:
      'モバイル/エッジ向けに最適化された軽量推論ランタイムのWeb版（Android/iOSのLiteRT/TFLiteと同系列）',
  },
] as const;

export function LiteRtComparisonInfo() {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
        >
          <Info className="size-4" />
          既存のWebGPU・TensorFlow.jsとの違い
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-[height] duration-300 ease-out">
        <div className="mt-2 flex flex-col gap-4 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">WebGPUとの違い</p>
            <p className="mt-1">
              WebGPUはブラウザの低レベルGPU描画/計算APIそのもので、GPU上で行列演算などを直接書くための土台にすぎません。LiteRT.jsはその上に立つ推論ランタイムで、
              <code>.tflite</code>
              モデルを読み込み、WebGPUをアクセラレータの一つとして自動的に使います。対応していない演算はCPU（WASM/XNNPACK）へ自動的にフォールバックするなど、WebGPU
              /
              WASM+XNNPACK（さらに実験的にWebNN）といった複数の実行手段を統一APIの下に抽象化しています。
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">TensorFlow.jsとの違い</p>
            <div className="mt-2 overflow-x-auto rounded-md border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 font-medium text-foreground">観点</th>
                    <th className="p-2 font-medium text-foreground">
                      TensorFlow.js
                    </th>
                    <th className="p-2 font-medium text-foreground">
                      LiteRT.js
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.axis} className="border-t">
                      <td className="p-2 font-medium text-foreground">
                        {row.axis}
                      </td>
                      <td className="p-2">{row.tfjs}</td>
                      <td className="p-2">{row.litert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              LiteRT.jsは「モバイルアプリで使われている軽量・高速な推論エンジン（旧TensorFlow
              Lite）」をそのままブラウザに持ってきたもので、モデルサイズや推論速度重視の設計です。一方TensorFlow.jsはより汎用的で、ブラウザ内での学習（トレーニング）や柔軟なグラフ操作もサポートする点が異なります。
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export function LiteRtInfo() {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
        >
          <Info className="size-4" />
          LiteRT.jsをどう使っているか
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-[height] duration-300 ease-out">
        <div className="mt-2 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-4">
            <li>
              <span className="font-medium text-foreground">モデル: </span>
              TensorFlow公式配布のSSD MobileNet V1 (COCO学習済み、量子化
              <code>.tflite</code>)を
              <code>public/models/</code>
              に配置。人・車・動物など80クラスを検出可能。
            </li>
            <li>
              <span className="font-medium text-foreground">
                ランタイム初期化:{' '}
              </span>
              <code>@litertjs/core</code>の<code>loadLiteRt()</code>
              で、LiteRT.jsのWASM実行エンジンをブラウザにロード。
            </li>
            <li>
              <span className="font-medium text-foreground">
                モデルコンパイル:{' '}
              </span>
              <code>loadAndCompile()</code>
              でこのモデルをコンパイル。WebGPUが使えればGPUで実行し、使えない演算(このモデルではNMS用のカスタムオペレータ1個)はCPU(WebAssembly/XNNPACK)に自動フォールバック。
            </li>
            <li>
              <span className="font-medium text-foreground">前処理: </span>
              アップロード画像やWebカメラ映像を300×300にリサイズし、uint8のRGB
              Tensorに変換(0-255の生ピクセル値のまま)。
            </li>
            <li>
              <span className="font-medium text-foreground">推論: </span>
              <code>model.run(inputTensor)</code>
              をフレームごとに実行し、検出したボックス座標・クラス・信頼度スコアを出力として取得。
            </li>
            <li>
              <span className="font-medium text-foreground">
                後処理・描画:{' '}
              </span>
              信頼度しきい値でフィルタし、Canvas上にバウンディングボックスとラベルを描画。
            </li>
          </ol>
          <p className="mt-3">
            画像・映像はいずれもサーバーへ送信されず、すべてこのブラウザ内(WASMまたはWebGPU)だけで処理されます。
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

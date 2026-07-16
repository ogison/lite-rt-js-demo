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
              Google MediaPipe公式配布の「Selfie Segmenter」(
              <code>.tflite</code>
              形式)。人物か背景かを画素単位で判定する軽量モデルを
              <code>public/models/</code>に配置。
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
              でこのモデルをコンパイル。WebGPUが使えればGPUで実行し、使えない場合はCPU(WebAssembly/XNNPACK)に自動フォールバック。
            </li>
            <li>
              <span className="font-medium text-foreground">前処理: </span>
              アップロード画像やWebカメラ映像を256×144にリサイズし、0-1に正規化したfloat32のTensorに変換。
            </li>
            <li>
              <span className="font-medium text-foreground">推論: </span>
              <code>model.run(inputTensor)</code>
              をフレームごとに実行し、人物らしさを画素単位で表す単チャンネルのマスク(confidence
              mask)を出力として取得。
            </li>
            <li>
              <span className="font-medium text-foreground">
                後処理・描画:{' '}
              </span>
              マスクをCanvas上で拡大し、人物だけを切り出して背景モード(透過/単色/ぼかし)に応じて合成。
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

# モデルファイルの配置

## 本番 (Vercel) と開発でのモデル参照方式

セグメンテーション3モデル（`segmentation.tflite` / `segmentation-multiclass.tflite` / `u2net-full.tflite`）は、
`src/lib/constants/segmentation-model-config.ts` の `resolveModelUrl()` により参照先が環境ごとに切り替わる。

- **本番 (`NODE_ENV=production`、Vercelビルド含む)**: 各モデルの配布元URLを直接fetchする。モデルファイル自体はデプロイに含めない。
  - 理由: 3モデル合計が100MBを超え、Vercel Hobbyプランの静的ファイルアップロード上限(100MB)を超過するため。
  - このアプリは `next.config.ts` でCOOP/COEP（`crossOriginIsolated`）を有効化しているが、配布元（Google Cloud Storage / Hugging Face）はCORSに対応しており、外部オリジンからの直接fetchが問題なく動作することを実機で確認済み。
- **開発 (`pnpm dev`)**: 以下の手順でダウンロードした `public/models/*.tflite` を参照する（オフライン開発・モデル差し替えの高速化のため）。`.gitignore` によりこれらのファイルはリポジトリにコミットされない。

`object-detection.tflite` のみ例外で、配布元がzipアーカイブのため直接fetchできず、常にリポジトリにコミットされている（4MBと小さいため）。開発環境のセットアップでも再ダウンロードは不要。

## object-detection.tflite（リポジトリにコミット済み・再ダウンロード不要）

### 入手元

- 配布元: TensorFlow公式 (`storage.googleapis.com/download.tensorflow.org`)
- URL: https://storage.googleapis.com/download.tensorflow.org/models/tflite/coco_ssd_mobilenet_v1_1.0_quant_2018_06_29.zip
- ライセンス: Apache License 2.0
- モデル: SSD MobileNet V1 (COCO, 300x300, uint8量子化)、zip内の `detect.tflite` を `object-detection.tflite` にリネームして配置

配布元がzip形式のため実行時に直接fetchできず、他モデルと異なりリポジトリに直接コミットしている。更新する場合の再取得手順:

```bash
curl -L -o /tmp/coco_ssd.zip \
  https://storage.googleapis.com/download.tensorflow.org/models/tflite/coco_ssd_mobilenet_v1_1.0_quant_2018_06_29.zip
unzip -o /tmp/coco_ssd.zip -d /tmp/coco_ssd
cp /tmp/coco_ssd/detect.tflite public/models/object-detection.tflite
cp /tmp/coco_ssd/labelmap.txt public/models/labelmap.txt
```

### 入出力仕様

- 入力: `normalized_input_image_tensor` — `uint8` `[1, 300, 300, 3]`（0-255の生ピクセル値、正規化不要）
- 出力（`TFLite_Detection_PostProcess`カスタムオペレータによりデコード・NMS済み。すべて`float32`）:
  1. `TFLite_Detection_PostProcess` — detection boxes `[1, 10, 4]`（`[ymin, xmin, ymax, xmax]`、0-1正規化座標）
  2. `TFLite_Detection_PostProcess:1` — detection classes `[1, 10]`（0始まりのCOCOクラスindex。`labelmap.txt`の1行目"???"を除いた並びに対応）
  3. `TFLite_Detection_PostProcess:2` — detection scores `[1, 10]`
  4. `TFLite_Detection_PostProcess:3` — num detections `[1]`

実際の名前・shape・並び順は `model.getInputDetails()` / `model.getOutputDetails()` で必ず確認すること（`src/lib/constants/model-config.ts` 参照）。

COCOラベルは `src/lib/constants/coco-labels.ts` にこのモデル付属の `labelmap.txt` の内容をそのまま定数化してあるため、`labelmap.txt` 自体をfetchする必要はない。

## segmentation.tflite（開発時のみ必要。本番は配布元URLを直接fetch）

### 入手元

- 配布元: Google MediaPipe公式 (`storage.googleapis.com/mediapipe-models`)
- URL: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite
- ライセンス: Apache License 2.0
- モデル: MediaPipe Selfie Segmenter (landscape/横長入力向けバリアント)。ダウンロードした `selfie_segmenter_landscape.tflite` を `segmentation.tflite` にリネームして配置する。

```bash
curl -L -o public/models/segmentation.tflite \
  https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite
```

このファイルは末尾にラベルメタデータ用のzip（`labels.txt`）が付加された形式のため `file` コマンドでは `Zip archive data` と誤判定されるが、先頭は正規のTFLite flatbuffer（オフセット4に`TFL3`識別子）であり、LiteRT.jsで問題なくロードできる。

### 入出力仕様

実際の名前・shape・dtypeは `model.getInputDetails()` / `model.getOutputDetails()` で確認すること（`src/lib/constants/segmentation-model-config.ts` 参照）。入力は正方形/横長のRGB画像、出力は人物らしさを表す単チャンネルのconfidence mask。

## segmentation-multiclass.tflite（開発時のみ必要。本番は配布元URLを直接fetch）

背景削除デモのモデルセレクタから選択できる2種類目のセグメンテーションモデル。開発環境で未配置の場合、選択するとモデル読み込みエラーになる。

### 入手元

- 配布元: Google MediaPipe公式 (`storage.googleapis.com/mediapipe-models`)
- URL: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
- ライセンス: Apache License 2.0
- モデル: MediaPipe Multiclass Selfie Segmenter（256x256正方形入力、6クラス出力）。ダウンロードしたファイルを `segmentation-multiclass.tflite` にリネームして配置する。

```bash
curl -L -o public/models/segmentation-multiclass.tflite \
  https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
```

### 入出力仕様

- 入力: `float32` `[1, 256, 256, 3]`（0-1に正規化したRGB、正方形固定なので横長映像はアスペクト比が歪む）
- 出力: `float32` `[1, 256, 256, 6]`。ピクセルごとに6クラス（background, hair, body-skin, face-skin, clothes, others）のsoftmax確率。`src/lib/segmentation/postprocess.ts` では `1 - background確率` を前景マスクとして扱っている。

実際の名前・shape・dtype・クラスの並び順は `model.getInputDetails()` / `model.getOutputDetails()` で必ず確認すること（`src/lib/constants/segmentation-model-config.ts` 参照）。

## u2net-full.tflite（開発時のみ必要。本番は配布元URLを直接fetch）

背景削除デモのモデルセレクタから選択できる3種類目のセグメンテーションモデル。開発環境で未配置の場合、選択するとモデル読み込みエラーになる。

### 入手元

- 配布元: Hugging Face個人アカウント `mlboydaisuke` によるフォーマット変換版（Google公式やU²-Net原著者本人による配布ではない点に注意）
- URL: https://huggingface.co/mlboydaisuke/U-2-Net-LiteRT/resolve/main/u2net_fp16.tflite
- ライセンス: Apache License 2.0（© U²-Net原著者 xuebinqin/U-2-Net。上記リポジトリは重み・アーキテクチャを変更しないフォーマット変換のみと明記）
- モデル: U²-Net Full（サリエンシー検出/一般物体のsalient object detection。float16量子化）。ダウンロードしたファイルを `u2net-full.tflite` にリネームして配置する。

```bash
curl -L -o public/models/u2net-full.tflite \
  https://huggingface.co/mlboydaisuke/U-2-Net-LiteRT/resolve/main/u2net_fp16.tflite
```

**重要な制約**: モデルカードに「GPU専用・CPUフォールバックなし（no CPU fallback, no Flex ops）」と明記されている。CPU (WebAssembly) アクセラレータでは動作しない可能性が高く、アプリ側もこのモデル選択時はアクセラレータをWebGPUに固定する。

### 入出力仕様

- 入力: `float32` `[1, 3, 320, 320]`（**NCHW**、他の2モデルとは異なり channels-first）。前処理は「画像内の最大ピクセル値で割ってから ImageNet mean/std ([0.485, 0.456, 0.406] / [0.229, 0.224, 0.225]) で正規化」というU²-Net固有の方式。
- 出力: `float32` `[1, 1, 320, 320]`。sigmoid済みの単チャンネルsaliency mask（0-1）。人物に限らない一般的な顕著物体を検出する。

実際の名前・shape・dtypeは `model.getInputDetails()` / `model.getOutputDetails()` で必ず確認すること（`src/lib/constants/segmentation-model-config.ts` 参照）。

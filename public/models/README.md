# モデルファイルの配置

`.tflite`モデルファイル（および元の`labelmap.txt`）は `.gitignore` によりリポジトリにコミットされません。開発環境をセットアップする際は、以下の手順で配置してください。

## object-detection.tflite

### 入手元

- 配布元: TensorFlow公式 (`storage.googleapis.com/download.tensorflow.org`)
- URL: https://storage.googleapis.com/download.tensorflow.org/models/tflite/coco_ssd_mobilenet_v1_1.0_quant_2018_06_29.zip
- ライセンス: Apache License 2.0
- モデル: SSD MobileNet V1 (COCO, 300x300, uint8量子化)、zip内の `detect.tflite` を `object-detection.tflite` にリネームして配置

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

## segmentation.tflite

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

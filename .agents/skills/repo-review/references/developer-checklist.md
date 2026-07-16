# 開発者目線チェックリスト

コードを書き続ける立場で「読みやすいか・壊れにくいか・伸ばしやすいか」を見る観点集。各項目は網羅の手がかりであり、当てはまらなければ無理に指摘しなくてよい。指摘するときは必ず該当ファイル（`file:line`）かコマンド出力を根拠に添える。

## 1. 型安全性

- `tsconfig.json` の `strict` が有効か。無効なら型の恩恵を大きく損なうため Warning 以上。
- より厳密な設定（`noUncheckedIndexedAccess`・`noImplicitOverride`・`exactOptionalPropertyTypes` 等）の採否。配列/オブジェクトアクセスの安全性を上げたいなら提案候補。
- `any` の乱用、`@ts-ignore` / `@ts-expect-error` の数と理由コメントの有無。
- `tsc --noEmit`（または `typecheck` スクリプト）が通るか。型エラーを放置していないか。
- パスエイリアス（`@/*` など）が設定され、相対パス地獄になっていないか。

## 2. Lint / Format

- ESLint 設定の網羅性。Next.js なら `eslint-config-next`（Core Web Vitals 含む）が入っているか。flat config（`eslint.config.mjs`）か旧 `.eslintrc` か。
- 型情報を使った Lint（`@typescript-eslint` の type-aware ルール）の有無。
- Prettier 等のフォーマッタ設定と、`format:check` が CI で回っているか。
- lint と format の設定が衝突していないか。
- pre-commit hook（husky/lint-staged など）でローカル検証が効いているか。無ければ Info。

## 3. テスト

- テストフレームワーク（Vitest/Jest、Playwright/Cypress）が導入されているか。**未導入は重要な欠落**で、規模次第で Warning〜Critical。
- `package.json` に `test` スクリプトがあるか。CI でテストが実行されているか。
- カバレッジ計測の有無、重要ロジック（lib/helpers/api）にテストがあるか。
- テストが形骸化していないか（スナップショットだけ・assert が薄い等）。

## 4. アーキテクチャ / ディレクトリ規約

- ディレクトリ構成に一貫した規約があるか（`components/ui` `features` `lib` `hooks` 等）。
- 空ディレクトリ・プレースホルダ（`.gitkeep` のみ）が放置されていないか。テンプレなら許容だが、肥大化した死蔵は指摘。
- 関心の分離: UI / ロジック / データ取得が混ざっていないか。
- 命名の一貫性（ファイル名・コンポーネント名・export 形式）。
- 循環依存や、`lib` から `components` を参照するような逆方向依存がないか。

## 5. Next.js / App Router 固有

- App Router か Pages Router か。混在していないか。
- Server Component / Client Component の境界が適切か。`"use client"` の付けすぎ（不要なクライアント化）や、Server Component で使えない API の誤用がないか。
- `metadata` / `generateMetadata` で各ページのメタ情報が設定されているか。
- `error.tsx` / `loading.tsx` / `not-found.tsx` の境界が用意されているか。エラーハンドリングの抜けは UX とデバッグ性に直結。
- Route Handlers（`route.ts`）の入力検証・エラー処理。
- 画像最適化（`next/image`）・フォント最適化（`next/font`）の利用。
- `next.config.*` の設定（`reactStrictMode`・実験的フラグの妥当性）。

## 6. コード品質

- 死蔵コード・コメントアウトされた塊・未使用 import / 変数。
- マジックナンバー／ハードコードされた文字列が定数化されていないか。
- 重複ロジックが共通化されていないか（DRY）。
- 過度に複雑な関数・巨大コンポーネント（責務過多）。
- アクセシビリティ（セマンティック HTML、`alt`、ラベル）への配慮。

## 7. 依存関係

- 依存の鮮度。極端に古い・非推奨パッケージがないか。
- 未使用依存・重複依存（同種ライブラリの混在）。
- バージョン指定方針（`^` / 固定）の一貫性。
- ランタイム依存と開発依存の振り分けが正しいか。

## 8. 開発者体験（DX）

- `package.json` の scripts が揃っているか（dev/build/start/lint/format、可能なら test/typecheck）。
- README が実情を反映しているか。`create-next-app` 既定のまま放置されていないか（**よくある欠落**）。
- セットアップ手順・前提（Node バージョン・パッケージマネージャ）が明記されているか。
- エディタ設定（`.editorconfig`・VSCode 推奨拡張）やオンボーディング資料の有無。

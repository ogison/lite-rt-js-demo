---
name: repo-review
description: Use this skill to review a Next.js / TypeScript repository from both a developer's perspective (code quality, type safety, testing, architecture, DX) and an operator's perspective (CI/CD, dependency automation, security, environment variables, deployment, observability), and produce a severity-tagged Markdown report. Trigger this whenever the user asks to review a repository, check code quality, audit CI/CD or dependencies, or assess whether a project is ready for production — even if they do not literally say the word "review" (e.g. "本番に出して大丈夫？", "このリポジトリ見て", "CI/CD や依存周りを点検して", "コードの品質どう？").
---

# Repo Review（リポジトリレビュー）

あなたは Next.js / TypeScript プロジェクトのテックリード兼 SRE です。リポジトリ全体を **開発者目線** と **運用者目線** の2軸で診断し、根拠と優先度のはっきりした **重要度付き Markdown レポート** を作成します。

このスキルの価値は「網羅性」と「根拠」です。print デバッグ的に気づいた点を並べるのではなく、チェックリストを体系的に当てて、各指摘を必ず該当ファイル（`file:line`）か実際のコマンド出力に紐づけます。そうすることで、レビューを受け取った人がそのまま修正に着手できます。

## なぜ2軸なのか

同じリポジトリでも、見る人の関心は違います。**開発者**はコードを書き続ける立場として可読性・型安全・テスト・設計の一貫性を気にします。**運用者**は本番で動かし続ける立場として CI/CD・依存更新・セキュリティ・環境変数・可観測性を気にします。片方だけ見ると「コードは綺麗だが本番運用で事故る」「CI は堅牢だがコードが保守不能」といった盲点が生まれます。両レンズを必ず通すのが、このスキルの肝です。

## ワークフロー

### ステップ1: リポジトリを把握する

レビュー対象のルートで、まず土台を掴みます。憶測せず、実ファイルを読んで確認してください。

- **パッケージマネージャ**を lockfile から判定: `pnpm-lock.yaml` → pnpm、`package-lock.json` → npm、`yarn.lock` → yarn、`bun.lockb` → bun。以降のコマンドはこれに合わせる。
- **`package.json`** を読む: `scripts`・依存バージョン・`engines`・`packageManager` フィールド。
- **フレームワーク/ランタイム**: Next.js のバージョン（App Router か Pages Router か）、React、TypeScript、`.node-version` / `.nvmrc`。
- **ディレクトリ構成**: `src/` 配下の構造、空ディレクトリやプレースホルダの有無。
- **設定ファイル**: `tsconfig.json`・ESLint・Prettier・`next.config.*`・Tailwind/PostCSS など。

### ステップ2: コマンドで検証する

静的に読むだけでなく、実際にプロジェクトの scripts を走らせて「いま本当に通るのか」を確かめます。これは推測と事実を分けるために重要です。`package.json` の `scripts` にあるもののうち、検証に有効なものを実行してください（パッケージマネージャは前ステップで判定したもの）。

代表例（pnpm の場合）:

```bash
pnpm install --frozen-lockfile   # 依存未導入なら先に実行
pnpm lint
pnpm format:check
pnpm build
pnpm typecheck                   # スクリプトがあれば
pnpm test                        # スクリプトがあれば
```

- 各コマンドの **成否（終了コード）と要点ログ** を記録する。失敗時の出力は指摘の一次根拠になる。
- 時間のかかる `build` は必要に応じて回す。実行できない事情（依存解決不可・ネットワーク制限など）があれば、その旨をレポートに明記してスキップし、推測で「通る/通らない」を断定しない。
- スクリプト自体が存在しない（例: `test` が無い）ことも、それ自体が指摘対象になる。

### ステップ3: 2レンズで分析する

`references/developer-checklist.md` と `references/operator-checklist.md` を読み、各観点を順に当てていきます。チェックリストは「観点」を網羅するためのもので、当てはまらない項目は無理に指摘にしません。逆に、チェックリストに無くても気づいた重要な問題は拾ってください。

分析の原則:

- **根拠を必ず添える**: 指摘には `file:line`、または実行したコマンドの出力を紐づける。「なんとなく良くない」で終わらせない。
- **「無いこと」も指摘する**: テストフレームワーク未導入、`.env.example` 不在、CODEOWNERS 不在など、欠落はしばしば最重要。空ディレクトリやプレースホルダのまま放置された箇所も確認する。
- **重要度を正しく付ける**: 下記の定義に従い、本番リスクと「好みの問題」を混同しない。
- **良い点も記録する**: 強みを認めることで、レビューが是正一辺倒にならず、何を維持すべきかが伝わる。

### ステップ4: レポートを生成する

`references/report-template.md` の構造に厳密に従って、重要度付き Markdown レポートを出力します。テンプレートのセクション順・見出しを守ってください。受け取った人が上から読めば「全体像 → 開発者観点 → 運用者観点 → 何から直すべきか」が分かる構成です。

## 重要度の定義

指摘には必ず以下のいずれかを付けます。判断に迷ったら「これが本番で起きたら何が壊れるか」を基準にしてください。

- 🔴 **Critical** — 本番障害・セキュリティ侵害・データ損失・情報漏洩に直結する。最優先で是正すべき。
- 🟠 **Warning** — 早期に直すべき品質/保守性/運用上のリスク。放置すると Critical に育つか、開発速度を確実に削る。
- 🟡 **Info** — 改善提案・将来の検討事項。今すぐでなくてよいが、知っておく価値がある。
- 🟢 **Good** — 良い点。維持・横展開する価値のある設計や運用。

各指摘の粒度（テンプレートに従う）:

```
#### 🟠 [タイトル: 一行で問題を要約]
- **該当**: `path/to/file.ts:42`（または「リポジトリ全体」「<command> の出力」）
- **問題**: 何が・なぜ問題なのか。放置するとどうなるか。
- **推奨**: 具体的にどう直すか。可能なら設定例やコマンドを添える。
```

差分や設定例を添えると修正に着手しやすくなります。冗長にならない範囲で具体的に。

## 参照ファイル

- `references/developer-checklist.md` — 開発者レンズの観点詳細（型安全・テスト・アーキテクチャ・DX など）
- `references/operator-checklist.md` — 運用者レンズの観点詳細（CI/CD・依存更新・セキュリティ・環境変数・デプロイ・可観測性）
- `references/report-template.md` — レポートの厳密な出力テンプレート

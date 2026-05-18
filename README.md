# 処方箋入力チャレンジ PWA

ランダムに表示される架空の処方箋を見ながら、レセコン入力形式で入力する練習ゲームです。
GitHub Pagesでそのまま公開できます。Google Apps Scriptを使うと全国ランキングに対応できます。

## 主な機能

- PWA対応
  - スマホ・PCのブラウザで動作
  - ホーム画面追加に対応
  - キャッシュ後はオフラインでも本体画面を表示可能
- 入力モード
  - 1枚入力
  - 3枚入力
  - 5枚入力
  - 10枚入力
  - エンドレス
- スコア計算
  - 正確率
  - 入力速度ボーナス
  - 完全一致ボーナス
  - 連続完全一致ボーナス
- ランキング
  - GAS未設定時：端末内ランキング
  - GAS設定時：Googleスプレッドシートを使った全国ランキング
  - 初期URLとして指定済み：`https://script.google.com/macros/s/AKfycbzKs2dbznSXPyNJWY0L2Wzfed5m834wBa8FLP9paAyaSJZ6dIx-eST16D3eTVICBs2rRw/exec`
- レセコン風の薬品候補
  - 薬品名を3文字以上入力すると候補を表示
  - 候補クリック、↑↓、Enter、Tabで選択
  - 候補を使わず最後まで手入力も可能

## ファイル構成

```text
prescription-input-pwa/
├─ index.html
├─ style.css
├─ app.js
├─ manifest.webmanifest
├─ sw.js
├─ assets/
│  ├─ icon-192.png
│  └─ icon-512.png
└─ gas/
   └─ Code.gs
```

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成します。
2. このフォルダ内のファイルをすべてアップロードします。
3. GitHubのリポジトリ画面で **Settings > Pages** を開きます。
4. **Build and deployment** で以下を選択します。
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root
5. 表示されたURLを開きます。

例：

```text
https://ユーザー名.github.io/リポジトリ名/
```

## GASランキングを設定する手順

1. Googleスプレッドシートを新規作成します。
2. メニューの **拡張機能 > Apps Script** を開きます。
3. `gas/Code.gs` の内容を貼り付けます。
4. Apps Scriptで **デプロイ > 新しいデプロイ** を選びます。
5. 種類は **ウェブアプリ** を選びます。
6. 設定は以下にします。
   - 実行ユーザー：自分
   - アクセスできるユーザー：全員
7. デプロイ後に表示される WebアプリURL をコピーします。
8. PWAのゲーム設定画面にある **GAS WebアプリURL** に貼り付けます。

この完成版では、以下のURLを初期値として設定済みです。別のGASに変更する場合のみ差し替えてください。

```text
https://script.google.com/macros/s/AKfycbzKs2dbznSXPyNJWY0L2Wzfed5m834wBa8FLP9paAyaSJZ6dIx-eST16D3eTVICBs2rRw/exec
```

## レセコン風の薬品候補

薬品名部分を3文字以上入力すると、薬品候補が表示されます。

例：

```text
アムロ
```

と入力すると、候補に `アムロジピンOD錠5mg` が表示されます。
候補はクリックで選択できます。PCでは上下キーで候補移動、EnterまたはTabで確定できます。
候補を使わず、最後まで手入力しても判定できます。

## 入力判定の仕様

1薬剤1行で、次の形式を基本にしています。

```text
薬品名 用量 用法 日数
```

例：

```text
アムロジピンOD錠5mg 1錠 分1 朝食後 28日分
ロキソプロフェンNa錠60mg 1錠 疼痛時 10回分
```

以下の違いはある程度吸収します。

- 全角・半角
- 空白の有無
- 大文字・小文字
- 一部の句読点

ただし、薬品名・用量・用法・日数が大きく違う場合は減点されます。

## 注意事項

- 表示される処方箋はすべて架空データです。
- 実在の患者情報は使用していません。
- ランキングは簡易実装のため、ブラウザ側の改ざんを完全には防止できません。
- 社内教育用途で厳密な成績管理を行う場合は、サーバー側で問題IDと正答を検証する方式に拡張してください。

## カスタマイズ場所

### 処方パターンを増やす

`app.js` の `MED_SETS` を編集します。

### 入力補助チップを増やす

`app.js` の `ASSIST_WORDS` を編集します。

### スコア計算を変更する

`app.js` の `checkCurrentPrescription()` 内を編集します。

### 見た目を変更する

`style.css` を編集します。

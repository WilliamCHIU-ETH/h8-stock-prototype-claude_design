# Light Demo UX Backlog

## V5 Contextual Card Flow Candidate｜2026-07-20

狀態：已依第一次操作回饋修正 wireframe，等待完整真人驗證；這是候選，不是正式產品決策。

- **流程起點**：股票 A 的個股首頁，不是 App 首頁。
- **Entry Architecture**：移除上方 guided CTA；A／B／C 卡片是唯一的 contextual Reel 入口，分別進入 Reel 1／2／3。
- **首頁理解**：保留一條精簡的 01→02→03 判讀路徑；C 卡直接標出「尚待確認」與目前最需留意的部分。
- **Card Rail**：A／B／C 位於同一條水平 rail；一次顯示一張完整卡與下一張 48px peek，點卡片 deep-link 對應內容。
- **Reel 1–3**：上滑／下滑前後閱讀，左右不觸發；移除「上一步／下一步」按鈕，鍵盤以 Arrow Up/Down、Page Up/Down、Home、End 操作。
- **Reel 4**：左滑＝先略過；右滑＝加入自選股並追蹤後續變化；同時保留可見按鈕、完成回饋與 Undo。
- **流程出口**：關閉或第四頁繼續上滑返回這檔股票的個股首頁；完成決策後，另以明確按鈕觸發「下一支股票」。
- **資料說明**：只用來揭露 sample data 與非投資建議邊界，移至「⋯」選單，不占首頁主要層級。
- **狀態**：加入自選股保存於當次 tab 的 `sessionStorage`；略過不跨 session；「下一支股票」仍是 placeholder event。
- **驗證邊界**：V5 保留 V4 亮白／淺灰／黑字／單一藍色、sample story 與 A／B／C 資訊角色；尚未經真人驗證。

### 仍需真人驗證的問題

- **Axis ownership**：Card Rail 只接管明確的水平拖曳；個股首頁仍須能自然垂直捲動，需特別測斜向手勢。
- **Contextual entry**：從 B 或 C 進入時會從第 2／3 頁開始；進度條是否足以讓人理解前面仍有內容，尚未驗證。
- **Conditional gesture**：左右手勢只在第 4 頁代表決策；頁面已提供方向提示與按鈕替代，但仍要觀察是否會誤觸。
- **Discoverability trade-off**：資料說明移入「⋯」後首頁更乾淨，但 sample／免責資訊的可發現性會降低。
- **State expectation**：目前只在同一個 tab 保存自選狀態，尚未接上真實自選股資料或跨裝置同步。

## V4 建立時的 Decision Lock（歷史紀錄）

- **已接受的候選**：V4 Light Demo 的亮白、淺灰、黑字與單一藍色視覺方向。
- **本輪允許變更**：視覺層次、component presentation、sample content 與文件。
- **本輪凍結**：點擊入口、上下滑、左右滑、返回、追蹤與略過的行為。
- **停止條件**：不在本輪實作下列 UX 待辦；先保留可回溯的 V3／V4 HTML。

## 原始 Journey Audit（V5 candidate 已回應，保留問題脈絡）

### UX-01｜收斂 Reel 入口

目前 Light Demo 有五個可進 Reel 的 target：主入口 CTA、判讀路徑、資訊候選 A、資訊候選 B、資訊候選 C。入口過多，且主入口 CTA 與下方判讀路徑的用途重疊。

- 優先假設：若保留「判讀路徑」，移除上方 `.reels-entry` 主入口。
- 待決策：保留一個全域入口，或只讓各資訊候選成為 contextual entry point。
- 驗收問題：第一次看到頁面的人，能否只憑一個明確入口理解「從哪裡開始」？

### UX-02｜把 A／B／C 改為橫向 Card Rail

資訊候選 A、B、C 應屬於同一組可橫向滑動的內容，而不是 A／B 雙欄、C 另放下一區。

- 候選形式：horizontal carousel／card rail。
- 預期操作：向左滑動後看到資訊候選 C。
- 呈現提示：保留下一張卡片的一小部分（peek），搭配 scroll snap 或頁碼指示，讓可滑動性不必靠教學文字才被發現。
- 待決策：一次完整顯示一張、兩張，或「一張＋下一張 peek」；卡片點擊是否直接進對應 Reel。

### UX-03｜定義第四頁的流程終點與手勢

第四頁目前只有「返回總覽」按鈕。下一輪要把它改成一個明確的 decision state，但不能讓同一個手勢同時代表兩件事。

- 暫定橫向手勢：左滑＝略過；右滑＝加入自選／追蹤（方向與用語仍需確認）。
- 垂直手勢尚有衝突：繼續下滑要「返回總覽」或「前往下一支股票」，只能先選一個主要結果。
- 必須一起定義：操作後的回饋、能否復原（undo）、追蹤狀態保存，以及不使用手勢時的可見按鈕替代方案。

### UX-04｜做一次完整 Journey Audit

在改 code 前，先把首頁到 Reel 結束的所有入口、狀態與出口畫成一條 journey：

`首頁摘要 → 選擇資訊候選 → 垂直閱讀 A/B/C → 第四頁決策 → 下一個目的地`

Audit 要回答：每一步只有一個主要動作嗎？橫向與縱向手勢是否互相搶奪？使用者離開後回到哪一個狀態？

## 溝通時可直接使用的 UI／UX 名詞

| 名詞 | 這個 Demo 裡的意思 |
| --- | --- |
| Content IA | 首頁摘要、A/B/C 證據與第四頁決策之間的內容層級與順序。 |
| Component presentation | 同一份內容如何透過卡片、留白、色彩、圖像與文字層級呈現。 |
| Visual hierarchy | 使用大小、對比與位置，讓人先看到「多方轉強」，再看到三項證據。 |
| Entry point | 進入 Reel 的入口；目前數量過多。 |
| CTA | 明確要求使用者採取動作的按鈕，例如「查看詳細」或「追蹤」。 |
| Affordance | 元件外觀是否讓人自然知道它能點、能滑或能展開。 |
| Carousel／Card rail | 同一組卡片在水平方向排列並可滑動的容器。 |
| Peek | 故意露出下一張卡片的一小部分，暗示還能橫向滑。 |
| Scroll snap | 滑動結束後，自動把內容吸附到完整卡片或完整頁。 |
| Gesture mapping | 左滑、右滑、上滑、下滑各自對應哪一個結果。 |
| Axis ownership | 橫向與縱向手勢各由哪個 component／頁面負責，避免手勢衝突。 |
| Progressive disclosure | 首頁先給摘要，需要時才進 Reel 展開證據。 |
| Decision state | 使用者讀完內容後，需要略過、追蹤或前往下一個標的的收尾狀態。 |
| Feedback／Undo | 操作完成後的可見回饋，以及能否撤銷誤操作。 |

## 下一輪開始前需要鎖定的三個問題

1. 首頁只保留哪一種 Reel 入口？
2. A／B／C 的 Card Rail 一次應看到幾張卡片？
3. 第四頁繼續下滑的唯一結果，是返回總覽還是下一支股票？

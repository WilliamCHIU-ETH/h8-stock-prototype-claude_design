# H8 個股判讀原型

手機互動原型：比較最新的 UX Flow／Lite Demo／Simple IA，以及有真實歷史素材的 V2／V1。

- header 依新到舊排列 **UX Flow／Lite Demo／Simple IA／V2／V1**；手機版可在單列中橫向滑動
- 點既有入口或卡片進「圖解導覽」：垂直 scroll snap 查看各段，可往左滑、關閉或用鍵盤返回
- Simple IA Test 是 **V2 layout-preserving fictional scenario**：保留 V2 的 component 順序、外層 geometry、導覽、追蹤與略過，只替換既有槽位內的內容
- Simple IA 使用虛構的「股票 A」與示意數值，讓首頁摘要與滑動證據可被理解；不連接真實股票、日期、推薦或預測
- Lite Demo 以亮白、淺灰與單一藍色重做視覺層次；互動邏輯沿用 Simple IA，不在本輪更動
- UX Flow（V5）從股票 A 的個股首頁出發，以 A／B／C contextual Card Rail、垂直閱讀與第四頁左右決策測試完整流程；保留 V4 sample story，不代表已經真人驗證
- 手機開啟占滿螢幕；桌機置中手機框並在框外顯示版本專屬 review 註解

V1／V2 為歷史示範材料；Simple IA／Lite Demo 不連接真實市場資料。這些候選僅供互動與資訊架構測試，不代表金融內容或正式產品方向。

V4 的 UX 問題、互動凍結範圍，以及 V5 候選決策整理在 [Lite Demo UX Backlog](docs/light-demo-ux-backlog.md)。

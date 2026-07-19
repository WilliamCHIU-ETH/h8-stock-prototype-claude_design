# H8 個股判讀原型

手機互動原型：比較有真實歷史素材的 V1／V2，以及不帶公司、數值、日期與判讀內容的 Neutral Test。

- header **V1／V2／Neutral Test** 切換三個獨立候選
- 點既有入口或卡片進「圖解導覽」：垂直 scroll snap 查看各段，可往左滑、關閉或用鍵盤返回
- Neutral Test 是 **V2 layout-preserving abstraction**：保留 V2 的 component 順序、外層 geometry、導覽、追蹤與略過，只替換既有槽位內的內容
- Neutral 圖像只使用低語意抽象幾何，不含價格軸、真實 K 線、公司資料、日期、量值、推薦或預測
- 手機開啟占滿螢幕；桌機置中手機框並在框外顯示版本專屬 review 註解

V1／V2 為歷史示範材料；Neutral Test 不連接真實市場資料。這些候選僅供互動與資訊架構測試，不代表金融內容或正式產品方向。

AFRAME.registerComponent("zodiac-position", {
  schema: {
    zodiacId: { type: "string", default: "aries" },
    lat: { type: "number", default: 0 },
    lng: { type: "number", default: 0 },
  },
  init: function () {
    this.zodiacData = null;
    this.getLocation();
  },
  getLocation: function () {
    navigator.geolocation.getCurrentPosition(
      this.locSuccess.bind(this),
      this.locError.bind(this),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  },
  locSuccess: function (pos) {
    this.data.lat = pos.coords.latitude;
    this.data.lng = pos.coords.longitude;
    this.getZodiacData();
  },
  locError: function (err) {
    console.warn(err.code, err.message);
    alert("位置情報が取得できませんでした。");
  },
  getZodiacData: function () {
    // モックデータを使用
    this.zodiacData = this.getMockZodiacData(
      this.data.lat,
      this.data.lng,
      new Date()
    );
    this.updateZodiacPosition();
  },
  getMockZodiacData: function (lat, lng, date) {
    // 仮の星座データを返す（例として固定値を使用）
    return {
      azimuth: 180, // 仮の方位角
      altitude: 45, // 仮の高度角
    };
  },
  updateZodiacPosition: function () {
    if (this.zodiacData) {
      const { azimuth, altitude } = this.zodiacData;
      this.el.setAttribute("rotation", `${altitude} ${azimuth} 0`);
      this.el.setAttribute("visible", true);

      // 画像の表示設定
      this.el.setAttribute("geometry", {
        primitive: "plane",
        height: 1,
        width: 1,
      });
      this.el.setAttribute("material", { src: `#${this.data.zodiacId}` });
      this.el.setAttribute("position", "0 1 -5");
    }
  },
});

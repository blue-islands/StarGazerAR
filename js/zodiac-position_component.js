AFRAME.registerComponent("zodiac-position", {
  schema: {
    zodiacId: { type: "number", default: 1 },
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
    const dt = new Date();
    const mockData = this.getMockZodiacData(this.data.lat, this.data.lng, dt);

    // モックデータを利用して位置を更新
    this.zodiacData = mockData;
    this.updateZodiacPosition();
  },
  getMockZodiacData: function (lat, lng, date) {
    // 仮の星座データを返す
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
    }
  },
});

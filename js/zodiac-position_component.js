AFRAME.registerComponent("zodiac-position", {
  schema: {
    zodiacId: { type: "string", default: "aries" },
    azimuth: { type: "number", default: 0 }, // 方位角
    altitude: { type: "number", default: 0 }, // 高度角
  },
  init: function () {
    this.updatePosition();
  },
  updatePosition: function () {
    const azimuth = this.data.azimuth;
    const altitude = this.data.altitude;

    // 方位角と高度角をベクトルに変換
    const x =
      Math.cos((altitude * Math.PI) / 180) *
      Math.sin((azimuth * Math.PI) / 180);
    const y = Math.sin((altitude * Math.PI) / 180);
    const z =
      Math.cos((altitude * Math.PI) / 180) *
      Math.cos((azimuth * Math.PI) / 180);

    // 位置と素材を設定
    this.el.setAttribute("position", { x: x, y: y, z: -z });
    this.el.setAttribute("geometry", {
      primitive: "plane",
      height: 1,
      width: 1,
    });
    this.el.setAttribute("material", { src: `#${this.data.zodiacId}` });
  },
});

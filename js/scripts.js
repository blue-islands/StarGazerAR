AFRAME.registerComponent("marker-event", {
  schema: {
    found: { type: "boolean", default: false },
  },
  init: function () {
    this.el.addEventListener(
      "markerFound",
      function () {
        this.setAttribute("marker-event", { found: true });
        console.log("Marker found");
      }.bind(this),
      false
    );
    this.el.addEventListener(
      "markerLost",
      function () {
        this.setAttribute("marker-event", { found: false });
        console.log("Marker lost");
      }.bind(this),
      false
    );
  },
});

AFRAME.registerComponent("compass-rotation", {
  schema: {
    azimuth: { type: "number", default: 0 }, // 方位
    elevation: { type: "number", default: 0 }, // 高さ
  },
  init: function () {
    window.addEventListener(
      "deviceorientation",
      this.updateRotation.bind(this)
    );
  },
  updateRotation: function (event) {
    const azimuth = this.data.azimuth;
    const elevation = this.data.elevation;

    const alpha = event.alpha; // 方位
    const beta = event.beta; // 高さ

    console.log("Device orientation event:", event);
    console.log("Azimuth (alpha):", alpha);
    console.log("Elevation (beta):", beta);

    // 矢印の方向を更新
    const arrow = document.querySelector("#arrow-plane");
    if (arrow) {
      arrow.setAttribute("rotation", {
        x: -elevation,
        y: azimuth,
        z: 0,
      });
    }
  },
});

// 方位と角度の指定
document.addEventListener("DOMContentLoaded", function () {
  const camera = document.querySelector("#camera");
  camera.setAttribute("compass-rotation", { azimuth: 90, elevation: 45 }); // 例: 東に45度の高さ
  console.log("Compass rotation set to azimuth: 90, elevation: 45");
});

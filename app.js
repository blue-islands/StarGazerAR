AFRAME.registerComponent("rotation-reader", {
  tick: function () {
    const cameraRotation = this.el.object3D.rotation;
    // console.log(`Rotation - x: ${cameraRotation.x}, y: ${cameraRotation.y}, z: ${cameraRotation.z}`);
  },
});

// 簡略化した赤緯・赤経からの位置計算
function calculatePosition(
  declination,
  rightAscension,
  userLatitude,
  userLongitude
) {
  // 簡略化した計算。実際の計算には天文ライブラリが必要です。
  const distance = 10; // 表示する距離（任意で調整可能）
  const latRad = declination * (Math.PI / 180);
  const lonRad = rightAscension * (Math.PI / 180);

  const x = distance * Math.cos(latRad) * Math.cos(lonRad);
  const y = distance * Math.sin(latRad);
  const z = distance * Math.cos(latRad) * Math.sin(lonRad);

  return { x, y, z };
}

function initAR() {
  // ユーザーの位置情報を取得
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatitude = position.coords.latitude;
      const userLongitude = position.coords.longitude;

      // 赤緯と赤経の仮の値（実際にはAPIなどで取得）
      const declination = 15; // 赤緯
      const rightAscension = 270; // 赤経

      // 惑星の位置を計算
      const planetPosition = calculatePosition(
        declination,
        rightAscension,
        userLatitude,
        userLongitude
      );

      // 惑星の位置を設定
      const planetEl = document.querySelector("#planet");
      planetEl.setAttribute(
        "position",
        `${planetPosition.x} ${planetPosition.y} ${planetPosition.z}`
      );
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
    }
  );
}

document.addEventListener("click", () => {
  initAR();
});

// window.onload = () => {
//     alert('After camera permission prompt, please tap the screen to activate geolocation.');
// };

// app.js
App({
    onLaunch: function () {
      const Verify = require('/verify_mpsdk/main');
      Verify.init({
        "env": "release", // 接口环境，正式环境接口值为 release
      });
      wx.cloud.init({
          traceUser: true
      });
    },
});

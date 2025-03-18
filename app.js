// app.js
App({
  onLaunch() {
    // 显示服务器迁移提醒
    wx.showModal({
      title: '服务器迁移通知',
      content: '服务器正在迁往新站点，预计下周可恢复使用，感谢您的支持！',
      showCancel: false,
      confirmText: '我知道了'
    });
    
    // 检查更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            });
          });
        }
      });
    }
  },
  globalData: {
    userInfo: null,
    building:0,
    room:0,
    flag:0,
    todaypower:0
  }
})

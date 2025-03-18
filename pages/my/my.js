Page({
  data: {
      userInfo: {},
      hasUserInfo: false,
      canIUseGetUserProfile: false,
      menuItems: [
          {
              icon: '/images/settings.png',
              text: '用前须知',
              path: '/pages/settings/settings'
          },
          {
              icon: '/images/service.png',
              text: '联系客服',
              type: 'contact'
          },
          {
              icon: '/images/about.png',
              text: '关于我们',
              path: '/pages/about/about'
          }
      ]
  },

  onLoad() {
      if (wx.getUserProfile) {
          this.setData({
              canIUseGetUserProfile: true
          })
      }
  },

  getUserProfile() {
      wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
              this.setData({
                  userInfo: res.userInfo,
                  hasUserInfo: true
              })
          }
      })
  },

  handleMenuClick(e) {
      const item = this.data.menuItems[e.currentTarget.dataset.index]
      if (item.type === 'contact') {
          return
      }
      if (item.text === '关于我们') {
          wx.showModal({
              title: '关于我们',
              content: '你好,我是华北科技学院22级信管专业学生,这是我的创新创业项目,一个大学生信息服务平台.项目更多功能正在开发中,如果你对此项目感兴趣请联系我们,发送简历到liz413452@gmail.com.',
              confirmText: '我已知晓',
              showCancel: false,
              success(res) {
                  if (res.confirm) {
                      console.log('用户点击确定')
                  }
              }
          })
          return
      }
      if (item.path) {
          wx.navigateTo({
              url: item.path
          })
      }
  },

  // 新增的设置信息弹窗方法
  showSettingsInfo() {
      wx.showModal({
          title: '用前须知',
          content: '目前我还在做关于本校图书馆抢座预约与考研资料分享的业务,如果你感兴趣请联系客服\r\r\r\r\rps:孩子这几天正在把服务器部署到新站点,可能导致查询错误或失败,请谅解',
          confirmText: '我已知晓',
          showCancel: false,
          success(res) {
              if (res.confirm) {
                  console.log('用户点击确定')
              }
          }
      })
  }
})
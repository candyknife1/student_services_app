Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    menuItems: [
      {
        icon: '/images/settings.png',
        text: '设置',
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
      // 打开客服会话
      return
    }
    if (item.path) {
      wx.navigateTo({
        url: item.path
      })
    }
  }
}) 
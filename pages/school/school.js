Page({
  data: {
    materialCategories: [
      { id: 1, name: "高等数学", icon: "/images/school/math.png" },
      { id: 2, name: "大学英语", icon: "/images/school/english.png" },
      { id: 3, name: "大学物理", icon: "/images/school/physics.png" },
      { id: 4, name: "程序设计", icon: "/images/school/programming.png" },
      { id: 5, name: "专业课程", icon: "/images/school/professional.png" },
      { id: 6, name: "历年试题", icon: "/images/school/papers.png" }
    ]
  },

  // 点击资料分类
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    
    // 显示开发中提示
    wx.showModal({
      title: '功能开发中',
      content: `${categoryName}资料共享功能正在开发中，敬请期待！`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 显示详情信息
  showDebugInfo() {
    wx.showModal({
      title: '资料共享',
      content: '大学课程期末复习资料共享功能正在开发中，未来将提供各类课程复习资料下载、交流功能，敬请期待！',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
}) 
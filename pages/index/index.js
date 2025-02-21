// pages/list.js
Page({
    data: {
        building: '',
        room: '',
        electricityInfo: null,
        buildings: ['请选择公寓楼'], // 初始只有提示选项
        buildingIndex: 0,
        loading: false,
        showChart: false,
        chartData: null,  // 添加图表数据
        notice: '8号楼的ABCD区用1234代替，例如A102房间号为1102',
        hasFetchedBuildings: false,
        isPickerShow: false // 控制下拉菜单的显示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        try {
            // 同时获取楼栋列表和图表数据
            await Promise.all([
                this.fetchBuildingList(),
                this.fetchChartData()
            ])
        } catch (error) {
            console.error('初始化数据失败：', error)
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 可以在这里处理一些渲染完成后的逻辑
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 每次页面显示时可以刷新数据
        this.fetchChartData()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        // 页面隐藏时的处理逻辑
    },

    // 获取楼栋列表的异步函数
    async fetchBuildingList() {
        return new Promise((resolve, reject) => {
            wx.request({
                url: 'http://127.0.0.1:5050/get_buildings',
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200 && res.data) {
                        const buildingList = ['请选择公寓楼']
                        res.data.forEach(building => {
                            buildingList.push(building.name)
                        })
                        this.setData({
                            buildings: buildingList,
                            hasFetchedBuildings: true
                        })
                        resolve(buildingList)
                    } else {
                        wx.showToast({
                            title: '获取楼栋列表失败',
                            icon: 'none'
                        })
                        reject(new Error('获取楼栋列表失败'))
                    }
                },
                fail: (err) => {
                    console.error('获取楼栋列表失败：', err)
                    wx.showToast({
                        title: '网络错误，请重试',
                        icon: 'none'
                    })
                    reject(err)
                }
            })
        })
    },

    // 获取图表数据
    async fetchChartData() {
        try {
            wx.showLoading({
                title: '加载图表...',
            })

            const res = await new Promise((resolve, reject) => {
                wx.request({
                    url: 'http://127.0.0.1:5050/get_chart_data',
                    method: 'GET',
                    success: (res) => {
                        if (res.statusCode === 200 && !res.data.error) {
                            resolve(res.data)
                        } else {
                            reject(new Error(res.data.error || '获取图表数据失败'))
                        }
                    },
                    fail: (err) => {
                        reject(new Error('网络错误，请检查网络连接'))
                    }
                })
            })

            // 将数据存储到本地
            wx.setStorageSync('chartData', res)
            
            this.setData({
                chartData: res
            })
        } catch (error) {
            console.error('获取图表数据失败：', error)
            // 如果获取失败，尝试从本地读取缓存数据
            const cachedData = wx.getStorageSync('chartData')
            if (cachedData) {
                this.setData({
                    chartData: cachedData
                })
            } else {
                wx.showToast({
                    title: '获取图表数据失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        } finally {
            wx.hideLoading()
        }
    },

    // 点击下拉框时触发
    async bindPickerTap() {
        console.log('bindPickerTap triggered') // 添加调试日志
        if (!this.data.hasFetchedBuildings) {
            wx.showLoading({
                title: '加载中...',
            })
            try {
                await this.fetchBuildingList()
            } catch (error) {
                console.error('获取楼栋列表失败：', error)
            } finally {
                wx.hideLoading()
            }
        }
        // 无论是否需要获取数据，都要显示下拉菜单
        this.setData({
            isPickerShow: true
        })
        console.log('isPickerShow:', this.data.isPickerShow) // 添加调试日志
    },

    // 选择楼栋
    selectBuilding(e) {
        this.setData({
            buildingIndex: e.detail.value
        })
    },

    // 点击遮罩层关闭
    closePicker() {
        console.log('closePicker triggered') // 添加调试日志
        this.setData({
            isPickerShow: false
        })
    },

    // 查询电量的异步函数
    async queryPower(building, room) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: 'http://127.0.0.1:5050/query',
                method: 'POST',
                data: {
                    building: building,
                    room: room
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        if (res.data.error) {
                            // 处理业务逻辑错误
                            reject(new Error(res.data.error))
                        } else {
                            resolve(res.data)
                        }
                    } else {
                        reject(new Error('查询失败，请稍后重试'))
                    }
                },
                fail: (err) => {
                    reject(new Error('网络错误，请检查网络连接'))
                }
            })
        })
    },

    // 查询电量
    async queryElectricity() {
        if (this.data.buildingIndex === 0) {
            wx.showToast({
                title: '请选择公寓楼',
                icon: 'none'
            })
            return
        }

        if (!this.data.room) {
            wx.showToast({
                title: '请输入房间号',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })
        wx.showLoading({
            title: '查询中...',
        })

        try {
            const building = this.data.buildings[this.data.buildingIndex]
            const room = this.data.room

            const result = await this.queryPower(building, room)
            
            this.setData({
                electricityInfo: {
                    quantity: result.quantity
                },
                showChart: true
            })
        } catch (error) {
            console.error('查询出错：', error)
            
            // 根据错误类型显示不同的提示
            if (error.message === '未找到该房间信息') {
                wx.showModal({
                    title: '提示',
                    content: '没有找到该房间，请检查：\n1. 房间号是否正确\n2. 是否选择了正确的楼栋',
                    showCancel: false
                })
            } else {
                wx.showToast({
                    title: error.message || '查询失败，请重试',
                    icon: 'none',
                    duration: 2000
                })
            }

            // 清空结果显示
            this.setData({
                electricityInfo: null,
                showChart: false
            })
        } finally {
            this.setData({ loading: false })
            wx.hideLoading()
        }
    },

    // 输入房间号时触发
    bindRoomInput(e) {
        this.setData({
            room: e.detail.value
        })
    },

    // 显示提示信息
    showNotice() {
        wx.showModal({
            title: '用前须知',
            content: this.data.notice,
            showCancel: false
        })
    },

    // 用前须知
    what() {
        wx.showModal({
            title: '用前须知',
            content: '8号楼的ABCD区用1234代替\r例如A102房间号为1102\rB102房间号为2102\rC102房间号为3102\rD102房间号为4102\r若需充值电量可前往\r完美校园APP-缴费-预缴费处缴费\r到账时间1-3分钟，单价0.5元/度',
            showCancel: false,
        })
    },

    // 点击查询后执行 
    formSubmit(e) {
        //清空页面已有的显示
        this.setData({
            avg: '',
            shengyu: '',
            kongtiao: '',
            du: ''
        })

        let room = e.detail.value.room;
        let building = e.detail.value.building.valueOf()
        if (e.detail.value.building == -1 || e.detail.value.building == 0) {
            wx.showModal({
                title: '输错了哦',
                content: '请输入正确的宿舍',
                showCancel: false,
            })
            return false
        }
        // 执行查询
        this.queryElectricity()
    },

    bindPickerChange: function (e) {
        // console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            // 楼号
            index: e.detail.value
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: res => {
        return {
            title: '微信小程序可以查询空调电量啦！',
            path: '/pages/index/index',
            success: function () {},
            fail: function () {}
        }
    },

})
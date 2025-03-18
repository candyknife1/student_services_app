// pages/chart/chart.js
const echarts = require('../../ec-canvas/echarts');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        chartData: null, // 存储图表数据
        ec: {
            lazyLoad: true // 启用延迟加载
        },
        buildings: ['请选择公寓楼'], // 初始只有提示选项
        buildingIndex: 0,
        hasFetchedBuildings: false,
        selectedBuilding: null,
        singleBuildingData: null, // 存储单个楼栋的数据
        showDefaultChart: true // 控制是否显示默认图表
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.ecComponent = this.selectComponent('#mychart-dom-bar');
        this.fetchBuildingList(); // 获取楼栋列表
        this.fetchChartData(); // 加载默认图表数据
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

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
        if (this.data.showDefaultChart) {
            this.fetchChartData();
        } else {
            this.fetchBuildingPower(this.data.selectedBuilding);
        }
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 获取楼栋列表
    fetchBuildingList() {
        wx.request({
            url: 'https://rmxcizonggsx.sealoshzh.site/get_buildings',
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200 && res.data) {
                    const buildingList = ['请选择公寓楼'];
                    res.data.forEach(building => {
                        buildingList.push(building.name);
                    });
                    this.setData({
                        buildings: buildingList,
                        hasFetchedBuildings: true
                    });
                } else {
                    wx.showToast({
                        title: '获取楼栋列表失败',
                        icon: 'none'
                    });
                }
            },
            fail: (err) => {
                console.error('获取楼栋列表失败：', err);
                wx.showToast({
                    title: '网络错误，请重试',
                    icon: 'none'
                });
            }
        });
    },

    // 获取默认图表数据
    fetchChartData() {
        wx.showLoading({ title: '加载图表...' });
        wx.request({
            url: 'https://rmxcizonggsx.sealoshzh.site/get_chart_data',
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200 && !res.data.error) {
                    this.setData({
                        chartData: res.data,
                        showDefaultChart: true
                    }, () => {
                        // 在数据设置完成后初始化图表
                        this.ecComponent.init((canvas, width, height, dpr) => {
                            const chart = echarts.init(canvas, null, {
                                width: width,
                                height: height,
                                devicePixelRatio: dpr
                            });
                            canvas.setChart(chart);
                            const option = this.getChartOption(res.data);
                            chart.setOption(option);
                            return chart;
                        });
                    });
                } else {
                    wx.showToast({
                        title: res.data.error || '获取图表数据失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('获取图表数据失败：', error);
                wx.showToast({
                    title: '网络错误，请检查网络连接',
                    icon: 'none'
                });
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },

    // 获取指定楼栋电量数据
    fetchBuildingPower(building) {
        wx.showLoading({ title: '加载楼栋数据...' });
        wx.request({
            url: 'https://rmxcizonggsx.sealoshzh.site/get_building_power',
            method: 'GET',
            data: {
                building: building
            },
            success: (res) => {
                if (res.statusCode === 200 && !res.data.error) {
                    // 处理单楼栋数据
                    this.setData({
                        singleBuildingData: res.data,
                        showDefaultChart: false
                    }, () => {
                        // 初始化单楼栋图表
                        this.ecComponent.init((canvas, width, height, dpr) => {
                            const chart = echarts.init(canvas, null, {
                                width: width,
                                height: height,
                                devicePixelRatio: dpr
                            });
                            canvas.setChart(chart);
                            const option = this.getSingleBuildingChartOption(res.data);
                            chart.setOption(option);
                            return chart;
                        });
                    });
                } else {
                    // 如果数据未更新，显示提示并展示默认图表
                    wx.showToast({
                        title: res.data.error || '获取楼栋数据失败',
                        icon: 'none'
                    });
                    this.fetchChartData(); // 加载默认图表
                }
            },
            fail: (error) => {
                console.error('获取楼栋数据失败：', error);
                wx.showToast({
                    title: '网络错误，请检查网络连接',
                    icon: 'none'
                });
                this.fetchChartData(); // 加载默认图表
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },

    // 选择楼栋
    selectBuilding(e) {
        const index = e.detail.value;
        this.setData({
            buildingIndex: index
        });

        if (index > 0) {
            const selectedBuilding = this.data.buildings[index];
            this.setData({
                selectedBuilding: selectedBuilding
            });
            this.fetchBuildingPower(selectedBuilding);
        } else {
            // 如果选择了"请选择公寓楼"，则显示默认图表
            this.fetchChartData();
        }
    },

    // 刷新图表
    refreshChart() {
        if (this.data.showDefaultChart) {
            this.fetchChartData();
        } else {
            this.fetchBuildingPower(this.data.selectedBuilding);
        }
    },

    // 获取默认图表配置
    getChartOption(chartData) {
        return {
            backgroundColor: '#ffffff',
            title: [{
                text: '宿舍电量分布图',
                left: 'center',
                top: 20,
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }, {
                text: '楼层平均电量对比',
                left: 'center',
                top: '55%',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }],
            grid: [{
                top: 100,
                bottom: '60%',
                left: 80,
                right: 30
            }, {
                top: '65%',
                bottom: 50,
                left: 80,
                right: 30
            }],
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    if (params[0].seriesType === 'scatter') {
                        return `房间号：${params[0].value[0]}\n剩余电量：${params[0].value[1]}度`
                    } else {
                        return `${params[0].name}\n剩余电量：${params[0].value}度`
                    }
                }
            },
            legend: [{
                data: chartData.scatter_data.buildings,
                top: 50,
                left: 'center',
                textStyle: {
                    fontSize: 12
                },
                itemGap: 50
            }, {
                data: chartData.bar_data.buildings,
                top: '60%',
                left: 'center',
                textStyle: {
                    fontSize: 12
                },
                itemGap: 50
            }],
            xAxis: [{
                type: 'category',
                name: '房间号',
                gridIndex: 0,
                nameLocation: 'middle',
                nameGap: 25,
                axisLabel: {
                    interval: 29,
                    fontSize: 12,
                    formatter: function(value) {
                        return value % 100 === 1 ? value : '';
                    }
                },
                data: Array.from({length: 6}, (_, floor) => 
                    Array.from({length: 30}, (_, room) => 
                        (floor + 1) * 100 + room + 1
                    )
                ).flat()
            }, {
                type: 'category',
                name: '楼层',
                gridIndex: 1,
                data: chartData.bar_data.floors,
                nameLocation: 'middle',
                nameGap: 25
            }],
            yAxis: [{
                type: 'value',
                name: '剩余电量(度)',
                gridIndex: 0,
                nameLocation: 'middle',
                nameGap: 65,
                nameTextStyle: {
                    fontSize: 12,
                    padding: [0, 0, 0, 0],
                    align: 'center'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min: 0,
                max: 300,
                interval: 50,
                axisLabel: {
                    formatter: '{value}'
                }
            }, {
                type: 'value',
                name: '平均电量(度)',
                gridIndex: 1,
                nameLocation: 'middle',
                nameGap: 65,
                nameRotate: 90,
                nameTextStyle: {
                    fontSize: 12,
                    padding: [0, 0, 0, 0],
                    align: 'center'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            }],
            series: [
                // 散点图数据
                ...chartData.scatter_data.data.map((buildingData, index) => ({
                    name: chartData.scatter_data.buildings[index],
                    type: 'scatter',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: buildingData.map(item => [item.room, item.quantity]),
                    symbolSize: 6
                })),
                // 柱状图数据
                ...chartData.bar_data.data.map((buildingData, index) => ({
                    name: chartData.bar_data.buildings[index],
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: buildingData
                }))
            ]
        };
    },

    // 获取单楼栋图表配置
    getSingleBuildingChartOption(buildingData) {
        // 处理房间数据，按楼层分组
        const rooms = buildingData.rooms;
        const floorMap = new Map();
        
        // 分组房间数据
        rooms.forEach(room => {
            const roomNum = parseInt(room.room_name);
            const floor = Math.floor(roomNum / 100); // 获取楼层
            
            if (!floorMap.has(floor)) {
                floorMap.set(floor, []);
            }
            
            floorMap.get(floor).push({
                room: roomNum,
                quantity: parseFloat(room.quantity)
            });
        });
        
        // 计算每层楼的平均电量
        const floors = Array.from(floorMap.keys()).sort();
        const floorAvgPower = floors.map(floor => {
            const roomsInFloor = floorMap.get(floor);
            const sum = roomsInFloor.reduce((acc, room) => acc + room.quantity, 0);
            return sum / roomsInFloor.length;
        });
        
        // 准备散点图数据
        const scatterData = [];
        rooms.forEach(room => {
            scatterData.push([
                parseInt(room.room_name),
                parseFloat(room.quantity)
            ]);
        });
        
        return {
            backgroundColor: '#ffffff',
            title: [{
                text: `${buildingData.building_name}电量分布图`,
                left: 'center',
                top: 20,
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }, {
                text: `${buildingData.building_name}楼层平均电量`,
                left: 'center',
                top: '55%',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }],
            grid: [{
                top: 100,
                bottom: '60%',
                left: 80,
                right: 30
            }, {
                top: '65%',
                bottom: 50,
                left: 80,
                right: 30
            }],
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    if (params[0].seriesType === 'scatter') {
                        return `房间号：${params[0].value[0]}\n剩余电量：${params[0].value[1]}度`;
                    } else {
                        return `${params[0].name}楼\n平均电量：${params[0].value.toFixed(2)}度`;
                    }
                }
            },
            xAxis: [{
                type: 'value',
                name: '房间号',
                gridIndex: 0,
                nameLocation: 'middle',
                nameGap: 25,
                axisLabel: {
                    formatter: '{value}'
                }
            }, {
                type: 'category',
                name: '楼层',
                gridIndex: 1,
                data: floors.map(f => `${f}`),
                nameLocation: 'middle',
                nameGap: 25
            }],
            yAxis: [{
                type: 'value',
                name: '剩余电量(度)',
                gridIndex: 0,
                nameLocation: 'middle',
                nameGap: 65,
                nameTextStyle: {
                    fontSize: 12,
                    padding: [0, 0, 0, 0],
                    align: 'center'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min: 0,
                axisLabel: {
                    formatter: '{value}'
                }
            }, {
                type: 'value',
                name: '平均电量(度)',
                gridIndex: 1,
                nameLocation: 'middle',
                nameGap: 65,
                nameRotate: 90,
                nameTextStyle: {
                    fontSize: 12,
                    padding: [0, 0, 0, 0],
                    align: 'center'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min: 0,
                axisLabel: {
                    formatter: '{value}'
                }
            }],
            series: [
                // 散点图数据
                {
                    name: buildingData.building_name,
                    type: 'scatter',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: scatterData,
                    symbolSize: 8,
                    itemStyle: {
                        color: '#1296db'
                    }
                },
                // 柱状图数据
                {
                    name: buildingData.building_name,
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: floorAvgPower,
                    itemStyle: {
                        color: '#1296db'
                    }
                }
            ]
        };
    }
})
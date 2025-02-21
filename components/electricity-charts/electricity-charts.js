// 使用 require 引入 echarts
const echarts = require('../../ec-canvas/echarts');

Component({
    properties: {
        chartData: {
            type: Object,
            value: null,
            observer: 'onDataChange'
        }
    },

    data: {
        ec: {
            onInit: function(canvas, width, height, dpr) {
                const chart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr
                });
                canvas.setChart(chart);

                const option = {
                    backgroundColor: '#ffffff',
                    title: [{
                        text: '宿舍电量分布图',
                        left: 'center',
                        top: 20,
                        textStyle: {
                            fontSize: 14
                        }
                    }, {
                        text: '楼层平均电量对比',
                        left: 'center',
                        top: '55%',
                        textStyle: {
                            fontSize: 14
                        }
                    }],
                    grid: [{
                        top: 80,
                        bottom: '58%',
                        left: 80,
                        right: 30
                    }, {
                        top: '60%',
                        bottom: 50,
                        left: 50,
                        right: 20
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
                        data: this.properties.chartData.scatter_data.buildings,
                        top: 50,
                        left: 'center',
                        textStyle: {
                            fontSize: 12
                        },
                        itemGap: 50,
                        formatter: function(name) {
                            if (name.includes('一号')) {
                                return '一号公寓'
                            } else if (name.includes('七号')) {
                                return '七号公寓'
                            }
                            return name
                        }
                    }, {
                        data: this.properties.chartData.bar_data.buildings,
                        top: '55%',
                        left: 'center',
                        textStyle: {
                            fontSize: 12
                        },
                        itemGap: 50,
                        formatter: function(name) {
                            if (name.includes('一号')) {
                                return '一号公寓'
                            } else if (name.includes('七号')) {
                                return '七号公寓'
                            }
                            return name
                        }
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
                        data: this.properties.chartData.bar_data.floors,
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
                        nameTextStyle: {
                            fontSize: 12,
                            padding: [0, 0, 0, 30]
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    }],
                    series: [
                        // 散点图数据
                        ...this.properties.chartData.scatter_data.data.map((buildingData, index) => ({
                            name: this.properties.chartData.scatter_data.buildings[index],
                            type: 'scatter',
                            xAxisIndex: 0,
                            yAxisIndex: 0,
                            data: buildingData.map(item => [item.room, item.quantity]),
                            symbolSize: 8
                        })),
                        // 柱状图数据
                        ...this.properties.chartData.bar_data.data.map((buildingData, index) => ({
                            name: this.properties.chartData.bar_data.buildings[index],
                            type: 'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            data: buildingData
                        }))
                    ]
                };

                chart.setOption(option);
                return chart;
            }
        }
    },

    lifetimes: {
        attached() {
            console.log('组件attached')
        }
    },

    methods: {
        onDataChange(newVal) {
            if (newVal) {
                this.setData({
                    'ec.onInit': this.createChartOption(newVal)
                });
            }
        },

        createChartOption(chartData) {
            return function(canvas, width, height, dpr) {
                const chart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr
                });
                canvas.setChart(chart);

                const option = {
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
                        top: '52%',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }],
                    grid: [{
                        top: 80,
                        bottom: '58%',
                        left: 80,
                        right: 30
                    }, {
                        top: '68%',
                        bottom: 80,
                        left: 60,
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
                        itemGap: 50,
                        formatter: function(name) {
                            if (name.includes('一号')) {
                                return '一号公寓'
                            } else if (name.includes('七号')) {
                                return '七号公寓'
                            }
                            return name
                        }
                    }, {
                        data: chartData.bar_data.buildings,
                        top: '56%',
                        left: 'center',
                        textStyle: {
                            fontSize: 12
                        },
                        itemGap: 50,
                        formatter: function(name) {
                            if (name.includes('一号')) {
                                return '一号公寓'
                            } else if (name.includes('七号')) {
                                return '七号公寓'
                            }
                            return name
                        }
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
                        nameGap: 25,
                        axisLabel: {
                            fontSize: 12,
                            interval: 0
                        }
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
                        nameTextStyle: {
                            fontSize: 12,
                            padding: [0, 0, 0, 30]
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'
                            }
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
                            symbolSize: 6,
                            itemStyle: {
                                opacity: 0.7
                            }
                        })),
                        // 柱状图数据
                        ...chartData.bar_data.data.map((buildingData, index) => ({
                            name: chartData.bar_data.buildings[index],
                            type: 'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            data: buildingData,
                            barMaxWidth: 25,
                            barGap: '30%',
                            itemStyle: {
                                borderRadius: [3, 3, 0, 0]
                            }
                        }))
                    ]
                };

                chart.setOption(option);
                return chart;
            }
        }
    }
}) 
<template>
  <el-container style="height: 100vh; flex-direction: column;">
    <!-- 内容区域 -->
    <el-main class="dashboard-container">
      <!-- 资产总览 -->
      <el-card class="box-card asset-overview">
        <div slot="header" class="card-header">
          <span>资产总览</span>
        </div>
        <div class="asset-grid">
          <div class="asset-item">
            <p>集成流</p>
            <h3><a href="/config-center/integrationConfig" class="text-link">{{ flowInfo.allTasks }}</a></h3>
          </div>
          <div class="asset-item">
            <p>数据源</p>
            <h3><a href="/config-center/datasource" class="text-link">{{ flowInfo.allDatasources }}</a></h3>
          </div>
          <div class="asset-item success">
            <p>已启用流</p>
            <h3>{{ flowInfo.enableTasks }}</h3>
          </div>
          <div class="asset-item error">
            <p>今日累计同步失败数量</p>
            <h3>321</h3>
          </div>
        </div>
      </el-card>

      <!-- 服务器资源监控 -->
      <el-card class="box-card server-monitor">
        <div slot="header" class="card-header">
          <span>服务器资源监控</span>
        </div>
        <div class="server-content">
          <!-- 左侧：CPU & Memory 图表 -->
          <div class="charts-row">
            <div class="chart-box">
              <div id="cpu-chart" class="chart" />
            </div>
            <div class="chart-box">
              <div id="memory-chart" class="chart" />
            </div>
          </div>

          <!-- 右侧：4个指标分2行显示 -->
          <div class="metrics-grid">
            <div class="metric">
              <p>今日同步总量</p>
              <h4>12,345,678</h4>
            </div>
            <div class="metric">
              <p>本月同步总量</p>
              <h4>912,345,678</h4>
            </div>
            <div class="metric success">
              <p>今日成功数量</p>
              <h4>12,345,357</h4>
            </div>
            <div class="metric success">
              <p>本月成功数量</p>
              <h4>912,345,678</h4>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 流同步排行 -->
      <el-card class="box-card flow-ranking">
        <div slot="header" class="card-header">
          <span>当月同步数据排行</span>
        </div>
        <div class="flow-content">
          <div class="chart-section">
            <div id="flow-ranking-chart" class="chart" />
          </div>
          <div class="table-section">
            <h5 style="margin-bottom: 10px;">最近流运行失败</h5>
            <el-table :data="recentFailures" size="mini" border style="width: 100%">
              <el-table-column prop="rank" label="Top" width="50" />
              <el-table-column prop="name" label="流名称" />
              <el-table-column prop="startTime" label="开始时间" width="160" />
            </el-table>
          </div>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import * as echarts from 'echarts/core'

// 引入需要用到的图表类型
import { BarChart } from 'echarts/charts'
import { GaugeChart } from 'echarts/charts'
import * as api from '@/api/dashboard'

// 引入需要的组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent
} from 'echarts/components'

// 使用 Canvas 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的模块
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  AxisPointerComponent,
  BarChart,
  GaugeChart,
  CanvasRenderer
])

export default {
  name: 'Dashboard',
  data() {
    return {
      recentFailures: [
        { rank: 1, name: '思索-金蝶-应收单同步-纷享...', startTime: '2025-05-14 20:13:52 GMT+08:00' },
        { rank: 2, name: '思索-销售订单同步-更新可...', startTime: '2025-05-14 15:00:00 GMT+08:00' },
        { rank: 3, name: '锐视销售退货单同步-金蝶K...', startTime: '2025-05-14 02:00:00 GMT+08:00' }
      ],
      cpuChart: null,
      memoryChart: null,
      flowInfo: {
        allTasks: 0,
        enableTasks: 0,
        allDatasources: 0
      },
      systemInfo: {
        SYSTEM_MEM_USAGE_PERCENT: 0,
        SYSTEM_CPU_USAGE_PERCENT: 0
      },
      cpuOptions: { title: {
        text: 'CPU使用率', // 标题文字
        left: 'left', // 水平居中
        top: 1, // 距离顶部 10px
        textStyle: {
          fontSize: 12, // 字体大小
          color: '#333' // 字体颜色
        }
      },
      series: [
        {
          type: 'gauge',
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            distance: -20,
            length: 8,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -30,
            length: 30,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          axisLabel: {
            color: 'inherit',
            distance: 30,
            fontSize: 12
          },
          detail: {
            fontSize: 20,
            valueAnimation: true,
            formatter: '{value}%',
            color: 'inherit'
          },
          data: [
            {
              value: 0
            }
          ]
        }
      ]
      },
      memoryOptions: { title: {
        text: '内存使用率', // 标题文字
        left: 'left', // 水平居中
        top: 1, // 距离顶部 10px
        textStyle: {
          fontSize: 12, // 字体大小
          color: '#333' // 字体颜色
        }
      },
      series: [
        {
          type: 'gauge',
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            distance: -20,
            length: 8,
            lineStyle: {
              color: '#fff',
              width: 1
            }
          },
          splitLine: {
            distance: -30,
            length: 30,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          axisLabel: {
            color: 'inherit',
            distance: 30,
            fontSize: 12
          },
          detail: {
            fontSize: 20,
            valueAnimation: true,
            formatter: '{value}%',
            color: 'inherit'
          },
          data: [
            {
              value: 0
            }
          ]
        }
      ]
      }
    }
  },
  async created() {
    this.getSystemInfo()
    this.getFlowIno()
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    getFlowIno() {
      api.getFlowInfo().then((res) => {
        this.flowInfo = res
      })
    },
    getSystemInfo() {
      api.getSystemInfo().then((res) => {
        console.log(res)
        this.systemInfo = res
        this.refreshCharts()
      })
    },
    refreshCharts() {
      this.cpuOptions.series[0].data[0].value = this.systemInfo.SYSTEM_CPU_USAGE_PERCENT
      this.cpuChart.setOption(this.cpuOptions)

      this.memoryOptions.series[0].data[0].value = this.systemInfo.SYSTEM_MEM_USAGE_PERCENT
      this.memoryChart.setOption(this.memoryOptions)
    },
    initCharts() {
      this.cpuChart = echarts.init(document.getElementById('cpu-chart'))
      this.cpuChart.setOption(this.cpuOptions)

      this.memoryChart = echarts.init(document.getElementById('memory-chart'))
      this.memoryChart.setOption(this.memoryOptions)

      const flowChart = echarts.init(document.getElementById('flow-ranking-chart'))
      flowChart.setOption({
        /* title: {
          text: '流同步数据排行'
        },*/
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: ['us033-MJC0901003-区域基本信息-东井', 'us034-MJC0901004-分站信息-东井', 'us035-MJC0901005-班次信息-东井', 'us036-MJC0901006-特种作业人员预设路线-东井', 'us038-MJC0901003-区域基本信息-西井', 'us039-MJC0901004-分站信息-西井', 'us040-MJC0901005-班次信息-西井', 'us041-MJC0901006-特种作业人员预设路线-西井', 'us045-MJC0902001-人员实时数据-东井', 'us048-MJC0902001-人员实时数据-西井']
        },
        series: [
          {
            type: 'bar',
            data: [18203, 23489, 130230, 230230, 330230, 430230, 538834, 638834, 738834, 839882]
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
/* 缩小标题与内容之间的间距 */
::v-deep .el-card__header {
  padding: 10px 20px; /* 减少上下 padding */
}

::v-deep .el-card__body {
  padding-top: 5px; /* 减少顶部 padding */
}

/* 去掉card横线 */
::v-deep .el-card__header {
  border-bottom: none;
}

.dashboard-container {
  padding: 20px;
  background-color: #f7f9fc;
  overflow-y: auto;
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
}
.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: none;
}

/* 资产总览 */
.asset-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px 0;
}
.asset-item {
  text-align: center;
}
.asset-item h3 {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}
.asset-item p {
  font-size: 14px;
  color: #666;
}
.error {
  color: #ff4d4f;
}
.success {
  color: #389e0d;
}
.text-link {
  text-decoration: underline;
  color: #2e9be0;
}
/* 服务器资源监控 */
.server-content {
  display: flex;
  gap: 10px;
  padding: 5px 0;
}
.charts-row {
  display: flex;
  gap: 10px;
  flex: 1;
}
.chart-box {
  flex: 1;
  height: 260px;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 5px;
  flex: 1;
}
.metric {
  padding: 5px 10px;
  background-color: #f0f5ff;
  border-radius: 6px;
}
.metric h4 {
  font-size: 16px;
  margin-top: 5px;
  color: #333;
}
/* 流同步数据排行 */
.flow-content {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}
.chart-section {
  flex: 2;
  height: 350px;
}
.table-section {
  flex: 1;
  padding-left: 10px;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>

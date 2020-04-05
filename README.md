# UrbanMotion 文档 UrbanMotion Doc

## 安装 Installation
```
git clone url
npm install
npm run start
```
## 简介 Introduction
主要使用vue\iview\jade\leaflet\canvas\heatmap.js等技术

## 项目结构 Structure

```
UrbanMotion/
│  app.js
│  npm-debug.log
│  package-lock.json
│  package.json
│  README.md
│  webpack.config.js
│  
├─bin
│      www         
├─public
│  ├─data
│  ├─javascripts
│  └─stylesheets          
├─src
│  │  init.js
│  │  prop.js
│  │  
│  ├─Animator
│  │      animator.js
│  │      animatorCtrl.js
│  │      
│  ├─calculate
│  │      calculateCircle.js
│  │      calculateColor.js
│  │      calculateEdge.js
│  │      
│  ├─directionCluster
│  │      directionFunction.js
│  │      drawDirectionCluster.js
│  │      
│  ├─drawAxis
│  │      drawAxis.js
│  │      
│  ├─drawClock
│  │      drawClock.js
│  │      
│  ├─drawMap
│  │      map.js
│  │      mapLayout.js
│  │      process.js
│  │      
│  ├─init
│  │      mapVueInit.js
│  │      
│  ├─processData
│  │      getData.js
│  │      processData.js
│  │      
│  ├─processTree
│  │      processTree.js
│  │      
│  ├─request
│  │      request.js
│  │      
│  ├─services
│  │      ajax.js
│  │      dotsCluster.js
│  │      famousEnterprise.js
│  │      gidFlowStatics.js
│  │      ODMap.js
│  │      personalRecords.js
│  │      
│  ├─util
│  │      base.js
│          
└─views
```

## src/重要文件详细说明 Detailed Descriptions of src/ important files

### 1. init.js
用途：入口文件，初始化vue实例对象，包含绑定数据、组件、methods、computed、mounted等生命周期

### 2. /init/mapVueInit.js
用途：vue绑定的初始化数据，包括各个下拉菜单、单选按钮的初始值等

### 3. ../views文件夹
用途：界面构建，以jade方式，主要使用了ivew的一些组件，并在组件中绑定了一些事件

### 4. /drawMap/mapLayout.js
用途: 定义mapview类，主要完成地图的展示功能，包括底图的设定、缩放等事件的监听、热力图以及动态移动流的绘制。

下面介绍几个重要方法：
#### 4.1 generate方法由服务端返回的树生成由多条由点组成的轨迹。
#### 4.2 drawLoopTree方法动态绘制移动流，采用canvas方法完成绘制和动画过程，其中包括地图viewreset、zoomstart、zoomend、moveend等事件的监听。其中动画的完成请参考canvas动画教程。
#### 4.3 drawStayPath方法绘制静止的移动流
#### 4.4 addHeatMap方法绘制热力图
参数：type 代表热力图的类型，data是热力图绑定的数据
#### 4.5 drawStaticsChart方法绘制异常统计图
#### 4.6 drawHubFlag方法绘制Hub的logo，并且绑定Hub点击事件（即弹出统计图表）

### 5. /processTree/processTree.js
用途：定义了动画绘制过程中平滑的方法，包括单个移动流的平滑、树的平滑。

### 6. /calculate文件夹
用途：包含项目中所用到的各个计算方法，详见各文件

### 7. /drawAxis/drawAxis.js
用途：绘制UrbanMotion系统中的时间轴选择部分

### 8. /drawClock/drawClock.js
用途：绘制系统中的左下角时钟部分，并添加点击监听事件

### 9 /services文件夹
用途：包含用于和后端接口请求的方法，由于存在跨域的问题，本项目采用jsonp的方式来解决，在/request/request.js文件中同样存在一些请求方法。

### 10 /util/base
用途：包含各类地图坐标系转换函数，这是因为各个底图所采用的坐标系不同，因此需要进行转换；以及请求数据后出现的动画logo添加函数。

### 11 /Animator文件夹
用途：设置动画绘制过程中的一些参数，例如：蒙层的透明度、线条的颜色粗细等

### 12 /directionCluster文件夹
用途：生成右上角的方向聚类时钟，并添加点击监听事件

### 修改说明 Instructions of modification
```
# 界面修改：../views文件夹
# 绑定数据添加/修改：/init/mapVueInit.js中进行添加/修改
# 绑定事件：init.js添加新的methods
# 请求数据：在/services下面添加新的文件
# 地图绘制：drawMap/mapLayout.js中添加新的类方法
```

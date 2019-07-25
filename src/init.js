//import {maps} from './prop'
import {mapview} from './drawMap/mapLayout'
import {objClone,sortline,getlines,getNodes,getLinePos,updateGraph,processPoiToDiv,processDivToPoi} from './processData/processData'
import Vue from 'vue'
import * as d3 from 'd3'
import vueSlider from 'vue-slider-component'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import {getdata,res, getdistrictData, getBoundary} from './processData/getData'
import {axisView} from './drawAxis/drawAxis'
import {clockView} from "./drawClock/drawClock"
import {Selectors} from "./Selecor/selectorLayout"
import {maps} from "./init/mapVueInit"
import {request,requestAm,getTreeMap,getAbnormalStatus,getTreeWidth} from "./request/request"
import {DirectionClusterView} from "./directionCluster/drawDirectionCluster"
import {gidFlowStatics} from "./services/gidFlowStatics"
import {addWaitingLogo,removeWaitingLogo} from "./util/base"
//import {sortline} from "processData/processData"

Vue.use(iView);
var starttime = "2016-July-05-07:00";
var end_time = "2016-July-05-10:00";
var request_days = ["2016-Jul-05"];
var start_hour;
var end_hour;
var sortOpt = "DESC";
$(function () {
    $(".form_datetime").datetimepicker({
        language: "zh-CN",
        format: "yyyy-MM-dd",
        autoclose: true,
        todayBtn: true,
        startDate: "2016-07-05 00:00",
        minView: "month"

    }).on('changeDate', function (ev) {

        starttime = $("#starttime").val();
        end_time = $("#endtime").val();
        //changeTime(starttime,end_time);
        console.log(starttime)
        console.log(end_time)
    });
});
var months = {'July': '07', 'August': '08', 'September': '09', 'Jul': "07", 'Aug': "08", 'Sep': "09"};
var map = [];
var clock;
var directionCluster;
var disAxis;
var comAxis;


function reduceGraph(dt) {
    var old_graph = graph;
    var new_graph = {};
    new_graph.nodes = [];
    new_graph.edges = [];
    var dt_nodes = dt.nodes, dtNodeLen = dt.nodes.length;
    var dt_edges = dt.edges, dtEdgeLen = dt.edges.length;
    var nodes = old_graph.nodes, nodeLen = old_graph.nodes.length;
    var edges = old_graph.edges, edgeLen = old_graph.edges.length;
    var id_updated = [];
    var eid_updated = [];
    for (var i = 0; i < nodeLen; i++) {
        var node = nodes[i];
        for (var j = 0; j < dtNodeLen; j++) {
            if (nodes[i].id == dt_nodes[j].id) {
                node.stay_device_num -= dt_nodes[j].stay_device_num;
                node.stay_record_num -= dt_nodes[j].stay_record_num;
                id_updated.push(nodes[i].id);
            }
        }
        new_graph.nodes.push(node);
    }

    for (var i = 0; i < edgeLen; i++) {
        var edge = edges[i];
        for (var j = 0; j < dtEdgeLen; j++) {
            //    console.log(edges[j]);
            if (edges[i].from_nid === dt_edges[j].from_nid && edges[i].to_nid === dt_edges[j].to_nid) {
                console.log("found!")
                edge.travel_device_num = edge.travel_device_num - dt_edges[j].travel_device_num;
                edge.travel_record_num = edge.travel_record_num - dt_edges[j].travel_record_num;
                eid_updated.push([edges[i].from_nid, edges[i].to_nid]);
            }
        }
        new_graph.edges.push(edge);
    }
    console.log("new graph is")
    console.log(new_graph);
    graph = new_graph;
    return new_graph;
}






function process(data) {
    var res = [];
    $.each(data.edges[0], function (j, edge) {
        var nodes = data.nodes[0];
        var link = edge;
        //console.log(link.from_nid)
        var count = 0;
        if (link.to_nid === 438) {
            for (var i = 0; i < nodes.length; i++) {
                //console.log(nodes[i].nid)
                if (nodes[i].id === 438) {
                    count++;
                    //console.log("found!")
                    link.to_x = nodes[i].x;
                    link.to_y = nodes[i].y;
                    break;
                }
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            //console.log(nodes[i].nid)
            if (link.from_nid === nodes[i].id) {
                count++;
                //console.log("found!")
                link.from_x = nodes[i].x;
                link.from_y = nodes[i].y;
                break;
                // res.push(link);
            }
        }
        /* for(var i = 0; i<nodes.length;i++){
             //console.log(nodes[i].nid)
             if(link.to_nid === 438 || link.to_nid === 603){
                 count ++;
                 //console.log("found!")
                 link.to_x = nodes[i].x;
                 link.to_y = nodes[i].y;
                 break;
             }
         }*/
        if (count == 2) res.push(link);
    });
    console.log(res);
    return res;
}

function process1(data) {
    var res = [];
    $.each(data.edges[0], function (j, edge) {
        /*if(j >500){
            return res;
        }*/
        var nodes = data.nodes[0];
        var link = edge;
        //console.log(link.from_nid)
        var count = 0;
        if (link.from_nid === 438) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === 438) {
                    count++;
                    link.from_x = nodes[i].x;
                    link.from_y = nodes[i].y;
                }
            }
        }

        /* for(var i = 0; i<nodes.length;i++){
             //console.log(nodes[i].nid)
             if(link.from_nid === 438 || link.from_nid === 603 ){
                 count ++;
                 //console.log("found!")
                 link.from_x = nodes[438].x;
                 link.from_y = nodes[438].y;
                 break;
                 // res.push(link);
             }
         }*/
        for (var i = 0; i < nodes.length; i++) {
            //console.log(nodes[i].nid)
            if (link.to_nid === nodes[i].id) {
                count++;
                //console.log("found!")
                link.to_x = nodes[i].x;
                link.to_y = nodes[i].y;
                break;
            }
        }
        if (count == 2) res.push(link);
    });
    console.log(res);
    return res;
}

function process2(data) {
    var res = [];
    $.each(data.edges[0], function (j, edge) {
        /*if(j >500){
            return res;
        }*/
        var nodes = data.nodes[0];
        var link = edge;
        //console.log(link.from_nid)

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id === link.from_nid) {
                link.from_x = nodes[i].x;
                link.from_y = nodes[i].y;
            }
        }
        for (var i = 0; i < nodes.length; i++) {
            //console.log(nodes[i].nid)
            if (link.to_nid === nodes[i].id) {
                //console.log("found!")
                link.to_x = nodes[i].x;
                link.to_y = nodes[i].y;
                break;
            }
        }
        res.push(link);
    });
    console.log(res);
    return res;
}




const userpannel = new Vue({
    el: '#maindiv',
    data: maps, starttime, end_time, map,
    components: {
        vueSlider
    },
    methods: {
        'changeStyle':function (heatnum) {
            //sliderbar.style.width = (100 - heatnum)+"%"
        },
        'changeCity': function (city) {
            maps.city = city
            if (city === 'BJ') {
                map[0].map.setView([39.9, 116.37],11)
            }
            if (city === 'TJ'){
                map[0].map.setView([39.1439299033,117.210813092],11)
            }
            if (city === 'TS'){
                map[0].map.setView([39.63,118.2],11)
            }
            getTreeMap()
                .then(function (res) {
                    map[0].allLatLngNodes = [];
                    map[0].lastLen = 0;
                    //maps.fade = false;
                    res.forEach(function (tree) {
                        var path = [];
                        var drawedSet = new Set()
                        map[0].generate(tree,path,drawedSet)
                    })
                    if(maps.status == "play"){
                        map[0].drawLoopTree(maps.newOptionData);
                        //map[0].drawODMap()
                    }
                    else{
                        map[0].drawStayPath(maps.newOptionData);
                    }
                })
        },
        'getPersonalRecord': function (travelId) {
            map[0].drawPersonalRecord(travelId)
        },
        'changeToOD':function () {
            map[0].drawODMap()
        },
        'changeToDotsCluster': function () {
            map[0].drawDotsCluster()
        },
        'changeToFamousEnterprise':function () {
            map[0].drawFamousEnterprise()
        },
        'changeToHotPlaces': function (type) {
            map[0].drawHotPlaces(type)
        },
        'changeToHotPlacesCluster': function () {
           map[0].drawHotGridCluster()
        },
        'changeToHub':function () {
           map[0].drawHub()
        },
        'changeToChannel':function () {

          map[0].drawChannel()
        },
        'showFillingStation': function () {
            console.log('station')
            map[0].drawFillingStation()
        },
        'showSubway':function () {
            map[0].drawSubway()
        },
        'changeToSpeed':function (speed) {
            maps.speedToShow = speed
            map[0].allLatLngNodes = [];
            map[0].lastLen = 0;
            maps.fade = false;
            getTreeMap()
                .then(function (res) {
                    res.forEach(function (tree) {
                        var path = [];
                        var drawedSet = new Set()
                        map[0].generate(tree,path,drawedSet)
                    })
                    if(maps.status == "play"){
                        map[0].drawLoopTree(maps.newOptionData);
                        //map[0].drawODMap()
                    }
                    else{
                        map[0].drawStayPath(maps.newOptionData);
                    }
                })
        },
        'changeHeatOption':function (curtype) {
            let el = document.getElementsByClassName('contain-slider')[0];
            let sliderbar = el.getElementsByClassName('ivu-slider-wrap')[0];
            sliderbar.background = "linear-gradient(to right, white, #57a3f3)";

            getAbnormalStatus(curtype)
               /* .then(function (heatType,data) {
                    map[0].addHeatMap(heatType,data)
                })*/


        },
        'format':function (val) {
          return val+"%"
        },
        'changeAnimate':function () {
            if(maps.animate=="play") {
                maps.animate = "pause";
            }
            else{
                maps.animate = "play";
                //todo 设置一个时间值之后改变停止播放状态；

                //request();
                //clock.clock.selectAll("path").style("opacity",0)
                //request();
            }
        },
        'changeAnimateAm':function () {
            if(maps.animateAm=="play") {
                maps.animateAm = "pause";
            }
            else{
                maps.animateAm = "play";
                //todo 设置一个时间值之后改变停止播放状态；

                //request();
                /*clock.clock.selectAll("path").style("opacity",function (d,i) {
                    if(i==19 || i==20 || i== 21){
                        return 1;
                    }
                    else{
                        return 0;
                    }
                })*/
                //requestAm();
            }
        },
        'changeStatus':function () {

            console.log(maps.status)
          if(maps.status=="play"){
              maps.status = "pause";
              d3.select(".tool-panel").select(".ivu-icon ivu-icon-ios-play")
                  .attr("class","ivu-icon ivu-icon-ios-pause");
             //map[0].map.off("zoomstart")
              //map[0].map.off("zoomend");
              //map[0].map.off()
              map[0].drawStayPath(maps.newOptionData);
            }
          else if(maps.status == "pause"){
              maps.status = "play";
              d3.select(".tool-panel").select(".ivu-icon ivu-icon-ios-pause")
                  .attr("class","ivu-icon ivu-icon-ios-play");
              map[0].drawLoopTree(maps.newOptionData);
          }
        },
        'changeOption':function (type) {
            //d3.select(".ivu-tooltip-popper").style("top","-40px");
            console.log("changeOption")
            var seedNum = maps.seedNum/100;
            var angle = maps.newOptionData[1].init;
            var seedStrength = maps.newOptionData[2].init;
            //var treeWidth = maps.newOptionData[12].init;
            //var treeWidth = maps.treeWidth.init;
            var treeWidth = getTreeWidth();
            var direction = maps.fromOrTo;
            var spaceInterval = 200;
            var jumpLen = maps.newOptionData[0].init;
            var gridDirNum = maps.newOptionData[7].init;
            var timeSegId = maps.timeSegId+maps.daySelect*24;
            var maxDistance = maps.newOptionData[10].init
            var gridSize = maps.newOptionData[11].init
            var city = maps.city
            console.log(maps.timeSegId)
            console.log(maps.daySelect)
            console.log(maps.base)
            if(maps.base!=0){
                timeSegId = maps.base + maps.daySelect*24;
            }
            var seedUnit = maps.seedUnit.init;
            var delta = maps.newOptionData[8].init == 'close' ? -1 : maps.newOptionData[8].init ;
            maps.fromOrTo = 'from'
            direction = 'from'
            if(seedUnit =="Flow Volume") {
                seedUnit = "basic"
                if(type=='placeType'){
                     //maps.newOptionData[10].init = 9999
                     maxDistance = 9999
                }
            }
            else if (seedUnit == "Hub") {
                seedUnit = "fhub"
                if(type=='placeType') {
                    maps.newOptionData[10].init = 2
                    maxDistance = 2
                }
            }
            else if (seedUnit == "tHub") {
                seedUnit = "thub"
                maps.fromOrTo = 'to'
                direction = 'to'
                if(type=='placeType') {
                    maps.newOptionData[10].init = 2
                    maxDistance = 2
                }
            }
            else if (seedUnit == "Channel") {
                seedUnit = "channel"
                if(type=='placeType') {
                    //maps.newOptionData[10].init = 9999
                    maxDistance = 9999
                }
            }
            else{
                seedUnit =seedUnit.toLowerCase()
            }
            var url ="http://192.168.0.118:3033/api/treeMapMM?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId+"&delta="+delta+"&maxDistance="+maxDistance+"&gridSize="+gridSize+"&city="+city;
            console.log(url) ;
            map[0].allLatLngNodes = [];
            map[0].lastLen = 0;
            maps.fade = false;
            addWaitingLogo('onemap')
            $.ajax({
                url:url ,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                async:true,
                success: function (data) {
                    var res;
                    if(data.error){
                        alert(" Warning: No data in current time interval!");
                        //map[0].ctx.clearRect(0,0,map[0].canvas.attr("width"),map[0].canvas.attr("height"))
                        d3.select(map[0].map.getPanes().overlayPane).select("canvas").remove();
                        return ;
                    }
                    if(map[0].heatmapLayer){
                        map[0].map.removeLayer(map[0].heatmapLayer)
                    }
                    if(map[0].negHeatLayer){
                        map[0].map.removeLayer(map[0].negHeatLayer)
                    }
                    if(direction=="from"){
                            res = data.res.from;
                        }
                    else if(direction == "to"){
                            res = data.res.to;
                        }
                    else if(direction=="all"){
                        res = data.res.from;
                        data.res.to.forEach(function (d) {
                            res.push(d)
                        })
                       // res.push(data.res.to);
                    }
                    console.log(res)
                    res.forEach(function (tree) {
                        var path = [];
                        var drawedSet = new Set()
                        map[0].generate(tree,path,drawedSet)
                        //map[0].drawTree(tree,path,drawedSet)
                    })
                    // map[0].drawAnimationTree();
                    var loopTime = 10;
                    // if(seedUnit=='fhub'){
                    //     map[0].drawSubway()
                    // }
                    removeWaitingLogo('onemap')
                    if(maps.status == "play"){
                        console.log("drawtree")
                        map[0].drawLoopTree(maps.newOptionData);
                    }
                    else{
                        map[0].drawStayPath(maps.newOptionData);
                    }

                    if(seedUnit=='fhub'){
                        map[0].drawHubFlag('from', data.fromGidList)
                        //map[0].drawSubway()
                    }
                    else if(seedUnit == 'thub'){
                        map[0].drawHubFlag('to', data.toGidList)
                    }
                    else if(seedUnit == "grid"){
                        map[0].drawHubFlag('grid', data.gridList)
                    }
                   /* var heatType = maps.heatType;
                    var timeSegID = maps.timeSegId+maps.daySelect*24;
                    var hourID = timeSegID%24;
                    var type = maps.heatType;
                    if(heatType=="hotspot"){
                        type = "flow"
                    }
                    else if(heatType=="density"){
                        type = "record"
                    }
                    if(heatType == "none"){
                        map[0].addHeatMap("none");
                    }
                    else if(heatType == "speed"){
                        map[0].addHeatMap("speed")
                    }*/
                    var heatType,type;
                    if(maps.heatType != "none"){
                        heatType = maps.heatType;
                        type = maps.heatType;
                        maps.anomalyType = "N/A"
                    }
                    else if(maps.anomalyType!= "none"){
                        heatType = maps.anomalyType;
                        type = maps.anomalyType;
                        maps.heatType = "N/A"
                    }
                    else{
                        heatType = "N/A";
                    }

                    console.log(heatType)
                    var timeSegID = maps.timeSegId+maps.daySelect*24;
                    if(maps.base!=0){
                        timeSegID = maps.base + maps.daySelect;
                    }
                    var hourID = timeSegID%24;

                    let direction1;
                    if(heatType=="Movement"){
                        type = "flow"
                    }
                    else if(heatType == "Travel") {
                        type = "travel"
                    }
                    else if(heatType=="Record"){
                        type = "record"
                    }
                    else if(heatType=="hourly"){
                        type = "ano1";
                    }
                    else if(heatType == "daily"){
                        // type = "freq";
                        // heatType = 'daily'
                        type = "stay";
                        heatType = "stay"
                        //type = "ano2"
                    }
                    else if(heatType == "from"){
                        heatType = "daily"
                        direction1 = "from"
                        type = "ano2"
                    }
                    else if(heatType == "to"){
                        heatType = "daily"
                        direction1 = "to"
                        type = "ano2"
                    }
                    else if(heatType=="freq"){
                        type = "freq";
                    }
                    else if(heatType == "stay"){
                        type = "stay"
                    }
                    if(heatType == "N/A"){
                        map[0].addHeatMap("N/A");
                    }
                    else if(heatType == "Speed"){
                        map[0].addHeatMap("speed")
                    }
                    else{
                        /*if(maps.base != 0 ){
                            maps.heatType = "none";
                            maps.anomalyType = "none";
                            return;
                        }*/
                        var url = "http://192.168.0.118:3033/api/abnormalStats?hourID="+hourID+"&timeSegID="+timeSegID+"&type="+type+"&city="+maps.city;
                        console.log(url)
                        $.ajax({
                            url:url,
                            type: 'GET',
                            contentType: "application/json",
                            dataType: 'jsonp',
                            async:true,
                            success: function (data) {
                                if(type == "record" || type == "travel"){
                                    if(JSON.stringify(data) == "{}"){
                                        maps.heatType = "N/A";
                                        maps.anomalyType = "N/A";
                                        return;
                                    }
                                    else if(data.length ==0){
                                        maps.heatType = "N/A";
                                        maps.anomalyType = "N/A";
                                        return;
                                    }
                                }
                                else if(!data.from){
                                    maps.heatType = "N/A";
                                    maps.anomalyType = "N/A";
                                    return;
                                }
                                /*var ft = maps.fromOrTo;
                                console.log(data);
                                var res;
                                if(type=="flow"){
                                    res = data;
                                }
                                else {
                                    if(ft=="from"){
                                        res = data.from;
                                    }
                                    else if(ft =="to"){
                                        res = data.to;
                                    }
                                }*/
                                map[0].addHeatMap(heatType,data,direction1)
                                //map[0].addHeatMap(heatType,res)
                            }

                        })
                    }
                   }
            })

        },
        'addMap': function () {
            let self = this;
            let index = maps.mapObj.length;
            let obj = objClone(maps.mapObj[index - 1]);
            obj.id.card = 'card${index}';
            obj.id.map = 'map{index}';
            obj.id.tab = 'tab{index}';
            maps.mapObj.push(obj);
            console.log('map' + index.toString());
            // this.drawmap(self);
        },
        'changeTime': function (starttime, end_time) {
            console.log("changetime function")
        },
        'getOverview': function (begintime, endtime) {
            var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime;
            console.log(get_url);
            $.ajax({
                /* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*/
                url: get_url,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                success: function (dt) {

                    var lines = process(dt);
                    //lines = [];
                    var data = getNodes(dt)

                    map[0].drawMigration(data, lines);
                }
            });

        },
        'changeFlow': function (index, flag) {
            console.log("changeflow")
            console.log(index)
            map[index].changeFlow(flag);
        },
        'changeCluster':function (index,flag) {
          map[index].changeCluster(flag);
        },
        //change fill data of each district including stay,flowin/out,in and out
        'changeFill':function (index,flag) {
           map[index].changeFill(flag);
        },
        'changeFilter': function (index, filter) {
            var radius = maps.mapObj[index].visualRadius;
            var stayfilter = maps.mapObj[index].nodeStayFilter;
            var stayinfilter = maps.mapObj[index].nodeInFilter;
            var stayoutfilter = maps.mapObj[index].nodeOutFilter;
            var edgefilter = maps.mapObj[index].edgefilter;
            var comEdgefilter = maps.mapObj[index].comEdgefilter;
            map[index].changeFilter(radius, stayfilter, stayinfilter, stayoutfilter, edgefilter,comEdgefilter,filter);
        },
        'changeSort':function(index,sortOption){
            sortOpt = sortOption ;
            var particleNum = maps.mapObj[index].particleNum;
            var url = "http://192.168.0.118:3033/api/tripFlow?type=record&thread="+particleNum+"&time=2016-07-05%2009:00:00&order="+sortOpt+"&v=v1";
            $.ajax({
                url:url ,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                async:true,
                success: function (dd) {
                    console.log(dd);
                    map[0].drawMigration2(dd)
                }

            })

        },
        'particleNumUpdate':function (index,flag) {
            var particleNum =  maps.mapObj[index].particleNum;
            var maxParticleLength = maps.mapObj[index].maxParticleLength;
            var directionNum = maps.mapObj[index].directionNum;
            console.log(particleNum)
            var url = "http://192.168.0.118:3033/api/tripFlow?type=record&thread=10000&time=2016-07-05%2009:00:00&order="+sortOpt+"&v=v1";
            $.ajax({
                url:url ,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                async:true,
                success: function (dd) {
                    console.log(dd);
                    map[0].drawMigration2(dd,maxParticleLength,directionNum,particleNum,flag)
                }

            })
            /*$.getJSON('/data/beijingBoundary.json', function (dt) {
                $.getJSON("/data/tripFlow5000.json",function (dd) {
                    map[0].drawMigration2(dd,maxParticleLength,directionNum)
                })
            })*/

        },
        'radiusUpdate': function (index, radius) {
            console.log(radius)
            //et radius = maps.mapObj[index].visulRadius;
            map[index].changeVisualRadius(radius);
        },
        'proportionUpdate':function (index) {
            var proportion = maps.mapObj[index].proportion;
            console.log(proportion)
            $.getJSON('/data/beijingBoundary.json', function (dt) {
                map[index].drawBoundary(dt);
                $.getJSON("/data/grid.json", function (data) {
                    var res = getlines(data, proportion);
                    if(index === 0){
                        var inlines = res.in;
                        var outlines = [];
                        var dt = getNodes(data);
                        map[0].drawMigration(dt, inlines, outlines)
                    }
                    else if (index == 1){
                        var inlines = [];
                        var outlines = res.out;
                        var dt = getNodes(data);
                        map[1].drawMigration(dt, outlines, inlines)
                    }

                })
            })
            },
        'nodeSFU': function (index, stayfilter) {
            console.log(maps.mapObj[index].nodeStayFilter)
            map[index].changeSFU(stayfilter);
        },
        'nodeIFU': function (index, stayinfilter) {
            map[index].changeIFU(stayinfilter);
        },
        'nodeOFU': function (index, stayoutfilter) {
            map[index].changeOFU(stayoutfilter)
        },
        'edgeFU': function (index, edgefilter) {
            map[index].changeEFU(edgefilter)
        },
        'changeTravelType': function (travel_type) {
            if (travel_type == "Grid-Grid") {
                console.log(travel_type);
                var start_hour = "07:00:00", end_hour = "08:00:00";
                var start_month = months[starttime.split('-')[1]];
                var begintime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + start_hour;
                //var end_month = months[end_time.split('-')[1]];
                var endtime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + end_hour;
                var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime;
                $.ajax({
                    url: get_url,
                    type: 'GET',
                    contentType: "application/json",
                    dataType: 'jsonp',
                    success: function (dt) {
                        console.log(dt);
                        var lines = process(dt);
                        var lines1 = process1(dt);
                        var data = getNodes(dt)
                        //lines = [];
                        console.log(lines);
                        console.log(lines1);
                        map[0].drawMigration(data, lines, lines1);
                    }
                });
            }
            else if (travel_type == "District-District") {
                $.getJSON('/data/beijingBoundary.json', function (dt) {
                  //  map[0].drawBoundary(dt);
                    $.getJSON('/data/sample.json', function (dt1) {
                        map[0].drawDistrict(dt1, dt);
                        var lines = process2(dt1);
                        var lines1 = process1(dt1);
                        map[0].drawDisDis(dt1, lines, lines1);
                    })
                });
            }

        },
        'getView': function (get_url) {
            this.dt = getdata(get_url);
            console.log(this.dt);
            var lines = process(this.dt);
            var lines1 = process1(this.dt);
            //lines = [];
            console.log(lines);
            console.log(lines1);
            map[0].drawMigration(this.dt, lines, lines1);
        },
        // click the clock and update graph
       'changeMaxWidth':function (maxWidth) {
            console.log("maxwidth")
            console.log(maps.mapObj[0].maxWidth)
       } ,
        //draw the clock in the time filter
        'drawClock': function () {


            var arc = d3.arc()
                .outerRadius(40)
                .innerRadius(25)
                .padAngle(0.05);
            var big_arc = d3.arc()
                .outerRadius(43)
                .innerRadius(22);
            var arcData = [];
            for (var i = 0; i < 24; i++) {
                var t = {};
                t.id = i;
                t.hour = (i + 12) % 24;
                t.value = 1;
                arcData.push(t);
            }
            ;
            var pie = d3.pie()
                .sort(null)
                .value(function (d1) {
                    return d1.value;
                })
            var svg = d3.select(".time-selector").append("svg")
                .attr("width", 300)
                .attr("height", 200)
                .append("g")
                .attr("class", "time-clock");

            var g = svg.selectAll(".arc")
                .data(pie(arcData))
                .enter().append("g")
                .attr("class", "arc")
                .attr("transform", 'translate(80,60)');
            var timelabel = [{
                'text': 12,
                'position': [73, 15]
            }, {
                'text': 15,
                'position': [110, 30]
            },
                {
                    'text': 18,
                    'position': [123, 65]
                },
                {
                    'text': 21,
                    'position': [110, 100]
                },
                {
                    'text': 0,
                    'position': [77, 112]
                },
                {
                    'text': 3,
                    'position': [40, 100]
                },
                {
                    'text': 6,
                    'position': [30, 65]
                },
                {
                    'text': 9,
                    'position': [40, 30]
                }
            ];

            var text = svg.selectAll("text")
                .data(timelabel)
                .enter()
                .append("text")
                .attr("color", "#777777")
                .attr("x", function (d) {
                    return d.position[0];
                })
                .attr("y", function (d) {
                    return d.position[1];
                })
                .html(function (d) {
                    return d.text;
                })
                .style("font-size","10px");


            var big_svg = d3.select(".time-selector").select("svg").select("g");
            var big_g = big_svg.selectAll(".arc1")
                .data(pie(arcData))
                .enter().append("g")
                .attr("class", "arc1")
                .attr("transform", 'translate(80,60)');

            big_g.append("path")
                .attr("d", big_arc)
                .attr("id", function (d, i) {
                    return "big-path" + i.toString();
                })
                .attr("class", "big_arc")
                .each(function (d, i) {
                    d.clicked = false;
                })
                .style("cursor", 'hand')
                .style("fill", "grey")
                .style("opacity", function (d, i) {
                    if (i === 19 || i === 20 || i === 21) {
                        return '1';
                    }
                    else {
                        return '0';
                    }
                })
                .on("mouseover", function (d, i) {
                    d3.select(this).style("fill", "grey");
                    g.select("#path" + i.toString()).style("fill", "grey");
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).style("fill", "grey");
                    g.select("#path" + i.toString()).style("fill", "silver");
                })
                .on("click", function (d, i) {
                    d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');
                    // d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
                    d3.select(".time-link").selectAll("a").style("background","white");
                    d3.select(".time-link").selectAll("a").style("color","#777777");
                    maps.mapObj[0].edgefilter = 0;
                    d.clicked = !d.clicked;
                    var start_hour = (i + 12) % 24
                    var end_hour = start_hour + 1;
                    console.log(start_hour);
                    if (start_hour < 10) {
                        start_hour = "0" + start_hour.toString() + ":00" + ":00";
                    }
                    else {
                        start_hour = start_hour.toString() + ":00" + ":00";
                    }
                    if (end_hour < 10) {
                        end_hour = "0" + end_hour.toString() + ":00" + ":00";
                    }
                    else {
                        end_hour = end_hour.toString() + ":00" + ":00";
                    }
                    /* var start_month = months[starttime.split('-')[1]];
                     var begintime = starttime.split('-')[0]+"-"+start_month+"-"+starttime.split('-')[2]+"+"+start_hour;
                     //var end_month = months[end_time.split('-')[1]];
                     var endtime = starttime.split('-')[0]+"-"+start_month+"-"+starttime.split('-')[2]+"+"+end_hour;
                     var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=div&timeType=duration&netType=basic&other=none&beginTime="+begintime+"&endTime="+endtime;
                     console.log(get_url);*/

                    if (d3.select(this).style("opacity") == 0) {
                        console.log("nominus")
                        d3.select(this).style("opacity", "1");

                        var bdData;
                        var data = {}, lines = [], lines1 = [];
                        var currentIndex = 0;
                        maps.mapObj[0].graph = {};
                        var poi_to_div_data = [];

                        function test(data) {
                            if (currentIndex >= request_days.length) {
                                console.log(data);
                                d3.select(".time-link").selectAll("a").style("background","white");
                                d3.select(".time-link").selectAll("a").style("color","#777777");

                                /*d3.select(".time-link").select(".a"+index.toString()).style("background","#ED5858");
                                d3.select(".time-link").select(".a"+index.toString()).style("color","white");*/

                                map[0].drawDistrict(data, bdData,false);
                                map[0].drawDisDis(data, lines);
                                console.log("line length")
                                console.log(lines.length)
                                maps.mapObj[0].edgefilter = lines.length-1;
                                maps.mapObj[0].maxedgefilter = lines.length-1;
                                var sort_lines = sortline(lines,maps.mapObj[0].graph.nodes)
                                disAxis.updateData(sort_lines)
                                var type = "com";
                                map[0].drawPoiToDiv(poi_to_div_data);
                                maps.mapObj[0].comEdgefilter = poi_to_div_data.nodes[0].length*2 -1;
                                maps.mapObj[0].maxComEdgefilter = poi_to_div_data.nodes[0].length*2 -1;
                                var com_sort_lines = sortline(poi_to_div_data.edges[0],poi_to_div_data.nodes[0],type)
                                map[0].com_sort_lines = com_sort_lines;
                                comAxis.updateData(com_sort_lines);


                                //map[0].drawMigration(data,lines,lines1);
                                return;
                            }
                            starttime = request_days[currentIndex];
                            end_time = request_days[currentIndex];
                            var start_month = months[starttime.split('-')[1]];
                            var begintime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + start_hour;
                            //var end_month = months[end_time.split('-')[1]];
                            var endtime = end_time.split('-')[0] + "-" + start_month + "-" + end_time.split('-')[2] + "+" + end_hour;
                            var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=div&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime+"&v=v2";
                            var poi_to_div_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=poi_to_div&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime +"&v=v2";
                            console.log(poi_to_div_url)
                            var div_to_poi_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=div_to_poi&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime +"&v=v2";
                            console.log(get_url);
                            if (currentIndex == 0) {
                                $.getJSON('/data/beijingBoundary.json', function (dt) {
                                    //map[0].drawBoundary(dt);
                                    bdData = dt;
                                    $.ajax({
                                        /* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*/
                                        url: get_url,
                                        type: 'GET',
                                        contentType: "application/json",
                                        dataType: 'jsonp',
                                        success: function (dt) {
                                            console.log(dt);
                                            currentIndex++;
                                            data = getNodes(dt);
                                            //data = getNodes(dt);
                                            lines = getLinePos(dt);

                                            //lines = [];
                                            maps.mapObj[0].graph = data;


                                            $.ajax({
                                                url: poi_to_div_url,
                                                type: 'GET',
                                                contentType: "application/json",
                                                dataType: 'jsonp',
                                                async:true,
                                                success: function (dd) {
                                                    $.ajax({
                                                        url :div_to_poi_url,
                                                        type:'GET',
                                                        contentType:'application/json',
                                                        dataType:'jsonp',
                                                        async:true,
                                                        success:function (d) {
                                                            var  poi_to_div_data0 = {};
                                                            var div_to_poi_line = processDivToPoi(d);
                                                            console.log(div_to_poi_line)

                                                            poi_to_div_data0.edges = [[]];
                                                            var a = dd.edges[0];
                                                            div_to_poi_line.forEach(function (line) {
                                                                a.push(line);
                                                            })
                                                            poi_to_div_data0.edges[0] = a;
                                                            poi_to_div_data0.nodes = dd.nodes;
                                                            console.log("poi_to_data0 is ")
                                                            console.log(poi_to_div_data0)
                                                            poi_to_div_data = processPoiToDiv(poi_to_div_data0);
                                                            test(data);
                                                        }
                                                    })

                                                }
                                            })

                                        }
                                    });
                                });
                            }
                            else {
                                $.getJSON('/data/beijingBoundary.json', function (dt) {
                                    //map[0].drawBoundary(dt);
                                    bdData = dt;
                                    $.ajax({
                                        /* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*/
                                        url: get_url,
                                        type: 'GET',
                                        contentType: "application/json",
                                        dataType: 'jsonp',
                                        success: function (dt) {
                                            console.log(dt);
                                            currentIndex++;
                                            data = updateGraph(dt);
                                            lines = getLinePos(data);
                                            data = getNodes(data);
                                            test(data)
                                            console.log(lines);

                                        }
                                    });
                                });
                            }
                        }
                        test(data);
                        /*$.ajax({
                            /!* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*!/
                            url:get_url,
                            type:'GET',
                            contentType:"application/json",
                            dataType:'jsonp',
                            success:function (dt) {
                                console.log(dt);
                                var data = dt;
                                //judge if graph is drawed or not
                                if(graph.nodes){
                                     data = updateGraph(dt);
                                     console.log(data);
                                }
                                else{
                                    graph = data;
                                    console.log(graph);
                                }
                                var lines = process(data);
                                var lines1 = process1(data);
                                data = getNodes(data)
                                //lines = [];
                                console.log(lines);
                                console.log(lines1);
                                map[0].drawMigration(data,lines,lines1);

                            } });*/
                    }
                    else {
                        console.log("minus")
                        d3.select(this).style("opacity", "0");
                        d3.select(self.map.getPanes().overlayPane).select("svg").remove();
                       /* var data = {}, lines = [], bdData;
                        var currentIndex = 0;

                        function test1(data) {
                            if (currentIndex >= request_days.length) {
                                console.log(data);
                                map[0].drawDistrict(data, bdData);
                                map[0].drawDisDis(data, lines);
                                //map[0].drawMigration(data,lines,lines1);
                                return;
                            }
                            starttime = request_days[currentIndex];
                            end_time = request_days[currentIndex];
                            var start_month = months[starttime.split('-')[1]];
                            var begintime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + start_hour;
                            //var end_month = months[end_time.split('-')[1]];
                            var endtime = end_time.split('-')[0] + "-" + start_month + "-" + end_time.split('-')[2] + "+" + end_hour;
                            var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=div&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime +"&v=v2";
                            console.log(get_url);
                            if (graph.nodes[0]) {
                                $.getJSON('/data/beijingBoundary.json', function (dt) {
                                    //map[0].drawBoundary(dt);
                                    bdData = dt;
                                    $.ajax({
                                        /!* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*!/
                                        url: get_url,
                                        type: 'GET',
                                        contentType: "application/json",
                                        dataType: 'jsonp',
                                        success: function (dt) {
                                            console.log(dt);
                                            currentIndex++;
                                            data = reduceGraph(dt);
                                            lines = getLinePos(data);
                                            data = getNodes(data)
                                            //lines = [];
                                            console.log(lines);
                                            //console.log(lines1);
                                            test1(data);
                                        }
                                    });
                                });
                                /!* $.ajax({
                                     /!* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*!/
                                     url:get_url,
                                     type:'GET',
                                     contentType:"application/json",
                                     dataType:'jsonp',
                                     async:true,
                                     success:function (dt) {
                                         currentIndex++;
                                         console.log(dt);
                                         data = reduceGraph(dt);
                                         lines = process(data);
                                         lines1 = process1(data);
                                         //lines = [];
                                         data = getNodes(data);
                                         console.log(lines);
                                         console.log(lines1);
                                         test1(data);
                                         // map[0].drawMigration(data,lines,lines1);
                                     } });*!/
                            }
                            else {
                                console.log("no graph exists")
                            }
                        }

                        test1(data);*/
                    }
                });

            g.append("path")
                .attr("d", arc)
                .attr("id", function (d, i) {
                    return "path" + i.toString();
                })
                .style('cursor', 'hand')
                .style("fill", "silver")
                .each(function (d, i) {
                    d.clicked = false;
                })
                .style("stroke", "grey")
                .style("stroke-width", '0px')
                .on('mouseover', function (d) {
                    d3.select(this).style("fill", "#eee");
                })
                .on("mouseout", function () {
                    d3.select(this).style("fill", "black");
                });
            this.clock = big_g;
        },
        'changeMonth': function (month) {
            console.log(month)
            maps.mapObj[0].edgefilter = 0;
            d3.select(".time-link").selectAll("a").style("background","white");
            //d3.select(".time-link").select(".a"+index.toString()).style("background","lightblue");
            d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');
            d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
            d3.select(".time-link").selectAll("a").style("background","white");
            d3.select(".time-link").selectAll("a").style("color","#777777");

            d3.select(".time-option").selectAll("a").style("background","white");
            d3.select(".time-option").selectAll("a").style("color","#777777");



            var parseDate = d3.timeParse("" +
                "%d %b %Y");
            if (month == "Jul") {
                d3.select(".time-option").select(".a0").style("background","#ED5858");
                d3.select(".time-option").select(".a0").style("color","white");

                this.x.domain([parseDate("05 Jul 2016"), parseDate("31 Jul 2016")]);
                this.x2.domain([parseDate("05 Jul 2016"), parseDate("31 Jul 2016")]);
                this.focus.select(".axis--x").call(this.xAxis);
                this.focus.select(".brush").call(this.brush.move, [0, 0]);

            }
            if (month == "Aug") {
                //console.log(changing);
                console.log(this.x);
                d3.select(".time-option").select(".a1").style("background","#ED5858");
                d3.select(".time-option").select(".a1").style("color","white");

                this.x.domain([parseDate("01 Aug 2016"), parseDate("31 Aug 2016")]);
                this.x2.domain([parseDate("01 Aug 2016"), parseDate("31 Aug 2016")]);
                this.focus.select(".axis--x").call(this.xAxis);
                this.focus.select(".brush").call(this.brush.move, [0, 0]);
                this.axis_left = parseDate("01 Aug 2016");
                this.axis_right = parseDate("08 Aug 2016")
            }
            else if (month == "Sep") {
                //console.log(changing);
                console.log(this.x);
                d3.select(".time-option").select(".a2").style("background","#ED5858");
                d3.select(".time-option").select(".a2").style("color","white");

                this.x.domain([parseDate("01 Sep 2016"), parseDate("30 Sep 2016")]);
                this.x2.domain([parseDate("01 Sep 2016"), parseDate("30 Sep 2016")]);
                this.focus.select(".axis--x").call(this.xAxis);
                this.focus.select(".brush").call(this.brush.move, [0, 0]);
                this.axis_left = parseDate("01 Sep 2016");
                this.axis_right = parseDate("08 Sep 2016")
            }
            var x = this.x;
            console.log(x)
            var parseDate = d3.timeParse("" +
                "%Y-%m-%d");
            var flowdata;
            $.getJSON("/data/flowCount.json",function (data) {
                flowdata = data;
                //console.log(flowdata)
                d3.select(".time-option").select(".timeAxis").selectAll(".rect").each(function (dd,i) {
                   // console.log(d3.select(this));
                    d3.select(this).attr("x", function (d) {
                        return x(parseDate(d.date)) + 10
                    })
                        .attr("width", function (d) {
                            if (i < flowdata.data.length - 1) {
                                console.log(x(parseDate(flowdata.data[i + 1].date)) - x(parseDate(d.date)))
                                return (x(parseDate(flowdata.data[i + 1].date)) - x(parseDate(d.date))) * 7 / 8

                            }
                            else {
                                return (x(parseDate(d.date)) - x(parseDate(flowdata.data[i - 1].date))) * 7 / 8

                            }
                        })
                })
                })
                       },
        'changeDay':function (weekday) {
            //d3.select(".time-link").selectAll("a").style("background","white");
            //d3.select(".time-link").select(".a"+index.toString()).style("background","lightblue");
            d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');
           // d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
            d3.select(".time-link").selectAll("a").style("background","white");
            d3.select(".time-link").selectAll("a").style("color","#777777");
            //starttime = request_days[currentIndex];
            //end_time = request_days[currentIndex];
            var parseDate = d3.timeParse("" +
                "%d %b %Y");
            start_hour = "00:00:00";
            end_hour = "23:59:59";
            if(weekday == "ALL"){
                this.x.domain([parseDate("11 Jul 2016"), parseDate("18 Jul 2016")]);

                this.focus.select(".axis--x").call(this.xAxis);
                //this.focus.select(".brush").call(this.brush.move, [0, 0]);
                this.focus.select(".brush").call(this.brush.move, [0, 605]);
                d3.selectAll(".handle--custom").each(function (d,i) {
                    var h = d3.select(this)
                    h.attr("transform",'translate('+605*i+','+15+')')
                });
                starttime = "2016-July-11-00:00";
                end_time = "2016-July-17-23:00";
            }
            if(weekday == "WORKDAY" ){
                console.log(parseDate("11 Jul 2016"))
                this.x.domain([parseDate("11 Jul 2016"), parseDate("18 Jul 2016")]);

                this.focus.select(".axis--x").call(this.xAxis);
                //this.focus.select(".brush").call(this.brush.move, [0, 0]);
                this.focus.select(".brush").call(this.brush.move, [0, 512]);
                d3.selectAll(".handle--custom").each(function (d,i) {
                    var h = d3.select(this)
                    h.attr("transform",'translate('+512*i+','+15+')')
                });
                starttime = "2016-July-11-00:00";
                end_time = "2016-July-15-23:00";
            }
            if(weekday == "WEEKEND"){
                var t = [282,605]
                this.x.domain([parseDate("11 Jul 2016"), parseDate("18 Jul 2016")]);

                this.focus.select(".axis--x").call(this.xAxis);
                this.focus.select(".brush").call(this.brush.move, [282, 605]);
                d3.selectAll(".handle--custom").each(function (d,i) {
                    var h = d3.select(this)
                    h.attr("transform",'translate('+t[i]+','+15+')')
                });
                starttime = "2016-July-16-00:00";
                end_time = "2016-July-17-23:00";
            }
            var start_month = months[starttime.split('-')[1]];
            var begintime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + start_hour;
            //var end_month = months[end_time.split('-')[1]];
            var endtime = end_time.split('-')[0] + "-" + start_month + "-" + end_time.split('-')[2] + "+" + end_hour;
            var get_url = "http://192.168.0.118:3033/api/basicGraph?spaceType=div&timeType=duration&netType=basic&other=none&beginTime=" + begintime + "&endTime=" + endtime+"&v=v2";
            console.log(get_url)
            var bdData;
            $.getJSON('/data/beijingBoundary.json', function (d) {
                //map[0].drawBoundary(dt);
                bdData = d;
                $.ajax({
                    /* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*/
                    url: get_url,
                    type: 'GET',
                    contentType: "application/json",
                    dataType: 'jsonp',
                    success: function (dt) {
                        var data = getNodes(dt);
                        console.log(dt);
                        var lines = getLinePos(dt);

                        console.log(lines);
                        map[0].drawDistrict(data, bdData,false);
                        map[0].drawDisDis(data, lines);


                    }
                });
            });

        },
        'leftTran': function () {
            var parseDate = d3.timeParse("" +
                "%d %b %Y");
            d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
            function processDate(date) {
                date = date.toString();
                var temptime = date.split(" ");
                return temptime[2] + " " + temptime[1] + " " + temptime[3];
            }

            // this.x.domain([parseDate(this.axis_left.setDate(this.axis_left.getDate()-7)),parseDate(this.axis_right.setDate(this.axis_right.getDate()-7))]);
            this.x.domain([parseDate(processDate(this.axis_left.setDate(this.axis_left.getDate() - 7))), parseDate(processDate(this.axis_right.setDate(this.axis_right.getDate()-7)))]);
            this.x2.domain([parseDate(processDate(this.axis_left)), parseDate(processDate(this.axis_right))]);

//            this.x2.domain([parseDate(this.axis_left),parseDate(this.axis_right)]);

            //var xAxis = d3.axisBottom(x);
            this.focus.select(".axis--x").call(this.xAxis);
            this.focus.select(".brush").call(this.brush.move, [0, 0]);
        },
        'rightTran': function () {
            var parseDate = d3.timeParse("" +
                "%d %b %Y");
            d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
            function processDate(date) {
                date = date.toString();
                var temptime = date.split(" ");
                return temptime[2] + " " + temptime[1] + " " + temptime[3];
            }

// this.x.domain([parseDate(this.axis_left.setDate(this.axis_left.getDate()-7)),parseDate(this.axis_right.setDate(this.axis_right.getDate()-7))]);
            this.x.domain([parseDate(processDate(this.axis_left.setDate(this.axis_left.getDate() +7 ))), parseDate(processDate(this.axis_right.setDate(this.axis_right.getDate() + 7)))]);
            this.x2.domain([parseDate(processDate(this.axis_left)), parseDate(processDate(this.axis_right))]);

//            this.x2.domain([parseDate(this.axis_left),parseDate(this.axis_right)]);

//var xAxis = d3.axisBottom(x);
            this.focus.select(".axis--x").call(this.xAxis);
            this.focus.select(".brush").call(this.brush.move, [0, 0]);
        },
        'showFilter':function () {
            alert("ssss")
        },
        'drawTimeAxis': function () {

                var margin = {top: 10, right: 40, bottom: 40, left: 40},
                    margin2 = {top: 10, right: 30, bottom: 40, left: 15},
                    width = 690 - margin.left - margin.right,
                    height = 80 - margin.top - margin.bottom,
                    height2 = 80 - margin.top - margin.bottom;
                var svg = d3.select("body").select(".time-option").select(".timeAxis")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", 100)
                    .append("g")
                    .attr("transform", "translate(" + 0 + "," + margin.top + ")");

                var parseDate = d3.timeParse("" +
                    "%d %b %Y");

                var x = d3.scaleTime()
                        .domain([parseDate("05 Jul 2016"), parseDate("30 Sep 2016")])
                        .rangeRound([0, width]),
                    x2 = d3.scaleTime().domain([parseDate("05 Jul 2016"), parseDate("30 Sep 2016")])
                        .rangeRound([0, width]),
                    y = d3.scaleLinear()
                        .domain([0, 10])
                        .rangeRound([0, height]);
                //y2 = d3.scaleLinear().range([height2, 0]);
                this.x = x;
                this.x2 = x2;
                this.axis_left = parseDate("05 Jul 2016");
                this.axis_right = parseDate("30 Sep 2016")
                //console.log(x2.range())
                var xAxis = d3.axisBottom(x),
                    xAxis2 = d3.axisBottom(x2),
                    yAxis = d3.axisLeft(y).ticks(3).tickFormat(function (d) {
                        return d/1000+"K"
                    });;

                var rect;
               // var flowdata;

            this.flowdata = null;
                var zoom = d3.zoom()
                    .scaleExtent([1, 6])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on("zoom", zoomed);

                var brush = d3.brushX()
                    .extent([[0, 0], [width, height2]])
                    .on("brush end", brushed);

                var focusBrush = d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("start ",startbrush)
                    .on("brush", focusbrushed)
                    .on("end", getRequestDays);


            var area = d3.area()
                    .curve(d3.curveMonotoneX)
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y0(height)
                    .y1(function (d) {
                        return 3;
                    });

                svg.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);

                var focus = svg.append("g")
                    .attr("class", "focus")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                focus.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                focus.append("g")
                    .attr("class", "axis axis--y")
                    .call(yAxis);
            var parseDate = d3.timeParse("" +
                "%Y-%m-%d");
            var flowdata = {};
                $.getJSON("/data/flowcount_new.json",function (data) {
                    $.getJSON("/data/travelDeviceNum.json",function (traveldata) {

                    flowdata = data;
                   /*console.log(d3.max(data.data,function (d) {
                        return d3.sum(d.flowCount);
                    }))*/
                    // y.domain([d3.max(data.data,function (d) {
                    //     return d3.sum(d.flowCount);
                    // }),0])
                        y.domain([d3.max(traveldata,function (d) {
                            return d[2];
                        }),0])
                    focus.select(".axis--y").call(yAxis);
                   // console.log("yyyyyyyyy")
                   // console.log(y.domain)
                    rect = svg.selectAll("datarect")
                        //.data(data.data)
                        .data(traveldata)
                        .enter()
                        .append("rect")
                        .attr("id",function (d,i) {
                            //console.log(i)
                            return "rect"+i;
                        })
                        .attr("class","rect")
                        .attr("fill",function (d,i) {
                            if(i==maps.daySelect){
                                return "#ED5858"
                            }
                            else{
                                return "grey"
                            }
                        })
                        .attr("x",function (d,i) {
                            return x(parseDate(data.data[i].date))+margin.left;
                        })
                        .attr("y",function (d) {
                            //return y(d3.sum(d.flowCount))+10;
                            return y(d[2])+10
                            //return height - y(d3.sum(d.flowCount))+10
                        })
                        .attr("width",function(d,i){
                                //console.log(x(parseDate(data.data[i+1].date))-x(parseDate(d.date)))
                                return 6

                            })
                        .attr("height",function (d,i) {
                            //console.log(i)
                          //  console.log(d3.sum(d.flowCount))
                            //return height-y(d3.sum(d.flowCount))
                            return height - y(d[2])
                        })
                        .each(function (dd,i) {

                           var re =   d3.select(this);
                           re.on("click",function (d) {
                               d3.selectAll(".rect").attr("fill","grey")
                               if(d.seleted){
                                   re.attr("fill","grey")
                                   d.seleted = false;
                                   maps.daySelect = -1;
                               }
                               else{
                                   maps.daySelect = i;
                                   re.attr("fill","#ED5858");
                                   d.seleted = true;
                                   clock.update();
                               }
                               d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');

                           })
                        })
                        /*.on("click",function (d) {
                            .attr("fill","#ED5858")
                        })*/

                    })
                })



                /* context.append("path")
                     .datum(data)
                     .attr("class", "area")
                     .attr("d", area2);*/

                /*context.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);*/
                /* console.log(x.range())
                 context.append("g")
                     .attr("class", "brush")
                     .call(brush)
                     .call(brush.move, x.range());*/


               /* var gb = focus.append("g")
                    .attr("class", "brush")
                    .call(focusBrush)
                   .call(brush.move,[x(parseDate("2016-07-05")),x(parseDate("2016-07-06"))])
                    .call(zoom)*/


            /*var handle = gb.selectAll(".handle--custom")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("path")
                .attr("class", "handle--custom")
                .attr("fill", "#8C8C8C")
                .attr("fill-opacity", 0.8)
                .attr("stroke", "none")
                .attr("stroke-width", 1.5)
                .attr("stroke-width", 1.5)
                .attr("cursor", "ew-resize")
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(height / 2)
                    .startAngle(0)
                    .endAngle(function(d, i) {
                        return i ? Math.PI : -Math.PI;
                    })
                )
                .attr("transform", function (d,i) {
                    return "translate(" + x(parseDate("2016-07-06"))*i + "," + height/2 + ")"
                });*/


            /* focus.append("rect")
                 .attr("class", "zoom")
                 .attr("width", width)
                 .attr("height", 60)
                 .attr("fill","steelblue")
                 .attr("opacity","1")
                 //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                 .call(zoom);*/
                var d0, d1;
                function startbrush() {
                    var s = d3.event.selection;
                    if (s == null) {
                        handle.attr("display", "none");
                        //circle.classed("active", false);
                    } else {
                        var sx = s.map(x.invert);
                        //circle.classed("active", function(d) { return sx[0] <= d && d <= sx[1]; });
                        handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + height / 2 + ")"; });
                    }
                }

                function focusbrushed() {
                    d3.select(".time-link").selectAll("a").style("background","white");
                    //d3.select(".time-link").select(".a"+index.toString()).style("background","lightblue");
                    if (d3.event.sourceEvent.type === "brush") return;
                    //console.log(x.invert)
                    var s = d3.event.selection;

                    d0 = d3.event.selection.map(x.invert);
                    d1 = d0.map(d3.timeDay.round);
                    //console.log(d1);
                    // If empty when rounded, use floor instead.
                    if (d1[0] >= d1[1]) {
                        d1[0] = d3.timeDay.floor(d0[0]);
                        d1[1] = d3.timeDay.offset(d1[0]);
                    }
                    d3.select(this).call(d3.event.target.move, d1.map(x));
                    if (s == null) {
                        handle.attr("display", "none");
                        //circle.classed("active", false);
                    }
                    else{
                        handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + x(d1[i]) + "," + height / 2 + ")"; });
                    }

                    //circle.classed("active", function(d) { return sx[0] <= d && d <= sx[1]; });

                    /*while (d1[0]<=d1[1]){
                        request_days.push(d1[0]++);
                    }*/

                    //this.axis_left = d1[0].setDate(d1[0].getDate()-30);
                    //this.axis_right = d1[1];
                    starttime = d1[0].toString();
                    var temptime = starttime.split(" ");
                    var sdate = temptime[2];
                    starttime = temptime[3] + "-" + temptime[1] + "-" + temptime[2];
                    end_time = d1[1].toString();
                    temptime = end_time.split(" ");
                    var edate = temptime[2];
                    if (edate[1] != '0') {
                        temptime[2] = edate[0] + (parseInt(edate[1]) - 1).toString();
                    }
                    else {
                        temptime[2] = parseInt(edate[0] - 1).toString() + "9";
                    }
                    end_time = temptime[3] + "-" + temptime[1] + "-" + temptime[2];
                }

                function getRequestDays() {

                    //var s = d3.event.selection;
                    //handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + height / 2 + ")"; });

                    request_days = [];
                    d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');
                    d3.select(".time-link").selectAll("a").style("background","white");
                    d3.select(".time-link").selectAll("a").style("color","#777777");

                    maps.mapObj[0].graph = {};

                    function processDate(date) {
                        date = date.toString();
                        var temptime = date.split(" ");
                        return temptime[3] + "-" + temptime[1] + "-" + temptime[2];
                    }

                    while (true) {
                        request_days.push(processDate(d1[0]))
                        d1[0].setDate(d1[0].getDate() + 1);
                        if (d1[0].toString() == d1[1].toString()) {
                            break;
                        }

                    }
                    clock.update();
                    console.log(request_days);
                }

                function brushed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                    var s =  x2.range();
                   /* x2 = d3.scaleTime().domain([parseDate("06 Jul 2016"), parseDate("25 Sep 2016")])
                        .rangeRound([0, width]);*/
                    x.domain(s.map(x2.invert, x2));
                    focus.select(".area").attr("d", area);
                    focus.select(".axis--x").call(xAxis);
                    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                        .scale(width / (s[1] - s[0]))
                        .translate(-s[0], 0));
                }

                function zoomed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") {
                        console.log("filter!")
                        return;
                    } // ignore zoom-by-brush
                    var t = d3.event.transform;
                    //console.log(t);
                    x.domain(t.rescaleX(x2).domain());
                   // x.range().map(t.invertX, t);
                    focus.select(".area").attr("d", area);
                    focus.select(".axis--x").call(xAxis);
                    focus.select(".brush").call(brush.move, [0, 0]);
                    d3.selectAll(".handle--custom").attr("transform","translate("+0+","+15+")");                    //context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
                    rect.attr("x",function (d) {
                        return x(parseDate(d.date))+margin.left
                    })
                        .attr("width",function (d,i) {
                            if(i<flowdata.data.length -1){
                                //console.log(x(parseDate(flowdata.data[i+1].date))-x(parseDate(d.date)))
                                return (x(parseDate(flowdata.data[i+1].date))-x(parseDate(d.date)))*7/8

                            }
                            else{
                                return (x(parseDate(d.date))-x(parseDate(flowdata.data[i-1].date)))*7/8

                            }
                        })
                }
                this.flowdata = flowdata;
                //console.log(this.flowdata)
                this.brush = brush;
                this.focus = focus;

                this.xAxis = xAxis;

            }

        ,
        'brush': function () {
                maps.loading = !maps.loading;
                if (d3.select(".time-option").select("svg").select(".zoom").attr("fill") == "steelblue") {
                    d3.select(".time-option").select("svg").select(".zoom").attr("fill", "none");
                }
                else {

                    d3.select(".time-option").select("svg").select(".zoom").attr("fill", "steelblue");

                }
            },
        'changeTI': function (index) {
            clock.changeTimeInterval(index,map[0]);
            },
        'addSelect':function (index) {
            if(!maps.isSelectable){
                map[index].addSelectLayer();
                maps.isSelectable = true;
            }
            else{
                map[index].removeSelectLayer();
                maps.isSelectable = false;
            }
        }
    },
    computed: {
        mapClass: function () {
            let mapNumber = maps.mapObj.length;
            if (mapNumber == 1) {
                return 'onemap';
            } else if (mapNumbear == 2) {
                return 'twomap';
            } else {
                return 'formap';
            }
        }
    }
    ,
    mounted() {
        let self = this;
        console.log("mounted")
        //this.drawClock();


        //创建svg
    //     gidFlowStatics('daily', 31036, 9).then(data=>{
    //         var svg = d3.select('.chart')
    //             .append('svg')
    //             .attr('width', 320)
    //             .attr('height', 250);
    //             // .style("background-color","rgb(142, 137, 137)");
    //     var margin=[10,10,10,10]
    //     //模拟数据:
    //     //var data1 = ['周一','周二','周三','周四','周五','周六','周日']
    //     //var data = [820, 932, 901, 934, 1290, 1330, 1320]
    //
    //     let datax = [], datay1 = [], datay2 = []
    //     data.forEach(function (t) {
    //         datax.push(t[3])
    //         datay1.push(parseInt(t[1]))
    //         datay2.push(parseInt(t[2]))
    //     })
    //     console.log(data)
    //     //构建y轴的比例尺
    //     var ymax = d3.max(datay1.concat(datay2),function(d){console.log(d);return d}) + 2 //为了增大图表y的上限
    //     var y=d3.scaleLinear()
    //         .domain([0,ymax]).range([180,0])
    //     var axisY = d3.axisLeft(y);
    //     var axisYG = svg.append('g')
    //         .attr('class','axisY')
    //         .attr('transform','translate(20,10)')
    //         .call(axisY);
    //
    //     var x = d3.scalePoint().domain(datax).range([0,280])
    //     var axisX = d3.axisBottom(x)
    //     var axisXG = svg.append('g')
    //         .attr('class','axisY')
    //         .attr('transform','translate(20,190)')
    //         .call(axisX);
    //     //绘制line
    //     //构建一个默认为直线的线条绘制器
    //     var line = d3.line()
    //         .x(function(d,i) { return x(datax[i]); })
    //         .y(function(d) {return y(d) });
    //     //构建g进行偏移处理,构建path绑定数据后,调用绘制器line
    //     svg.append('g')
    //         .attr('transform','translate(20,10)')
    //         .append('path')
    //         .style('fill','none') //此处需要将处理是为了折线只显示线条
    //         .style('stroke',"rgb(51, 209, 243)")
    //         .style('stroke-width',3)
    //         .datum(datay1)
    //         .attr('d',line)
    //
    //     //构建g进行偏移处理,构建path绑定数据后,调用绘制器line
    //     svg.append('g')
    //         .attr('transform','translate(20,10)')
    //         .append('path')
    //         .style('fill','none') //此处需要将处理是为了折线只显示线条
    //         .style('stroke',"rgb(243, 209, 51)")
    //         .style('stroke-width',3)
    //         .datum(datay2)
    //         .attr('d',line)
    //
    // })


        this.$nextTick(function () {
            let self = this;
            this.drawTimeAxis();
            //this.drawSelector();
            map[0] = new mapview('map0',"svg");

            //var selectors = new Selectors(map[0]);
            clock = new clockView(map[0])

            //clock.addColor(request_days);
            var bdData;
            var start_hour = "07:00:00", end_hour = "10:00:00";
            var start_month = months[starttime.split('-')[1]];
            var begintime = starttime.split('-')[0] + "-" + start_month + "-" + starttime.split('-')[2] + "+" + start_hour;
            //var end_month = months[end_time.split('-')[1]];
            var endtime = end_time.split('-')[0] + "-" + start_month + "-" + end_time.split('-')[2] + "+" + end_hour;
           var cluster;

          // $.getJSON('/data/businessAreaBoundary.json', function (data) {
          //     map[0].drawBoundary(data)
          // })
          directionCluster = new DirectionClusterView(this.mapid);

          addWaitingLogo('onemap')
          getTreeMap()
              .then(function (res) {
              res.forEach(function (tree) {
                  var path = [];
                  var drawedSet = new Set()
                  map[0].generate(tree,path,drawedSet)
              })
              removeWaitingLogo('onemap')
              if(maps.status == "play"){
                  map[0].drawLoopTree(maps.newOptionData);
                  //map[0].drawODMap()
              }
              else{
                  map[0].drawStayPath(maps.newOptionData);
              }
              })

            //map[0].drawWindMap()
        });

    },
    updated() {
        let self = this;
        let mapobjs = maps.mapObj;
        let len = mapobjs.length;
        /*for(var i=0;i<len;i++){
            maps.mapObj[i].edgefilter = 0;
        }*/

        if (len >= 2) {
            map[0].invalidateSize();
        }
        $.getJSON('/data/beijingBoundary.json', function (data) {
            for (var i = 1; i < len; i++) {
                map[i] = new mapview('map' + i.toString());
                //map[i].drawBoundary(data);
                $.getJSON('/data/beijingBoundary.json', function (dt) {
                    map[1].drawBoundary(dt);
                    $.getJSON("/data/tripFlow5000.json", function (dd) {
                     map[1].drawMigration2(dd)
                      /*  var res = getlines(data, maps.mapObj[1].proportion);
                        var inlines = res.in;
                        var outlines = [];
                        var dt = getNodes(data);*/
                      /*var inlines = data.edges;
                      var dt = {}
                      var outlines = []
                        map[1].drawMigration1(dt, inlines, outlines)
                    */})
                })
            }
        });
    }

})

export {disAxis,comAxis,request_days,map,clock,directionCluster}


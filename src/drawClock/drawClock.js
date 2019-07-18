import {maps} from "../init/mapVueInit"
import {objClone,sortline,getNodes,getLinePos,updateGraph,processPoiToDiv,processDivToPoi} from '../processData/processData'
import {disAxis,comAxis,request_days,directionCluster} from "../init"
import {getColor} from "../calculate/calculateColor"
import {mapview} from "../drawMap/mapLayout"
import {getTreeWidth} from "../request/request"
import {addWaitingLogo,removeWaitingLogo} from "../util/base"
class clockView{
    constructor(map){
        var months = {'July': '07', 'August': '08', 'September': '09', 'Jul': "07", 'Aug': "08", 'Sep': "09"};
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

        var request_day = request_days[0]
        var day = months[request_day.split('-')[1]];
        day = request_day.split('-')[0] + "-" + day + "-" + request_day.split('-')[2];

        $.getJSON("/data/flowcount_new.json",function (d) {
            var data = d.data;
            data.forEach(function (object) {
                if (object.date == day) {
                    var flowNum = object.flowCount;
                    var min = d3.min(flowNum);
                    var max = d3.max(flowNum);
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
                        .style("fill", function (d, i) {
                            d.color = getColor(1, 0.2, (flowNum[(i + 12) % 24] - min) / (max - min));
                            return getColor(1, 0.2, (flowNum[(i + 12) % 24] - min) / (max - min))
                        })
                        .style("opacity", function (d, i) {
                            if ((i+12)%24 == maps.timeSegId ) {
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
                            d3.select(this).style("fill", function () {
                                return d.color;
                            });
                            g.select("#path" + i.toString()).style("fill", function () {
                                return d.color
                            });
                        })
                        .on("click", function (d, i) {
                            d3.select(".time-selector").select(".time-clock").selectAll(".big_arc").style("opacity", '0');
                            // d3.selectAll(".handle--custom").attr("transform", "translate("+0+","+15+")");
                            d3.select(".time-link").selectAll("a").style("background", "white");
                            d3.select(".time-link").selectAll("a").style("color", "#777777");
                            maps.mapObj[0].edgefilter = 0;
                            d.clicked = !d.clicked;
                            //
                            if (d3.select(this).style("opacity") == 0) {
                                directionCluster.update();
                                maps.base = 0;
                                d3.select(this).style("opacity", "1");
                                maps.timeSegId = (i + 12) % 24;
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
                                var seedUnit = maps.seedUnit.init;
                                var delta = maps.newOptionData[8].init == 'close' ? -1 : maps.newOptionData[8].init ;
                                var maxDistance = maps.newOptionData[10].init
                                var gridSize = maps.newOptionData[11].init
                                var city = maps.city
                                //maps.fromOrTo = 'from'
                                //direction = 'from'
                                if(seedUnit =="Flow Volume") {
                                    seedUnit = "basic"
                                }
                                else if (seedUnit == "Hub") {
                                    seedUnit = "fhub"
                                }
                                else if (seedUnit == "tHub") {
                                    seedUnit = "thub"
                                    maps.fromOrTo = 'to'
                                    direction = 'to'
                                }
                                else if (seedUnit == "Channel") {
                                    seedUnit = "channel"
                                }
                                else{
                                    seedUnit =seedUnit.toLowerCase()
                                }
                                var url ="http://192.168.0.118:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId+"&delta="+delta+"&maxDistance="+maxDistance+"&gridSize="+gridSize+"&city="+city;
                                console.log(url) ;
                                map.allLatLngNodes = [];
                                map.lastLen = 0;
                                maps.fade = false;
                                addWaitingLogo('onemap')
                                $.ajax({
                                    url:url ,
                                    type: 'GET',
                                    contentType: "application/json",
                                    dataType: 'jsonp',
                                    async:false,
                                    success: function (data) {
                                        let res;
                                        if(data.error){
                                            alert(" Warning: No data in current time interval!");
                                            //map.ctx.clearRect(0,0,map.canvas.attr("width"),map.canvas.attr("height"))
                                            d3.select(map.map.getPanes().overlayPane).select("canvas").remove();
                                            return ;
                                        }
                                        if(map.heatmapLayer){
                                            map.map.removeLayer(map.heatmapLayer)
                                            map.heatmapLayer = null;
                                        }
                                        if(map.negHeatLayer){
                                            map.map.removeLayer(map.negHeatLayer)
                                            map.negHeatLayer = null;
                                        }
                                        console.log(direction)
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
                                            map.generate(tree,path,drawedSet)
                                            //map[0].drawTree(tree,path,drawedSet)
                                        })
                                        // map[0].drawAnimationTree();
                                        var loopTime = 10;
                                        removeWaitingLogo('onemap')
                                        if(maps.status == "play"){
                                            console.log("drawtree")
                                            map.drawLoopTree(maps.newOptionData);
                                        }
                                        else{
                                            map.drawStayPath(maps.newOptionData);
                                        }
                                        console.log(seedUnit)
                                        if(seedUnit=='fhub'){
                                            map.drawHubFlag('from', data.fromGidList)
                                        }
                                        else if(seedUnit == 'thub'){
                                            map.drawHubFlag('to', data.toGidList)
                                        }
                                        else if(seedUnit == "grid"){
                                            map.drawHubFlag('grid', data.gridList)
                                        }


                                        var heatType,type;
                                        if(maps.heatType != "none"){
                                            heatType = maps.heatType;
                                            type = maps.heatType;
                                            maps.anomalyType = "none"
                                        }
                                        else if(maps.anomalyType!= "none"){
                                            heatType = maps.anomalyType;
                                            type = maps.anomalyType;
                                            maps.heatType = "none"
                                        }
                                        else{
                                            heatType = "none";
                                        }

                                        console.log(heatType)
                                        var timeSegID = maps.timeSegId+maps.daySelect*24;
                                        var hourID = timeSegID%24;

                                        let  direction1;

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
                                            // type = "daily"
                                            // heatType = "daily"
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
                                        else if(heatType == "stay" || heatType == "total"){
                                            type = "stay"
                                        }
                                        if(heatType == "N/A"){
                                            map.addHeatMap("N/A");
                                        }
                                        else if(heatType == "Speed"){
                                            map.addHeatMap("speed")
                                        }
                                        else{
                                            if(maps.base != 0 ){
                                                maps.heatType = "N/A";
                                                maps.anomalyType = "N/A";
                                                return;
                                            }
                                            var url = "http://192.168.0.118:3033/api/abnormalStats?hourID="+hourID+"&timeSegID="+timeSegID+"&type="+type;
                                            console.log(url)
                                            $.ajax({
                                                url:url,
                                                type: 'GET',
                                                contentType: "application/json",
                                                dataType: 'jsonp',
                                                async:false,
                                                success: function (data) {
                                                    map.addHeatMap(heatType,data, direction1)

                                                    /*var ft = maps.fromOrTo;
                                                    let res;
                                                    if(type=="record"){
                                                        map.addHeatMap(heatType,data)
                                                    }
                                                    else {
                                                        if(ft=="from"){
                                                            res = data.from;
                                                        }
                                                        else if(ft =="to"){
                                                            res = data.to;
                                                        }
                                                        map.addHeatMap(heatType,res)
                                                    }*/
                                                }

                                            })
                                        }
                                    }

                                })
                            }

                        });

                    g.append("path")
                        .attr("d", arc)
                        .attr("id", function (d, i) {
                            return "path" + i.toString();
                        })
                        .style('cursor', 'hand')
                        .style("fill", function (d, i) {
                            d.color = getColor(1, 0.2, (flowNum[(i + 12) % 24] - min) / (max - min));
                            return getColor(1, 0.2, (flowNum[(i + 12) % 24] - min) / (max - min))
                        })
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
                }
            })
        })
        this.clock = big_g;
        this.smallClock = g;
    }
    update(){
        console.log("addColor")
        var months = {'July': '07', 'August': '08', 'September': '09', 'Jul': "07", 'Aug': "08", 'Sep': "09"};
        var request_day = request_days[0]
        var day = maps.daySelect;
       // day = request_day.split('-')[0] + "-" + day + "-" + request_day.split('-')[2];
        var g = this.smallClock;
        var bigg = this.clock;
        $.getJSON("/data/flowCount.json",function (d) {
            var data = d.data;
            data.forEach(function (object,j) {
                if(j == day){
                    var flowNum = object.flowCount;
                    var min = d3.min(flowNum);
                    var max = d3.max(flowNum);
                    g.each(function (d,i) {
                        d3.select(this).select("path")
                            .style("fill",function (dd) {
                                dd.color = getColor(1,0.2,(flowNum[(i + 12) % 24]-min)/(max-min));
                                return getColor(1,0.2,(flowNum[(i + 12) % 24]-min)/(max-min))
                            })
                    })
                    bigg.each(function (d,i) {
                        d3.select(this).select("path")
                            .style("fill",function (dd) {
                                dd.color = getColor(1,0.2,(flowNum[(i + 12) % 24]-min)/(max-min))
                                return getColor(1,0.2,(flowNum[(i + 12) % 24]-min)/(max-min))
                            })
                    })
                }

            })
        })
    }
    changeTimeInterval(index,map){
        var months = {'July': '07', 'August': '08', 'September': '09', 'Jul': "07", 'Aug': "08", 'Sep': "09"};

        var g = d3.select(".time-clock");
        console.log(g);
        var start_hour = "12:00:00", end_hour = "14:00:00";
        var interval_set = [];
        function showClock(interval_set) {
            for (var i = 0; i < 24; i++) {
                var flag = false;
                if (interval_set.length == 0) break;
                interval_set.forEach(function (d) {
                    if (d == i) {
                        flag = true;
                        console.log(g.select('#big-path' + d.toString()).style("opacity"))
                        g.select('#big-path' + d.toString()).style("opacity", '1');
                        console.log(g.select('#big-path' + d.toString()).style("opacity"))

                    }
                });
                if (!flag) {
                    g.select('#big-path' + i.toString()).style("opacity", '0');
                }
            }
        }
//todo 4007 4031
        var timSegID ;
        if (index == 0) {
            console.log(this.clock);
            this.clock.selectAll(".big_arc").style("opacity", '1');
            maps.base = 8000;
            timSegID = 8000+maps.daySelect*24;
        }
        if (index == 1) {
            this.clock.selectAll(".big_arc").style("opacity", '0');

        }
        if (index == 2) {
            interval_set = [19,20,21];
            //showClock(interval_set);
            maps.base = 4007;
            console.log(maps.base)
            timSegID =4007+maps.daySelect*24;
            console.log(timSegID)
        }
        if (index == 3) {
            interval_set = [21,22,23];
            //showClock(interval_set);
            // to be added not full!
            start_hour = "09:00:00";
            end_hour = "12:00:00";
        }
        if (index == 4) {
            interval_set = [0, 1];
            timSegID = 4012 + maps.daySelect*24
            //showClock(interval_set);
            start_hour = "12:00:00";
            end_hour = "14:00:00";
        }
        if (index == 5) {
            console.log(index);
            interval_set = [2,3,4];
            //showClock(interval_set);
            start_hour = "14:00:00";
            end_hour = "17:00:00";
        }
        if (index == 6) {
            interval_set = [5,6,7];
            timSegID =4017+maps.daySelect*24;
            maps.base = 4017;
            //showClock(interval_set);
            // not full 0-3 not included
            //timSegID = 4007;
        }
        if (index == 7) {
            interval_set = [9,10,11];
            //showClock(interval_set);
            start_hour = "21:00:00";
            end_hour = "24:00:00";
        }
        if (index == 8) {
            interval_set = [12,13,14,15,16,17];
            //showClock(interval_set);
            start_hour = "00:00:00";
            end_hour = "06:00:00";
        }
        if (index == 9) {
            interval_set = [12, 13, 14, 15, 16, 17, 18, 19];
            //showClock(interval_set);
            start_hour = "00:00:00";
            end_hour = "08:00:00";
        }
        var bdData;
        var data = {}, lines = [], lines1 = [];
        var currentIndex = 0;
        maps.mapObj[0].graph = {};
        var poi_to_div_data = [];
        d3.select(".time-link").selectAll("a").style("background","white");
        d3.select(".time-link").selectAll("a").style("color","#777777");

        d3.select(".time-link").select(".a"+index.toString()).style("background","#ED5858");
        d3.select(".time-link").select(".a"+index.toString()).style("color","white");

        showClock(interval_set);
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
        var timeSegId = maps.timeSegId+maps.daySelect*24+maps.base;
        var seedUnit = maps.seedUnit.init;
        var maxDistance = maps.newOptionData[10].init
        var gridSize = maps.newOptionData[11].init
        var delta = maps.newOptionData[8].init == 'close' ? -1 : maps.newOptionData[8].init ;
        var city = maps.city
        if(seedUnit =="Flow Volume") {
            seedUnit = "basic"
        }
        else {
            seedUnit =seedUnit.toLowerCase()
        }
        var url ="http://192.168.0.118:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timSegID+"&delta="+delta+"&city="+city+"&maxDistance="+maxDistance+"&gridSize="+gridSize;
        console.log(url) ;
        map.allLatLngNodes = [];
        map.lastLen = 0;
        maps.fade = false;
        addWaitingLogo('onemap')
        $.ajax({
            url:url ,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async:false,
            success: function (data) {
                let res;
                if(data.error){
                    alert(" Warning: No data in current time interval!");
                    //map.ctx.clearRect(0,0,map.canvas.attr("width"),map.canvas.attr("height"))
                    d3.select(map.map.getPanes().overlayPane).select("canvas").remove();
                    return ;
                }
                if(map.heatmapLayer){
                    map.map.removeLayer(map.heatmapLayer)
                    map.heatmapLayer = null;
                }
                if(map.negHeatLayer){
                    map.map.removeLayer(map.negHeatLayer)
                    map.negHeatLayer = null;
                }
                console.log(direction)
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
                    map.generate(tree,path,drawedSet)
                    //map[0].drawTree(tree,path,drawedSet)
                })
                // map[0].drawAnimationTree();
                var loopTime = 10;
                removeWaitingLogo('onemap')
                if(maps.status == "play"){
                    console.log("drawtree")
                    map.drawLoopTree(maps.newOptionData);
                }
                else{
                    map.drawStayPath(maps.newOptionData);
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
                    map.addHeatMap("none");
                }
                else if(heatType == "speed"){
                    map.addHeatMap("speed")
                }*/
                var heatType,type;
                if(maps.heatType != "none"){
                    heatType = maps.heatType;
                    type = maps.heatType;
                    maps.anomalyType = "none"
                }
                else if(maps.anomalyType!= "none"){
                    heatType = maps.anomalyType;
                    type = maps.anomalyType;
                    maps.heatType = "none"
                }
                else{
                    heatType = "none";
                }

                console.log(heatType)
                var timeSegID = maps.timeSegId+maps.daySelect*24;
                var hourID = timeSegID%24;

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
                    // type = 'daily'
                    // heatType = 'daily'
                    type = "stay";
                    heatType = "stay"
                    //type = "ano2"
                }
                if(heatType == "N/A"){
                    map.addHeatMap("N/A");
                }
                else if(heatType == "Speed"){
                    map.addHeatMap("speed")
                }
                else{
                    if(maps.base != 0 ){
                        maps.heatType = "N/A";
                        maps.anomalyType = "N/A";
                        return;
                    }
                    var url = "http://192.168.0.118:3033/api/abnormalStats?hourID="+hourID+"&timeSegID="+timeSegID+"&type="+type;
                    console.log(url)
                    $.ajax({
                        url:url,
                        type: 'GET',
                        contentType: "application/json",
                        dataType: 'jsonp',
                        async:false,
                        success: function (data) {
                            map[0].addHeatMap(heatType,data)
                            /*var ft = maps.fromOrTo;
                            let res;
                            if(type=="record"){
                                map.addHeatMap(heatType,data)
                            }
                            else {
                                if(ft=="from"){
                                    res = data.from;
                                }
                                else if(ft =="to"){
                                    res = data.to;
                                }
                                map.addHeatMap(heatType,res)
                            }*/
                        }

                    })
                }
            }

        })

        /*function test(data) {
            if (currentIndex >= request_days.length) {
                console.log(data);
                console.log(interval_set);
                d3.select(".time-link").selectAll("a").style("background","white");
                d3.select(".time-link").selectAll("a").style("color","#777777");

                d3.select(".time-link").select(".a"+index.toString()).style("background","#ED5858");
                d3.select(".time-link").select(".a"+index.toString()).style("color","white");

                showClock(interval_set);
                map.drawDistrict(data, bdData,false);
                map.drawDisDis(data, lines);
                console.log("line length")
                console.log(lines.length)
                maps.mapObj[0].edgefilter = lines.length-1;
                maps.mapObj[0].maxedgefilter = lines.length-1;
                var sort_lines = sortline(lines,maps.mapObj[0].graph.nodes)
                disAxis.updateData(sort_lines)
                var type = "com";
                map.drawPoiToDiv(poi_to_div_data);
                maps.mapObj[0].comEdgefilter = poi_to_div_data.nodes[0].length*2 -1;
                maps.mapObj[0].maxComEdgefilter = poi_to_div_data.nodes[0].length*2 -1;
                var com_sort_lines = sortline(poi_to_div_data.edges[0],poi_to_div_data.nodes[0],type)
                map.com_sort_lines = com_sort_lines;
                comAxis.updateData(com_sort_lines);


                //map[0].drawMigration(data,lines,lines1);
                return;
            }
            var starttime = request_days[currentIndex];
            var end_time = request_days[currentIndex];
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
                        /!* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*!/
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
                                async:false,
                                success: function (dd) {
                                    $.ajax({
                                        url :div_to_poi_url,
                                        type:'GET',
                                        contentType:'application/json',
                                        dataType:'jsonp',
                                        async:false,
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
                        /!* url:'http://192.168.0.118:3033/api/basicGraph?spaceType=grid&timeType=duration&netType=basic&other=none&beginTime=2016-07-05+03%3A30%3A00&endTime=2016-07-05+06%3A05%3A00',*!/
                        url: get_url,
                        type: 'GET',
                        contentType: "application/json",
                        dataType: 'jsonp',
                        success: function (dt) {
                            console.log(dt);
                            currentIndex++;
                            data = updateGraph(dt);
                            lines = getLinePos(data,false);
                            data = getNodes(data,false);
                            test(data)
                            console.log(lines);

                        }
                    });
                });
            }
        }
        test(data);*/
    }
}

export{clockView}
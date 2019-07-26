import{maps} from "../init/mapVueInit"
import{map,clock} from "../init"
function request() {
    maps.aniCurHour += 1;
    var curHourId = maps.aniCurHour;

    getData(curHourId);


}
function getData(curHourId) {
    var seedNum = maps.seedNum/100;
    var angle = maps.newOptionData[1].init;
    var seedStrength = maps.newOptionData[2].init;
    var treeWidth = maps.newOptionData[12].init;
    var direction = maps.fromOrTo;
    var spaceInterval = 200;
    var jumpLen = maps.newOptionData[0].init;
    var gridDirNum = maps.newOptionData[7].init;
    var timeSegId = curHourId+maps.daySelect*24;
    var seedUnit = maps.seedUnit.init;

    if(seedUnit =="Flow Volume") {
        seedUnit = "basic"
    }
    else {
        seedUnit ="grid"
    }
    var url ="http://192.168.0.118:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    if (maps.mapMatching == "open"){
        url ="http://192.168.0.118:3033/api/treeMapMM?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    }
    console.log(url) ;

    map[0].allLatLngNodes = [];
    map[0].lastLen = 0;
    maps.fade = false;
    $.ajax({
        url:url ,
        type: 'GET',
        contentType: "application/json",
        dataType: 'jsonp',
        async:false,
        success: function (data) {
            var res;
            console.log(data);
            if(curHourId<23){
                request()
                // setTimeout(request,1000);
            }
            else{
                maps.aniCurHour =-1
            }
            if(direction=="from"){
                res = data.res.to;
            }
            else if(direction == "to"){
                res = data.res.from;
            }
            else if(direction == "all"){
                res = data.res.from;
                data.res.to.forEach(function (d) {
                    res.push(d)
                })
            }
            res.forEach(function (tree) {
                var path = [];
                var drawedSet = new Set()
                map[0].generate(tree,path,drawedSet)
            })
            showClock((maps.aniCurHour+12)%24);
            map[0].drawStayPath(maps.newOptionData);

        }

    })
}

function showClock(index) {
    for (var i = 0; i < 24; i++) {
        var flag = false;
            if (index == i) {
                flag = true;
                //console.log(g.select('#big-path' + d.toString()).style("opacity"))
                clock.clock.select('#big-path' + index).style("opacity", '1');
                //console.log(g.select('#big-path' + d.toString()).style("opacity"))

            }
        if (!flag) {
            clock.clock.select('#big-path' + i.toString()).style("opacity", '0');
        }
    }
}

function requestAm() {
    maps.aniCurDay += 1;
    var curdayId = maps.aniCurDay;

    getDataAm(curdayId);
}

function getDataAm(aniCurDay) {
    var seedNum = maps.seedNum/100;
    var angle = maps.newOptionData[1].init;
    var seedStrength = maps.newOptionData[2].init;
    var treeWidth = maps.newOptionData[12].init;
    var direction = maps.fromOrTo;
    var spaceInterval = 200;
    var jumpLen = maps.newOptionData[0].init;
    var gridDirNum = maps.newOptionData[7].init;
    var timeSegId = 7+aniCurDay*24+4000;
    var seedUnit = maps.seedUnit.init;

    if(seedUnit =="Flow Volume") {
        seedUnit = "basic"
    }
    else {
        seedUnit ="grid"
    }
    var url ="http://192.168.0.118:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    if (maps.mapMatching == "open"){
        url ="http://192.168.0.118:3033/api/treeMapMM?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId;
    }
    console.log(url) ;

    map[0].allLatLngNodes = [];
    map[0].lastLen = 0;
    maps.fade = false;
    $.ajax({
        url:url ,
        type: 'GET',
        contentType: "application/json",
        dataType: 'jsonp',
        async:false,
        success: function (data) {
            var res;
            console.log(data);

            if(direction=="from"){
                res = data.res.to;
            }
            else if(direction == "to"){
                res = data.res.from;
            }
            else if(direction == "all"){
                res = data.res.from;
                data.res.to.forEach(function (d) {
                    res.push(d)
                })
            }
            res.forEach(function (tree) {
                var path = [];
                var drawedSet = new Set()
                map[0].generate(tree,path,drawedSet)
            })
            d3.selectAll("rect").attr("fill",function (d,i) {
                if((i-1)==aniCurDay){
                    return "#ED5858"
                }
                return "grey"
            })
            map[0].drawStayPath(maps.newOptionData);
            console.log(maps.aniCurDay)
            if(aniCurDay<5){
                requestAm()
                // setTimeout(request,1000);
            }
            else{
                maps.aniCurDay =-1
                maps.animateAm = "pause"
            }

        }

    })
}
function showRect(aniCurDay) {
   d3.selectAll("rect").attr("fill",function (d,i) {
       if(i==aniCurDay){
           return "#ED5858"
       }
       return "grey"
   })
}

function getTreeWidth() {
    if(maps.treeWidth.init == "One"){
        return 1
    }
    if (maps.treeWidth.init == "Mid"){
        return 3
    }
    if (maps.treeWidth.init == "High"){
        return 5
    }
}
function getTreeMap() {
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
    var timeSegId = maps.timeSegId;
    var seedUnit = maps.seedUnit.init;
    var delta = maps.newOptionData[8].init == 'close' ? -1 : maps.newOptionData[8].init ;
    var speedToShow = maps.speedToShow
    var maxDistance = maps.newOptionData[10].init
    var city = maps.city
    if(seedUnit =="Flow Volume") {
        seedUnit = "basic"
        //maps.newOptionData[10].init = 9999
        maxDistance = 9999
    }
    else if (seedUnit == "Hub") {
        seedUnit = "hub"
        maps.newOptionData[10].init = 2
        maxDistance = 2
    }
    else if (seedUnit == "Channel") {
        seedUnit = "channel"
        //maps.newOptionData[10].init = 9999
        maxDistance = 9999
    }
    else{
        seedUnit ="grid"
    }
    var url ="http://192.168.0.118:3033/api/treeMap?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId+"&delta="+delta+"&speedToShow="+speedToShow+"&maxDistance="+maxDistance+"&city="+city;
    if (maps.mapMatching == "open"){
        url ="http://192.168.0.118:3033/api/treeMapMM?treeNumRate="+seedNum+"&searchAngle="+angle+"&seedStrength="+seedStrength+"&treeWidth="+treeWidth+"&spaceInterval="+spaceInterval+"&seedUnit="+seedUnit+"&jumpLen="+jumpLen+"&gridDirNum="+gridDirNum+"&timeSegID="+timeSegId+"&delta="+delta+"&speedToShow="+speedToShow+"&maxDistance="+maxDistance+"&city="+city;
    }
    console.log(url) ;
    return new Promise(function (resolve,reject) {
        $.ajax({
            url:url ,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async:false,
            success: function (data) {
                //resolve(data);
                var res;
                console.log(data);
                if(direction=="from"){
                    res = data.res.from;
                }
                else if(direction == "to"){
                    res = data.res.to;
                }
                else if(direction == "all"){
                    res = data.res.from;
                    data.res.to.forEach(function (d) {
                        res.push(d)
                    })
                }
                resolve(res)
                /*res.forEach(function (tree) {
                    var path = [];
                    var drawedSet = new Set()
                    map[0].generate(tree,path,drawedSet)
                    //mrequestap[0].drawTree(tree,path,drawedSet)
                })
                // map[0].drawAnimationTree();
                if(maps.status == "play"){
                    map[0].drawLoopTree(maps.newOptionData);

                }
                else{
                    map[0].drawStayPath(maps.newOptionData);

                }*/
                // map[0].addTestLayer();
            }
        })
    })
}

function getAbnormalStatus(curtype){
    var heatType,type;
    if(curtype == "heatType"){
        heatType = maps.heatType;
        type = maps.heatType;
        maps.anomalyType = "N/A"
    }
    else if(curtype == "anomalyType"){
        heatType = maps.anomalyType;
        type = maps.anomalyType;
        maps.heatType = "N/A"
    }

    console.log(heatType)

    var timeSegID = maps.timeSegId+maps.daySelect*24;

    if(maps.base!=0){
        timeSegID = maps.base+maps.daySelect*24
    }
    var hourID = timeSegID%24;

    // maps.mapLayerType = 'default'

    let direction;
    if(heatType=="Movement"){
        type = "flow"
    }
    else if(heatType == "Travel") {
        type = "travel"
    }
    else if(heatType=="Record"){
        if(timeSegID > 4000) {
            timeSegID -= 4000
        }
        type = "record"
    }
    else if(heatType=="hourly"){
        type = "ano1";
    }
    else if(heatType == "Daily"){
        type = "stay";
        heatType = "stay"
        //type = "ano2";
    }
    else if(heatType == "from"){
        heatType = "daily"
        direction = "from"
        type = "ano2"
    }
    else if(heatType == "to"){
        heatType = "daily"
        direction = "to"
        type = "ano2"
    }
    else if(heatType=="freq"){
        type = "freq";
    }
    else if(heatType == "stay" || heatType == "total"||heatType == "Daily"){
        type = "stay"
    }
    if(heatType == "N/A"){
        map[0].addHeatMap("N/A");
    }
    else if(heatType == "Speed"){
        map[0].addHeatMap("speed")
    }
    else{
        /* if(maps.base != 0 ){
             alert("no data") ;
             maps.heatType = "none";
             maps.anomalyType = "none";
             return;
         }*/
        //mov，density,ano1,ano2
        var url = "http://192.168.0.118:3033/api/abnormalStats?hourID="+hourID+"&timeSegID="+timeSegID+"&type="+type+"&city="+maps.city;
        console.log(url)

            $.ajax({
                url:url,
                type: 'GET',
                contentType: "application/json",
                dataType: 'jsonp',
                async:false,
                success: function (data) {
                    if(type == "record" || type == "travel"){
                        if(JSON.stringify(data) == "{}"){
                            alert("no data") ;
                            maps.heatType = "N/A";
                            maps.anomalyType = "N/A";
                            return;
                        }
                        else if(data.length ==0){
                            alert("no data") ;
                            maps.heatType = "N/A";
                            maps.anomalyType = "N/A";
                            return;
                        }
                    }
                    else if(Object.prototype.toString.call(data) === '[Object object]' && !data.from){
                        alert("no data") ;
                        maps.heatType = "N/A";
                        maps.anomalyType = "N/A";
                        return;
                    }
                    var ft = maps.fromOrTo;
                    var res;
                    console.log(data)
                    //resolve(heatType,data)
                    map[0].addHeatMap(heatType, data, direction)
                    /*  if(type=="record"){
                          map[0].addHeatMap(heatType,data)
                      }
                      else {
                          if(ft=="from"){
                              res = data.from;
                          }
                          else if(ft =="to"){
                              res = data.to;
                          }
                          map[0].addHeatMap(heatType,res)
                      }
    */

        }
    })

    }

}

export{request,requestAm,getTreeMap,getAbnormalStatus,getTreeWidth}
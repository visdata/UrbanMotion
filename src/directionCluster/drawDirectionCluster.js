import {getClusterColor} from "../calculate/calculateColor"
import {getAngle} from "./directionFunction"
import {maps} from "../init/mapVueInit"
class DirectionClusterView{
    constructor(mapid) {
        // var months = {'July': '07', 'August': '08', 'September': '09', 'Jul': "07", 'Aug': "08", 'Sep': "09"};
        var arc = d3.arc()
            .outerRadius(40)
            .innerRadius(15)
            .padAngle(0.05);
        var big_arc = d3.arc()
            .outerRadius(43)
            .innerRadius(8)
            .padAngle(0.05)

        var arcData = [];
        var timesegid = maps.timeSegId + maps.daySelect * 24;
        var eps = maps.eps;
        var url = "http://192.168.0.118:3033/api/angleClusterStats?timeSegID=" + timesegid;
        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async: true,
            success: function (dt) {
                var directionRes = dt;
                var max = d3.max(directionRes,function (d) {
                    return d;
                })
                var min = d3.min(directionRes,function (d) {
                    return d;
                })
                $.getJSON("/data/directionCluster.json", function (data) {
                    var directionSeries = data.res;
                    var tmpx = 0;
                    var tmpy = 1
                    directionSeries.forEach(function (item) {
                        var angle = getAngle(item.x1, item.y1, item.x2, item.y2)
                        //Math.asin(Math.sqrt((item.x1-item.x2)*(item.x1-item.x2)+(item.y1-item.y2)*(item.y1-item.y2))/2);
                        item.angle = angle;
                        if (item.x1 != tmpx && item.y1 != tmpy) {
                            var space = {};
                            space.angle = getAngle(tmpx, tmpy, item.x1, item.y1)
                            //Math.asin(Math.sqrt((item.x1-tmpx)*(item.x1-tmpx)+(item.y1-tmpy)*(item.y1-tmpy))/2);
                            space.num = 0;
                            arcData.push(space)
                        }
                        arcData.push(item);
                        tmpx = item.x2;
                        tmpy = item.y2;
                    })
                    console.log(arcData)
                   /* var min = d3.min(directionSeries, function (d) {
                        return d.num;
                    })
                    var max = d3.max(directionSeries, function (d) {
                        return d.num;
                    })*/
                    var pie = d3.pie()
                        .sort(null)
                        .value(function (d1) {
                            return d1.angle;
                        })
                    var svg = d3.select(".cluster-panel").append("svg")
                        .attr("width", 130)
                        .attr("height", 120)
                        .append("g")
                        .attr("class", "time-clock");

                    var g = svg.selectAll(".arc")
                        .data(pie(arcData))
                        .enter().append("g")
                        .attr("class", "arc")
                        .attr("transform", 'translate(75,60)');
                    var timelabel = [{
                        'text': "N",
                        'position': [68, 15]
                    },
                        {
                            'text': "E",
                            'position': [118, 65]
                        },
                        {
                            'text': "S",
                            'position': [72, 112]
                        },
                        {
                            'text': "W",
                            'position': [23, 65]
                        }
                    ];

                    var text = svg.selectAll("text")
                        .data(timelabel)
                        .enter()
                        .append("text")
                        .attr("x", function (d) {
                            return d.position[0];
                        })
                        .attr("y", function (d) {
                            return d.position[1];
                        })
                        .html(function (d) {
                            return d.text;
                        })
                        .style("font-size", "10px")
                        .style("color", "white");


                    var big_svg = d3.select(".cluster-panel").select("svg").select("g");
                    var big_g = big_svg.selectAll(".arc1")
                        .data(pie(arcData))
                        .enter().append("g")
                        .attr("class", "arc1")
                        .attr("transform", 'translate(75,60)');


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
                            if (arcData[i].num === 0) {
                                return "none"
                            }
                            d.color = getClusterColor(1, 1, (directionRes[i] - min) / (max - min));
                            return "#ED5858"
                            //return getClusterColor(1, 1, (arcData[i].num- min) / (max - min))
                        })
                        .style("opacity", function (d, i) {
                            return 0;
                            /* if (i === 0 || i === 1 ) {
                                 return '1';
                             }
                             else {
                                 return '0';
                             }*/
                        })
                        .on("mouseover", function (d, i) {
                            d3.select(this).style("fill", "#ED5858");
                            g.select("#path" + i.toString()).style("fill", "#ED5858");
                        })
                        .on("mouseout", function (d, i) {
                            d3.select(this).style("fill", function () {
                                //return d.color;
                                return "#ED5858"
                            });
                            g.select("#path" + i.toString()).style("fill", function () {
                                //return "silver"
                                return d.color;
                            });
                        })
                        .on("click", function (d, i) {
                            var angle1 = getAngle(0, 1, arcData[i].x1, arcData[i].y1, true);
                            var angle2 = getAngle(0, 1, arcData[i].x2, arcData[i].y2, true);
                            if (angle2 == 0) {
                                angle2 = 2 * Math.PI
                            }
                            if (d3.select(this).style("opacity") == 0) {
                                console.log("nominus")
                                // big_g.selectAll(".big_arc").style('opacity','0');
                                d3.select(this).style("opacity", "1");
                                maps.direction.push([angle1, angle2])
                                console.log(maps.direction)
                            }
                            else {
                                console.log("minus")
                                d3.select(this).style("opacity", "0");
                                var newCluster = [];
                                maps.direction.forEach(function (t) {
                                    if (t[0] != angle1 || t[1] != angle2) {
                                        newCluster.push(t);
                                    }
                                })
                                maps.direction = newCluster;
                            }
                        })

                    g.append("path")
                        .attr("d", arc)
                        .attr("id", function (d, i) {
                            return "path" + i.toString();
                        })
                        .style('cursor', 'hand')
                        .style("fill", function (d, i) {
                            if (arcData[i].num === 0) {
                                return "none"
                            }
                            d.color = getClusterColor(1, 1, (directionRes[i] - min) / (max - min));
                            //return getClusterColor(1, 1, (arcData[i].num  - min) / (max - min))
                            //console.log(d.color)
                            return getClusterColor(1, 1, (directionRes[i]  - min) / (max - min))
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

                })
                console.log(arcData);
            }

        })
    }
    update(){
        var arcData = [];
        var timesegid = maps.timeSegId + maps.daySelect * 24;
        var eps = maps.eps;
        var url = "http://192.168.0.118:3033/api/angleClusterStats?timeSegID=" + timesegid;
        console.log(url)
        /*$.ajax({
            url:url,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async:false,
            success:function (data) {
                var directionSeries = data;
                var tmpx = 0;
                var tmpy = 1
                directionSeries.forEach(function (item) {
                    var angle = getAngle(item.x1,item.y1,item.x2,item.y2)
                    //Math.asin(Math.sqrt((item.x1-item.x2)*(item.x1-item.x2)+(item.y1-item.y2)*(item.y1-item.y2))/2);
                    item.angle = angle;
                    if(item.x1!=tmpx && item.y1!=tmpy){
                        var space = {};
                        space.angle = getAngle(tmpx,tmpy,item.x1,item.y1)
                        //Math.asin(Math.sqrt((item.x1-tmpx)*(item.x1-tmpx)+(item.y1-tmpy)*(item.y1-tmpy))/2);
                        space.rate = 0;
                        arcData.push(space)
                    }
                    arcData.push(item);
                    tmpx = item.x2;
                    tmpy = item.y2;
                })
                if(tmpx!=0 || tmpy!=1){
                    var space = {};
                    space.angle = getAngle(tmpx,tmpy,0,1)
                    //Math.asin(Math.sqrt((item.x1-tmpx)*(item.x1-tmpx)+(item.y1-tmpy)*(item.y1-tmpy))/2);
                    space.rate = 0;
                    arcData.push(space)
                }
                console.log(arcData)
                var min= d3.min(directionSeries,function (d) {
                    return d.rate;
                })
                var max = d3.max(directionSeries,function (d) {
                    return d.rate;
                })
                var pie = d3.pie()
                    .sort(null)
                    .value(function (d1) {
                        return d1.angle;
                    })
                var svg = d3.select(".cluster-panel").append("svg")
                    .attr("width", 130)
                    .attr("height", 120)
                    .append("g")
                    .attr("class", "time-clock");

                var g = svg.selectAll(".arc")
                    .data(pie(arcData))
                    .enter().append("g")
                    .attr("class", "arc")
                    .attr("transform", 'translate(75,60)');
                var timelabel = [{
                    'text': "N",
                    'position': [68, 15]
                },
                    {
                        'text': "E",
                        'position': [118, 65]
                    },
                    {
                        'text': "S",
                        'position': [72, 112]
                    },
                    {
                        'text': "W",
                        'position': [23, 65]
                    }
                ];

                var text = svg.selectAll("text")
                    .data(timelabel)
                    .enter()
                    .append("text")
                    .attr("x", function (d) {
                        return d.position[0];
                    })
                    .attr("y", function (d) {
                        return d.position[1];
                    })
                    .html(function (d) {
                        return d.text;
                    })
                    .style("font-size","10px")
                    .style("color", "white");


                var big_svg = d3.select(".cluster-panel").select("svg").select("g");
                var big_g = big_svg.selectAll(".arc1")
                    .data(pie(arcData))
                    .enter().append("g")
                    .attr("class", "arc1")
                    .attr("transform", 'translate(75,60)');


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
                        if(arcData[i].rate ===0){
                            return "none"
                        }
                        d.color = getClusterColor(1, 1, (arcData[i].rate - min) / (max - min));
                        return "#ED5858"
                        //return getClusterColor(1, 1, (arcData[i].num- min) / (max - min))
                    })
                    .style("opacity", function (d, i) {
                        return 0;
                        /!* if (i === 0 || i === 1 ) {
                             return '1';
                         }
                         else {
                             return '0';
                         }*!/
                    })
                    .on("mouseover", function (d, i) {
                        d3.select(this).style("fill", "#ED5858");
                        g.select("#path" + i.toString()).style("fill", "#ED5858");
                    })
                    .on("mouseout", function (d, i) {
                        d3.select(this).style("fill", function () {
                            //return d.color;
                            return "#ED5858"
                        });
                        g.select("#path" + i.toString()).style("fill", function () {
                            return d.color
                        });
                    })
                    .on("click", function (d, i) {
                        var angle1 = getAngle(0,1,arcData[i].x1,arcData[i].y1,true);
                        var angle2 = getAngle(0,1,arcData[i].x2,arcData[i].y2,true);
                        if(angle2==0){
                            angle2 = 2*Math.PI
                        }
                        if (d3.select(this).style("opacity") == 0) {
                            console.log("nominus")
                            // big_g.selectAll(".big_arc").style('opacity','0');
                            d3.select(this).style("opacity", "1");
                            maps.direction.push( [angle1,angle2])
                            console.log(maps.direction)
                        }
                        else {
                            console.log("minus")
                            d3.select(this).style("opacity", "0");
                            var newCluster = [];
                            maps.direction.forEach(function (t) {
                                if(t[0]!=angle1 || t[1]!=angle2){
                                    newCluster.push(t);
                                }
                            })
                            maps.direction = newCluster;
                        }
                    })

                g.append("path")
                    .attr("d", arc)
                    .attr("id", function (d, i) {
                        return "path" + i.toString();
                    })
                    .style('cursor', 'hand')
                    .style("fill", function (d, i) {
                        if(arcData[i].rate ===0){
                            return "none"
                        }
                        d.color = getClusterColor(1, 1, (arcData[i].rate  - min) / (max - min));
                        return getClusterColor(1, 1, (arcData[i].rate  - min) / (max - min))
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

    })*/
        $.ajax({
            url: url,
            type: 'GET',
            contentType: "application/json",
            dataType: 'jsonp',
            async: false,
            success: function (dt) {
                var directionRes = dt;
                var max = d3.max(directionRes,function (d) {
                    return d;
                })
                var min = d3.min(directionRes,function (d) {
                    return d;
                })
                $.getJSON("/data/directionCluster.json", function (data) {
                    var directionSeries = data.res;
                    var tmpx = 0;
                    var tmpy = 1
                    directionSeries.forEach(function (item) {
                        var angle = getAngle(item.x1, item.y1, item.x2, item.y2)
                        //Math.asin(Math.sqrt((item.x1-item.x2)*(item.x1-item.x2)+(item.y1-item.y2)*(item.y1-item.y2))/2);
                        item.angle = angle;
                        if (item.x1 != tmpx && item.y1 != tmpy) {
                            var space = {};
                            space.angle = getAngle(tmpx, tmpy, item.x1, item.y1)
                            //Math.asin(Math.sqrt((item.x1-tmpx)*(item.x1-tmpx)+(item.y1-tmpy)*(item.y1-tmpy))/2);
                            space.num = 0;
                            arcData.push(space)
                        }
                        arcData.push(item);
                        tmpx = item.x2;
                        tmpy = item.y2;
                    })
                    console.log(arcData)
                    var svg = d3.select(".cluster-panel").select("svg")
                    svg.selectAll(".arc")
                        .each(function (d,i) {
                            var thisG = d3.select(this);
                            thisG.select("path").style("fill",function (d) {

                                d.color = getClusterColor(1, 1, (directionRes[i] - min) / (max - min));
                                //return getClusterColor(1, 1, (arcData[i].num  - min) / (max - min))
                              return getClusterColor(1, 1, (directionRes[i]  - min) / (max - min))
                            })
                        })
                })
            }

        })
    }
}

export{DirectionClusterView}
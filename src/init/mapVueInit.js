var maps = {
    'mapObj': [{
        'id': {
            'card': 'card0',
            'map': 'map0',
            'tab': 'tab0'
        },
        'visualRadius': 100,
        'nodeStayFilter': 0,
        'nodeInFilter': 0,
        'nodeOutFilter': 0,
        'edgefilter': 0,
        'maxedgefilter':300,
        'comEdgefilter':0,
        'maxComEdgefilter':2000,
        'maxWidth':10,
        'graph':{},
        'proportion':5,
        'maxProportion':1,
        'particleNum':300,
        'maxParticleLength':10,
        'directionNum':5

    }
    ],
    'stay_type': [{
        value: 'District',
        label: 'District'
    },
        {
            value: 'POI',
            label: 'POI'
        },
        {
            value: 'GRID',
            label: 'GRID'
        }],
    'stay_default': 'District',
    'travel_type': [{
        value: 'District-District',
        label: 'DD'
    },
        {
            value: 'District-POI',
            label: 'DP'
        },
        {
            value: 'POI-POI',
            label: 'PP'
        },
        {
            value: 'POI-Grid',
            label: 'PG'
        },
        {
            value: 'District-Grid',
            label: 'DG'
        },
        {
            value: 'Grid-Grid',
            label: 'GG'
        }],
    'travel_default': 'District-District',
    'years': [{
        value: 2016,
        label: 2016
    }],
    'year_default': 2016,
    'months': [{
        value: 'Jul',
        label: 'Jul'
    },
        {
            value: 'Aug',
            label: 'Aug'
        }, {
            value: 'Sep',
            label: 'Sep'
        }],
    'month_default': 'Jul',
    'weekdays': [{
        value: 'ALL',
        label: 'ALL'
    },
        {
            value: 'WORKDAY',
            label: 'WORKDAY'
        }, {
            value: 'WEEKEND',
            label: 'WEEKEND'
        }],
    'weekday_default': ' ',
    'loading': false,
    'optionData':[
        //{index:3,text:'Label : ',class:'nodeLabel',values:['TF-IDF keywords','Frequent keywords','venue']},
        {
            index:1,text:'SeedNum : ',title:'Movement Anomaly Score Threshold',class:'mFilter',values:[150,750,1500].map(function(d){return String(d)}),init:150,
            input:{checked:true,position:'left',key:'m',father:'nodeType'}
        },
        {
            index:2,text:'Angle : ',title:'HAVC Anomaly Score Threshold',class:'hFilter',values:[30,60,90,120,180].map(function(d){return String(d)}),init:'60',
            input:{checked:true,position:'left',key:'h',father:'nodeType'}
        },
        {
            index:3,text:'MinPoints : ', title:'Movement-Movement Correlation Threshold',class:'mmFilter',values:[8,10].map(function(d){return String(d)}),init:'10',
            input:{checked:true,position:'left',key:'mm',father:'corrScore'}
        },
        {
            index:4,text:'FlowStrength : ', title:'Movement-HAVC Correlation Threshold',class:'mhFilter',values:[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1].map(function(d){return String(d)}),init:'0.5',
            input:{checked:true,position:'left',key:'mh',father:'corrScore'}
        },
        {
            index:5,text:'TimeInterval : ',title:'Movement Anomaly Score Threshold',class:'mFilter',values:[10,20,40,50,60,80,100].map(function(d){return String(d)}),init:10,
            input:{checked:true,position:'left',key:'m',father:'nodeType'}
        },
        {
            index:6,text:'MinTrajLen : ',title:'Movement Anomaly Score Threshold',class:'mFilter',values:[1,2,4,5,6,8,10].map(function(d){return String(d)}),init:0,
            input:{checked:true,position:'left',key:'m',father:'nodeType'}
        },
        {
            index:7,text:'MinFlowStrength : ',title:'Movement Anomaly Score Threshold',class:'mFilter',values:[10,20,40,50,60,80,100].map(function(d){return String(d)}),init:0,
            input:{checked:true,position:'left',key:'m',father:'nodeType'}
        },
        {
            index:8,text:'MinSpeed : ',title:'Movement Anomaly Score Threshold',class:'mFilter',values:[10,20,40,50,60,80,100].map(function(d){return String(d)}),init:0,
            input:{checked:true,position:'left',key:'m',father:'nodeType'}
        }
        ],
    'newOptionData':[
        {
            index:0,
            name:"SegLen:",
            init:3,
            option:[
                {value:1,label:1},
                {value:2,label:2},
                {value:3,label:3},
                {value:4,label:4},
                {value:5,label:5}
            ]
        },
        {index:1,
            name:"SearchAngle:",
            init:30,
            option:[
                {value:30,label:30},
                {value:60,label:60},
                {value:90,label:90},
                {value:120,label:120}
            ]
        },
        {index:2,
            name:"MinFlowRatio:",
            init:0.1,
            option:[
                {value:0,label:0},
                {value:0.1,label:0.1},
                {value:0.3,label:0.3},
                {value:0.5,label:0.5},
                {value:0.7,label:0.7},
                {value:0.9,label:0.9}
            ]
        },
        {index:3,
            name:"MaxFlowLen:",
            init:'close',
            option:[
                {value:'close',label:'close'},
                {value:1,label:1},
                {value:2,label:2},
                {value:3,label:3},
                {value:4,label:4},
                {value:5,label:5},
                {value:6,label:6}
            ]
        },
        {index:4,
            name:"MinFlowLen:",
            init:0,
            option:[
                {value:0,label:0},
                {value:0.2,label:0.2},
                {value:0.5,label:0.5},
                {value:1,label:1},
                {value:2,label:2},
                {value:3,label:3},
                {value:4,label:4},
                {value:5,label:5},
                {value:8,label:8},
                {value:10,label:10}
            ]
        },
        /*{index:5,
            name:"MinFlowStrength:",
            init:0,
            option:[
                {value:0,label:0},
                {value:10,label:10},
                {value:20,label:20},
                {value:30,label:30},
                {value:40,label:40},
                {value:50,label:50},
                {value:60,label:60},
                {value:70,label:70},
                {value:80,label:80},
                {value:90,label:90},
                {value:100,label:100}
            ]
        },*/
        {index:6,
            name:"MinFlowSpeed:",
            init:0,
            option:[
                {value:0,label:0},
                {value:10,label:10},
                {value:30,label:30},
                {value:70,label:70}
            ]
        },
        {index:7,
            name:"AnimationRate:",
            init:20,
            option:[
                {value:5,label:5},
                {value:10,label:10},
                {value:20,label:20},
                {value:50,label:50},
                {value:80,label:80},
                {value:100,label:100},
                {value:200,label:200}
            ]
        },
        {index:8,
            name:"GridDirNum:",
            init:-1,
            option:[
                {value:-1,label:-1},
                {value:1,label:1},
                {value:2,label:2},
                {value:4,label:4},
                {value:6,label:6},
                {value:8,label:8}
            ]
        },
        {index:9,
            name:"KDE Bandwidth:",
            init:'close',
            option:[
                {value:'close',label:'close'},
                {value:0.2,label:0.2},
                {value:0.5,label:0.5},
                {value:1,label:1},
                {value:2,label:2}
            ]
        },
        {index:10,
            name:"MaxFlowSpeed:",
            init:200,
            option:[
                {value:0,label:0},
                {value:10,label:10},
                {value:30,label:30},
                {value:70,label:70},
                {value:200,label:200}
            ]
        },
        {index:11,
            name:"MaxDistance:",
            init:9999,
            option:[
                {value:1,label:1},
                {value:2,label:2},
                {value:3,label:3},
                {value:7,label:7},
                {value:20,label:20},
                {value:9999,label:9999}
            ]
        },
        {index:12,
            name:"gridSize:",
            init:500,
            option:[
                {value:5000,label:5000},
                {value:4000,label:4000},
                {value:2000,label:2000},
                {value:1000,label:1000},
                {value:500,label:500},
                {value:250,label:250},
                {value:100,label:100}
            ],
        },
        {index:5,
            name:"Map-matching:",
            init:'close',
            option:[
                {value:'close',label:'close'},
                {value:'open',label:'open'}
            ]
        }
        // {
        //     index:13,
        //     name:"treeWidth:",
        //     init:1,
        //     option:[
        //         {value:1,label:1},
        //         {value:2,label:2},
        //         {value:3,label:3},
        //         {value:4,label:4},
        //         {value:5,label:5},
        //         {value:8,label:8},
        //         {value:10,label:10}
        //     ]
        // }
    ],
    'option':[
        {value:"150",label:"150"},
        {value:"750",label:"750"},
        {value:"1500",label:"1500"}
    ],
    'seedUnit':{
      init:"Flow Volume",
      option:[
          {value:"Flow",label:"Flow"},
          {value:"Hotspot",label:"Hotspot"}
      ]
    },
    'treeWidth':{
        init:"One",
        option:[
                {value:3,label:"Mid"},
                {value:5,label:"High"}
                ]

    },
    'daySelect':0,
    'timeSegId':9,
    'option_default':"150",
    'isSelectable':false,
    'fromOrTo':'from',
    'strokeType':'speed',
    'status':"play",
    'animate':"pause",
    'fade':false,
    'seedNum':3,
    'maxTreeRate':1,
    'direction':[],
    'minSamples':300,
    'eps':2.5,
    'heatType':"N/A",
    'anomalyType':"N/A",
    'heatNum':[20,100],
    'anomalyNum':1,
    'radius':8,
    'aniCurHour':-1,
    'mapType':"none",
    'base':0,
    'animateAm':"pause",
    'aniCurDay':-1,
    'port':4000,
    'speedToShow':'all',
    'mapLayerType': 'default',
    'personalId':0,
    'city':'BJ',
    'mapMatching': 0
}

export {maps}
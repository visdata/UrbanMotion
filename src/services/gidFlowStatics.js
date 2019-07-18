import {ajax} from './ajax'
import {maps} from '../init/mapVueInit'

const host = 'http://192.168.0.118'
const port = '3033'
const api = '/api/gidFlowStatics'
//http://192.168.0.118:3033/api/clusterDots?customize=0&v=v1&filterNoise=1
const gidFlowStatics = function (type, gid, timeSegID) {
    let url = host +':'+ port + api +"?type="+type+"&gid="+gid+"&timeSegID="+timeSegID+"&city="+maps.city;
    return ajax(url,'GET')
}

export {gidFlowStatics}
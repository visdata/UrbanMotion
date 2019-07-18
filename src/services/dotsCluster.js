import {ajax} from './ajax'

const host = 'http://192.168.0.118'
const port = '3033'
const api = '/api/clusterDots'
//http://192.168.0.118:3033/api/clusterDots?customize=0&v=v1&filterNoise=1
const getDotsCluster = function (customize, version, filterNoise) {
    let url = host +':'+ port + api + '?customize=' + customize + '&v=' + version + '&filterNoise=' + filterNoise;
    return ajax(url,'GET')
}

export {getDotsCluster}
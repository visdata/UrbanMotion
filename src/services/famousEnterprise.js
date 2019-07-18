import {ajax} from './ajax'

const host = 'http://192.168.0.118'
const port = '3033'
const api = '/api/famousEnterprise'
//http://192.168.0.118:3033/api/clusterDots?customize=0&v=v1&filterNoise=1
const getFamousEnterprise = function () {
    let url = host +':'+ port + api ;
    return ajax(url,'GET')
}

export {getFamousEnterprise}
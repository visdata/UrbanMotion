import {ajax} from './ajax'

const host = 'http://192.168.0.118'
const port = '3033'
const api = '/api/ODTripFlow'
//http://192.168.0.118:3033/api/ODTripFlow?timeSegID=9
const getODTripFlow = function (timeSeg) {
    let url = host +':'+ port + api + '?timeSegID=' + timeSeg;
    return ajax(url,'GET')
}

export {getODTripFlow}
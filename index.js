require('dotenv').config({ path: './dev.env' })const CFG = require('./cfg');const redis = require('redis');const client = redis.createClient();const {promisify} = require('util');const getAsync = promisify(client.get).bind(client);const setAsync = promisify(client.set).bind(client);const {secret_keys} = CFG;const CryptoJS = require('crypto-js');client.on('error', (error) => {  console.error(error);});const encrypt = (data) => CryptoJS.AES.encrypt(data, process.env.secret).toString();const decrypt = (data) => CryptoJS.AES.decrypt(data, process.env.secret).toString(CryptoJS.enc.Utf8);const get = async (key) => {  try {    let res = await getAsync(`keyv:${key}`);    res = JSON.parse(res);    res = res.value || res;    if (secret_keys.hasOwnProperty(key))      do_stuff(key, res, true)    return res  } catch (e) {    console.error(e)    console.error(`Couldn't get key ${key}`)    return null;  }};const do_stuff = (key, value, do_decryption) => {  if (!process.env.secret)    return  if (Array.isArray(value)) {    for (let item of value) {      secret_keys[key].forEach(variable_name => {        if (!item.hasOwnProperty(variable_name))          return        const www = item[variable_name];        item[variable_name] = do_decryption ? decrypt(www) : encrypt(www)      })    }  }};const set = (key, value) => {  setAsync(`keyv:update_time:${key}`, Date().toString());  if (secret_keys.hasOwnProperty(key))    do_stuff(key, value, false)  return setAsync(`keyv:${key}`, JSON.stringify(value));};module.exports = {  get,  set}
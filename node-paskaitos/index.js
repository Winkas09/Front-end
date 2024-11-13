const casual = require('casual');
const colors = require('colors');
const si = require('systeminformation');
const os = require('os');

si.cpu().then(data => console.log(data))

const uptime = os.uptime();
console.log("🚀 ~ uptime:", uptime)

const http = require('http')
const os = require('os')

const si = require('systeminformation')

// function serverListener(req, res) {}
// const server = http.createServer(serverListener)

// const server = http.createServer(function(req, res) {})

const server = http.createServer(async (req, res) => {
    const url = req.url

    if (url === '/utilization') {
        const utilizationText = await getUtilizationGPU()
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>')
        res.write('<head><title>Our page</title></head>')
        res.write('<body><h1>Utilization Page</h1><p>' + utilizationText + '</p></body>')
        res.write('</html>')
        
        res.end()
    } else {
        const uptime = os.uptime()

        const uptimeText = `Your computer is running for ${uptime} seconds.`
        
        res.setHeader('Content-Type', 'text/html')
        res.write('<html>')
        res.write('<head><title>Our page</title></head>')
        res.write('<body><h1>Hello World</h1><p>' + uptimeText + '</p></body>')
        res.write('</html>')
        
        res.end()
    }
})

async function getUtilizationGPU() {
    const data = await si.graphics()
    const utilizationGpu = data.controllers[2].utilizationGpu
    return `GPU Utilization is ${utilizationGpu}`
}

server.listen(3000)
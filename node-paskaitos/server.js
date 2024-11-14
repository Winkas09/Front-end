const http = require('http')
const os = require('os')
const si = require('systeminformation')

const getSystemInfo = async () => {
    const uptime = os.uptime()
    const cpu = os.cpus()[0].model
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const diskData = await si.diskLayout()
    return {
        uptime,
        cpu,
        totalMem,
        freeMem,
        diskData
    }
}

const generateHTML = (title, content) => {
    return `
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f0f0f0; margin: 0; padding: 0; }
            h1 { color: #333; }
            p { color: #666; }
            .container { max-width: 800px; margin: 50px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            pre { background-color: #eee; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${title}</h1>
            ${content}
        </div>
    </body>
    </html>
    `
}

const server = http.createServer(async (req, res) => {
    const url = req.url

    if (url === '/utilization') {
        const gpuData = await si.graphics()
        const utilizationText = JSON.stringify(gpuData, null, 2)
        const content = `<pre>${utilizationText}</pre>`
        res.setHeader('Content-Type', 'text/html')
        res.end(generateHTML('GPU Utilization', content))
    } else if (url === '/network') {
        const networkData = await si.networkInterfaces()
        const networkText = JSON.stringify(networkData, null, 2)
        const content = `<pre>${networkText}</pre>`
        res.setHeader('Content-Type', 'text/html')
        res.end(generateHTML('Network Information', content))
    } else {
        const { uptime, cpu, totalMem, freeMem, diskData } = await getSystemInfo()
        const uptimeText = `Your computer has been running for ${uptime} seconds.`
        const cpuText = `CPU: ${cpu}`
        const memoryText = `Total Memory: ${(totalMem / (1024 ** 3)).toFixed(2)} GB, Free Memory: ${(freeMem / (1024 ** 3)).toFixed(2)} GB`
        const diskInfo = JSON.stringify(diskData, null, 2)
        const content = `
            <p>${uptimeText}</p>
            <p>${cpuText}</p>
            <p>${memoryText}</p>
            <h2>Disk Information</h2>
            <pre>${diskInfo}</pre>
        `
        res.setHeader('Content-Type', 'text/html')
        res.end(generateHTML('System Information', content))
    }
})

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})
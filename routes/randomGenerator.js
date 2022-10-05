function randomGenerator(qty) {
    let rndList = {}
    for (let num=0; num <= qty; num++) {
        let rndNum = parseInt(Math.random() * (1000 - 1) + 1)
        if (rndList.hasOwnProperty(rndNum)) {
            rndList[rndNum] += 1
        } else {
            rndList[rndNum] = 1
        }
    }
    return JSON.stringify(rndList)
}

process.on('message', (msg => {
    const rndList = randomGenerator(parseInt(msg))
    process.send(rndList)
}))
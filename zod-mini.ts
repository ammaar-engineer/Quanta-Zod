const obj = {
    nama: 'lorem',
    umur: 'ipsum'
}

interface zmScheme {
    type: 'string' | 'number'
    max: number
    min: number
}
type listParam = (raw: any) => boolean



function mz <T> (data: any, securtyVariaty: T, queue) {
    let queueCheck: Function[] = []
    Object.keys(queue!).forEach((item) => {
        const choosenFunc = securtyVariaty[item]
        queueCheck.push(choosenFunc)
    })
    let result: boolean[] = queueCheck.map(func => {
        return func(data, queue)
    })
    return !result.includes(false)
}

const checkingSecurity = {
    type: (raw: any, dataRule: any) => typeof raw == dataRule['type'],
    max: (raw: any, dataRule: any) => raw.toString().length < dataRule['max'],
    min: (raw: any, dataRule: any) => raw.toString().length > dataRule['min']
}

console.log(mz('amaru', checkingSecurity, {max: 6, type: 'string', min: 1}))
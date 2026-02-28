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



function mz<T extends string> (data: any, securtyVariaty: Record<T, any>, queue?: Partial<Record<T, ReturnType<typeof qz>>>) {
    const SECURITY_KEY = Object.keys(securtyVariaty)
    const QUEUE_KEY = Object.keys(queue || {})

    let queue_task: Function[] = []
    let queue_task_key: string[] = []

    QUEUE_KEY.forEach(key => {
        const selectedFunc = securtyVariaty[key]
        queue_task_key.push(key)
        queue_task.push(selectedFunc)
    })

    let isSuccess = true
    let issue: any[] = []
    queue_task.forEach((func, i) => {
        const curr_queue_key = queue_task_key[i]
        const {expectedValue, errmsg} = queue![curr_queue_key]
        try {
            const execute = func(data, expectedValue)
            if (!execute) throw Error()
        } catch {
            isSuccess = false
            issue.push({
                errmsg,
                loc: curr_queue_key
            })
        }
    })
    return isSuccess ? {isSuccess, data} : {isSuccess, issue}
}
function qz (expectedValue: any, errmsg: string) {
    return {expectedValue, errmsg}
}
const checkingSecurity = {
    type: (raw: any, expected: any) => typeof raw == expected,
    max: (raw: any, expected: any) => raw.toString().length < expected,
    min: (raw: any, expected: any) => raw.toString().length > expected,
    isSame: (raw: any, expected: any) => raw == expected
}

console.log(mz(
    'amaru', 
    checkingSecurity, 
    {max: qz(5, 'max is 5'), type: qz('number', 'must str'), min: qz('1', 'must be 4')}
))
console.log(mz(
    'amara', 
    checkingSecurity, 
    {isSame: qz('amaru', 'not same as expected')}
))
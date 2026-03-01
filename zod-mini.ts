function mz<T extends string> (
        data: any, 
        securtyVariaty: Record<T, any>, 
        queue: Partial<Record<T, ReturnType<typeof qz>>>) 
    {
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



interface optionScheme {
    optional: boolean
}
type boolFunc = (param: any, anparam: any) => boolean
type obj = Record<string, any>

class oz_initiate<T extends string> {
    securityMiddleware: Record<T, boolFunc>
    constructor (securityMiddleware: Record<T, boolFunc>) {
        this.securityMiddleware = securityMiddleware
    }

    oz = (obj: obj, expected_obj: Record<any, Partial<Record<T, ReturnType<typeof qz>>>>) => {
        const securityList = this.securityMiddleware
        // All keys
        const SECURITY_LIST_KEY = Object.keys(securityList)
        const OBJ_KEY = Object.keys(obj)
        const EXPECTED_OBJ_KEY = Object.keys(expected_obj)

        let isSuccess = true
        let issue: any[] = []

        // Checking key first
        for (const key_ex of EXPECTED_OBJ_KEY) {
            if (!obj[key_ex]) {
                isSuccess = false
                issue.push({
                    loc: key_ex,
                    errmsg: `Obj ${key_ex} not found`
                })
                break
            }
            const expectedValue_key = Object.keys(expected_obj[key_ex])
            for (const list_check_key of expectedValue_key) {
                const target_func = securityList[list_check_key]
                const {expectedValue, errmsg} = expected_obj[key_ex][list_check_key]
                const execute = target_func(obj[key_ex], expectedValue)
                if (!execute) {
                    isSuccess = false
                    issue.push({
                        loc: key_ex,
                        onCheck: list_check_key,
                        errmsg
                    })
                    break
                }
            }
        }

        return isSuccess ? {isSuccess, obj} : {isSuccess, issue}
    }
}

const mzcl = new oz_initiate(
    {
        type: (raw: any, expected: any) => typeof raw == expected,
        max: (raw: any, expected: any) => raw.toString().length < expected,
        min: (raw: any, expected: any) => raw.toString().length > expected,
        isSame: (raw: any, expected: any) => raw == expected,
        min_num: (raw, expected) => raw > expected
    }
)
console.log(
    mzcl.oz(
        {name: 'Ammaar', kelas: 4, sahur: 'sada'}, 
        {
            name: {
                max: qz(9, 'Must be 5 kid'), isSame: qz('Ammaar', 'Not ammar :/'), type: qz('string', 'must string >:(')},
            kelas: {min_num: qz(2, 'Must be more than 4')}
        }
    )
)
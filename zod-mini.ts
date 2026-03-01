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

// console.log(mz(
//     'amaru', 
//     checkingSecurity, 
//     {max: qz(5, 'max is 5'), type: qz('number', 'must str'), min: qz('1', 'must be 4')}
// ))
// console.log(mz(
//     'amara', 
//     checkingSecurity, 
//     {isSame: qz('amaru', 'not same as expected')}
// ))



interface optionScheme {
    optional: boolean
}
type obj = Record<string, any>

// Untuk transformer layer
type transformerFunc = (tf_into: any, currData: any) => any
type transformer_obj_scheme<T extends string> = Record<any, Partial<Record<T, any>>>
// Untuk security layer
type expected_obj_scheme <T extends string> = Record<any, Partial<Record<T, ReturnType<typeof qz>>>>
type boolFunc = (param: any, anparam: any) => boolean

type setup_arr_scheme<E extends string, T extends string> = [expected_obj_scheme<E>, transformer_obj_scheme<T>?]

export class oz_initiate<E extends string, T extends string> {
    securityMiddleware: Record<E, boolFunc>
    transformerMiddleware: Record<T, transformerFunc>
    constructor (securityMiddleware: Record<E, boolFunc>, transformerMiddleware: Record<T, transformerFunc>) {
        this.securityMiddleware = securityMiddleware
        this.transformerMiddleware = transformerMiddleware
    }

    oz = (obj: obj, setup_arr: setup_arr_scheme<E, T>) => {
        const securityList = this.securityMiddleware
        const transformerList = this.transformerMiddleware
        // All keys
        const SECURITY_LIST_KEY = Object.keys(securityList)
        const OBJ_KEY = Object.keys(obj)
        const [expected_obj_setup, transformer_obj_setup] = setup_arr

        const TRANSFORMER_OBJ_KEY = Object.keys(transformer_obj_setup || {})
        const EXPECTED_OBJ_KEY = Object.keys(expected_obj_setup)

        let isSuccess = true
        let issue: any[] = []
        let currData = {}

        // Checking key first
        for (const key_ex of EXPECTED_OBJ_KEY) {
            if (!obj[key_ex]) {
                isSuccess = false
                issue.push({
                    loc: key_ex,
                    errmsg: `Obj ${key_ex} not found`,
                    layer: 'security_check'
                })
                break
            }
            // Go through security layer
            const expectedValue_key = Object.keys(expected_obj_setup[key_ex])
            for (const list_check_key of expectedValue_key) {
                console.log(`Security layer => ${list_check_key}`)
                const target_func = securityList[list_check_key]
                const {expectedValue, errmsg} = expected_obj_setup[key_ex][list_check_key]
                const execute = target_func(obj[key_ex], expectedValue)
                if (!execute) {
                    isSuccess = false
                    issue.push({
                        loc: key_ex,
                        onCheck: list_check_key,
                        errmsg,
                        layer: 'security_check'
                    })
                    break
                }

            }
            if (TRANSFORMER_OBJ_KEY.length != 0 && isSuccess) {
                for (let key_tf of TRANSFORMER_OBJ_KEY) {
                    if (!obj[key_tf]) {
                        isSuccess = false
                        issue.push({
                            loc: key_tf,
                            errmsg: `Obj ${key_tf} Not found`,
                            layer: 'transform_layer'
                        })
                        break
                    }
                    const transformerValue = Object.keys(transformer_obj_setup![key_tf])
                    for (const tf_list_key of transformerValue) {
                        const tf_into = transformer_obj_setup![key_tf][tf_list_key]
                        const choosedFunc = transformerList[tf_list_key]
                        const dataForFunc =  currData[key_tf] ? currData[key_tf] : obj[key_tf]
                        let data = choosedFunc(tf_into, dataForFunc)
                        console.log(`Transformer Layer => ${tf_list_key}`)
                        currData[key_tf] = data
                    }
                }
            }

        }
        return isSuccess ? {isSuccess, data: TRANSFORMER_OBJ_KEY.length != 0 ? currData : obj} : {isSuccess, issue}
    }
}






const guard = new oz_initiate({
    type:        (raw, expected) => typeof raw === expected,
    min:         (raw, expected) => raw.toString().length > expected,
    max:         (raw, expected) => raw.toString().length < expected,
    isPositive:  (raw, _) => raw > 0,
    isEven:      (raw, _) => raw % 2 === 0,
    isDivisible: (raw, expected) => raw % expected === 0,
    isEmail:     (raw, _) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw),
    noSpace:     (raw, _) => !raw.toString().includes(' '),
}, {
    trim:        (tf_into, curr) => {
        return curr.toString().trim()
    },
    toLowerCase: (tf_into, curr) => {
        return curr.toString().toLowerCase()
    },
    toUpperCase: (tf_into, curr) => curr.toString().toUpperCase(),
    replace:     (tf_into, curr) => curr.toString().replaceAll(tf_into[0], tf_into[1]),
    append:      (tf_into, curr) => curr + tf_into,
    prepend:     (tf_into, curr) => tf_into + curr,
    toInt:       (tf_into, curr) => parseInt(curr),
    multiply:    (tf_into, curr) => {
        return tf_into * curr
    },
    slice:       (tf_into, curr) => curr.toString().slice(tf_into[0], tf_into[1]),
})

// TEST 1: String pipeline — trim, lowercase, replace spasi ke underscore
console.log('=== TEST 1: String pipeline ===')
console.log(guard.oz(
    { username: '  AmmAAr Dev  ' },
    [
        { username: { type: qz('string', 'Must string'), min: qz(3, 'Too short') } },
        { username: { trim: null, toLowerCase: null, replace: [' ', '_'] } }
    ]
))
// Expected: 'ammaar_dev'

// TEST 2: Number pipeline — validate lalu multiply
console.log('=== TEST 2: Number pipeline ===')
console.log(guard.oz(
    { score: 6, tes: 'a' },
    [
        { score: { type: qz('number', 'Must number'), isPositive: qz(null, 'Must positive'), isEven: qz(null, 'Must even') }, tes: {type: qz('string', 'mst')} },
        { score: { multiply: 7, append: ' points' }, tes: {append: 'a'} }
    ]
))
// Expected: '42 points'

// TEST 3: Email — validate lalu normalize
console.log('=== TEST 3: Email normalize ===')
console.log(guard.oz(
    { email: '  AMMAAR@Gmail.COM  ' },
    [
        { email: { type: qz('string', 'Must string') } },
        { email: { trim: null, toLowerCase: null } }
    ]
))
// Expected: 'ammaar@gmail.com'

// TEST 4: Security fail di tengah, transformer ga boleh jalan
console.log('=== TEST 4: Security fail ===')
console.log(guard.oz(
    { username: 'am' },
    [
        { username: { type: qz('string', 'Must string'), min: qz(3, 'Min 4 chars'), max: qz(20, 'Max 20 chars') } },
        { username: { trim: null, toUpperCase: null } }
    ]
))

// TEST 5: Multi field, tiap field transform sendiri
console.log('=== TEST 5: Multi field pipeline ===')
console.log(guard.oz(
    { username: '  Ammaar  ', score: 6 },
    [
        {
            username: { type: qz('string', 'Must string'), min: qz(3, 'Too short') },
            score:    { type: qz('number', 'Must number'), isEven: qz(null, 'Must even') }
        },
        {
            username: { trim: null, toLowerCase: null },
            score:    { multiply: 7 }
        }
    ]
))
// Expected: username: 'ammaar', score: 42 — tapi gimana output nya? obj tunggal atau per field?
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

function mz (param: zmScheme, data: any) {
    const listCheck = {
        type: (raw: any) => typeof raw == param.type,
        max: (raw: any) => raw.toString().length < param.max,
        min: (raw: any) => raw.toString().length > param.min
    }
    let queueCheck: Function[] = []
    Object.keys(param).forEach((item) => {
        const choosenFunc = listCheck[item]
        queueCheck.push(choosenFunc)
    })
    let result = queueCheck.map(func => {
        return func(data)
    })
    console.log(result)
}

mz({type: 'string', max: 7, min: 1}, 'amardsadasdasdaskdashdas')
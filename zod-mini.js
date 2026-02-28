const obj = {
    nama: 'lorem',
    umur: 'ipsum'
};
function mz(data, securtyVariaty, queue) {
    let queueCheck = [];
    Object.keys(queue).forEach((item) => {
        const choosenFunc = securtyVariaty[item];
        queueCheck.push(choosenFunc);
    });
    console.log(queueCheck);
    let result = queueCheck.map(func => {
        return func(data, queue);
    });
    return !result.includes(false);
}
// mz({type: 'string', max: 7, min: 1}, 'amardsadasdasdaskdashdas')
const checkingSecurity = {
    type: (raw, dataRule) => typeof raw == dataRule['type'],
    max: (raw, dataRule) => raw.toString().length < dataRule['max'],
    min: (raw, dataRule) => raw.toString().length > dataRule['min']
};
console.log(mz('amaru', checkingSecurity, { max: 6, type: 'string', min: 1 }));

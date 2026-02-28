const obj = {
    nama: 'lorem',
    umur: 'ipsum'
};
function mz(data, securtyVariaty, queue) {
    const SECURITY_KEY = Object.keys(securtyVariaty);
    const QUEUE_KEY = Object.keys(queue || {});
    let queue_task = [];
    let queue_task_key = [];
    QUEUE_KEY.forEach(key => {
        const selectedFunc = securtyVariaty[key];
        queue_task_key.push(key);
        queue_task.push(selectedFunc);
    });
    let isSuccess = true;
    let issue = [];
    queue_task.forEach((func, i) => {
        const curr_queue_key = queue_task_key[i];
        const { expectedValue, errmsg } = queue[curr_queue_key];
        try {
            const execute = func(data, expectedValue);
            if (!execute)
                throw Error();
        }
        catch (_a) {
            isSuccess = false;
            issue.push({
                errmsg,
                loc: curr_queue_key
            });
        }
    });
    return isSuccess ? { isSuccess, data } : { isSuccess, issue };
}
function qz(expectedValue, errmsg) {
    return { expectedValue, errmsg };
}
const checkingSecurity = {
    type: (raw, expected) => typeof raw == expected,
    max: (raw, expected) => raw.toString().length < expected,
    min: (raw, expected) => raw.toString().length > expected,
    isSame: (raw, expected) => raw == expected
};
console.log(mz('amaru', checkingSecurity, { max: qz(5, 'max is 5'), type: qz('number', 'must str'), min: qz('1', 'must be 4') }));
console.log(mz('amara', checkingSecurity, { isSame: qz('amaru', 'not same as expected') }));

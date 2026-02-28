export function mz(data, securtyVariaty, queue) {
    let queueCheck = [];
    // Proses masuk antrean O(1)
    Object.keys(queue).forEach((item) => {
        const choosenFunc = securtyVariaty[item];
        queueCheck.push(choosenFunc);
    });
    let isSuccess = true;
    queueCheck.forEach((func, i) => {
        try {
            const execute = func(data, queue);
            if (!execute)
                throw Error();
            console.log(`Eksekusi ke ${execute}`);
            isSuccess = true;
        }
        catch (_a) {
            isSuccess = false;
            const queueArr = Object.keys(queue);
            console.log(`Error on: ${queueArr[i]}`);
        }
    });
    // console.log(isSuccess)
}

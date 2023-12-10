export function roundDownToTick(tickSize: number, price: number): number {
    return tickSize * Math.floor(price / tickSize)
}

export function roundToTick(tickSize: number, price: number): number {
    return tickSize * Math.round(price / tickSize)
}

export function getPrecision(num: number) {
    const strs = num.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 21 }).split('.')
    if(strs.length !== 2) return 0
    return strs[1].length
}

export function precisionRound(num: number, precision: number) {
    var factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}

export function indexWindowAverage(arr: number[], index: number, size: number): number {
    let ma = 0
    let cnt = 0
    for(let i = -size;i <= size;i++) {
        const num = arr[index + i]
        if(num) {
            ma += num
            cnt++
        }
    }
    return ma / cnt
}

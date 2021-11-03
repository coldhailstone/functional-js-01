const log = console.log;

const curry = (f) => (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);

const go = (...args) => reduce((a, f) => f(a), args);

const pipe = (f, ...fs) => (...as) => go(f(...as), ...fs);

const add = (a, b) => a + b;

const map = curry((f, iter) => {
    let res = [];
    iter = iter[Symbol.iterator]();
    let cur;
    while (!(cur = iter.next()).done) {
        const a = cur.value;
        res.push(f(a));
    }
    return res;
});

const filter = curry((f, iter) => {
    let res = [];
    iter = iter[Symbol.iterator]();
    let cur;
    while (!(cur = iter.next()).done) {
        const a = cur.value;
        if (f(a)) res.push(a);
    }
    return res;
});

const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);

const reduceF = (acc, a, f) => 
    a instanceof Promise
        ? a.then(a => f(acc, a), e => e == nop ? acc : Promise.reject(e))
        : f(acc, a);

const head = iter => go1(take(1, iter), ([h]) => h);

const reduce = curry((f, acc, iter) => {
    if (!iter) return reduce(f, head(iter = acc[Symbol.iterator]()), iter);

    iter = iter[Symbol.iterator]();
    return go1(acc, function recur(acc) {
        let cur;
        while (!(cur = iter.next()).done) {
            acc = reduceF(acc, cur.value, f);
            if (acc instanceof Promise) return acc.then(recur);
        }
        return acc;
    });
});

const take = curry((l, iter) => {
    let res = [];
    iter = iter[Symbol.iterator]();
    return function recur() {
        let cur;
        while (!(cur = iter.next()).done) {
            const a = cur.value;
            if (a instanceof Promise)
                return a
                    .then(a => (res.push(a), res).length == l ? res : recur())
                    .catch(e => e == nop ? recur() : Promise.reject(e));
            res.push(a);
            if (res.length == l) return res;
        }
        return res;
    }();
});

const takeAll = take(Infinity);

const join = curry((sep = ',', iter) => 
    reduce((a, b) => `${a}${sep}${b}`, iter));

const range = l => {
    let i = -1;
    let res = [];
    while (++i < l) {
        res.push(i);
    }
    return res;
};

const L = {};

L.range = function *(l) {
    let i = -1;
    while (++i < l) {
        yield i;
    }
};

L.map = curry(function *(f, iter) {
    for (const a of iter) {
        yield go1(a, f);
    }
});

const nop = Symbol('nop');

L.filter = curry(function *(f, iter) {
    for (const a of iter) {
        const b = go1(a, f);
        if (b instanceof Promise) yield b.then(b => b ? a : Promise.reject(nop));
        else if (b) yield a;
    }
});

L.entries = function *(obj) {
    for (const k in obj) yield [k, obj[k]];
}
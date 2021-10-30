const log = console.log;

const curry = (f) => (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);

const go = (...args) => reduce((a, f) => f(a), args);

const pipe = (f, ...fs) => (...as) => go(f(...as), ...fs);

const map = curry((f, iter) => {
    let res = [];
    for (const p of iter) {
        res.push(f(p));
    }
    return res;
});

const filter = curry((f, iter) => {
    let res = [];
    for (const a of iter) {
        if (f(a)) res.push(a);
    }
    return res;
});

const reduce = curry((f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const a of iter) {
        acc = f(acc, a);
    }
    return acc;
});

const take = (l, iter) => {
    let res = [];
    for (const a of iter) {
        res.push(a);
        if (res.length == l) return res;
    }
    return res;
}

const L = {};

L.range = function *(l) {
    let i = -1;
    while (++i < l) {
        yield i;
    }
};

L.map = function *(f, iter) {
    for (const a of iter) yield f(a);
};

L.filter = function *(f, iter) {
    for (const a of iter) if (f(a)) yield a;
};
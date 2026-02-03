const { numberToSpanishWords } = require('./lib/number-to-words');

const tests = [
    0,
    1,
    10,
    15,
    20,
    21,
    30,
    35,
    100,
    105,
    125,
    500,
    1000,
    1500.50,
    50000000,
    45000.75
];

tests.forEach(t => {
    try {
        console.log(`${t} => ${numberToSpanishWords(t)}`);
    } catch (e) {
        console.log(`${t} => ERROR: ${e.message}`);
    }
});

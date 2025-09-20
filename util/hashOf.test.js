const hashOf = require('./hashOf')

describe('hashOf()', () => {

    it('generates a sha256 hash of the input', () => {
        expect(hashOf('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });

    it('generates the same hash with the same input args in whichever order', () => {
        expect(hashOf('t', 'e', 's', 't')).toEqual(hashOf('t', 's', 'e', 't'));
    });
});
const assert = require('node:assert/strict');
const test = require('node:test');
const validateImage = require('../controllers/imageValidation');

const validPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

test('accepts valid Base64 image data up to 2 MB', () => {
    assert.equal(validateImage(validPng), null);
    assert.equal(validateImage(Buffer.alloc(2 * 1024 * 1024).toString('base64')), null);
});

test('requires a non-empty image field', () => {
    for (const value of [undefined, null, '', '   ']) {
        assert.equal(validateImage(value), 'Field image wajib diisi');
    }
});

test('rejects malformed Base64 data', () => {
    for (const value of ['halo dunia!!!', 'abc', 'AAAA====', 123]) {
        assert.equal(validateImage(value), 'Field image harus berupa Base64 yang valid');
    }
});

test('rejects decoded image data larger than 2 MB', () => {
    const tooLarge = Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64');
    assert.equal(validateImage(tooLarge), 'Ukuran image maksimal 2 MB');
});

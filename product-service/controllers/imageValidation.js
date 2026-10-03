const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function validateImage(value) {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return 'Field image wajib diisi';
    }

    if (typeof value !== 'string' || value.length % 4 !== 0 || !BASE64_PATTERN.test(value)) {
        return 'Field image harus berupa Base64 yang valid';
    }

    const decodedImage = Buffer.from(value, 'base64');

    if (decodedImage.toString('base64') !== value) {
        return 'Field image harus berupa Base64 yang valid';
    }

    if (decodedImage.length > MAX_IMAGE_SIZE) {
        return 'Ukuran image maksimal 2 MB';
    }

    return null;
}

module.exports = validateImage;

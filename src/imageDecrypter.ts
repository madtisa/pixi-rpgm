const HEADER_LENGTH = 16;

export default function decrypt(buffer: Uint8Array, decryptionKey?: Uint8Array): Uint8Array
{
    if (!decryptionKey)
    {
        throw new Error('Decryption key is required to load encrypted files');
    }

    if (decryptionKey.length !== HEADER_LENGTH)
    {
        throw new Error(
            `Invalid decryption key length (expected: ${HEADER_LENGTH}, actual: ${decryptionKey?.length})`
        );
    }

    const decryptedBuffer = buffer.subarray(HEADER_LENGTH);

    if (decryptedBuffer.length < decryptionKey.length)
    {
        throw new Error(`Invalid file. File is too small.`);
    }

    for (let i = 0; i < decryptionKey.length; i++)
    {
        decryptedBuffer[i] = decryptedBuffer[i] ^ decryptionKey[i];
    }

    return decryptedBuffer;
}

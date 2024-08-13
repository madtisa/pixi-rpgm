const headerLength = 16;

export default function decrypt(buffer: Uint8Array, encryptionKey?: Uint8Array): Uint8Array
{
    if (encryptionKey?.length !== headerLength)
    {
        throw new Error(
            `Invalid signature length (expected: ${headerLength}, actual: ${encryptionKey?.length})`
        );
    }

    const decryptedBuffer = buffer.subarray(headerLength);

    if (decryptedBuffer.length < encryptionKey.length)
    {
        throw new Error(`Invalid file. File is too small.`);
    }

    for (let i = 0; i < encryptionKey.length; i++)
    {
        decryptedBuffer[i] = decryptedBuffer[i] ^ encryptionKey[i];
    }

    return decryptedBuffer;
}

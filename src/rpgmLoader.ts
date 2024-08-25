import * as PIXI from 'pixi.js';
import decrypt from './imageDecrypter';
import { createUrl, getExtension } from './utils';

import type { Loader, LoaderParser, ResolvedAsset } from 'pixi.js';

export type DecryptedFormat = {
    ext: string,
    mimeType?: string,
    loadParser?: string,
};

const rpgAssetExtensions = new Map<string, DecryptedFormat>([
    ['.rpgmvp', { ext: '.png', mimeType: 'image/png', loadParser: 'loadTextures' }],
    ['.rpgmvo', { ext: '.ogg', mimeType: 'audio/ogg', loadParser: 'sound' }],
    ['.rpgmvm', { ext: '.m4a', mimeType: 'audio/mp4', loadParser: 'sound' }],
]);

function getDecryptedExtensionInfo(url: string): DecryptedFormat & { encryptedExt: string }
{
    const extension = getExtension(url);
    const decryptedExtensionInfo = rpgAssetExtensions.get(extension);

    if (!decryptedExtensionInfo)
    {
        throw new Error(`Extension '${extension}' is not supported (url: '${url}')`);
    }

    return {
        encryptedExt: extension,
        ...decryptedExtensionInfo,
    };
}

function getDecryptedUrl(url: string): string
{
    const { encryptedExt, ext } = getDecryptedExtensionInfo(url);

    return url.slice(0, -encryptedExt.length) + ext;
}

const loadRpgMakerAsset = {
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        priority: PIXI.LoaderParserPriority.Normal,
    },
    name: 'loadRpgm',
    config: {
        decryptedProperty: Symbol('decrypted')
    },
    test(url)
    {
        return rpgAssetExtensions.has(getExtension(url));
    },
    async load(url, asset, loader: Loader)
    {
        const response = await PIXI.settings.ADAPTER.fetch(url);
        const buffer = await response.arrayBuffer();

        const { ext, mimeType, loadParser } = asset?.data?.decryptedFormat ?? getDecryptedExtensionInfo(url);
        const decryptedFormat = ext.slice(1);
        const decryptedAlias = getDecryptedUrl(url);
        const decryptedAssetUrl = createUrl(
            decrypt(new Uint8Array(buffer), asset?.data?.decryptionKey),
            mimeType
        );

        let decryptedAssetMetadata: ResolvedAsset | undefined = {};

        if (asset)
        {
            decryptedAssetMetadata = { ...asset.data };
            delete decryptedAssetMetadata.decryptionKey;
            delete decryptedAssetMetadata.decryptedFormat;
        }

        try
        {
            const decryptedAsset = await loader.load({
                alias: [decryptedAlias],
                src: decryptedAssetUrl,
                format: decryptedFormat,
                data: decryptedAssetMetadata,
                loadParser
            });

            if (this.config?.decryptedProperty)
            {
                decryptedAsset[this.config.decryptedProperty] = decryptedAssetUrl;
            }

            return decryptedAsset;
        }
        finally
        {
            URL.revokeObjectURL(decryptedAssetUrl);
        }
    },
    unload(asset, resolvedAsset, loader: Loader)
    {
        if (!this.config?.decryptedProperty)
        {
            return;
        }

        const decryptedAssetUrl = asset[this.config.decryptedProperty];

        if (decryptedAssetUrl)
        {
            loader.unload(decryptedAssetUrl).then(() => undefined);
        }
    }
} as LoaderParser<any, { decryptionKey: Uint8Array, decryptedFormat?: DecryptedFormat }, { decryptedProperty: symbol }>;

PIXI.extensions.add(loadRpgMakerAsset);

export default loadRpgMakerAsset;

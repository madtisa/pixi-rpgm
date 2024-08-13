import * as PIXI from 'pixi.js';
import decrypt from './imageDecrypter';
import { createDataUrl, getExtension } from './utils';

import type { Loader, LoaderParser, ResolvedAsset } from 'pixi.js';
import {loadTextures} from "pixi.js";

type DecryptedFormat = {
    ext: string,
    loader?: string,
    mimeType?: string,
};
const rpgAssetExtensions = new Map<string, DecryptedFormat>([
    ['.rpgmvp', { ext: '.png', mimeType: 'image/png', loader: 'loadTextures' }],
    ['.rpgmvo', { ext: '.ogg', mimeType: 'audio/ogg', loader: 'sound' }],
    ['.rpgmvm', { ext: '.m4a', mimeType: 'audio/mp4', loader: 'sound' }],
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

const testPng = loadTextures.test;
loadTextures.test = function (url, resolvedAsset, loader) {
    return testPng.call(this, url, resolvedAsset, loader) || resolvedAsset.format === 'png';
}

const loadRpgMakerAsset = {
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        priority: 4,
    },
    name: 'loadRpgm',
    config: {
        decryptedProperty: Symbol('decryptedKey')
    },
    test(url)
    {
        return rpgAssetExtensions.has(getExtension(url));
    },
    async load(url, asset, loader: Loader)
    {
        const response = await PIXI.settings.ADAPTER.fetch(url);
        const buffer = await response.arrayBuffer();

        const { ext, mimeType } = asset?.data?.decryptedFormat ?? getDecryptedExtensionInfo(url);
        const decryptedFormat = ext.slice(1);
        const decryptedAlias = getDecryptedUrl(url);
        const decryptedAssetDataUrl = await createDataUrl(
            decrypt(new Uint8Array(buffer), asset?.data?.encryptionKey),
            mimeType
        );

        let decryptedAssetMetadata: ResolvedAsset | undefined = {};

        if (asset)
        {
            decryptedAssetMetadata = { ...asset.data };
            delete decryptedAssetMetadata.encryptionKey;
            delete decryptedAssetMetadata.decryptedFormat;
            // asset.alias = [decryptedAlias];
            // asset.src = decryptedAssetDataUrl;
            // asset.format = decryptedFormat;
            //
            // delete asset.data?.encryptionKey;
            // delete asset.data?.decryptedFormat;
        }

        const decryptedAsset = await loader.load({
            alias: [decryptedAlias],
            src: decryptedAssetDataUrl,
            format: decryptedFormat,
            data: decryptedAssetMetadata,
        });

        decryptedAsset[this.config?.decryptedProperty] = decryptedAssetDataUrl;

        return decryptedAsset;
    },
    unload(asset, resolvedAsset, loader: Loader)
    {
        const decryptedAssetUrl = asset[this.config?.decryptedProperty];

        if (decryptedAssetUrl)
        {
            loader.unload(decryptedAssetUrl)
                .then(() => console.log('Unloaded: ', asset))
                .catch((e) => console.error(e));
        }
    }
} as LoaderParser<any, { encryptionKey: Uint8Array, decryptedFormat?: DecryptedFormat }, {decryptedProperty: symbol}>;

PIXI.extensions.add(loadRpgMakerAsset);

export default loadRpgMakerAsset;

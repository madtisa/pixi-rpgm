import * as PIXI from 'pixi.js';

import type { ITypedArray } from 'pixi.js';

export function getExtension(url: string): string
{
    const tempURL = url.split('?')[0];

    return PIXI.utils.path.extname(tempURL).toLowerCase();
}

export function createUrl(arrayBuffer: ArrayBuffer | ITypedArray, type?: string): string
{
    const options = type ? { type } : undefined;
    const blob = new Blob([arrayBuffer], options);

    return URL.createObjectURL(blob);
}

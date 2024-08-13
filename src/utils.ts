import * as PIXI from 'pixi.js';

import type { ITypedArray } from 'pixi.js';

export function getExtension(url: string): string
{
    const tempURL = url.split('?')[0];

    return PIXI.utils.path.extname(tempURL).toLowerCase();
}

export function createDataUrl(arrayBuffer: ArrayBuffer | ITypedArray, type?: string): Promise<string>
{
    const options = type ? { type } : undefined;
    const blob = new Blob([arrayBuffer], options);

    return new Promise<string>((resolve, reject) =>
    {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);

        reader.readAsDataURL(blob);
    });
}

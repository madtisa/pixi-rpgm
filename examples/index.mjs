import * as PIXI from 'pixi.js';
import '../lib/index.mjs';

/** @type {PIXI.Application<HTMLCanvasElement>} */
const app = new PIXI.Application({ backgroundAlpha: 0, width: 400, height: 400 });

document.body.appendChild(app.view);

(async () =>
{
    const decryptionKey = new Uint8Array([
        0x3B, 0x7A, 0x20, 0x1A, 0x3E, 0x37, 0x9F, 0xD9, 0xA7, 0xCF, 0x96, 0x9A, 0xE6, 0xA4, 0x98, 0x1D
    ]);
    const data = {
        decryptionKey,
        decryptedFormat: {
            ext: '.apng',
            mimeType: 'image/apng'
        }
    };

    const catSprite = await PIXI.Assets.load({ src: './assets/cat.rpgmvp', data });

    app.stage.addChild(catSprite);
    catSprite.play();
})();

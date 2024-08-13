# PixiJS RPGM

Adds loader to PixiJS that decrypts RPG Maker assets.

Supported formats:

| Input    | Output    |
|----------|-----------|
| `rpgmvp` | `png`     |
| `rpgmvo` | `ogg`[^1] |
| `rpgmvm` | `m4a`[^1] |

[^1]: Requires `pixi/sound` to load decrypted `ogg` or `m4a` assets.

# Compatibility

| PixiJS | PixiJS RPGM |
|--------|-------------|
| v7.x   | v1.x        |

## Installation

```bash
npm install pixi-rpgm
```

## Usage

For png:
```js
import 'pixi-rpgm';

const pngTexture = await PIXI.Assets.load({
    src: './png.rpgmvp',
    data: {
        encryptionKey: new Uint8Array(/* ... */)
    }
});
stage.addChild(new PIXI.Sprite(pngTexture));
```

For apng:
```js
import 'pixi-apng';
import 'pixi-rpgm';

const animatedPng = await PIXI.Assets.load({
    src: './apng.rpgmvp',
    data: {
        encryptionKey: new Uint8Array(/* ... */),
        decryptedFormat: {
            ext: '.apng',
            mimeType: 'image/apng'
        }
    }
});
stage.addChild(animatedPng);
```

## Building

Install all dependencies by simply running the following.

```bash
npm install
```

Build by running the following:

```bash
npm run build
```

## Demo

To open demo page run:

```bash
npm run demo
```

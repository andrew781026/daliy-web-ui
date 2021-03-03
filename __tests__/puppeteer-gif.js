// 參考資料 : https://gist.github.com/bambooom/e6b0faaf2eeec11a80952a0c48b5decf
const fs = require('fs');
const puppeteer = require('puppeteer');

const GIFEncoder = require('gifencoder');
const PNG = require('png-js');

function decode(png) {
    return new Promise(r => {
        png.decode(pixels => r(pixels))
    });
}

async function gifAddFrame(page, encoder) {
    const pngBuffer = await page.screenshot({clip: {width: 1024, height: 768, x: 0, y: 0}});
    const png = new PNG(pngBuffer);
    await decode(png).then(pixels => encoder.addFrame(pixels));
}

const makeGif = async (url, output = 'test.gif') => {

    const browser = await puppeteer.launch({headless: true, slowMo: 0,});

    const page = await browser.newPage();
    page.setViewport({width: 1024, height: 768});
    await page.goto(url, {waitUntil: ['networkidle0']});

    // record gif
    var encoder = new GIFEncoder(1024, 768);
    encoder.createWriteStream()
        .pipe(fs.createWriteStream(output));

    // setting gif encoder
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(150);
    encoder.setQuality(10); // default

    for (let i = 0; i < 10; i++) {
        await gifAddFrame(page, encoder);
    }

    // finish encoder, test.gif saved
    encoder.finish();

    await browser.close();
};

(async () => {

    const urls = [
        'https://andrew781026.github.io/daliy-web-ui/glass-morphism-user-card/index.html',
        'https://andrew781026.github.io/daliy-web-ui/rotating-image-gallery/index.html',
        'https://andrew781026.github.io/daliy-web-ui/energy-button-hover-effect/index.html',
        'https://andrew781026.github.io/daliy-web-ui/clip-path-button-hover-effects/index.html',
        'https://andrew781026.github.io/daliy-web-ui/custom-radio-button/index.html',
        'https://andrew781026.github.io/daliy-web-ui/liquid-loader-animation-effects/index.html',
        'https://andrew781026.github.io/daliy-web-ui/background-animation-effects/index.html',
        'https://andrew781026.github.io/daliy-web-ui/background-animation-effects/second.html',
        'https://andrew781026.github.io/daliy-web-ui/shiny-glass/index.html',
        'https://andrew781026.github.io/daliy-web-ui/fontAwesome-icon-background-animation-effects/index.html',
        'https://andrew781026.github.io/daliy-web-ui/loading-animate/index.html',
        'https://andrew781026.github.io/daliy-web-ui/analog-clock/index.html',
        'https://andrew781026.github.io/daliy-web-ui/circular-progress-bar/index.html',
        'https://andrew781026.github.io/daliy-web-ui/bubbly-background-animation/index.html',
        'https://andrew781026.github.io/daliy-web-ui/neon-light-text/index.html',
        'https://andrew781026.github.io/daliy-web-ui/animated-heart/index.html',
        'https://andrew781026.github.io/daliy-web-ui/scroll-effect/airplane/index.html',
        'https://andrew781026.github.io/daliy-web-ui/text-animate/first.html',
        'https://andrew781026.github.io/daliy-web-ui/text-animate/second.html',
        'https://andrew781026.github.io/daliy-web-ui/scroll-effect/clip-path/index.html',
        'https://andrew781026.github.io/daliy-web-ui/image-filper/index.html',
    ];

    for (const url of urls) {

        await makeGif(url, `test-${index}.gif`);
    }

})();

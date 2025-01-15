// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    let fgIndex = 0;

    for (let y = 0; y < fgImg.height; y++) {
        for (let x = 0; x < fgImg.width; x++, fgIndex += 4) {
            const bgX = fgPos.x + x;
            const bgY = fgPos.y + y;
            const bgIndex = (bgY * bgImg.width + bgX) * 4;

            const fgA = fgImg.data[fgIndex + 3] * fgOpac;
            const alpha = fgA / 255;
            const invAlpha = 1 - alpha;

            for (let rgbIndex = 0; rgbIndex < 3; rgbIndex++) {
                bgImg.data[bgIndex + rgbIndex] =
                    fgImg.data[fgIndex + rgbIndex] * alpha +
                    bgImg.data[bgIndex + rgbIndex] * invAlpha;
            }

            bgImg.data[bgIndex + 3] = fgA + bgImg.data[bgIndex + 3] * invAlpha;
        }
    }
}

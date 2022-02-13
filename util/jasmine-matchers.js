const pixelmatch = require('pixelmatch'),
    path = require('path'),
    process = require('process'),
    fs = require('fs'),
    pngjs = require('pngjs').PNG,
    getCallingPath = require('./get-calling-path');

function getImageMatch(actual, expected) {
    const actualImg = pngjs.sync.read(fs.readFileSync(actual)),
        expectedImg = pngjs.sync.read(fs.readFileSync(expected));

    if (actualImg.width !== expectedImg.width || actualImg.height !== expectedImg.height) {
        throw new Error('Test image and emulator image sizes did not match! Cannot compare! Images should be 256x240 pngs.');
    }

    const numDiff = pixelmatch(actualImg.data, expectedImg.data, null, actualImg.width, actualImg.height);

    return (1 - (numDiff / (actualImg.width * actualImg.height))) * 100;
}

//This class exists entirely for documentation reasons.
/**
 * @alias JasmineMatchers
 * @classdesc
 * Adds matchers to the jasmine object, allowing images to be compared to other images.
 */
class NesTestJasmineMatchers {

    /**
     * Compares an image generated by the emulator with another image you provide. This will succeed if at least
     * 80% of the pixels in the old image match the new one. 
     * @param {String} actual The path to the image generated by the emulator. (This is what goes in expect())
     * @param {String} expected  The path to the image on your system to compare with. (This is what goes in.toBeSimilarToImage())
     * @returns Success if the images are at least 80% similar, otherwise failure and an error message.
     * @example
     * <caption>Compares two images, to verify whether they are at least 80% similar.</caption>
     *  // Take a screenshot of the intro screen
     *  const testImage = await emulator.takeScreenshot('intro-screen.png');
     * 
     *  // Do a comparison that they're similar (at least 80% the same)
     *  expect(testImage).toBeSimilarToImage('./data/intro-screenshot.png');
     */
    static toBeSimilarToImage(actual, expected) {}

    /**
     * Compares an image generated by the emulator with another image you provide. This will succeed only if
     * every pixel in the image matches.
     * @param {String} actual The path to the image generated by the emulator. (This is what goes in expect())
     * @param {String} expected  The path to the image on your system to compare with. (This is what goes in.toBeSimilarToImage())
     * @returns Success if all pixels match, otherwse failure.
     * @example
     * <caption>Compares two images, to verify whether they are at least 80% similar.</caption>
     *  // Take a screenshot of the intro screen
     *  const testImage = await emulator.takeScreenshot('intro-screen.png');
     * 
     *  // Do a comparison that shows that all pixels match.
     *  expect(testImage).toBeIdenticalToImage('./data/intro-screenshot.png');
     */

    static toBeIdenticalToImage(actual, expected) {}
}


beforeAll(() => {

    jasmine.addMatchers({
        toBeSimilarToImage: function(matchersUtil) {
            return {
                compare: function(actual, expected) {
                    const realCwd = getCallingPath(2);
                    const resNumber = getImageMatch(actual, path.join(realCwd, expected));

                    if (resNumber >= 80) {
                        return {
                            pass: true
                        };
                    } else {
                        return {
                            pass: false,
                            message: "Expected 80% of pixels to be the same, actual percentage was " + resNumber + "%"
                        }
                    }
                }
            }
        },
        toBeIdenticalToImage: function(matchersUtil) {
            return {
                compare: function(actual, expected) {
                    const realCwd = getCallingPath(2);
                    const resNumber = getImageMatch(actual, path.join(realCwd, expected));

                    if (resNumber === 100) {
                        return {
                            pass: true
                        };
                    } else {
                        return {
                            pass: false,
                            message: "Expected an exact image match, however the real match was " + resNumber + "%"
                        }
                    }
                }
            }
        }
    })
});
const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");

const url = "https://www.nasa.gov/multimedia/imagegallery/iotd.html";

let start = async () => {
  console.log("started");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  page.waitForNavigation("#main-content");
  const images = await getImages(page);
  await downloadImages(images)
};

let getImages = async (page) => {
  console.log("getting images");
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".image img"), ({ src, alt }) => [
      { src: src, alt: alt },
    ])
  );
};

let downloadImages = async (images) => {
  console.log("downloading images");
  images.forEach((image, index) => {
    let img = image[0];
    let extension = img.src.substring(img.src.lastIndexOf("."), img.src.length);
    let name = img.alt.substring(img.alt, 10);

    return new Promise((resolve, reject) => {
      https.get(img.src, (res) => {
        if (res.statusCode == 200) {
          res
            .pipe(fs.createWriteStream(`./imgs/${name}.${extension}`))
            .on("error", reject)
            .on("close", () => {
              resolve(`./imgs/${name}.${extension}}`);
              console.log(`downloaded image ${index}`);
            });
        } else {
          res.resume();
          reject(new Error(`failed with: ${res.statusCode}`));
        }
      });
    });
  });
};

start();
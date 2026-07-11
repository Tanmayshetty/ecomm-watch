import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import Table from 'cli-table'
dotenv.config();
const pool = new Pool({
  ssl: {
    rejectUnauthorized: false
  }
});
const todaysProduct = new Table({
  head: ['Link', 'Current Price', 'Price Notify']
  , colWidths: [300, 50, 50]
});
// const lenvoLoggedIn = false;
// const lenovologin = async (page, url) => {
//   if (!lenvoLoggedIn && url.includes("lenovo.com")) {
//     const loginURL = "https://account.lenovo.com/in/en/account/login/index.html";
//     await page.goto(loginURL.trim());
//     await page.content({ waitUntil: 'domcontentloaded' });
//     const emailLoginAddressText = ".email_input_text"
//     await page.type(emailLoginAddressText, process.env.LENOVO_USER_EMAIL);
//     await sleep(1000);
//     await page.keyboard.press('Enter');
//     await page.locator('.button_emailContinue').click({ force: true, clickCount: 2 });
//     await page.content({ waitUntil: 'domcontentloaded' });
//     await sleep(55000);
//     const passwordField = ".signIn_input_text"
//     await page.type(passwordField, process.env.LENOVO_USER_PASSWORD);
//     lenvoLoggedIn = true
//   }
// }
// Read or create db.json
const defaultData = { products: [], flipkarLinksToWatch: [] };
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const { rows: productResults } = await pool.query(
  'select url,type,price_notify as priceNotify,product_id as productId,sold_out as soldOut from products '
);
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function getResult(contentDiv, shopCheerioLoad, url) {
  let result = null;
  let soldOutResult = null;
  if (url.includes('flipkart')) {
    result = contentDiv
      .filter((e) => {
        const $element = shopCheerioLoad(e);
        const elementText = $element.text().trim();
        // if (e.type === 'text' &&
        //   elementText.startsWith('₹') &&
        //   !elementText.includes('month')
        // ) {
        //   console.log("All Attr : ", $element.parent().attr())
        //   console.log("Element Text ", elementText)
        // }

        return (
          e.type === 'text' &&
          elementText.startsWith('₹') &&
          !elementText.includes('month') &&
          !elementText.includes('Bank') &&
          $element.parent().attr('font') === 'default-fk-font-m' &&
          $element.parent().attr('style').includes('rgb(51, 51, 51)') &&
          !$element.parent().attr('style').includes('line-through')
        );
      })
      .map((e) => shopCheerioLoad(e).text().trim());
    soldOutResult = [shopCheerioLoad(contentDiv).find('.r-1iln25a').text().trim().includes('Notify')]
  } else if (url.includes("lenovo.com")) {
    result = [shopCheerioLoad('.price-title').text()];
    soldOutResult = []
  }
  else if (url.includes("thesleepcompany.in")) {
    result = [shopCheerioLoad('.dev_variant_price').text()]
    soldOutResult = []
  }
  else {
    result = ['₹' + shopCheerioLoad('#apex_desktop .a-price-whole').first().text()];
    soldOutResult = shopCheerioLoad('#apex_desktop')
      .text()
      .includes('Unavailable')
      ? [{}]
      : [];
  }
  console.log("---------")
  console.log('URL : ', url);
  // console.log('Sold Out :', soldOutResult);
  return { result, soldOutResult };
}
const browser = await puppeteer.launch({ headless: false, args: ["--disable-notifications"] });
let linkIndexCount = 0;
const browserCloseHandler = async (linkIndexCount, browser) => {
  try {
    if (linkIndexCount === productResults.length) {
      await browser.close();
      if (todaysProduct.length > 0)
        console.log(todaysProduct.toString());
    }
  } catch (err) {
    console.error('Error during close ', err);
  }
};
const page = await browser.newPage();
while (linkIndexCount < productResults.length) {
  const {
    url,
    pricenotify: priceNotify,
    productid: productId,
    soldout: soldOut,
  } = productResults[linkIndexCount];
  // await lenovologin(page, url);
  // if (!url.includes("lenovo")) {
  //   linkIndexCount += 1;
  //   continue;
  // }
  await page.goto(url.trim());
  try {
    if (url.includes('amazon')) {
      await page.click('text/Continue shopping');
      await sleep(5000);
    }
    else if (url.includes('lenovo')) {
      await sleep(5000)
    }
    else {
      await sleep(2000)
    }
  } catch (e) { }
  await sleep(100);
  const flipkartHTML = await page.content({ waitUntil: 'domcontentloaded' });

  const shopCheerioLoad = cheerio.load(flipkartHTML);
  const contentDiv = [...shopCheerioLoad('div').contents()];
  const { result, soldOutResult } = await getResult(
    contentDiv,
    shopCheerioLoad,
    url
  );
  if (!result[0] || soldOutResult[0]) {
    if (soldOutResult[0]) {
      await pool.query({
        text: 'update products set sold_out=true where product_id=$1',
        values: [productId],
      });
    }
    linkIndexCount += 1;
    await browserCloseHandler(linkIndexCount, browser);
    continue;
  } else if (soldOut) {
    await pool.query({
      text: 'update products set sold_out=false where product_id=$1',
      values: [productId],
    });
  }
  const price = parseInt(result[0].split('₹')[1].replace(',', ''));
  if (Number.isNaN(price)) {
    linkIndexCount += 1
    await pool.query({
      text: 'update products set sold_out=false where product_id=$1',
      values: [productId],
    });
    await browserCloseHandler(linkIndexCount, browser);
    continue
  }
  let { rows: productsUpdate } = await pool.query({
    text: `select * from products INNER JOIN history ON products.product_id=history.product_id
   where products.url=$1 and history.date=$2`,
    values: [url, new Date()],
  });
  const shouldNotify = price < priceNotify;
  if (productsUpdate.length === 0) {
    console.log('Price : ', price);
    await pool.query({
      text: 'insert into history (product_id,price,date,should_notify) values ($1,$2,$3,$4)',
      values: [productId, price, new Date(), shouldNotify],
    });
  }
  if (shouldNotify) {
    todaysProduct.push([url, price, priceNotify])
  }
  await sleep(1000);
  linkIndexCount += 1;
  await browserCloseHandler(linkIndexCount, browser);
}

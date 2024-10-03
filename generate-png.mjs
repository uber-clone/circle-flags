import sharp from "sharp";
import { countriesPhoneCodes } from "./countries-phone-codes.mjs";

function waitForPromises(promises, onPromiseCompleted) {
  let done = 0;
  onPromiseCompleted(0);

  for (const promise of promises) {
    promise.then(() => {
      onPromiseCompleted(++done);
    });
  }

  return Promise.all(promises);
}

const conversions = [];

console.log("Starting image conversions");

for (const countryPhoneCode of countriesPhoneCodes) {
  const countryCode = countryPhoneCode.iso.toLowerCase();

  conversions.push(
    sharp(`${import.meta.dirname}/flags/${countryCode}.svg`)
      .png()
      .resize({
        width: 64,
        height: 64,
      })
      .toFile(`${import.meta.dirname}/flags/png/${countryCode}.png`)
  );
}

await waitForPromises(conversions, (index) => {
  console.log(`Completed ${index}/${conversions.length}`);
});
console.log("Done");

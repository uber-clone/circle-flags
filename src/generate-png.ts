import sharp from "sharp";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { countriesPhoneCodes } from "./countries-phone-codes.js";

const flagsSvgDir = `${import.meta.dirname}/../flags`;
const flagsPngDir = `${flagsSvgDir}/png`;
const flagsIndex = `${import.meta.dirname}/../images.js`;
const flagsIndexTypes = `${import.meta.dirname}/../images.d.ts`;

function waitForPromises<T>(
  promises: Promise<T>[],
  onPromiseCompleted: (index: number) => void
) {
  let done = 0;
  onPromiseCompleted(0);

  for (const promise of promises) {
    promise.then(() => {
      onPromiseCompleted(++done);
    });
  }

  return Promise.all(promises);
}

// Reset png dir
rmSync(flagsPngDir, { recursive: true, force: true });
mkdirSync(flagsPngDir);

const conversions = [];

console.log("Starting image conversions");

for (const countryPhoneCode of countriesPhoneCodes) {
  const countryCode = countryPhoneCode.iso.toLowerCase();

  conversions.push(
    sharp(`${flagsSvgDir}/${countryCode}.svg`)
      .png()
      .resize({
        width: 64,
        height: 64,
      })
      .toFile(`${flagsPngDir}/${countryCode}.png`)
  );
}

await waitForPromises(conversions, (index) => {
  console.log(`Completed ${index}/${conversions.length}`);
});

let generatedFileContent = "";

for (const countryPhoneCode of countriesPhoneCodes) {
  const iso = countryPhoneCode.iso.toLowerCase();
  generatedFileContent += `export { default as ${iso}Flag } from "./flags/png/${iso}.png";\n`;
}

writeFileSync(flagsIndex, generatedFileContent);

generatedFileContent = "";

for (const countryPhoneCode of countriesPhoneCodes) {
  const iso = countryPhoneCode.iso.toLowerCase();
  generatedFileContent += `declare const ${iso}Flag: number;\n`;
}

generatedFileContent += `export { ${countriesPhoneCodes
  .map((countryPhoneCode) => countryPhoneCode.iso.toLowerCase() + "Flag")
  .join(", ")} };`;

writeFileSync(flagsIndexTypes, generatedFileContent);

console.log("Done");

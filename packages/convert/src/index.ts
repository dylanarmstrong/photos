#!/usr/bin/env node
// Takes .44 per size on c6i-2xlarge
import { readdir } from 'node:fs/promises';
import { cpus } from 'node:os';
import path from 'node:path';
import pLimit from 'p-limit';
import sharp from 'sharp';

const { argv } = process;
if (argv.length < 3) {
  // eslint-disable-next-line no-console
  console.error('Usage: /path/to/script.js /path/to/photos');
  process.exit(1);
}

const numberCpus = cpus().length;
const availableCpus = Math.max(1, numberCpus - 1);
const concurrencyPerFormat = Math.max(1, Math.floor(availableCpus / 3));
// eslint-disable-next-line no-console
console.log(
  `System has ${numberCpus} CPUs, using ${availableCpus} (${concurrencyPerFormat} per format)`,
);

const limitJpeg = pLimit(concurrencyPerFormat);
const limitWebp = pLimit(concurrencyPerFormat);
const limitAvif = pLimit(concurrencyPerFormat);

const requested = [320, 640, 960, 1280, 2560];

const folder = argv[2];
const files = await readdir(folder, { recursive: true });

// Filter files once - only include files that match pattern
const photoFiles = files.filter((file) =>
  /^(?!.*_w\d+.*$).*\.(jpeg|png)/.test(file),
);

const getBase = (pathName: string): [string, string] => {
  const baseFolder = path.dirname(pathName);
  const baseFile = path.basename(pathName).replace(/\.[^./]+$/, '');
  return [baseFolder, baseFile];
};

const hasFile = (baseFolder: string, outputFile: string) =>
  files.includes(
    path.join(baseFolder.split(path.sep).at(-1) || `.${path.sep}`, outputFile),
  ) || files.includes(outputFile);

// Check which conversions actually need to be done
const conversionsNeeded: Array<{
  file: string;
  width: number;
  format: 'avif' | 'webp' | 'jpeg';
}> = [];
for (const file of photoFiles) {
  const pathName = path.join(folder, file);
  const [baseFolder, baseFile] = getBase(pathName);

  for (const width of requested) {
    if (!hasFile(baseFolder, `${baseFile}_w${width}.avif`)) {
      conversionsNeeded.push({ file, format: 'avif', width });
    }
    if (!hasFile(baseFolder, `${baseFile}_w${width}.webp`)) {
      conversionsNeeded.push({ file, format: 'webp', width });
    }
    if (!hasFile(baseFolder, `${baseFile}_w${width}.jpeg`)) {
      conversionsNeeded.push({ file, format: 'jpeg', width });
    }
  }
}

// Statistics tracking
let conversionsCompleted = 0;
const totalPossibleConversions = photoFiles.length * requested.length * 3; // All possible conversions
const conversionsAlreadyDone =
  totalPossibleConversions - conversionsNeeded.length; // Already completed
const totalConversions = conversionsNeeded.length;
const startTime = Date.now();

const avif = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.avif`;
    await sharp(pathName)
      .resize({
        fit: sharp.fit.inside,
        width,
        withoutEnlargement: true,
      })
      .avif({
        effort: 4,
        quality: 50,
      })
      .toFile(path.join(baseFolder, outputFile));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  } finally {
    conversionsCompleted += 1;
  }
};

const webp = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.webp`;
    await sharp(pathName)
      .resize({
        fit: sharp.fit.inside,
        width,
        withoutEnlargement: true,
      })
      .webp({
        effort: 4,
        preset: 'photo',
        quality: 80,
      })
      .toFile(path.join(baseFolder, outputFile));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  } finally {
    conversionsCompleted += 1;
  }
};

const jpeg = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.jpeg`;
    await sharp(pathName)
      .resize({
        fit: sharp.fit.inside,
        width,
        withoutEnlargement: true,
      })
      .jpeg({ mozjpeg: true, quality: 80 })
      .toFile(path.join(baseFolder, outputFile));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  } finally {
    conversionsCompleted += 1;
  }
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h${minutes}m`;
  }
  return `${minutes}m`;
};

const updateStats = () => {
  const elapsed = (Date.now() - startTime) / 1000;
  const conversionsPerSecond = elapsed > 0 ? conversionsCompleted / elapsed : 0;
  const actualCompleted = conversionsAlreadyDone + conversionsCompleted;
  const percentComplete = (
    (actualCompleted / totalPossibleConversions) *
    100
  ).toFixed(1);

  const remainingConversions = totalConversions - conversionsCompleted;
  const estimatedSecondsRemaining =
    conversionsPerSecond > 0 ? remainingConversions / conversionsPerSecond : 0;
  const eta = formatTime(estimatedSecondsRemaining);

  const status = `Progress: ${actualCompleted}/${totalPossibleConversions} (${percentComplete}%) | ${conversionsPerSecond.toFixed(2)} conv/sec | ETA: ${eta}`;

  // Clear the line and write the status
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(status);
};

const statsInterval = setInterval(updateStats, 1000);

// eslint-disable-next-line no-console
console.log(
  `Found ${photoFiles.length} photos, ${totalConversions} conversions needed`,
);

// Process all needed conversions
for (const conversion of conversionsNeeded) {
  const pathName = path.join(folder, conversion.file);

  switch (conversion.format) {
    case 'avif': {
      limitAvif(() => avif(pathName, conversion.width));
      break;
    }
    case 'webp': {
      limitWebp(() => webp(pathName, conversion.width));
      break;
    }
    case 'jpeg': {
      limitJpeg(() => jpeg(pathName, conversion.width));
      break;
    }
    default: {
      break;
    }
  }
}

// Wait for all conversions to complete by checking the queue
while (conversionsCompleted < totalConversions) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

// Clear the stats interval and show final stats
clearInterval(statsInterval);
updateStats();
// eslint-disable-next-line no-console
console.log('\n\nConversion complete!');

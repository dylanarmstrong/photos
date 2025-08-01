#!/usr/bin/env node
// Takes .44 per size on c6i-2xlarge
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import sharp from 'sharp';

const { argv } = process;
if (argv.length < 3) {
  // eslint-disable-next-line no-console
  console.error('Usage: /path/to/script.js /path/to/photos');
  process.exit(1);
}

sharp.queue.on('change', (length) => {
  // eslint-disable-next-line no-console
  console.log(`Queue contains ${length} tasks`);
});

const limitJpeg = pLimit(100);
const limitWebp = pLimit(100);
const limitAvif = pLimit(100);

const requested = [320, 640, 960, 1280, 2560];

const folder = argv[2];
const files = await readdir(folder, { recursive: true });

const getBase = (pathName: string): [string, string] => {
  const baseFolder = path.dirname(pathName);
  const baseFile = path.basename(pathName).replace(/\.[^./]+$/, '');
  return [baseFolder, baseFile];
};

const hasFile = (baseFolder: string, outputFile: string) =>
  files.includes(
    path.join(baseFolder.split(path.sep).at(-1) || `.${path.sep}`, outputFile),
  ) || files.includes(outputFile);

const avif = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.avif`;
    if (!hasFile(baseFolder, outputFile)) {
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
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  }
};

const webp = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.webp`;
    if (!hasFile(baseFolder, outputFile)) {
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
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  }
};

const jpeg = async (pathName: string, width: number) => {
  const [baseFolder, baseFile] = getBase(pathName);
  try {
    const outputFile = `${baseFile}_w${width}.jpeg`;
    if (!hasFile(baseFolder, outputFile)) {
      await sharp(pathName)
        .resize({
          fit: sharp.fit.inside,
          width,
          withoutEnlargement: true,
        })
        .jpeg({ mozjpeg: true, quality: 80 })
        .toFile(path.join(baseFolder, outputFile));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      baseFolder,
      baseFile,
      width,
      (error as Error)?.message || 'Unknown Error',
    );
  }
};

const convertFile = async (pathName: string) => {
  for (let index = 0, { length } = requested; index < length; index += 1) {
    const width = requested[index];
    limitAvif(() => avif(pathName, width));
    limitJpeg(() => jpeg(pathName, width));
    limitWebp(() => webp(pathName, width));
  }
};

for (const file of files) {
  if (/^(?!.*_w\d+.*$).*\.(jpeg|png)/.test(file)) {
    // eslint-disable-next-line no-console
    console.log('Convert', file);
    const pathName = path.join(folder, file);
    convertFile(pathName);
  }
}

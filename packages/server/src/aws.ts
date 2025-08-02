import {
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  S3Client,
  type _Object,
} from '@aws-sdk/client-s3';

import { R2_BUCKET, R2_ENDPOINT, R2_SECRET, R2_TOKEN } from './constants.js';
import { filterUndefined } from './utilities.js';

import type { GetObjects } from './types.js';

const s3 = new S3Client({
  credentials: {
    accessKeyId: R2_TOKEN,
    secretAccessKey: R2_SECRET,
  },
  endpoint: R2_ENDPOINT,
  region: 'auto',
});

const photoMap = ({ Key, Size }: _Object): string | undefined => {
  // Gather all valid images by finding 320 sized thumbnails
  if (Size && Size > 0 && Key && Key.endsWith('_w320.jpeg')) {
    // Return without the suffix of the Key
    return Key.replace('_w320.jpeg', '');
  }

  return undefined;
};

const viewAlbum = async (albumName: string) => {
  const getObjects = async (ContinuationToken?: string): Promise<GetObjects> =>
    new Promise((resolve) => {
      const listCallback = (data: ListObjectsV2CommandOutput) => {
        const { Contents, IsTruncated, NextContinuationToken } = data;
        if (Contents === undefined) {
          resolve({
            IsTruncated: false,
            NextContinuationToken: undefined,
            photos: [],
          });
          return;
        }

        const photos: string[] = Contents.map(
          (Content) => photoMap(Content),
          // eslint-disable-next-line unicorn/no-array-callback-reference
        ).filter(filterUndefined);

        resolve({
          IsTruncated: IsTruncated || false,
          NextContinuationToken: NextContinuationToken || undefined,
          photos,
        });
      };

      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        ContinuationToken,
        Delimiter: '/',
        Prefix: `${encodeURIComponent(albumName)}/`,
      });

      s3.send(command).then(listCallback);
    });

  const photos = [];
  let data = await getObjects();
  photos.push(data.photos);
  while (data.IsTruncated) {
    data = await getObjects(data.NextContinuationToken);
    photos.push(data.photos);
  }
  return photos.flat();
};

export { viewAlbum };

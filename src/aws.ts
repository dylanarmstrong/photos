import {
  ListObjectsV2Command,
  S3Client,
  type ListObjectsV2CommandOutput,
  type _Object,
} from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

import {
  AWS_IDENTITY_POOL_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
} from './constants.js';

import type { GetObjects } from './@types/index.js';

const s3 = new S3Client({
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: AWS_REGION },
    identityPoolId: AWS_IDENTITY_POOL_ID,
  }),
  region: AWS_REGION,
});

const photoMap = ({ Key, Size }: _Object): string | undefined => {
  // Only list full size images, and not thumbnails
  if (Size && Size > 0 && Key && /(?!.*_thumb.*)^.*\.jpeg$/i.test(Key)) {
    return Key;
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

        const photos: string[] = Contents.map((Content) =>
          photoMap(Content),
        ).filter((k): k is string => typeof k === 'string');

        resolve({
          IsTruncated: IsTruncated || false,
          NextContinuationToken: NextContinuationToken || undefined,
          photos,
        });
      };

      const command = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET,
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

import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import type { ListObjectsV2CommandOutput, _Object } from '@aws-sdk/client-s3';

import type { GetObjects } from './@types';

const { Bucket = '', IdentityPoolId = '', region = '' } = process.env;

const s3 = new S3Client({
  credentials: fromCognitoIdentityPool({
    clientConfig: { region },
    identityPoolId: IdentityPoolId,
  }),
  region,
});

const photoMap = (value: _Object) => {
  const { Key, Size } = value;
  if (Size === 0 || !Key) {
    return null;
  }

  // Only list full size images, and not thumbnails
  if (Key.match(/(?!.*_thumb.*)^.*\.jpeg$/i)) {
    return Key;
  }

  return null;
};

const filterNullKey = (k: string | null): k is string => typeof k === 'string';

const viewAlbum = async (albumName: string) => {
  const getObjects = async (ContinuationToken?: string): Promise<GetObjects> =>
    new Promise((resolve) => {
      const listCb = (data: ListObjectsV2CommandOutput) => {
        const { Contents, IsTruncated, NextContinuationToken } = data;
        if (typeof Contents === 'undefined') {
          resolve({
            IsTruncated: false,
            NextContinuationToken: undefined,
            photos: [],
          });
          return;
        }

        const photos: string[] = Contents.map(photoMap).filter(filterNullKey);

        resolve({
          IsTruncated: IsTruncated || false,
          NextContinuationToken: NextContinuationToken || undefined,
          photos,
        });
      };

      const command = new ListObjectsV2Command({
        Bucket,
        ContinuationToken,
        Delimiter: '/',
        Prefix: `${encodeURIComponent(albumName)}/`,
      });
      s3.send(command).then(listCb);
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

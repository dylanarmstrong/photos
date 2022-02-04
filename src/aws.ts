import AWS from 'aws-sdk';
import type { AWSError, S3 } from 'aws-sdk';

import type { GetObjects } from './@types';

const {
  Bucket = '',
  IdentityPoolId = '',
} = process.env;

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
  }),
  region: process.env.region,
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket },
});

const photoMap = (value: S3.Object & Partial<{ Key: string; Size: number }>) => {
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
  const getObjects = async (ContinuationToken?: string): Promise<GetObjects> => new Promise(
    (resolve) => {
      const listCb = (err: AWSError, data: S3.Types.ListObjectsV2Output) => {
        const { Contents, IsTruncated, NextContinuationToken } = data;
        if (err || typeof Contents === 'undefined') {
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

      s3.listObjectsV2({
        Bucket,
        ContinuationToken,
        Delimiter: '/',
        Prefix: `${encodeURIComponent(albumName)}/`,
      }, listCb);
    },
  );

  const photos = [];
  let data = await getObjects();
  photos.push(data.photos);
  while (data.IsTruncated) {
    data = await getObjects(data.NextContinuationToken);
    photos.push(data.photos);
  }
  return photos.flat();
};

export {
  viewAlbum,
};

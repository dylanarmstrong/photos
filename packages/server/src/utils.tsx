import { renderToString } from 'react-dom/server';

import type { Request, Response } from 'express';

import { Album } from './pages/album.js';
import { Details } from './pages/details.js';
import { Home } from './pages/home.js';
import { Status } from './pages/status.js';

import type { RenderOptions } from './@types/index.js';

const getIp = (request: Request) => {
  try {
    return String(
      request.headers['x-forwarded-for'] || request.socket.remoteAddress,
    ).split(',')[0];
  } catch {
    return 'Error';
  }
};

const getDate = () => new Date().toLocaleString().replace(',', '');

const log = (request: Request, message: string) => {
  // eslint-disable-next-line no-console
  console.log(`[${getDate()}] [${getIp(request)}] ${message}`);
};

const sendStatus = (response: Response, status: number) => {
  const html = renderToString(<Status status={String(status)} />);
  response.status(status).send(
    `<!DOCTYPE html>
    ${html}`,
  );
};

const render = (
  response: Response,
  page: 'album' | 'details' | 'home',
  properties: RenderOptions,
) => {
  const html = ['<!DOCTYPE html>'];
  switch (page) {
    case 'album': {
      html.push(
        renderToString(
          <Album
            album={properties.album}
            datas={properties.datas}
            nextPage={String((properties?.page || 0) + 1)}
            page={properties.page}
            pages={properties.pages}
            prevPage={String((properties?.page || 0) - 1)}
          />,
        ),
      );
      break;
    }

    case 'details': {
      html.push(
        renderToString(
          <Details
            data={properties.data}
            nextPage={
              properties.nextPage === undefined
                ? undefined
                : String(properties.nextPage)
            }
            prevPage={
              properties.prevPage === undefined
                ? undefined
                : String(properties.prevPage)
            }
            prevUrl={properties.prevUrl}
          />,
        ),
      );
      break;
    }

    case 'home': {
      html.push(renderToString(<Home albums={properties.albums} />));
      break;
    }
  }

  response.send(html.join('\n'));
};

export { log, render, sendStatus };

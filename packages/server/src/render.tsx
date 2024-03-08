import { renderToString } from 'react-dom/server';

import type { Response } from 'express';

import { Album } from './pages/album/index.js';
import { Details } from './pages/details/index.js';
import { Home } from './pages/home/index.js';
import { Status } from './pages/status.js';

import type { RenderOptions } from './@types/index.js';

const sendStatus = (response: Response, status: number) => {
  const html = renderToString(<Status status={String(status)} />);
  response.status(status).send(
    `<!DOCTYPE html>
    ${html}`,
  );
};

const render = (response: Response, options: RenderOptions) => {
  const html = ['<!DOCTYPE html>'];
  const { page, properties } = options;
  switch (page) {
    case 'album': {
      html.push(
        renderToString(
          <Album
            album={properties.album}
            nextPage={String(properties.page + 1)}
            page={properties.page}
            pages={properties.pages}
            prevPage={String(properties.page - 1)}
          />,
        ),
      );
      break;
    }

    case 'details': {
      html.push(
        renderToString(
          <Details
            nextPage={
              properties.nextPage === undefined
                ? undefined
                : String(properties.nextPage)
            }
            photo={properties.photo}
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

    default: {
      html.push(renderToString(<Home albums={properties.albums} />));
      break;
    }
  }

  response.send(html.join('\n'));
};

export { render, sendStatus };

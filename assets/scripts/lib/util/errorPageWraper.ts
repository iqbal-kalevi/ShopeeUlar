import { assetManager } from 'cc';
export async function showErrorPage() {
  const game = document.getElementById('Cocos3dGameContainer');
  if (game) {
    game.style.display = 'none';
  }

  const errDiv = document.getElementById('error-page-hole');
  if (errDiv) {
    errDiv.style.display = 'block';
  }

  // @ts-ignore
  const errorPage: any = await import('../errorPage/errorPage.js');
  errorPage.default.openErrorPage();
}

export function checkErrorDOM() {
  const content = document.getElementById('GameDiv');

  let div = document.getElementById('error-page-hole');
  if (!div) {
    div = document.createElement('div');
    div.id = 'error-page-hole';
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.zIndex = '100';
    div.style.display = 'none';
    div.style.fontFamily = `'Roboto', sans-serif`;

    if (content) {
      content.appendChild(div);
    } else {
      document.body.prepend(div);
    }
  }
}

export async function loadErrorPageBundle(onLoaded?: () => void) {
  const bundleName = 'errorPage';

  new Promise<void>((resolve, reject) => {
    const resolveAndLoad = () => {
      console.log('Error Page loaded');
      checkErrorDOM();
      resolve();
      onLoaded?.();
    };

    if (assetManager.getBundle(bundleName)) {
      resolveAndLoad();
    } else {
      assetManager.loadBundle(bundleName, (err) => {
        if (err) {
          reject(err);
        } else {
          resolveAndLoad();
        }
      });
    }
  });
}

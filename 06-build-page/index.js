const fs = require('fs');
const { mkdir, rm, readdir } = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');

const appHtml = 'template.html';
const appComp = 'components';
const appAssetsFolder = '/assets/';
const appCssFolder = '/styles/';

const bundleDir = '/project-dist/';
const bundleCss = 'style.css';
const bundleHtml = 'index.html';
const bundleDirPath = path.join(__dirname, bundleDir);
const bundleCssPath = path.join(bundleDirPath, bundleCss);
const bundleHtmlPath = path.join(bundleDirPath, bundleHtml);

let outputCss;

try {
  (async () => {
    await rm(bundleDirPath, { recursive: true, force: true }, (error) => {
      if(error) throw error;
    });
    await mkdir(bundleDirPath, { recursive: true, force: true }, (error) => {
      if (error) throw error;
    })
    outputCss = await writeStream(bundleCssPath);
    await createBundleHtml(appHtml, appComp);
    await mergeStyles(appCssFolder);
    await copyDirectory(appAssetsFolder, bundleDir+appAssetsFolder);
  })()
} catch (error) {
  console.error(error);
}

function writeStream(bundleCssPath) {
  return fs.createWriteStream(bundleCssPath, 'utf-8');
}

async function createBundleHtml(appHtml, appComp) {
  const outputHtml = await writeStream(bundleHtmlPath);
  const appHtmlPath = path.join(__dirname, appHtml);
  const appCompPath = path.join(__dirname, appComp);
  const template = fs.createReadStream(appHtmlPath, 'utf-8');
  const components =  await readdir(appCompPath);
  const compMax = components.length - 1;
  let data = '';
  template.on('data', chunk => data += chunk);
  template.on('end', () =>  {
    components .forEach((comp, index) => {
      const compInfo = comp.split('.');
      let nameComp = compInfo[0];
      const compPath = path.join(appCompPath, comp);
      const compHtml = fs.createReadStream(compPath, 'utf-8');
      const replaceName = `{{${nameComp}}}`;
      let dataComp = '';
      compHtml.on('data', chankComp => dataComp += chankComp);
      compHtml.on('end', () => {
        data = data.replaceAll(replaceName, dataComp);
        if (compMax === index) {
          outputHtml.write(data);
        }
      })
    })
  })
}

async function mergeStyles(dir) {
  const directory = path.join(__dirname, dir);
  const files = await readdir(directory, { withFileTypes: true });
  let filePath;
  files.forEach(file => {
    if (!file.isDirectory()){
      const ext = file.name.split('.')[1];
      if (ext === 'css') {
        filePath = path.join(directory, file.name);
        const input = fs.createReadStream(filePath);
        input.on('data', chank => outputCss.write(chank));
      }
    } else {
      dir = path.join(dir, file.name);
      mergeStyles(dir);
    }
  })
}

async function copyDirectory(dir, dirCopy) {
  const directoryPath = path.join(__dirname, dir);
  const directoryPathCopy = path.join(__dirname, dirCopy);
  const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });

  await mkdir(directoryPathCopy, { recursive: true, force: true }, (error) => {
    if (error) throw error;
  })

  files.forEach( async file => {
    if (!file.isDirectory()) {
      const filePath = path.join(directoryPath, file.name);
      const filePathCopy = path.join(directoryPathCopy, file.name);
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(filePathCopy, 'utf-8');
      pipeline(
        readStream,
        writeStream,
        error => { if (error) console.error(error.message) }
      )
    } else {
      let dirR = path.join(dir, file.name);
      let dirCopyR = path.join(dirCopy, file.name);
      copyDirectory(dirR, dirCopyR);
    }
  })
}
const fs = require('fs');
const path = require('path');
const { stdout, stdin } = require('process');
const pathFile = path.join(__dirname, 'text.txt');

process.on('SIGINT', () => process.exit());
process.on('exit', () => stdout.write('The script has finished its work. Goodbye!'));
stdin.on('error', error => err(error));

stdout.write('Hi! Please, enter text ...\n');

let writeStream = fs.createWriteStream(pathFile, 'utf-8')
writeStream.on('error', error => err(error));

stdin.on('data', data => {

  let dataString = data.toString();
  if (dataString.trim() === 'exit') process.exit();
  writeStream.write(dataString);
});

function err(error) {
  console.error(error.message);
}
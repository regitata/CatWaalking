/**
 * CatWalking download archive: Google Apps Script web app.
 * Every time a visitor downloads "My Cat's Gang", the website sends a landscape JPEG here,
 * and this script saves it into the Drive folder below. The number of files = number of downloads.
 *
 * Setup (once):
 * 1. Go to https://script.google.com, click "New project", delete the sample code, paste this file.
 * 2. Click Deploy > New deployment > gear icon > "Web app".
 *    Execute as: Me.   Who has access: Anyone.   Click Deploy and allow the permissions.
 * 3. Copy the "Web app URL" (ends with /exec) and put it in assets/js/data.js as archiveUrl.
 */
const FOLDER_ID = '1IktASGcWRS7P5wNzMzdaQX8Cw13VEf2a';
const MAX_BYTES = 8 * 1024 * 1024;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.image || data.image.length > MAX_BYTES * 1.4) return out('too big');
    const bytes = Utilities.base64Decode(data.image);
    // only accept real JPEG files (they start with FF D8)
    if (bytes.length < 4 || (bytes[0] & 0xff) !== 0xff || (bytes[1] & 0xff) !== 0xd8) return out('not a jpeg');
    const stamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd_HH-mm-ss');
    const fmt = String(data.format || 'download').replace(/[^a-z]/gi, '').slice(0, 12);
    const name = 'cats-gang_' + stamp + '_' + fmt + '.jpg';
    DriveApp.getFolderById(FOLDER_ID).createFile(Utilities.newBlob(bytes, 'image/jpeg', name));
    return out('ok');
  } catch (err) {
    return out('error');
  }
}

function out(text) {
  return ContentService.createTextOutput(text);
}

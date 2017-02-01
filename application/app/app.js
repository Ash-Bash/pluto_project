const electron = require('electron');
const Datastore = require('nedb');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var db = new Datastore({ filename: 'app/database/app_pluto.db' });
db.loadDatabase(function (err) {    // Callback is optional
// Now commands will be executed
});

db = {};
db.feeds = new Datastore('app/database/app_feeds.db');
db.pins = new Datastore('app/database/app_pins.db');
db.favorites = new Datastore('app/database/app_favorites.db');
db.readlater = new Datastore('app/database/app_readlater.db');
db.history = new Datastore('app/database/app_history.db');

// You need to load each database (here we do it asynchronously)
db.feeds.loadDatabase();
db.pins.loadDatabase();
db.favorites.loadDatabase();
db.readlater.loadDatabase();
db.history.loadDatabase();



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768, frame: false})

  //limit width to 647

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/html/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  mainWindow.setMenuBarVisibility(false);
  //mainWindow.titleBarStyle = hidden;
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

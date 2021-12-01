const { app, BrowserWindow, globalShortcut } = require('electron');

function createWindow () {
  let win = new BrowserWindow({
    backgroundColor: '#373a40',
    minWidth:  1200,
    minHeight: 700,
    width:     1200,
    height:    700,
    frame:     false,
    hasShadow: true,
    icon:      __dirname + "/img/favicon-32x32.png",
    webPreferences: {
      nodeIntegration: true,
    }
  });
  win.loadFile('index.html');
  win.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then( function(){
  createWindow();
});

app.on('browser-window-focus', function () {
  globalShortcut.register("CommandOrControl+R", function () {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", function () {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});  // OS X

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

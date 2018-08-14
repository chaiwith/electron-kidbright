// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
// const kidbrightide = require('./kidbrightide');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const path = require('path');
const url = require('url');
const log = require('electron-log');
log.transports.console.level = 'info';
log.transports.file.level = 'info';
let mainWindow
var shuttingDown;

function startExpress() {

  // var env = JSON.parse(JSON.stringify(process.env));
  // log.info(env);
  console.log('__dirname: ' + __dirname);
  const exec = require('child_process').exec;
  webServer = exec('node ./kidbrightide', { cwd: __dirname}, () => {
      console.log('__dirname: ' + __dirname);
  });

  // Were we successful?
  if (!webServer) {
      log.info("couldn't start web server");
      return;
  }

  // Handle standard out data from the child process
  webServer.stdout.on('data', function(data) {
      log.info('data: ' + data);
  });

  // Triggered when a child process uses process.send() to send messages.
  webServer.on('message', function(message) {
      log.info(message);
  });

  // Handle closing of the child process
  webServer.on('close', function(code) {
      log.info('child process exited with code ' + code);
      // webServer = null;

      // Only restart if killed for a reason...
      // if (!shuttingDown) {
      //     log.info('restarting...');
      //     startExpress();
      // }
  });

  // Handle the stream for the child process stderr
  webServer.stderr.on('data', function(data) {
      log.info('stderr: ' + data);
  });

  // Occurs when:
  // The process could not be spawned, or
  // The process could not be killed, or
  // Sending a message to the child process failed.
  webServer.on('error', function(err) {
      log.info('web server error: ' + err);
  });
}

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1280, height: 720 })
  mainWindow.loadURL(url.format({
      pathname: 'localhost:8000',
      protocol: 'http:',
      slashes: true
  }));

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    shuttingDown = false;
    startExpress();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
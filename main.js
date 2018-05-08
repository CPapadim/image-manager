var formatters = require("./formatters.js");
var dockerode  = require('dockerode');

const { app, BrowserWindow, ipcMain } = require('electron');
//const generator = "hi"//require('animation-strip-generator');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 900, height: 480, minWidth:900, titleBarStyle: 'hidden' });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('did-finish-load');
    });
}

function refreshECRImages() {
    ipcMain.on('did-submit-ecr-form', (event, argument) => {
        const { ecr_img_filter } = argument;
        var image_html = formatters.showRepos(ecr_img_filter);
        event.sender.send('showEcrImageList', image_html);

    });
}

function refreshContainers() {
    ipcMain.on('did-submit-container-form', (event) => {
        var container_html;
        formatters.showContainers().then(function(result) { 
                                        container_html = result;
                                        //console.log(container_html);
                                        event.sender.send('showContainerList', container_html);
                                    });
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    refreshECRImages();
    refreshContainers();
});

app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

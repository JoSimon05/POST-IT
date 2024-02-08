
const { app, BrowserWindow, dialog, globalShortcut, ipcMain, Menu, Notification, nativeImage, nativeTheme, screen, shell, Tray } = require("electron")
const { autoUpdater } = require("electron-updater")
const { info, name } = require("./package.json")
const fs = require("fs")
const path = require("path")


// about paths
const dataFile = "data.json"
const dataFolder = ".database"
const appFolder = path.join(app.getPath("appData"), name)

const dataFilePath = path.join(appFolder, dataFolder, dataFile)
const dataFilePathDev = path.join(__dirname, dataFolder, dataFile)

const dataFolderPath = path.join(appFolder, dataFolder)
const dataFolderPathDev = path.join(__dirname, dataFolder)

const checkDataFilePath = app.isPackaged ? dataFilePath : dataFilePathDev
const checkDataFolderPath = app.isPackaged ? dataFolderPath : dataFolderPathDev



// FUNCTION: check if all necessary files and folders exist in ".../AppData/Roaming/"
function checkDataFile() {

    const appFolderExists = fs.existsSync(appFolder)
    const dataFolderExists = fs.existsSync(checkDataFolderPath)
    const dataFileExists = fs.existsSync(checkDataFilePath)

    if (app.isPackaged && !appFolderExists) fs.mkdirSync(appFolder)

    if (!dataFolderExists) {

        if (!app.isPackaged) console.log(`'${dataFolder}' folder no longer exists`)

        fs.mkdirSync(checkDataFolderPath)

        if (!app.isPackaged) console.log(`'${dataFolder}' folder restored`)
    }

    if (!dataFileExists) {

        if (!app.isPackaged) console.log(`'${dataFile}' file no longer exists`)
        
        const emptyDataArray = {
            "firstLaunch": true,
            "autoLaunch": true,
            "notesArray": []
        }
    
        const emptyDataArrayString = JSON.stringify(emptyDataArray, null, 4)
        
        fs.writeFileSync(checkDataFilePath, emptyDataArrayString)
    
        if (!app.isPackaged) console.log(`'${dataFile}' file restored`)
    }
}

checkDataFile() // check if all necessary files and folders exist in ".../AppData/Roaming/"


const appName = info.displayName
const data = JSON.parse(fs.readFileSync(checkDataFilePath))

// about icons
const updateIconLow = nativeImage.createFromPath(path.join(__dirname, "icons", "update_icon_low.ico"))
const updateIconHigh = nativeImage.createFromPath(path.join(__dirname, "icons", "update_icon_high.ico"))
const inputIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "input_icon.ico"))
const noteIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon.ico"))
const noteIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon_white.ico")).resize({ width: 12, height: 12 })
const noteIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon_black.ico")).resize({ width: 12, height: 12 })
const helpIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "help_icon.ico"))

// about colors
const colorsArray = ["orange", "yellow", "green", "blue", "violet", "pink"]
let colorIndex = 1   // default color (yellow)

// about color icons
const orangeIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "orange.ico")).resize({ width: 14, height: 14 })
const yellowIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "yellow.ico")).resize({ width: 14, height: 14 })
const greenIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "green.ico")).resize({ width: 14, height: 14 })
const blueIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "blue.ico")).resize({ width: 14, height: 14 })
const violetIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "violet.ico")).resize({ width: 14, height: 14 })
const pinkIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "pink.ico")).resize({ width: 14, height: 14 })

// about shortcuts
const inputShoutcut = "ALT+N"
const inputMenuShortcut = "SHIFT+F10"
const inputColorShortcut = "ALT+C"
const helpShortcut = "ALT+H"
const visibilityShortcut = "ALT+V"
const trayMenuShortcut = "SHIFT+ALT+N"

// about windows
let inputWin
let noteWin
let helpWin

// about menus
let tray
let trayMenu
let areVisible = true
let someNotes = data.notesArray.length != 0 ? true : false

// about positions
let screenOrigin
let screenWidth
let screenHeight
let notePosX
let notePosY

// about notifications
let lauchNotif



// APP setup
app.setName(name)
app.setAppUserModelId(info.displayAppID)
app.setLoginItemSettings({
    openAtLogin: true,
    enabled: data.autoLaunch
})
app.setJumpList([]) // empty APP jumplist



// check if APP is already running
const instanceLock = app.requestSingleInstanceLock()

if(!instanceLock) {
    app.quit()
    
} else {
    
    app.on("second-instance", () => {
        showInputWindow()
    })
    
    
    app.whenReady().then(() => {

        screenOrigin = screen.getPrimaryDisplay().nativeOrigin
        screenWidth = screen.getPrimaryDisplay().size.width
        screenHeight = screen.getPrimaryDisplay().size.height


        // get TRAY menu
        trayMenu = Menu.buildFromTemplate([
            
            {
                label: `${appName} ${info.displayVersion}`,
                id: "titleWhiteID",
                enabled: false,
                icon: noteIconWhite,
                visible: nativeTheme.shouldUseDarkColors ? true : false
            },
            {
                label: `${appName} ${info.displayVersion}`,
                id: "titleBlackID",
                enabled: false,
                icon: noteIconBlack,
                visible: nativeTheme.shouldUseDarkColors ? false : true
            },
            
            { type: "separator" },

            {
                label: "Help?",
                accelerator: helpShortcut,
                click: () => openHelpWindow()
            },

            { type: "separator" },
            
            {
                label: "Open Input bar",
                accelerator: inputShoutcut,
                click: () => showInputWindow()
            },
            {
                label: "Visible Notes",
                id: "visibilityID",
                accelerator: visibilityShortcut,
                type: "checkbox",
                checked: someNotes && areVisible,
                enabled: someNotes,
                click: () => switchVisibility()
            },

            { type: "separator" },

            {
                label: "More options...",
                submenu: [
                    {
                        label: "Check for updates...",
                        id: "checkUpdateID",
                        click: () => app.isPackaged ? checkForUpdatesFromMenu() : console.log("no updates")
                    },
                    {
                        label: "Install update!",
                        id: "downloadUpdateID",
                        visible: false,
                        click: () => app.isPackaged ? confirmUpdate() : console.log("no updates")
                    },
                    {
                        label: "Run on startup",
                        id: "autoLaunchID",
                        type: "checkbox",
                        click: () => switchAutoLaunch()
                    },

                    { type: "separator" },

                    {
                        label: "Clear all",
                        id: "clearAllID",
                        enabled: someNotes,
                        click: () => clearAllNotes()
                    },
                ]
            },
            {
                label: "Quit",
                role: "quit",
            }
        ])

        // get INPUTWINDOW menu
        const inputMenu = Menu.buildFromTemplate([
            
            {
                label: "Color...",
                id: "colorSubmenuID",
                accelerator: inputColorShortcut,
                submenu: [
                    { label: "Orange", type: "radio", icon: orangeIcon, click: () => colorIndex = 0 },
                    { label: "Yellow", type: "radio", checked: true, icon: yellowIcon, click: () => colorIndex = 1 },   // default color
                    { label: "Green", type: "radio", icon: greenIcon, click: () => colorIndex = 2 },
                    { label: "Blue", type: "radio", icon: blueIcon, click: () => colorIndex = 3 },
                    { label: "Violet", type: "radio", icon: violetIcon, click: () => colorIndex = 4 },
                    { label: "Pink", type: "radio", icon: pinkIcon, click: () => colorIndex = 5 }
                ]
            },

            { type: "separator" },
            
            {
                label: "Emoji",
                accelerator: "META+.",
                click: () => (app.isEmojiPanelSupported()) ? app.showEmojiPanel() : null
            },

            { type: "separator" },

            {
                label: "Cut",
                role: "cut",
                accelerator: "CTRL+X"
            },
            {
                label: "Copy",
                role: "copy",
                accelerator: "CTRL+C"
            },
            {
                label: "Paste",
                role: "paste",
                accelerator: "CTRL+V"
            },
            
            { type: "separator" },
            
            {
                label: "Select all",
                role: "selectAll",
                accelerator: "CTRL+A"
            }
        ])



        // change TITLE icon theme (in tray menu)
        nativeTheme.on("updated", () => {

            if (nativeTheme.shouldUseDarkColors) {
                trayMenu.getMenuItemById("titleWhiteID").visible = true
                trayMenu.getMenuItemById("titleBlackID").visible = false
                
            } else {
                trayMenu.getMenuItemById("titleWhiteID").visible = false
                trayMenu.getMenuItemById("titleBlackID").visible = true
            }
        })



        // TRAY setup
        tray = new Tray(noteIcon)
        tray.setToolTip(appName)

        tray.on("click", () => {
            trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
            tray.popUpContextMenu(trayMenu)
        })

        tray.on("right-click", () => {
            trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
            tray.popUpContextMenu(trayMenu)
        })



        // load INPUTWINDOW
        inputWin = getInputWindow()    
        inputWin.loadFile("src/input/input.html")

        // close INPUTWINDOW when not focused
        inputWin.on("blur", () => {
            inputWin.hide()
        })

        // popup INPUTWINDOW menu
        inputWin.webContents.on("context-menu", () => {
            inputMenu.popup()
        })

        // prevent INPUTWINDOW system menu
        //! BUG: Electron fix update needed
        ////inputWin.on("system-context-menu", (event) => {
        ////    event.preventDefault()
        ////})
        //! TEMPORARY SOLUTION:
        const WM_INITMENU = 0x0116;
        inputWin.hookWindowMessage(WM_INITMENU, () => {

            inputWin.setEnabled(false)
            inputWin.setEnabled(true)
        })
        

        
        // SHORTCUT: show INPUTWINDOW
        globalShortcut.register(inputShoutcut, () => {
            showInputWindow()
        })

        // SHORTCUT: open INPUT menu
        globalShortcut.register(inputMenuShortcut, () => {

            if (inputWin && inputWin.isVisible()) {
                inputMenu.popup({
                    x: screenOrigin.x,
                    y: screenOrigin.y
                })
            }
        })

        // SHORTCUT: open INPUT submenu (color)
        globalShortcut.register(inputColorShortcut, () => {

            if (inputWin && inputWin.isVisible()) {
                inputMenu.getMenuItemById("colorSubmenuID").submenu.popup({
                    x: screenOrigin.x,
                    y: screenOrigin.y
                })
            }
        })

        // SHORTCUT: open HELPWINDOW
        globalShortcut.register(helpShortcut, () => {
            openHelpWindow()
        })

        // SHORTCUT: prevent default window closing event
        globalShortcut.register("CTRL+W", () => {
            
            if (inputWin && inputWin.isVisible()) {
                inputWin.hide()
            }
            
            if (helpWin && helpWin.isFocused()) {
                helpWin.close()
            }
        })

        // SHORTCUT: switch NOTEWINDOWs visibility
        globalShortcut.register(visibilityShortcut, () => {
            switchVisibility()
        })

        // SHORTCUT: open TRAY menu
        globalShortcut.register(trayMenuShortcut, () => {
            tray.popUpContextMenu(trayMenu, { x: screenWidth, y: screenHeight })
        })



        // get launch NOTIFICATION
        lauchNotif = new Notification({
            icon: noteIcon,
            title: `${appName} is running!`,
            body: `Press ${inputShoutcut} to create a Note`,
            silent: true
        })

        // show launch NOTIFICATION
        if (Notification.isSupported()) {

            lauchNotif.show()

            lauchNotif.on("close", () => lauchNotif.close())
            lauchNotif.on("click", () => lauchNotif.close())
        }


        
        // restore unclosed NOTEWINDOWs
        if (data.notesArray.length != 0) {

            data.notesArray.forEach(noteToRestore => {

                const restoredID = noteToRestore.id
                const restoredText = noteToRestore.text
                const restoredColor = noteToRestore.index
                const restoredX = noteToRestore.x
                const restoredY = noteToRestore.y

                noteToRestore = getNoteWindow()
                noteToRestore.loadFile("src/note/note.html")

                noteToRestore.setPosition(restoredX, restoredY)

                const updatedID = noteToRestore.id - 1

                noteToRestore.on("ready-to-show", () => {

                    noteToRestore.webContents.send("displayNote", { id: updatedID, text: restoredText, colorIndex: restoredColor })
                    noteToRestore.show()

                    const noteIndex = data.notesArray.findIndex(n => n.id === restoredID)

                    data.notesArray[noteIndex].id = updatedID

                    const updatedData = JSON.stringify(data, null, 4)
                    fs.writeFileSync(checkDataFilePath, updatedData)
                })

                // update all restored NOTEWINDOWs position (x, y)
                noteToRestore.on("moved", () => {

                    data.notesArray.forEach(note => {

                        const noteFromId = BrowserWindow.fromId(note.id + 1)
                        const [updatedPosX, updatedPosY] = noteFromId.getPosition()

                        if (noteFromId) {

                            const noteIndex = data.notesArray.findIndex(n => n.id === note.id)

                            data.notesArray[noteIndex].x = updatedPosX
                            data.notesArray[noteIndex].y = updatedPosY

                            const updatedData = JSON.stringify(data, null, 4)
                            fs.writeFileSync(checkDataFilePath, updatedData)
                        }
                    })
                })

                // prevent NOTEWINDOW system menu
                //! BUG: Electron fix update needed
                ////noteWin.on("system-context-menu", (event) => {
                ////    event.preventDefault()
                ////})
                //! TEMPORARY SOLUTION:
                const WM_INITMENU = 0x0116;
                noteToRestore.hookWindowMessage(WM_INITMENU, () => {

                    data.notesArray.forEach(note => {

                        const noteFromId = BrowserWindow.fromId(note.id + 1)

                        noteFromId.setEnabled(false)
                        noteFromId.setEnabled(true)
                    })
                })
            })

            // update TRAY
            tray.setToolTip(`${appName} (${data.notesArray.length})`)
        }


        // open HELPWINDOW on first launch
        if (data.firstLaunch) {
            
            openHelpWindow()

            data.firstLaunch = false

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)
        }



        // log DETAILS
        console.log(
            `auto-launch: ${data.autoLaunch}`,
            `\ndark-theme: ${nativeTheme.shouldUseDarkColors}`,
            `\nrestored-notes: ${data.notesArray.length}`
        )



        // auto-check for updates (don't run in dev mode)
        if (app.isPackaged) {
            
            autoUpdater.autoDownload = false
            autoUpdater.autoInstallOnAppQuit = false

            autoUpdater.checkForUpdates()

            autoUpdater.on("update-available", () => {

                tray.setImage(updateIconLow)
                tray.setToolTip("Update available!")

                autoUpdater.downloadUpdate()
            })

            autoUpdater.on("update-downloaded", (info) => {

                trayMenu.getMenuItemById("checkUpdateID").visible = false
                trayMenu.getMenuItemById("downloadUpdateID").visible = true
                tray.setContextMenu(trayMenu)

                dialog.showMessageBox({
                    icon: updateIconHigh,
                    message: `New update available! (${info.version})`,
                    buttons: ["Install", "Later..."],
                    noLink: true,
                    defaultId: 0,
                    cancelId: 1

                }).then(message => {

                    if (message.response !== 0) {

                        const updateHelpNotif = new Notification({
                            icon: updateIconHigh,
                            title: "Update is still available!",
                            body: 'Click on "Install update!" (in tray menu)\nto proceed with the installation',
                            silent: true
                        })

                        if (Notification.isSupported()) {

                            updateHelpNotif.show()

                            updateHelpNotif.on("close", () => updateHelpNotif.close())
                            updateHelpNotif.on("click", () => updateHelpNotif.close())
                        }
                    }

                    if (message.response === 0) confirmUpdate()
                })
            })

            autoUpdater.on("error", (error) => {
                dialog.showErrorBox(`${appName} UPDATER ERROR`, error)
            })
        }



        // FUNCTION: open HELPWINDOW
        function openHelpWindow() {

            if (!helpWin || helpWin.isDestroyed()) {

                helpWin = getHelpWindow()
                helpWin.loadFile("src/help/help.html")
    
                helpWin.on("ready-to-show", () => helpWin.show())
    
    
                // prevent HELPWINDOW system menu
                //! BUG: Electron fix update needed
                ////helpWin.on("system-context-menu", (event) => {
                ////    event.preventDefault()
                ////})
                //! TEMPORARY SOLUTION:
                const WM_INITMENU = 0x0116;
                helpWin.hookWindowMessage(WM_INITMENU, () => {
    
                    helpWin.setEnabled(false)
                    helpWin.setEnabled(true)
                })

            } else helpWin.focus()
        }


        // FUNCTION: switch NOTEWINDOWs visibility
        function switchVisibility() {

            if (data.notesArray.length != 0) {

                if (areVisible) {
                    
                    // hide all NOTEWINDOWs
                    data.notesArray.forEach(note => {
                        
                        const noteFromId = BrowserWindow.fromId(note.id + 1)
                        
                        if (noteFromId) noteFromId.hide()
                    })
                    
                    // update TRAY's menu
                    trayMenu.getMenuItemById("visibilityID").checked = false
                    tray.setContextMenu(trayMenu)
                    
                    areVisible = false

                } else {
                    
                    // show all NOTEWINDOWs
                    data.notesArray.forEach(note => {
                        
                        const noteFromId = BrowserWindow.fromId(note.id + 1)
                        
                        if (noteFromId) noteFromId.show()
                    })
                    
                    // update TRAY menu
                    trayMenu.getMenuItemById("visibilityID").checked = true
                    tray.setContextMenu(trayMenu)
                    
                    areVisible = true
                }
            }
        }


        // FUNCTION: switch AUTOLAUNCH
        function switchAutoLaunch() {

            if (data.autoLaunch) {

                data.autoLaunch = false

                const updatedData = JSON.stringify(data, null, 4)
                fs.writeFileSync(checkDataFilePath, updatedData)

                app.setLoginItemSettings({
                    openAtLogin: true,
                    enabled: false,
                })

            } else {

                data.autoLaunch = true

                const updatedData = JSON.stringify(data, null, 4)
                fs.writeFileSync(checkDataFilePath, updatedData)

                app.setLoginItemSettings({
                    openAtLogin: true,
                    enabled: true,
                })
            }
        }


        // FUNCTION: close all NOTEWINDOWs
        function clearAllNotes() {

            data.notesArray.forEach(note => {

                const noteFromId = BrowserWindow.fromId(note.id + 1)

                if (noteFromId) noteFromId.close()
            })

            data.notesArray = []

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)


            // update TRAY
            tray.setToolTip(appName)

            // update TRAY menu
            trayMenu.getMenuItemById("visibilityID").enabled = false
            trayMenu.getMenuItemById("visibilityID").checked = false
            trayMenu.getMenuItemById("clearAllID").enabled = false
            tray.setContextMenu(trayMenu)
        }


        // FUNCTION: check for updates (from tray menu)
        function checkForUpdatesFromMenu() {

            autoUpdater.checkForUpdates()

            autoUpdater.on("update-not-available", (info) => {

                const noUpdateNotif = new Notification({
                    icon: noteIcon,
                    title: `${appName} is up-to-date!`,
                    body: `You're running the latest version (${info.version})`,
                    silent: true
                })

                if (Notification.isSupported()) {

                    noUpdateNotif.show()

                    noUpdateNotif.on("close", () => noUpdateNotif.close())
                    noUpdateNotif.on("click", () => noUpdateNotif.close())
                }
            })
        }


        // FUNCTION: confirm update installation
        function confirmUpdate() {

            dialog.showMessageBox({
                icon: updateIconHigh,
                message: "Do you want to proceed with the installation?",
                buttons: ["Yes", "No"],
                noLink: true,
                defaultId: 0,
                cancelId: 1

            }).then(result => {

                if (result.response === 0) {

                    data.firstLaunch = true

                    const updatedData = JSON.stringify(data, null, 4)
                    fs.writeFileSync(checkDataFilePath, updatedData)

                    autoUpdater.quitAndInstall()
                }
            })
        }
        
    })   // end of "app.whenReady()" event


    // check and set AUTOLAUNCH before app quit
    app.on("before-quit", () => {

        data.autoLaunch = app.getLoginItemSettings().launchItems[0].enabled
        
        const updatedData = JSON.stringify(data, null, 4)
        fs.writeFileSync(checkDataFilePath, updatedData)

        globalShortcut.unregisterAll()
    })



    // FUNCTION: build INPUTWINDOW
    function getInputWindow() {

        const inputWindow = new BrowserWindow({

            icon: inputIcon,

            width: 500,
            height: 60,

            center: true,

            frame: false,
            thickFrame: false,
            opacity: 1,

            fullscreenable: false,
            resizable: false,
            focusable: true,

            alwaysOnTop: true,
            show: false,
            skipTaskbar: false,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        
        return inputWindow
    }


    // FUNCTION: build NOTEWINDOW
    function getNoteWindow() {

        // random NOTEWINDOW spawn
        notePosX = Math.floor(Math.random() * (screenWidth - 200))
        notePosY = Math.floor(Math.random() * (screenHeight - 200))

        const noteWindow = new BrowserWindow({

            icon: noteIcon,

            width: 200,
            height: 200,

            x: notePosX,
            y: notePosY,

            frame: false,
            thickFrame: false,
            transparent: true,

            fullscreenable: false,
            resizable: false,
            focusable: false,

            alwaysOnTop: true,
            show: false,
            skipTaskbar: true,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })

        return noteWindow
    }


    // FUNCTION: build HELPWINDOW
    function getHelpWindow() {

        const helpWindow = new BrowserWindow({

            icon: helpIcon,

            width: 400,
            height: 400,

            center: true,

            frame: false,
            thickFrame: false,
            transparent: true,

            fullscreenable: false,
            resizable: false,
            focusable: true,

            alwaysOnTop: true,
            show: false,
            skipTaskbar: false,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        return helpWindow
    }


    // FUNCTION: show INPUTWIN
    function showInputWindow() {

        if (!inputWin.isDestroyed()) {

            if (inputWin.isVisible()) {
                inputWin.hide()
                inputWin.webContents.send("clearInput")

            } else {
                inputWin.show()
            }

        } else {

            // reload INPUTWINDOW if destroyed
            inputWin = getInputWindow()
            inputWin.loadFile("src/input/input.html")

            inputWin.on("ready-to-show", () => {
                inputWin.show()
            })  
        }
    }



    // IPC: create NOTEWINDOW
    ipcMain.on("createNote", (event, noteText) => {

        if (data.notesArray.length == 10) {
            inputWin.webContents.send("clearInput")   // prevent lag
            inputWin.webContents.send("tooManyNotes", noteText)

        } else {

            inputWin.hide()
            inputWin.webContents.send("clearInput")

            // load NOTEWINDOW
            noteWin = getNoteWindow()
            noteWin.loadFile("src/note/note.html")

            noteWin.setPosition(notePosX, notePosY)

            noteWin.on("ready-to-show", () => {

                noteWin.webContents.send("displayNote", { id: noteWin.id - 1, text: noteText, colorIndex: colorIndex })   // only NOTEWINDOWs IDs
                noteWin.show()

                // save NOTEWINDOW data
                const noteData = {
                    id: noteWin.id - 1,
                    text: noteText,
                    color: colorsArray[colorIndex],
                    index: colorIndex,
                    x: notePosX,
                    y: notePosY
                }

                data.notesArray.push(noteData)

                const updatedData = JSON.stringify(data, null, 4)
                fs.writeFileSync(checkDataFilePath, updatedData)
                
                
                // update TRAY
                tray.setToolTip(`${appName} (${data.notesArray.length})`)
            })


            // update all NOTEWINDOWs position (x, y)
            noteWin.on("moved", () => {

                data.notesArray.forEach(note => {

                    const noteFromId = BrowserWindow.fromId(note.id + 1)
                    const [updatedPosX, updatedPosY] = noteFromId.getPosition()

                    if (noteFromId) {

                        const noteIndex = data.notesArray.findIndex(n => n.id === note.id)

                        data.notesArray[noteIndex].x = updatedPosX
                        data.notesArray[noteIndex].y = updatedPosY

                        const updatedData = JSON.stringify(data, null, 4)
                        fs.writeFileSync(checkDataFilePath, updatedData)
                    }
                })
            })


            // prevent NOTEWINDOW system menu
            //! BUG: Electron fix update needed
            ////noteWin.on("system-context-menu", (event) => {
            ////    event.preventDefault()
            ////})
            //! TEMPORARY SOLUTION (by community):
            const WM_INITMENU = 0x0116;
            noteWin.hookWindowMessage(WM_INITMENU, () => {

                data.notesArray.forEach(note => {

                    const noteFromId = BrowserWindow.fromId(note.id + 1)

                    noteFromId.setEnabled(false)
                    noteFromId.setEnabled(true)
                })
            })


            // show all hidden NOTEWINDOWs
            data.notesArray.forEach(note => {

                const noteFromId = BrowserWindow.fromId(note.id + 1)

                if (noteFromId) noteFromId.show()
            })


            // update TRAY menu
            trayMenu.getMenuItemById("visibilityID").enabled = true
            trayMenu.getMenuItemById("visibilityID").checked = true
            trayMenu.getMenuItemById("clearAllID").enabled = true
            tray.setContextMenu(trayMenu)

            areVisible = true
        }
    })


    // IPC: close INPUTWINDOW
    ipcMain.on("closeInput", () => {
        inputWin.hide()
        inputWin.webContents.send("clearInput")
    })


    // IPC: close NOTEWINDOW
    ipcMain.on("closeNote", (event, noteID) => {   // id -1

        const noteFromId = BrowserWindow.fromId(noteID + 1)

        if (noteFromId) noteFromId.close()

        const noteIndex = data.notesArray.findIndex(n => n.id === noteID + 1 - 1)   // arrays start from 0!

        if (noteIndex !== -1) {

            data.notesArray.splice(noteIndex, 1)

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)
        }

        
        // update TRAY
        tray.setToolTip(`${appName}${data.notesArray.length != 0 ? ` (${data.notesArray.length})` : ""}`)
        
        // update TRAY menu
        if (data.notesArray.length == 0) {

            trayMenu.getMenuItemById("visibilityID").enabled = false
            trayMenu.getMenuItemById("visibilityID").checked = false
            trayMenu.getMenuItemById("clearAllID").enabled = false
            tray.setContextMenu(trayMenu)
        }
    })


    // IPC: close HELPWINDOW
    ipcMain.on("closeHelp", () => {
        helpWin.close()
    })


    // IPC: open LINK in browser
    ipcMain.on("openLink", (event, data) => {

        const noteFromId = BrowserWindow.fromId(data.id + 1)

        noteFromId.webContents.setWindowOpenHandler(details => {

            shell.openExternal(details.url)

            return { action: "deny" }
        })

        shell.openExternal(data.url)
    })


    // IPC: open LINK in browser (example)
    ipcMain.on("openExampleLink", (event, data) => {

        helpWin.webContents.setWindowOpenHandler(details => {

            shell.openExternal(details.url)

            return { action: "deny" }
        })

        shell.openExternal("https://example.com/post-it/help/open-link-example")
    })
}

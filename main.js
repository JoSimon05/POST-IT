
const { app, BrowserWindow, dialog, globalShortcut, ipcMain, Menu, Notification, nativeImage, nativeTheme, screen, shell, Tray } = require("electron")
const { autoUpdater } = require("electron-updater")
const { info, name, version } = require("./package.json")
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
            "lastColorIndex": 1,   // yellow (default on first launch)
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
const inputIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "input_icon.ico")).resize({ width: 24, height: 24 })
const noteIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon.ico"))
const noteIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon_white.ico")).resize({ width: 12, height: 12 })
const noteIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon_black.ico")).resize({ width: 12, height: 12 })
const helpIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "help_icon.ico")).resize({ width: 24, height: 24 })
const alertIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "alert_icon.ico"))

// about colors
const colorsArray = ["orange", "yellow", "green", "blue", "violet", "pink"]
let colorIndex = data.lastColorIndex

// about color icons
const orangeIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "orange.ico")).resize({ width: 14, height: 14 })
const yellowIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "yellow.ico")).resize({ width: 14, height: 14 })
const greenIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "green.ico")).resize({ width: 14, height: 14 })
const blueIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "blue.ico")).resize({ width: 14, height: 14 })
const violetIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "violet.ico")).resize({ width: 14, height: 14 })
const pinkIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "pink.ico")).resize({ width: 14, height: 14 })

// about shortcuts
const inputShoutcut = "ALT+N"
const inputMenuShortcut = "SHIFT+F10" // system default
const inputColorShortcut = "ALT+C"
const helpShortcut = "ALT+H"
const showShortcut = "ALT+V"
const pinShortcut = "ALT+P"
const trayMenuShortcut = "SHIFT+ALT+N"

// about windows
let inputWin
let noteWin
let helpWin

// about menus
let tray
let trayMenu
let inputMenu
let arePinned = false
let someNotes = data.notesArray.length != 0 ? true : false

// about positions
let screenOrigin
let screenWidth
let screenHeight
let notePosX
let notePosY



// APP setup
app.setName(name)
app.setAppUserModelId(info.displayAppID)
app.setLoginItemSettings({
    openAtLogin: true,
    enabled: data.autoLaunch
})
app.setJumpList([]) // empty APP jumplist



// check APP instance
const instanceLock = app.requestSingleInstanceLock()

if(!instanceLock) {
    app.quit()
    
} else {
    
    // execute if APP is already running
    app.on("second-instance", () => {
        showInputWindow()
    })
    
    
    // execute when APP is ready
    app.whenReady().then(() => {   // APP is ready!

        screenOrigin = screen.getPrimaryDisplay().nativeOrigin
        screenWidth = screen.getPrimaryDisplay().size.width
        screenHeight = screen.getPrimaryDisplay().size.height


        // build TRAY menu
        trayMenu = Menu.buildFromTemplate([
            
            {   // title (white icon)
                label: `${appName} ${info.displayVersion}`,
                id: "titleWhiteID",
                enabled: false,
                icon: noteIconWhite,
                visible: nativeTheme.shouldUseDarkColors ? true : false
            },
            {   // title (black icon)
                label: `${appName} ${info.displayVersion}`,
                id: "titleBlackID",
                enabled: false,
                icon: noteIconBlack,
                visible: nativeTheme.shouldUseDarkColors ? false : true
            },
            
            { type: "separator" },

            {   // show INPUT
                label: "Open Input bar",
                accelerator: inputShoutcut,
                click: () => showInputWindow()
            },

            {   // show HELP
                label: "Help?",
                accelerator: helpShortcut,
                click: () => showHelpWindow()
            },

            { type: "separator" },

            {   // move all NOTEs on top
                label: "Show Notes",
                id: "showNotesID",
                accelerator: showShortcut,
                enabled: someNotes && !arePinned,
                click: () => showAllNotes()
            },

            {   // pin all NOTEs
                label: "Pin Notes",
                id: "pinNotesID",
                accelerator: pinShortcut,
                enabled: someNotes,
                visible: arePinned ? false : true,
                click: () => pinAllNotes()
            },
            {   // unpin all NOTEs
                label: "Unpin Notes",
                id: "unpinNotesID",
                accelerator: pinShortcut,
                visible: false,
                click: () => unpinAllNotes()
            },

            { type: "separator" },

            {   // popup submenu for more options
                label: "More options...",
                submenu: [
                    {   // check for updates
                        label: "Check for updates...",
                        id: "checkUpdateID",
                        click: () => app.isPackaged ? checkForUpdatesFromMenu() : console.log("no updates")
                    },
                    {   // install update
                        label: "Install update!",
                        id: "downloadUpdateID",
                        visible: false,
                        click: () => app.isPackaged ? confirmUpdate() : console.log("no updates")
                    },
                    {   // choose if run on startup
                        label: "Run on startup",
                        id: "autoLaunchID",
                        type: "checkbox",
                        click: () => switchAutoLaunch()
                    },

                    { type: "separator" },

                    {   // delete all NOTEs
                        label: "Clear all",
                        id: "clearAllID",
                        enabled: someNotes,
                        click: () => clearAllNotes()
                    },
                ]
            },
            {   // quit APP
                label: "Quit",
                role: "quit",
            }
        ])

        // build INPUT menu
        inputMenu = Menu.buildFromTemplate([
            
            {   // open submenu for colors
                label: "Colors...",
                id: "colorSubmenuID",
                accelerator: inputColorShortcut,
                submenu: [
                    { label: "Orange", type: "radio", checked: colorIndex == 0 ? true : false, icon: orangeIcon, click: () => saveLastColor(0) },
                    { label: "Yellow", type: "radio", checked: colorIndex == 1 ? true : false, icon: yellowIcon, click: () => saveLastColor(1) },
                    { label: "Green", type: "radio", checked: colorIndex == 2 ? true : false, icon: greenIcon, click: () => saveLastColor(2) },
                    { label: "Blue", type: "radio", checked: colorIndex == 3 ? true : false, icon: blueIcon, click: () => saveLastColor(3) },
                    { label: "Violet", type: "radio", checked: colorIndex == 4 ? true : false, icon: violetIcon, click: () => saveLastColor(4) },
                    { label: "Pink", type: "radio", checked: colorIndex == 5 ? true : false, icon: pinkIcon, click: () => saveLastColor(5) }
                ]
            },

            { type: "separator" },
            
            {   // open emoji panel
                label: "Emoji",
                accelerator: "META+.",
                click: () => (app.isEmojiPanelSupported()) ? app.showEmojiPanel() : null
            },

            { type: "separator" },

            {   // cut text
                label: "Cut",
                role: "cut",
                accelerator: "CTRL+X"
            },
            {   // copy text
                label: "Copy",
                role: "copy",
                accelerator: "CTRL+C"
            },
            {   // paste text
                label: "Paste",
                role: "paste",
                accelerator: "CTRL+V"
            },
            
            { type: "separator" },
            
            {   // select all text
                label: "Select all",
                role: "selectAll",
                accelerator: "CTRL+A"
            }
        ])



        // switch TITLE icon theme (in tray menu)
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
            
            // check APP auto-launch changes (by system)
            trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
            tray.popUpContextMenu(trayMenu)
        })

        tray.on("right-click", () => {

            // check APP auto-launch changes (by system)
            trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
            tray.popUpContextMenu(trayMenu)
        })



        loadInputWindow() // load INPUT
        

        
        // SHORTCUT: show/hide INPUT
        globalShortcut.register(inputShoutcut, () => {
            showInputWindow()
        })

        // SHORTCUT: popup INPUT submenu (colors)
        globalShortcut.register(inputColorShortcut, () => {

            if (inputWin && inputWin.isVisible()) {
                inputMenu.getMenuItemById("colorSubmenuID").submenu.popup({
                    x: screenOrigin.x,
                    y: screenOrigin.y
                })
            }
        })

        // SHORTCUT: show HELP
        globalShortcut.register(helpShortcut, () => {
            showHelpWindow()
        })

        // SHORTCUT: move all NOTEs on top
        globalShortcut.register(showShortcut, () => {
            if (someNotes && !arePinned) showAllNotes()
        })

        // SHORTCUT: pin/unpin all NOTEs
        globalShortcut.register(pinShortcut, () => {

            if (someNotes) {

                if (!arePinned) {
                    pinAllNotes()

                } else {
                    unpinAllNotes()
                }
            }
        })

        // SHORTCUT: popup TRAY menu
        globalShortcut.register(trayMenuShortcut, () => {
            tray.popUpContextMenu(trayMenu, { x: screenWidth, y: screenHeight })
        })



        // build launch notification
        const lauchNotif = new Notification({
            icon: noteIcon,
            title: `${appName} is running!`,
            body: `Press ${inputShoutcut} to create a Note`,
            silent: true
        })

        // show launch notification
        if (Notification.isSupported()) {

            lauchNotif.show()

            lauchNotif.on("close", () => lauchNotif.close())
            lauchNotif.on("click", () => lauchNotif.close())
        }



        // restore unclosed NOTEs
        if (data.notesArray.length != 0) {

            // load and show restored NOTEs
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

                // execute when ready
                noteToRestore.on("ready-to-show", () => {

                    // IPC: send 'displayNote' event
                    noteToRestore.webContents.send("displayNote", {
                        id: updatedID,
                        text: restoredText,
                        colorIndex: restoredColor
                    })

                    noteToRestore.show()


                    // update DATA file
                    const noteIndex = data.notesArray.findIndex(n => n.id === restoredID)

                    data.notesArray[noteIndex].id = updatedID

                    const updatedData = JSON.stringify(data, null, 4)
                    fs.writeFileSync(checkDataFilePath, updatedData)
                })
                
                // manage NOTE events
                noteEvents(noteToRestore)
            })

            // update TRAY
            tray.setToolTip(`${appName} (${data.notesArray.length})`)
        }


        // show HELP on first launch
        if (data.firstLaunch) {

            showHelpWindow()

            // update DATA file
            data.firstLaunch = false

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)
        }


        
        // check if APP is packaged/dev mode
        if (app.isPackaged) {
            
            // auto-check for updates (packaged)
            checkForUpdatesOnStartup()

        } else {
            
            // log APP details (dev mode)
            console.log(
                `auto-launch: ${data.autoLaunch}`,
                `\nsystem-theme: ${nativeTheme.shouldUseDarkColors ? "dark" : "light"}`,
                `\nselected-color: ${colorsArray[colorIndex]}`,
                `\nrestored-notes: ${data.notesArray.length}`
            )
        }
    })

    
    // execute before APP quit
    app.on("before-quit", () => {

        // update DATA file
        data.autoLaunch = app.getLoginItemSettings().launchItems[0].enabled   // check auto-launch value
        
        const updatedData = JSON.stringify(data, null, 4)
        fs.writeFileSync(checkDataFilePath, updatedData)


        globalShortcut.unregisterAll() // unregister all shortcuts


        // delete auto-launch registry key (dev mode)
        if (!app.isPackaged) {
            app.setLoginItemSettings({
                openAtLogin: false
            })
        }
    })


    // execute when all windows are closed/destroyed
    app.on("window-all-closed", () => {
        
        // build alert notification
        const quitPreventNotif = new Notification({
            icon: alertIcon,
            title: `${appName} was prevented from closing!`,
            body: 'Click on "Quit" (in Tray menu) to close the whole application',
            silent: false
        })

        // show alert notification
        if (Notification.isSupported()) {

            quitPreventNotif.show()

            quitPreventNotif.on("close", () => quitPreventNotif.close())
            quitPreventNotif.on("click", () => quitPreventNotif.close())
        }

        showInputWindow() // reload and show INPUT
    })




    // FUNCTION: build INPUT
    function getInputWindow() {

        const inputWindow = new BrowserWindow({

            title: "Type something or paste a link...",
            icon: inputIcon,

            width: 500,
            height: 60,

            center: true,

            frame: false,
            thickFrame: false,
            opacity: 1,

            maximizable: false,
            minimizable: false,
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


    // FUNCTION: build NOTE
    function getNoteWindow() {

        // set random NOTE spawn
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

            maximizable: false,
            minimizable: false,
            fullscreenable: false,
            resizable: false,
            focusable: true,

            alwaysOnTop: false,
            show: false,
            skipTaskbar: true,

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })

        return noteWindow
    }


    // FUNCTION: build HELP
    function getHelpWindow() {

        const helpWindow = new BrowserWindow({

            title: "Help?",
            icon: helpIcon,

            width: 400,
            height: 400,

            center: true,

            frame: false,
            thickFrame: false,
            transparent: true,

            maximizable: false,
            minimizable: false,
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



    // FUNCTION: load INPUT
    function loadInputWindow() {

        inputWin = getInputWindow()    
        inputWin.loadFile("src/input/input.html")
        inputWin.setAppDetails({ appId: "INPUT.win" })


        // register shortcuts only when visible
        inputWin.on("show", () => {

            // SHORTCUT: prevent default window closing event
            globalShortcut.register("CTRL+W", () => null)

            // SHORTCUT: popup INPUT menu
            globalShortcut.register(inputMenuShortcut, () => {
                inputMenu.popup({ x: screenOrigin.x, y: screenOrigin.y })
            })
        })


        // unregister shortcut when hidden
        inputWin.on("hide", () => {
            globalShortcut.unregister("CTRL+W")
            globalShortcut.unregister(inputMenuShortcut)
        })


        // close INPUT when not focused
        inputWin.on("blur", () => {
            inputWin.hide()
        })


        // popup INPUT menu
        inputWin.webContents.on("context-menu", () => {
            inputMenu.popup()
        })


        // prevent INPUT system menu
        //! BUG: Electron fix needed
        ////inputWin.on("system-context-menu", (event) => {
        ////    event.preventDefault()
        ////})
        //! TEMPORARY SOLUTION:
        const WM_INITMENU = 0x0116;
        inputWin.hookWindowMessage(WM_INITMENU, () => {
            inputWin.setEnabled(false)
            inputWin.setEnabled(true)
        })
    }


    // FUNCTION: show INPUT
    function showInputWindow() {

        if (!inputWin || inputWin.isDestroyed()) {

            // reload INPUT if destroyed
            loadInputWindow()

            inputWin.on("ready-to-show", () => inputWin.show())
            
        } else {

            if (!inputWin.isVisible()) {
                inputWin.show()
                
            } else {

                inputWin.hide()
                inputWin.webContents.send("clearInput") // IPC: send 'clearInput' event
            }
        }
    }


    // FUNCTION: load and show HELP
    function showHelpWindow() {

        if (!helpWin || helpWin.isDestroyed()) {

            // load HELP
            helpWin = getHelpWindow()
            helpWin.loadFile("src/help/help.html")
            helpWin.setAppDetails({ appId: "HELP.win" })

            helpWin.on("ready-to-show", () => helpWin.show())
            
            
            // register shortcut when visible/focused
            helpWin.on("show", () => {
                
                // SHORTCUT: prevent default window closing event
                globalShortcut.register("CTRL+W", () => null)
            })

            helpWin.on("focus", () => {

                // SHORTCUT: prevent default window closing event
                globalShortcut.register("CTRL+W", () => null)
            })


            // unregister shortcut when blurred/closed
            helpWin.on("blur", () => {
                globalShortcut.unregister("CTRL+W")
            })

            helpWin.on("closed", () => {
                globalShortcut.unregister("CTRL+W")
            })
        
            
            // prevent HELP system menu
            //! BUG: Electron fix needed
            ////helpWin.on("system-context-menu", (event) => {
            ////    event.preventDefault()
            ////})
            //! TEMPORARY SOLUTION:
            const WM_INITMENU = 0x0116;
            helpWin.hookWindowMessage(WM_INITMENU, () => {
                helpWin.setEnabled(false)
                helpWin.setEnabled(true)
            })


        } else helpWin.focus() // focus if already opened
    }



    // FUNCTION: move all NOTEs on top
    function showAllNotes() {

        data.notesArray.forEach(note => {
                    
            const noteFromId = BrowserWindow.fromId(note.id + 1)
            
            noteFromId.show()
        })
    }


    // FUNCTION: pin all NOTEs
    function pinAllNotes() {

        data.notesArray.forEach(note => {

            const noteFromId = BrowserWindow.fromId(note.id + 1)

            noteFromId.webContents.send("pinNote") // IPC: send 'pinNote' event
            noteFromId.setAlwaysOnTop(true, "status")
            noteFromId.focus()
        })

        arePinned = true

        // update TRAY menu
        trayMenu.getMenuItemById("pinNotesID").visible = false
        trayMenu.getMenuItemById("unpinNotesID").visible = true

        trayMenu.getMenuItemById("showNotesID").enabled = false
    }


    // FUNCTION: unpin all NOTEs
    function unpinAllNotes() {

        data.notesArray.forEach(note => {

            const noteFromId = BrowserWindow.fromId(note.id + 1)

            noteFromId.webContents.send("unpinNote") // IPC: send 'unpinNote' event
            noteFromId.setAlwaysOnTop(false)
            noteFromId.focus()
        })

        arePinned = false

        // update TRAY menu
        trayMenu.getMenuItemById("unpinNotesID").visible = false
        trayMenu.getMenuItemById("pinNotesID").visible = true

        trayMenu.getMenuItemById("showNotesID").enabled = true
    }

    


    // FUNCTION: check for updates automatically (on startup)
    function checkForUpdatesOnStartup() {

        // auto-update setup
        autoUpdater.autoDownload = false
        autoUpdater.autoInstallOnAppQuit = false

        autoUpdater.checkForUpdates() // check for updates


        // execute if update is available
        autoUpdater.on("update-available", () => {
    
            // update TRAY
            tray.setImage(updateIconLow)
            tray.setToolTip("Update available!")
    
            autoUpdater.downloadUpdate() // download update (automatically)
        })


        // execute when update is downloaded
        autoUpdater.on("update-downloaded", (info) => {

            // update TRAY menu
            trayMenu.getMenuItemById("checkUpdateID").visible = false
            trayMenu.getMenuItemById("downloadUpdateID").visible = true


            // build and show update message box
            dialog.showMessageBox({
                icon: updateIconHigh,
                message: `New update available! (${info.version})`,
                buttons: ["Install", "Later..."],
                noLink: true,
                defaultId: 0,
                cancelId: 1

            }).then(message => {

                if (message.response !== 0) {

                    // build update-alert notification
                    const updateHelpNotif = new Notification({
                        icon: updateIconHigh,
                        title: "Update is still available!",
                        body: 'Click on "Install update!" (in Tray menu)\nto proceed with the installation',
                        silent: false
                    })

                    // show update-alert notification
                    if (Notification.isSupported()) {

                        updateHelpNotif.show()

                        updateHelpNotif.on("close", () => updateHelpNotif.close())
                        updateHelpNotif.on("click", () => updateHelpNotif.close())
                    }
                }

                if (message.response === 0) confirmUpdate() // wait for confirmation
            })
        })


        // execute if an error occurs
        autoUpdater.on("error", (error) => {
            dialog.showErrorBox(`${appName} UPDATER ERROR`, error)
        })
    }


    // FUNCTION: check for updates manually (from tray menu)
    function checkForUpdatesFromMenu() {

        autoUpdater.checkForUpdates() // check for updates

        
        // execute if no update is available
        autoUpdater.on("update-not-available", () => {

            // build no-update notification
            const noUpdateNotif = new Notification({
                icon: noteIcon,
                title: `${appName} is up-to-date!`,
                body: `You're running the latest version (${version})`,
                silent: false
            })

            // show no-update notification
            if (Notification.isSupported()) {

                noUpdateNotif.show()

                noUpdateNotif.on("close", () => noUpdateNotif.close())
                noUpdateNotif.on("click", () => noUpdateNotif.close())
            }
        })
    }


    // FUNCTION: confirm update installation
    function confirmUpdate() {

        // build and show installation message box
        dialog.showMessageBox({
            icon: updateIconHigh,
            message: "Do you want to proceed with the installation?",
            buttons: ["Yes", "No"],
            noLink: true,
            defaultId: 0,
            cancelId: 1

        }).then(result => {

            if (result.response === 0) {

                // update DATA file
                data.firstLaunch = true

                const updatedData = JSON.stringify(data, null, 4)
                fs.writeFileSync(checkDataFilePath, updatedData)


                autoUpdater.quitAndInstall() // quit and install update
            }
        })
    }


    
    // FUNCTION: choose if run on startup
    function switchAutoLaunch() {

        if (data.autoLaunch) {

            // update DATA file
            data.autoLaunch = false

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)

            // set auto-launch value
            app.setLoginItemSettings({
                openAtLogin: true,
                enabled: false,
            })

        } else {

            // update DATA file
            data.autoLaunch = true

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)

            // set auto-launch value
            app.setLoginItemSettings({
                openAtLogin: true,
                enabled: true,
            })
        }
    }


    // FUNCTION: delete all NOTEs
    function clearAllNotes() {

        data.notesArray.forEach(note => {

            const noteFromId = BrowserWindow.fromId(note.id + 1)

            if (noteFromId) noteFromId.close()
        })
        
        arePinned = false


        // update DATA file
        data.notesArray = []

        const updatedData = JSON.stringify(data, null, 4)
        fs.writeFileSync(checkDataFilePath, updatedData)


        // update TRAY
        tray.setToolTip(appName)

        // update TRAY menu
        trayMenu.getMenuItemById("unpinNotesID").visible = false
        trayMenu.getMenuItemById("pinNotesID").visible = true

        trayMenu.getMenuItemById("showNotesID").enabled = false
        trayMenu.getMenuItemById("pinNotesID").enabled = false
        trayMenu.getMenuItemById("clearAllID").enabled = false
    }



    // FUNCTION: save last color index
    function saveLastColor(index) {

        colorIndex = index

        // update DATA file
        data.lastColorIndex = colorIndex

        const updatedData = JSON.stringify(data, null, 4)
        fs.writeFileSync(checkDataFilePath, updatedData)
    }


    // FUNCTION: manage NOTE events
    function noteEvents(win) {

    //TODO imposta focus collettivo
/*
        win.on("focus", () => {
            
            //...
        })
*/


        // save position of all NOTEs (x, y)
        win.on("moved", () => {

            data.notesArray.forEach(note => {

                const noteFromId = BrowserWindow.fromId(note.id + 1)
                const [updatedPosX, updatedPosY] = noteFromId.getPosition()

                if (noteFromId) {

                    const noteIndex = data.notesArray.findIndex(n => n.id === note.id)

                    // update DATA file
                    data.notesArray[noteIndex].x = updatedPosX
                    data.notesArray[noteIndex].y = updatedPosY

                    const updatedData = JSON.stringify(data, null, 4)
                    fs.writeFileSync(checkDataFilePath, updatedData)
                }
            })
        })


        // prevent NOTE system menu
        //! BUG: Electron fix needed
        ////win.on("system-context-menu", (event) => {
        ////    event.preventDefault()
        ////})
        //! TEMPORARY SOLUTION:
        const WM_INITMENU = 0x0116;
        win.hookWindowMessage(WM_INITMENU, () => {

            data.notesArray.forEach(note => {

                const noteFromId = BrowserWindow.fromId(note.id + 1)

                noteFromId.setEnabled(false)
                noteFromId.setEnabled(true)
            })
        })
    }




    // IPC: create NOTE
    ipcMain.on("createNote", (event, noteText) => {

        if (data.notesArray.length == 10) {

            // prevent if too many NOTEs
            inputWin.webContents.send("clearInput") // IPC: send 'clearInput' event (prevent lag)
            inputWin.webContents.send("tooManyNotes", noteText) // IPC: send 'tooManyNotes' event

        } else {

            // hide and clear INPUT
            inputWin.hide()
            inputWin.webContents.send("clearInput") // IPC: send 'clearInput' event


            // load NOTE
            noteWin = getNoteWindow()
            noteWin.loadFile("src/note/note.html")

            noteWin.setPosition(notePosX, notePosY)

            // execute when ready
            noteWin.on("ready-to-show", () => {

                // IPC: send 'displayNote' event
                noteWin.webContents.send("displayNote", {   // only NOTEs IDs
                    id: noteWin.id - 1,
                    text: noteText,
                    colorIndex: colorIndex
                })

                noteWin.show()
                
                // check and pin (if NOTEs are pinned)
                if (arePinned) {
                    noteWin.webContents.send("pinNote") // IPC: send 'pinNote' event
                    noteWin.setAlwaysOnTop(true, "status")
                }
                

                // save NOTEWINDOW data
                const noteData = {
                    id: noteWin.id - 1,
                    text: noteText,
                    color: colorsArray[colorIndex],
                    index: colorIndex,
                    x: notePosX,
                    y: notePosY
                }

                // update DATA file
                data.notesArray.push(noteData)

                const updatedData = JSON.stringify(data, null, 4)
                fs.writeFileSync(checkDataFilePath, updatedData)
                
                
                // update TRAY
                tray.setToolTip(`${appName} (${data.notesArray.length})`)

                
                showAllNotes() // move all NOTEs on top
            })


            // manage NOTE events
            noteEvents(noteWin)


            // update TRAY menu
            trayMenu.getMenuItemById("showNotesID").enabled = true
            trayMenu.getMenuItemById("pinNotesID").enabled = true
            trayMenu.getMenuItemById("clearAllID").enabled = true
        }
    })


    // IPC: hide and clear INPUT
    ipcMain.on("hideInput", () => {
        inputWin.hide()
        inputWin.webContents.send("clearInput") // IPC: send 'clearInput' event
    })


    // IPC: delete NOTE
    ipcMain.on("deleteNote", (event, noteID) => {   // id -1

        const noteFromId = BrowserWindow.fromId(noteID + 1)

        if (noteFromId) noteFromId.close()

        const noteIndex = data.notesArray.findIndex(n => n.id === noteID + 1 - 1) // arrays start from 0!

        if (noteIndex !== -1) {

            // update DATA file
            data.notesArray.splice(noteIndex, 1)

            const updatedData = JSON.stringify(data, null, 4)
            fs.writeFileSync(checkDataFilePath, updatedData)
        }

        
        // update TRAY
        tray.setToolTip(`${appName}${data.notesArray.length != 0 ? ` (${data.notesArray.length})` : ""}`)
        
        if (data.notesArray.length == 0) {
            
            arePinned = false
            
            // update TRAY menu
            trayMenu.getMenuItemById("unpinNotesID").visible = false
            trayMenu.getMenuItemById("pinNotesID").visible = true
    
            trayMenu.getMenuItemById("showNotesID").enabled = false
            trayMenu.getMenuItemById("pinNotesID").enabled = false
            trayMenu.getMenuItemById("clearAllID").enabled = false
        }
    })


    // IPC: close HELPWINDOW
    ipcMain.on("closeHelp", () => {
        helpWin.close()
    })


    // IPC: open link in default browser
    ipcMain.on("openLink", (event, data) => {

        const noteFromId = BrowserWindow.fromId(data.id + 1)

        noteFromId.webContents.setWindowOpenHandler(details => {

            shell.openExternal(details.url)

            return { action: "deny" }
        })

        shell.openExternal(data.url) // open link
    })


    // IPC: open example link in default browser
    ipcMain.on("openExampleLink", () => {

        helpWin.webContents.setWindowOpenHandler(details => {

            shell.openExternal(details.url)

            return { action: "deny" }
        })

        shell.openExternal("https://example.com/post-it/help/open-link-example") // open example link
    })
}

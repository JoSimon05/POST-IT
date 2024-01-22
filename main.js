
const { app, BrowserWindow, Notification, Tray, nativeImage, Menu, ipcMain, screen, globalShortcut, nativeTheme, shell } = require("electron")
const { version } = require("./package.json")
const fs = require("fs")
const path = require("path")

const dataFile = "data.json"
const dataFolder = "database"
const dataPath = path.join(__dirname, dataFolder, dataFile)

let data

const appName = "POST-IT"


// FUNCTION: check if DATA file exists
async function checkDataFile() {
    
    try {
        await fs.promises.access(dataPath)
        
    } catch {
        console.log(`'${dataFile}' file no longer exists`)
        
        try {
            const emptyDataArray = {
                "autoLaunch": true,
                "notesArray": []
            }
        
            const emptyDataArrayString = JSON.stringify(emptyDataArray, null, 4)
        
            await fs.promises.writeFile(dataPath, emptyDataArrayString)
        
            console.log(`'${dataFile}' file restored`)
    
        } catch (error) {
            console.error(error)
        }
    }
}

checkDataFile().then(() => {

    data = JSON.parse(fs.readFileSync(dataPath))

    const notifIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "notif_icon.ico"))
    const inputIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "input_icon.ico"))
    const inputIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "input_icon_white.ico")).resize({ width: 12, height: 12 })
    const inputIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "input_icon_black.ico")).resize({ width: 12, height: 12 })
    const noteIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "note_icon.ico"))
    const noteIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "note_icon_white.ico")).resize({ width: 12, height: 12 })
    const noteIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "note_icon_black.ico")).resize({ width: 12, height: 12 })
    const helpIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "help_icon.ico"))
    const helpIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "help_icon_white.ico")).resize({ width: 12, height: 12 })
    const helpIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "help_icon_black.ico")).resize({ width: 12, height: 12 })
    const xIconWhite = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "x_icon_white.ico")).resize({ width: 10, height: 10 })
    const xIconBlack = nativeImage.createFromPath(path.join(__dirname, "icons", "menu", "x_icon_black.ico")).resize({ width: 10, height: 10 })
    
    // about window
    let inputWin
    let noteWin
    let helpWin

    // about notification
    let lauchNotif
    
    // about menu
    let tray
    let trayMenu
    let someNotes = data.notesArray.length != 0 ? true : false
    let isDark = nativeTheme.shouldUseDarkColors
    let isVisible = true

    // about shortcut
    let inputShoutcut = "ALT+N"
    let inputMenuShortcut = "SHIFT+F10"
    let inputColorShortcut = "SHIFT+ALT+C"
    let helpShortcut = "ALT+H"
    let visibilityShortcut = "ALT+SHIFT+V"
    let trayMenuShortcut = "SHIFT+ALT+N"

    // about position
    let screenOrigin
    let screenWidth
    let screenHeight
    let notePosX
    let notePosY
    
    // about color
    const colorsArray = ["orange", "yellow", "green", "blue", "violet", "pink"]
    let colorIndex = 1   // default color (yellow)
    
    const orangeIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "orange.ico")).resize({ width: 14, height: 14 })
    const yellowIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "yellow.ico")).resize({ width: 14, height: 14 })
    const greenIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "green.ico")).resize({ width: 14, height: 14 })
    const blueIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "blue.ico")).resize({ width: 14, height: 14 })
    const violetIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "violet.ico")).resize({ width: 14, height: 14 })
    const pinkIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "colors", "pink.ico")).resize({ width: 14, height: 14 })


    // APP setup
    app.setName(appName)
    app.setAppUserModelId(appName)
    
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
                    label: `${appName} v${version}`,
                    enabled: false,
                    icon: isDark ? noteIconWhite : noteIconBlack
                },

                { type: "separator" },

                {
                    label: "Help?",
                    accelerator: helpShortcut,
                    //icon: isDark ? helpIconWhite : helpIconBlack,
                    click: () => openHelpWindow()
                },
                {
                    label: "Open input bar",
                    accelerator: inputShoutcut,
                    //icon: isDark ? inputIconWhite : inputIconBlack,
                    click: () => showInputWindow()
                },
                {
                    label: "Visible Notes",
                    id: "visibilityID",
                    accelerator: visibilityShortcut,
                    type: "checkbox",
                    checked: someNotes && isVisible,
                    enabled: someNotes,
                    click: () => switchVisibility()
                },

                { type: "separator" },

                {
                    label: "More options",
                    submenu: [
                        {
                            label: "Run at startup",
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
                    //icon: isDark ? xIconWhite : xIconBlack
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
            
        
            // TRAY setup
            tray = new Tray(noteIcon)
            
            tray.setTitle(appName)
            tray.setToolTip(appName)
            
            tray.on("click", () => {
                
                trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
                tray.popUpContextMenu(trayMenu)
            })

            tray.on("right-click", () => {
                
                trayMenu.getMenuItemById("autoLaunchID").checked = app.getLoginItemSettings().launchItems[0].enabled
                tray.popUpContextMenu(trayMenu)
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

            // SHORTCUT: prevent default WINDOW closing event
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

            // prevent INPUTWIN system menu
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
                        
                        fs.writeFileSync(dataPath, updatedData)
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
                                
                                fs.writeFileSync(dataPath, updatedData)
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
    
                    if (isVisible) {
                        
                        // hide all NOTEWINDOWs
                        data.notesArray.forEach(note => {
                            
                            const noteFromId = BrowserWindow.fromId(note.id + 1)
                            
                            if (noteFromId) noteFromId.hide()
                        })
                        
                        // update TRAY's menu
                        trayMenu.getMenuItemById("visibilityID").checked = false
                        tray.setContextMenu(trayMenu)
                        
                        isVisible = false

                    } else {
                        
                        // show all NOTEWINDOWs
                        data.notesArray.forEach(note => {
                            
                            const noteFromId = BrowserWindow.fromId(note.id + 1)
                            
                            if (noteFromId) noteFromId.show()
                        })
                        
                        // update TRAY menu
                        trayMenu.getMenuItemById("visibilityID").checked = true
                        tray.setContextMenu(trayMenu)
                        
                        isVisible = true
                    }
                }
            }


            // FUNCTION: switch AUTOLAUNCH
            function switchAutoLaunch() {

                if (data.autoLaunch) {

                    data.autoLaunch = false

                    const updatedData = JSON.stringify(data, null, 4)

                    fs.writeFileSync(dataPath, updatedData)

                    app.setLoginItemSettings({
                        openAtLogin: true,
                        enabled: false,
                    })

                } else {

                    data.autoLaunch = true

                    const updatedData = JSON.stringify(data, null, 4)

                    fs.writeFileSync(dataPath, updatedData)

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
                
                fs.writeFileSync(dataPath, updatedData, function(error) {
                    if (error) return console.log(error)
                })
    
                // update TRAY menu
                trayMenu.getMenuItemById("visibilityID").enabled = false
                trayMenu.getMenuItemById("visibilityID").checked = false
                trayMenu.getMenuItemById("clearAllID").enabled = false
                tray.setContextMenu(trayMenu)
            }

        
        }).then(() => {

            // get launch NOTIFICATION
            lauchNotif = new Notification({

                icon: notifIcon,
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


            // log APP details
            console.log(
                `auto-launch: ${data.autoLaunch}`,
                `\ndark-theme: ${isDark}`,
                `\nrestored-notes: ${data.notesArray.length}`
            )

        })   // end of app.whenReady() event


        // check and set AUTOLAUNCH before app quit
        app.on("before-quit", () => {

            data.autoLaunch = app.getLoginItemSettings().launchItems[0].enabled
            
            const updatedData = JSON.stringify(data, null, 4)
            
            fs.writeFileSync(dataPath, updatedData)


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
                inputWin.webContents.send("tooManyNotes")
    
            } else {

                inputWin.hide()
                
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
                    
                    fs.writeFileSync(dataPath, updatedData, function(error) {
                        if (error) return console.log(error)
                    })
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
                            
                            fs.writeFileSync(dataPath, updatedData)
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
    
                isVisible = true
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
                
                fs.writeFileSync(dataPath, updatedData, function(error) {
                    if (error) return console.log(error)
                })
            }
    

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
})

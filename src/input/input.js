
const { ipcRenderer } = require("electron")
const linkify = require("linkifyjs")

document.addEventListener("DOMContentLoaded", () => {

    const textField = document.getElementById("text-field")
    
    let lastText = null
    let timeoutID

    const defaultPlaceholder = "Type something or paste a link..."
    textField.placeholder = defaultPlaceholder


    // execute when KEY is pressed
    textField.addEventListener("keydown", event => {
    
        // execute if KEY is "ENTER"
        if (event.key === "Enter") {
            event.preventDefault()
            
            // hide INPUT if empty
            if (textField.value == "" && lastText == null) {

                // IPC: send 'hideInput' event
                ipcRenderer.send("hideInput")
                
            } else {
                
                // prevent if blank/spaced text
                if (!/\S/.test(textField.value)) {
                    textField.value = ""
                    
                } else {

                    const linkFromText = linkify.find(textField.value)
                    const isLink = linkFromText.length != 0 ? true : false
                    const linkToOpen = isLink ? linkFromText[0].value : null // only one link!
                    const isValidLink = linkToOpen != null ? linkToOpen.startsWith("https://") || linkToOpen.startsWith("http://") : null


                    // ignore characters limit (link)
                    if (isValidLink) {

                        // IPC: send 'createNote' event
                        ipcRenderer.send("createNote", textField.value)
                        textField.value = ""

                    } else {

                        // block if over 70 characters (no link)
                        if (textField.value.length > 70) {
                            
                            // save last text and restore it
                            lastText = textField.value

                            textField.style.caretColor = "transparent"
                            textField.placeholder = "Max 70 characters!"
                            textField.value = ""
                            

                            // overwrite current timeout
                            if (timeoutID) clearTimeout(timeoutID)
        
                            timeoutID = setTimeout(() => {
                                textField.value = lastText
                                textField.style.caretColor = "auto"
                                textField.placeholder = defaultPlaceholder
                                lastText = null
                            }, 1000)
                    
                        } else {

                            // IPC: send 'createNote' event
                            ipcRenderer.send("createNote", textField.value)
                        }
                    }
                }
            }
    
        }
        
        
        // execute if KEY is "ESC"
        if(event.key === "Escape") {

            // IPC: send 'hideInput' event
            ipcRenderer.send("hideInput")
        }
    })
    
    
    

    // IPC: clear INPUT text field
    ipcRenderer.on("clearInput", () => {
        textField.value = ""
    })
    
    
    // IPC: prevent if too many NOTEs
    ipcRenderer.on("tooManyNotes", (event, noteText) => {
        
        // save last text and restore it
        lastText = noteText

        textField.style.caretColor = "transparent"
        textField.placeholder = "Too many opened Notes!"
        textField.value = ""


        // overwrite current timeout
        if (timeoutID) clearTimeout(timeoutID)
    
        timeoutID = setTimeout(() => {
            textField.value = lastText
            textField.style.caretColor = "auto"
            textField.placeholder = defaultPlaceholder
            lastText = null
        }, 1000)
    })
})

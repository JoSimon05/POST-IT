
const { ipcRenderer } = require("electron")
const linkify = require("linkifyjs")

document.addEventListener("DOMContentLoaded", () => {

    const textField = document.getElementById("text-field")
    
    let lastText = null
    let timeoutID

    const defaultPlaceholder = "Type something or paste a link..."
    textField.placeholder = defaultPlaceholder


    // send text (after check) or close INPUTWINDOW
    textField.addEventListener("keydown", event => {
    
        if (event.key === "Enter") {
            event.preventDefault()
            
            // IPC: send 'close INPUTWINDOW' event if empty
            if (textField.value == "" && lastText == null) {
                ipcRenderer.send("closeInput")
                
            } else {
                
                // prevent (spaced) empty text
                if (!/\S/.test(textField.value)) {
                    textField.value = ""
                    
                } else {

                    const linkFromText = linkify.find(textField.value)
                    const isLink = linkFromText.length != 0 ? true : false
                    const linkToOpen = isLink ? linkFromText[0].value : null   // only one link!
                    const isValidLink = linkToOpen != null ? linkToOpen.startsWith("https://") || linkToOpen.startsWith("http://") : null

                    if (isValidLink) {

                        // no characters limit if link
                        ipcRenderer.send("createNote", textField.value)
                        textField.value = ""

                    } else {

                        // block if over 70 characters
                        if (textField.value.length > 70) {
                            
                            // save last text and restore it
                            lastText = textField.value

                            textField.style.caretColor = "transparent"
                            textField.placeholder = "Max 70 characters"
                            textField.value = ""
                            
                            if (timeoutID) clearTimeout(timeoutID)
        
                            timeoutID = setTimeout(() => {
                                textField.value = lastText
                                textField.style.caretColor = "auto"
                                textField.placeholder = defaultPlaceholder
                                lastText = null
                            }, 1000)
                    
                        } else {
                            ipcRenderer.send("createNote", textField.value)
                        }
                    }
                }
            }
    
        // IPC: send 'close INPUTWINDOW' event if 'ESCAPE' key is pressed
        } else if(event.key === "Escape") {
            ipcRenderer.send("closeInput")
        }
    })
    
    
    
    // IPC: clear TEXTFIELD
    ipcRenderer.on("clearInput", () => {
        textField.value = ""
    })
    
    
    // IPC: 'too many notes' alert
    ipcRenderer.on("tooManyNotes", (event, noteText) => {
        
        // save last text and restore it
        lastText = noteText

        textField.style.caretColor = "transparent"
        textField.placeholder = "Too many opened Notes"
        textField.value = ""
        
        if (timeoutID) clearTimeout(timeoutID)
    
        timeoutID = setTimeout(() => {
            textField.value = lastText
            textField.style.caretColor = "auto"
            textField.placeholder = defaultPlaceholder
            lastText = null
        }, 1000)
    })
})

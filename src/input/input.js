
const { ipcRenderer } = require("electron")
const linkify = require("linkifyjs")

document.addEventListener("DOMContentLoaded", () => {

    const textField = document.getElementById("text-field")
    
    let timeoutID


    // send text (after check) or close INPUTWINDOW
    textField.addEventListener("keydown", event => {
    
        if (event.key === "Enter") {
            event.preventDefault()
            
            // IPC: send 'close INPUTWINDOW' event if empty
            if (textField.value == "") {
                ipcRenderer.send("closeInput")
                
            } else {
                
                // prevent (spaced) empty text
                if (!/\S/.test(textField.value)) {
                    textField.value = ""
                    
                } else {

                    const linkFromText = linkify.find(textField.value)
                    const isLink = linkFromText.length != 0 ? true : false
                    const linkToOpen = isLink ? linkFromText[0].value : null   // just one link
                    const isValidLink = linkToOpen != null ? linkToOpen.startsWith("https://") || linkToOpen.startsWith("http://") : null

                    if (isValidLink) {

                        // no characters limit if link
                        ipcRenderer.send("createNote", textField.value)
                        textField.value = ""

                    } else {

                        // block if over 70 characters
                        if (textField.value.length > 70) {
                            
                            textField.value = ""
                            
                            textField.placeholder = "Max 70 characters"
                            
                            if (timeoutID) clearTimeout(timeoutID)
        
                            timeoutID = setTimeout(() => {
                                textField.placeholder = "Type something or paste a link..."
                            }, 3000)
                    
                        } else {

                            ipcRenderer.send("createNote", textField.value)
                            textField.value = ""
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
    ipcRenderer.on("tooManyNotes", () => {
        
        textField.placeholder = "There are too many opened Notes"
        
        if (timeoutID) clearTimeout(timeoutID)
    
        timeoutID = setTimeout(() => {
            textField.placeholder = "Type something or paste a link..."
        }, 3000)
    })
})

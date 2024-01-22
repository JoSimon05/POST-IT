
const { ipcRenderer, clipboard } = require("electron")
const linkify = require("linkifyjs")

document.addEventListener("DOMContentLoaded", () => {

    const noteText = document.getElementById("note-text")
    const cornerContainer = document.getElementById("corner-container")
    const cornerBox = document.getElementById("corner-box")
    const corner = document.getElementById("corner")
    const message = document.getElementById("message-field")
    
    let noteID
    let timeoutID

    let linkFromText
    let linkToOpen
    let isLink
    let isValidLink

    const colorsArray = [
        "255, 193, 74",   // orange
        "255, 255, 100",   // yellow
        "185, 235, 71",   // green
        "138, 222, 255",   // blue
        "206, 129, 255",   // violet
        "255, 147, 217"   // pink
    ]

    const secColorsArray = [
        "225, 163, 44",   // darker orange -30
        "225, 225, 70",   // darker yellow -30
        "155, 205, 41",   // darker green -30
        "108, 192, 225",   // darker blue -30
        "176, 99, 225",   // darker violet -30
        "225, 117, 187"   // darker pink -30
    ]


    // IPC: display NOTEWINDOW content
    ipcRenderer.on("displayNote", (event, data) => {
        
        noteID = data.id   // id -1
        const textFromData = data.text

        linkFromText = linkify.find(textFromData)
        isLink = linkFromText.length != 0 ? true : false
        linkToOpen = isLink ? linkFromText[0].value : null   // just one link
        isValidLink = linkToOpen != null ? linkToOpen.startsWith("https://") || linkToOpen.startsWith("http://") : null
        
        if (isValidLink) {
            
            const updatedText = textFromData.replace(linkToOpen, `<span id="link-text"><u>${linkToOpen}</u></span>`)

            noteText.innerHTML = updatedText


            const linkText = document.getElementById("link-text")

            // LINKTEXT mouse hovering events
            linkText.addEventListener("mouseenter", () => {
                message.innerHTML = "Open link..."
                linkText.style.color = "rgba(0, 0, 0, 0.5)"
            })

            linkText.addEventListener("mouseleave", () => {
                message.innerHTML = ""
                linkText.style.color = "rgba(0, 0, 0, 1)"
            })

            linkText.addEventListener("mousedown", () => {
                message.innerHTML = ""
            })

            // open LINK
            linkText.addEventListener("click", () => {
                ipcRenderer.send("openLink", { url: linkToOpen, id: noteID })
            })

            linkText.style.cursor = "pointer"


        } else {
            noteText.innerHTML = textFromData
            noteText.style.cursor = "pointer"
        }

        
        document.body.style.background = `linear-gradient(-45deg, rgba(0, 0, 0, 0) 12.5%, rgba(${colorsArray[data.colorIndex]}, 1) 0%)`
        cornerBox.style.background = `linear-gradient(-45deg, rgba(0, 0, 0, 0) 50%, rgba(${colorsArray[data.colorIndex]}, 1) 50%)`
        corner.style.background = `linear-gradient(-45deg, rgba(0, 0, 0, 0) 50%, rgba(${secColorsArray[data.colorIndex]}, 1) 50%)`
    })


    // NOTETEXT mouse hovering events
    noteText.addEventListener("mouseenter", () => {
        
        if (!isValidLink) {
            message.innerHTML = "Copy..."
            noteText.style.color = "rgba(0, 0, 0, 0.5)"
        }
    })
    
    noteText.addEventListener("mouseleave", () => {

        if (!isValidLink) {

            if (message.innerText == "Copy..." || message.innerText == "") {
                message.innerHTML = ""
        
            } else {
    
                message.innerHTML = "Copied!"
                
                if (timeoutID) clearTimeout(timeoutID)
    
                timeoutID = setTimeout(() => {
                    message.innerHTML = ""
                }, 3000)
            }
    
            noteText.style.color = "rgba(0, 0, 0, 1)"
        }
    })
    
    noteText.addEventListener("mousedown", () => {
        if (!isValidLink) {
            message.innerHTML = ""
        }
    })
    
    // copy NOTETEXT
    noteText.addEventListener("click", () => {

        if (!isValidLink) {

            clipboard.writeText(noteText.textContent)
            message.innerHTML = "Copied!"
            
            if (timeoutID) clearTimeout(timeoutID)
            
            timeoutID = setTimeout(() => {
                message.innerHTML = ""
            }, 3000)
        }
    })
    
    
    // CORNER mouse hovering events
    cornerContainer.addEventListener("mouseenter", () => {
        message.innerHTML = "Delete..."
    })
    
    cornerContainer.addEventListener("mouseleave", () => {
        message.innerHTML = ""
    })
    
    // IPC: send 'close NOTEWINDOW' event
    cornerContainer.addEventListener("click", () => {
        ipcRenderer.send("closeNote", noteID)
    })
})

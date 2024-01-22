
const { ipcRenderer, clipboard } = require("electron")

document.addEventListener("DOMContentLoaded", () => {

    const copyExample = document.getElementById("copy-example")
    const copied = document.getElementById("copied")
    const linkExample = document.getElementById("link-example")
    const closeExample = document.getElementById("close-example")
    const corner = document.getElementById("corner-container")
    

    // copy example text
    copyExample.addEventListener("click", () => {

        clipboard.writeText(copyExample.textContent)
        copied.innerHTML = "copied!"
    })


    // open example link
    linkExample.addEventListener("click", () => {
        ipcRenderer.send("openExampleLink")
    })


    // CORNER mouse hovering events
    corner.addEventListener("mouseenter", () => {
        closeExample.style.color = "rgba(0, 0, 0, 0.5)"
    })

    corner.addEventListener("mouseleave", () => {
        closeExample.style.color = "rgba(0, 0, 0, 1)"
    })

    // IPC: send 'close HELPWINDOW' event
    corner.addEventListener("click", () => {
        ipcRenderer.send("closeHelp")
    })
})
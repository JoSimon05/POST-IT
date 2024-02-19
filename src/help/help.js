
const { ipcRenderer, clipboard } = require("electron")

document.addEventListener("DOMContentLoaded", () => {

    const copyExample = document.getElementById("copy-example")
    const copied = document.getElementById("copied")
    const linkExample = document.getElementById("link-example")
    const closeExample = document.getElementById("close-example")
    const corner = document.getElementById("corner-container")
    

    // mouse events (text)
    copyExample.addEventListener("click", () => {
        
        // copy example text
        clipboard.writeText(copyExample.textContent)
        copied.innerHTML = "copied!"
    })


    // mouse events (link)
    linkExample.addEventListener("click", () => {

        // IPC: send 'openExampleLink' event
        ipcRenderer.send("openExampleLink")
    })

    linkExample.addEventListener("contextmenu", (event) => {
        event.preventDefault()

        // copy example link
        clipboard.writeText("https://example.com/post-it/help/open-link-example")
    })


    // mouse events (corner)
    corner.addEventListener("mouseenter", () => {
        closeExample.style.color = "rgba(0, 0, 0, 0.5)"
    })

    corner.addEventListener("mouseleave", () => {
        closeExample.style.color = "rgba(0, 0, 0, 1)"
    })

    corner.addEventListener("click", () => {

        // IPC: send 'closeHelp' event
        ipcRenderer.send("closeHelp")
    })
})
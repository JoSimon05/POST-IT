
# <img src="https://github.com/JoSimon05/POST-IT/blob/Preview/icons/note_icon.ico" width="23"/> POST-IT (preview)

[![release](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/JoSimon05/POST-IT/Preview/package.json&query=version&style=flat-square&label=Latest&labelColor=30363d&color=2ea043)](https://github.com/JoSimon05/POST-IT/releases) 
![platform](https://img.shields.io/badge/Platform-Windows-0078d4?style=flat-square&labelColor=30363d)
![language](https://img.shields.io/badge/Language-JavaScript-f7df1E?style=flat-square&labelColor=30363d)

<br>

> **A minimal reminder app based on colorful sticky notes, which you can pin on your desktop**

![note1](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_1.png)
![note2](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_2.png)
![note3](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_3.png)
![note4](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_4.png)

<br>

## SHORTCUTS
**ALT+N** &nbsp;&#10230;&nbsp; open text Input bar

  ![input](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/input.png)

<br> **ALT+C** &nbsp;&#10230;&nbsp; choose color of current Note

  > Color menu can only be displayed when Input bar is opened

<br> **ALT+V** &nbsp;&#10230;&nbsp; move all Notes above other opened windows

  > Notes may still be hidden if they lose focus

<br> **ALT+P** &nbsp;&#10230;&nbsp; pin/unpin all Notes on the top z-level of your desktop

  > Every new Note will be pinned automatically if other Notes are

<br> **ALT+H** &nbsp;&#10230;&nbsp; open Help window

  > Help cannot be closed by pressing the shortcut again

<br> **SHIFT+ALT+N** &nbsp;&#10230;&nbsp; open [Tray context menu](https://github.com/JoSimon05/POST-IT?tab=readme-ov-file#tray)

<br>

## LOCAL SAVES
Every Note is stored inside a local database and reloaded on application startup.

> [!NOTE]
> **POST-IT** remembers content, color and position of all Notes
> 
> ```
> "notesArray": [
>     {
>         "id": 1,
>         "text": "This is a Note!",
>         "color": "yellow",
>         "index": 1,
>         "x": 1597,
>         "y": 112
>     }
> ]
> ```

<br>

## TRAY CONTEXT MENU
> [!TIP]
> ![tray](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/tray.png)

The Tray context menu is the application main menu and It contains a lot of useful functions. You can find it in the lower right corner of your desktop (on taskbar).

<br>

## UPDATES
Updates are automatically checked and downloaded on startup, then you can choose when to install them.

> [!NOTE]
> Even if you install new versions of the application, you won't lose your [stored data](https://github.com/JoSimon05/POST-IT?tab=readme-ov-file#local-saves)

<br>

## USER-FRIENDLY
**POST-IT** has been created to be as user-friendly as possible, It's simple to use and It provides an overview of the main features of the application (see "**Help?**" in Tray context menu).

> [!IMPORTANT]
> Due to aesthetic issues, you can only interact with Notes by using mouse cursor

<br>

# TRY POST-IT!
**Check [Releases page](https://github.com/JoSimon05/POST-IT/releases) and download the latest version available.**

> You just need to download this file:&nbsp; **POST-IT_{version}_setup.exe**

<br>

> [!WARNING]
> Before installation by *installer.exe*, the system antivirus could show a security alert. DON'T WORRY! \
> You just need to click on "**More info**" ("Ulteriori informazioni" in the image below)
> 
> ![alert1](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/installer_alert_1.png)
> 
> finally, click on the button "**Run anyways**" ("Esegui comunque" in the image below) that appears next.
> 
> ![alert2](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/installer_alert_2.png)
>
> > That's because I still cannot afford the *authentication certificate* for native applications (It's not that cheap...)

<br>



<!--
TODO: 

SPAZIO EXTRA: &nbsp;

ICONA BASE64: logo=data:image/ico;base64,AAABAAEAAAAAAAEAIAAyBQAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAEAAAABAAgGAAAAXHKoZgAABPlJREFUeNrt2LuRJUUYhNGEwBA0jMKZxUFUBBQ8GYQNFoadx310dz3yHAt+Jb+oqB9e/shLgEo/jj4AGEcAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABT7afQBjPXn7z+PPoFBXpIvXgBQ6CX58suvf/0mAFDmn/En/gCgyn/HnwgA1Pj/+BMBgApvjT8RANjee+NPBAC29tH4EwGAbX02/kQAYEu3jD8RANjOreNPBAC2cs/4EwGAbdw7/kQAYAuPjD8RAFjeo+NPBACW9sz4EwGAZT07/kQAYElHjD8RAFjOUeNPBACWcuT4EwGAZRw9/kQAYAlnjD8RAJjeWeNPBACmdub4EwGAaZ09/kQAYEpXjD8RAJjOVeNPBACmcuX4EwGAaVw9/kQAYAojxp8IAAw3avyJAMBQI8efCAAMM3r8iQDAEDOMPxEAuNws408EAC410/gTAYDLzDb+RADgEjOOPxEAON2s408EAE418/gTAYDTzD7+RADgFCuMPxEAONwq408EAA610vgTAYDDrDb+RADgECuOPxEAeNqq408EAJ6y8vgTAYCHrT7+RADgITuMPxEAuNsu408EAO6y0/gTAYCb7Tb+RADgJjuOPxEA+NSu408EAD608/gTAYB37T7+RADgTQ3jTwQAvtMy/kQA4JWm8ScCAN+0jT8RAEjSOf5EAKB2/IkAUK55/IkAUKx9/IkAUMr4vxIA6hj/vwSAKsb/mgBQw/i/JwBUMP63CQDbM/73CQBbM/6PCQDbMv7PCQBbMv7bCADbMf7bCQBbMf77CADbMP77CQBbMP7HCADLM/7HCQBLM/7nCADLMv7nCQBLMv5jCADLMf7jCABLMf5jCQDLMP7jCQBLMP5zCADTM/7zCABTM/5zCQDTMv7zCQBTMv5rCADTMf7rCABTMf5rCQDTMP7rCQBTMP4xBIDhjH8cAWAo4x9LABjG+McTAIYw/jkIAJcz/nkIAJcy/rkIAJcx/vkIAJcw/jkJAKcz/nkJAKcy/rkJAKcx/vkJAKcw/jUIAIcz/nUIAIcy/rUIAIcx/vUIAIcw/jUJAE8z/nUJAE8x/rUJAA8z/vUJAA8x/j0IAHcz/n0IAHcx/r0IADcz/v0IADcx/j0JAJ8y/n0JAB8y/r0JAO8y/v0JAG8y/g4CwHeMv4cA8IrxdxEAvjH+PgJAEuNvJQAYfzEBKGf83f4GZZC1zOrdNFsAAAAASUVORK5CYII=)
-->

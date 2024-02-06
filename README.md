
# <img src="https://github.com/JoSimon05/POST-IT/blob/Preview/icons/note_icon.ico" width="23"/> POST-IT (preview) [WIP]

[![release](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/JoSimon05/POST-IT/Preview/package.json&query=displayVersion&style=flat-square&label=latest&labelColor=30363d&color=ffd700)](https://github.com/JoSimon05/POST-IT/releases) 
![platform](https://img.shields.io/badge/platform-Windows-0078d4?style=flat-square&labelColor=30363d)
![language](https://img.shields.io/badge/language-JavaScript-f7df1E?style=flat-square&labelColor=30363d)

<!--
![npm](https://img.shields.io/badge/npm-v10.2.5-cb0000?style=flat-square&labelColor=30363d&logo=npm)
![node](https://img.shields.io/badge/NodeJS-v20.10.0-339933?style=flat-square&labelColor=30363d&logo=nodedotjs)
![framework](https://img.shields.io/badge/Electron-v28.1.4-47848f?style=flat-square&labelColor=30363d&logo=electron)
-->

> **A minimal reminder app based on colorful sticky notes**

<br>

![note1](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_1.png)
![note2](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_2.png)
![note3](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_3.png)
![note4](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/note_4.png)

<br>

___

<br>

## SHORTCUTS
* Use the keys combination &nbsp;**ALT+N**&nbsp; to open the text input bar.

    ![input](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/input.png)

    > [!TIP]
    > You can choose Note color by input bar context menu <s>(default is &nbsp;<img src="https://github.com/JoSimon05/POST-IT/blob/Preview/icons/colors/yellow.ico" width="11"/> **Yellow**&nbsp; on startup)</s>

* ALT+C
    ...

* ALT+V
    ...

<br>

## LOCAL SAVES
Every Note is stored inside a local database and reloaded on application startup.

```json
"notesArray": [
    {
        "id": 1,
        "text": "This is a Note!",
        "color": "yellow",
        "index": 1,
        "x": 1597,
        "y": 112
    }
]
```

> [!NOTE]
> **POST-IT** remembers content, color and position of all Notes

<br>

## TRAY
The tray context menu contains some useful functions. 

> You can find the application tray in the lower right corner of your desktop
>
> ![tray](https://github.com/JoSimon05/POST-IT/blob/Preview/.github/tray.png)

> ...

<br>

## UPDATES
Updates are automatically checked and downloaded on startup, then you can choose when to install them.

> [!NOTE]
> Even if you install new versions of application, you won't lose your stored Notes

<br>

## USER-FRIENDLY
**POST-IT** has been created to be as user-friendly as possible, It's simple to use and It provides an overview of the main features of the application (see &nbsp;**Help?**&nbsp; in tray context menu).

> [!IMPORTANT]
> Due to aesthetic issues, you can only interact with Notes with your mouse cursor

<br>

___

<br>

> [!WARNING]
> ## APPLICATION SETUP
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



<!--
TODO: latest verde

ICONA BASE64: logo=data:image/ico;base64,AAABAAEAAAAAAAEAIAAyBQAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAEAAAABAAgGAAAAXHKoZgAABPlJREFUeNrt2LuRJUUYhNGEwBA0jMKZxUFUBBQ8GYQNFoadx310dz3yHAt+Jb+oqB9e/shLgEo/jj4AGEcAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABQTACgmAFBMAKCYAEAxAYBiAgDFBACKCQAUEwAoJgBQTACgmABAMQGAYgIAxQQAigkAFBMAKCYAUEwAoJgAQDEBgGICAMUEAIoJABT7afQBjPXn7z+PPoFBXpIvXgBQ6CX58suvf/0mAFDmn/En/gCgyn/HnwgA1Pj/+BMBgApvjT8RANjee+NPBAC29tH4EwGAbX02/kQAYEu3jD8RANjOreNPBAC2cs/4EwGAbdw7/kQAYAuPjD8RAFjeo+NPBACW9sz4EwGAZT07/kQAYElHjD8RAFjOUeNPBACWcuT4EwGAZRw9/kQAYAlnjD8RAJjeWeNPBACmdub4EwGAaZ09/kQAYEpXjD8RAJjOVeNPBACmcuX4EwGAaVw9/kQAYAojxp8IAAw3avyJAMBQI8efCAAMM3r8iQDAEDOMPxEAuNws408EAC410/gTAYDLzDb+RADgEjOOPxEAON2s408EAE418/gTAYDTzD7+RADgFCuMPxEAONwq408EAA610vgTAYDDrDb+RADgECuOPxEAeNqq408EAJ6y8vgTAYCHrT7+RADgITuMPxEAuNsu408EAO6y0/gTAYCb7Tb+RADgJjuOPxEA+NSu408EAD608/gTAYB37T7+RADgTQ3jTwQAvtMy/kQA4JWm8ScCAN+0jT8RAEjSOf5EAKB2/IkAUK55/IkAUKx9/IkAUMr4vxIA6hj/vwSAKsb/mgBQw/i/JwBUMP63CQDbM/73CQBbM/6PCQDbMv7PCQBbMv7bCADbMf7bCQBbMf77CADbMP77CQBbMP7HCADLM/7HCQBLM/7nCADLMv7nCQBLMv5jCADLMf7jCABLMf5jCQDLMP7jCQBLMP5zCADTM/7zCABTM/5zCQDTMv7zCQBTMv5rCADTMf7rCABTMf5rCQDTMP7rCQBTMP4xBIDhjH8cAWAo4x9LABjG+McTAIYw/jkIAJcz/nkIAJcy/rkIAJcx/vkIAJcw/jkJAKcz/nkJAKcy/rkJAKcx/vkJAKcw/jUIAIcz/nUIAIcy/rUIAIcx/vUIAIcw/jUJAE8z/nUJAE8x/rUJAA8z/vUJAA8x/j0IAHcz/n0IAHcx/r0IADcz/v0IADcx/j0JAJ8y/n0JAB8y/r0JAO8y/v0JAG8y/g4CwHeMv4cA8IrxdxEAvjH+PgJAEuNvJQAYfzEBKGf83f4GZZC1zOrdNFsAAAAASUVORK5CYII=)
-->

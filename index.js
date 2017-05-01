const fs = require("fs")
const {merge, collect} = require("./task.js")
const {dialog} = require("electron").remote

// todo 将getElementById 放到 domloaded 中

document.getElementById("btn-select").addEventListener("click", () => {
  dialog.showOpenDialog({properties: ["openDirectory"]}, (selectPaths) => {
    document.getElementById("path").value = selectPaths[0]
    document.getElementById("btn-process").disabled = false
  })
})

document.getElementById("btn-process").addEventListener("click", () => {
  const btnProcess = document.getElementById("btn-process")
  const textPath = document.getElementById("path")
  const indicator = document.getElementById("indicator")
  btnProcess.disabled = true
  const path = textPath.value
  const task = document.querySelector("input[name='task']:checked").value
  try {
    fs.statSync(path).isDirectory()
  } catch (e) {
    mdui.alert("Invalid Path")
    return
  }
  if (task === "collect") {
    btnProcess.classList.toggle("mdui-hidden")
    indicator.classList.toggle("mdui-hidden")
    collect(path, (categories) => {
      // btnProcess.innerHTML = "DONE"
      dialog.showSaveDialog(fileName => {
        if (fileName === undefined) {
          console.log("cancel saving file.")
          return
        }
        // Todo join 的效率问题
        fs.writeFile(fileName, [...categories].join("\n"), err => {
          if (err) {
            mdui.alert("an error ocurred creating the file" + err.message)
          }
          mdui.alert(`All categories has been saved to file: ${fileName}.`)
        })
      })
    })
  } else if (task === "merge") {
    merge(path)
  }
})

document.getElementById("path").addEventListener("keyup", () => {
  let isEmpty = document.getElementById("path").value.length === 0 ? true : false
  document.getElementById("btn-process").disabled = isEmpty
})

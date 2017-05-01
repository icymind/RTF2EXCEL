// const fs = require("fs")
const fs = require("fs-extra")
const pathModule = require("path")
// const path = require("path")
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
  btnProcess.value = "Processing"
  const path = textPath.value
  const task = document.querySelector("input[name='task']:checked").value
  try {
    fs.statSync(path).isDirectory()
  } catch (e) {
    mdui.alert("Invalid Path")
    return
  }
  if (task === "collect") {
    // btnProcess.classList.toggle("mdui-hidden")
    // indicator.classList.toggle("mdui-hidden")
    collect(path, (categoriesSet, cantHandleFiles) => {
      // btnProcess.innerHTML = "DONE"
      mdui.alert(`${categoriesSet.size} categories has been extracted. Please choose a filename to save categories.`, () => {
        dialog.showSaveDialog({title: "choose a filename to save categories."},fileName => {
          if (fileName === undefined) {
            console.log("cancel saving file.")
            return
          }
          // Todo join 的效率问题
          fs.writeFile(fileName, [...categoriesSet].join("\n"), err => {
            if (err) {
              mdui.alert("an error ocurred creating the file" + err.message)
            }
          })
        })
          // mdui.alert(`All categories has been saved to file: ${fileName}.`)
        mdui.alert(`Can not handle ${cantHandleFiles.length} files. please choose a directory to save cantHandleFiles's copy.`, () => {
          dialog.showOpenDialog({properties: ["openDirectory"]}, selectedPaths => {
            cantHandleFiles.forEach(file => {
              let basename = pathModule.basename(file)
              let des = pathModule.join(selectedPaths[0], basename)
              console.log(file)
              console.log(des)
              fs.copy(file, pathModule.join(selectedPaths[0], basename), err => {
                if (err) { console.log(err) }
                console.log("sucess")
              })
              // fs.createReadStream(file).pipe(fs.createWriteStream(require("path").join(selectedPaths[0], basename)))
            })
          })
        })
      })
      btnProcess.disabled = false
      btnProcess.value = "Process"

    })
  } else if (task === "merge") {
    merge(path)
  }
})

document.getElementById("path").addEventListener("keyup", () => {
  let isEmpty = document.getElementById("path").value.length === 0 ? true : false
  document.getElementById("btn-process").disabled = isEmpty
})

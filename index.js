// const fs = require("fs")
const fs = require("fs-extra")
const path = require("path")
const {extract} = require(path.join(__dirname, "extract.js"))
const {merge, collect} = require("./task.js")
const {dialog} = require("electron").remote
const glob = require("glob")

// todo 将getElementById 放到 domloaded 中

document.addEventListener("DOMContentLoaded", (event) => {
  const btnProcess = document.getElementById("btn-process")
  const btnSelect = document.getElementById("btn-select")
  const textPath = document.getElementById("path")
  const indicator = document.getElementById("indicator")

  textPath.addEventListener("keyup", () => {
    let isEmpty = textPath.value.length === 0 ? true : false
    btnProcess.disabled = isEmpty
  })

  btnSelect.addEventListener("click", () => {
    dialog.showOpenDialog({properties: ["openDirectory"]},(selectedPaths) => {
      if (!selectedPaths) {
        console.log("Cancel selecting path.")
        return
      } else {
        textPath.value = selectedPaths[0]
        btnProcess.disabled = false
      }
    })
  })

  btnProcess.addEventListener("click", () => {
    btnProcess.disabled = true
    btnProcess.value = "Processing"
    const dirPath = textPath.value
    const task = document.querySelector("input[name='task']:checked").value
    try {
      fs.statSync(dirPath).isDirectory()
    } catch(err) {
      mdui.alert("Invalid Path.")
      return
    }

    if (task === "collect") {

      glob(`${dirPath}/**/*.rtf`, {}, (err, files) => {

        let filesAmount = files.length
        console.log(`${filesAmount} files to be collect.`)
        let categoriesSet = new Set()
        let cantHandleFiles = new Set()
        let rtf = null

        files.forEach((file, index) => {
          // btnProcess.innerHTML = `${index + 1}/${filesAmount}`
          try {
            rtf = extract(fs.readFileSync(file))
            if (rtf.error === true) {
              cantHandleFiles.push(file)
            } else {
              rtf["nonconformity details"].forEach(detail => {
                categoriesSet.add(detail.title)
              })
            }
          } catch(err) {
            console.log(`无法解析文件: ${file}`)
            cantHandleFiles.add(file)
          }
        })

        return new Promise((resolve, reject) => {
          // btnProcess.innerHTML = "DONE"
          if (categoriesSet.size === 0) {
            console.log("size === 0")
            return resolve()
          }
          mdui.alert(`${categoriesSet.size} categories has been extracted. Choose a filename to save categories.`, () => {
            dialog.showSaveDialog({title: "choose a filename"}, fileName => {
              if (fileName) {
                fs.writeFile(fileName, [...categoriesSet].join("\n"), err => {
                  if (err) {
                    mdui.alert("an error ocurred creating the file" + err.message)
                  }
                })
              }
              resolve()
            })
          })
        }).then(() => {
          mdui.alert(`Can not handle ${cantHandleFiles.size} files. please choose a directory to save cantHandleFiles's copy.`, () => {
            dialog.showOpenDialog({properties: ["openDirectory"]}, selectedPaths => {
              if (selectedPaths) {
                cantHandleFiles.forEach(file => {
                  let basename = path.basename(file)
                  let des = path.join(selectedPaths[0], basename)
                  fs.copy(file, des, err => {
                    if (err) { console.log(err) }
                    console.log("copy cantHandleFile sucess")
                  })
                })
              }
            })
          })
        })
      })
      btnProcess.disabled = false
    } else if (task === "merge") {
      glob(`${path}/**/*.rtf`, {}, (err, files) => {

        console.log(`${files.length} files to be merge.`)
      })
    }
  })
})

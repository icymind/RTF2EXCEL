// const fs = require("fs")
const fs = require("fs-extra")
const path = require("path")
const {extractFromFile} = require(path.join(__dirname, "extract.js"))
const {dialog} = require("electron").remote
const glob = require("glob")
const {createWorkbook, writeToWorkbook} = require(path.join(__dirname, "./excel.js"))

// todo 将getElementById 放到 domloaded 中


document.addEventListener("DOMContentLoaded", () => {
  const btnProcess = document.getElementById("btn-process")
  const btnSelect = document.getElementById("btn-select")
  const textPath = document.getElementById("path")
  // const indicator = document.getElementById("indicator")

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
    // const task = document.querySelector("input[name='task']:checked").value
    const task = "merge"
    try {
      fs.statSync(dirPath).isDirectory()
    } catch(err) {
      mdui.alert("Invalid Path.")
      return
    }

    if (task === "merge") {

      glob(`${dirPath}/**/*.rtf`, {}, (err, files) => {

        let filesAmount = files.length
        let cantHandleFiles = new Set()
        console.log(`${filesAmount} files to be merge.`)
        let sheetName = "Analysis"

        let workbook= createWorkbook(sheetName)
        console.log("workbook created")
        files.forEach((file, index) => {
          // btnProcess.innerHTML = `${index + 1}/${filesAmount}`
          // console.log(`Processing ${file}`)
          let rtf = extractFromFile(file)
          if (rtf["parse error"]) {
            console.log(`add ${file} to cantHandleFiles`)
            cantHandleFiles.add(file)
          }
          writeToWorkbook(workbook, sheetName, rtf)
        })
        workbook = null

        return new Promise((resolve, reject) => {
          mdui.alert(`${filesAmount} files has been processed(${cantHandleFiles.size} fails; ${filesAmount - cantHandleFiles.size} sucess ).\nChoose a filename to save excel.`, () => {
            dialog.showSaveDialog({title: "choose a filename", filters: [{name: "xlsx", extensions: ["xlsx"]}], defaultPath: "rtf2excel.xlsx"}, fileName => {
              if (fileName) {
                return workbook.xlsx.writeFile(fileName)
              }
            })
          })
        }).then(() => {
          mdui.alert(`please choose a directory to save cantHandleFiles's copy.`, () => {
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
    } else if (task === "collect") {
      glob(`${path}/**/*.rtf`, {}, (err, files) => {
        console.log(`${files.length} files to be collect.`)
      })
    }
  })
})

module.exports = {writeToWorkbook: writeToWorkbook, createWorkbook: createWorkbook}

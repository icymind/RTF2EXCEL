// const fs = require("fs")
var bluebirdPromise = require("bluebird")
const fs = require("fs-extra")
const path = require("path")
const {extract, extractFromFile} = require(path.join(__dirname, "extract.js"))
const {dialog} = require("electron").remote
const glob = require("glob")
const {createWorkbook, writeToWorkbook} = require(path.join(__dirname, "./excel.js"))
const defaultFileName = "rtfs2excel.xlsx"
let globalWorkbook = null
let globalUnsuccessfulFile = null

// todo 将getElementById 放到 domloaded 中


document.addEventListener("DOMContentLoaded", () => {
  const btnProcess = document.getElementById("btn-process")
  const btnSaveSelect = document.getElementById("btn-save-select")
  const btnSelect = document.getElementById("btn-select")
  const textPath = document.getElementById("path")
  const textSavePath = document.getElementById("save-path")
  const dlgSave = new mdui.Dialog("#dialog-save-file", {modal: true})
  const dialogSaveFile = document.getElementById("dialog-save-file")
  // const indicator = document.getElementById("indicator")

  let defaultFolder = path.join(process.env[(process.platform == "win32") ? "USERPROFILE" : "HOME"], "Desktop")
  textSavePath.value = defaultFolder

  dialogSaveFile.addEventListener("closed.mdui.dialog", () => {
    btnProcess.innerHTML = "Re Process"
    btnProcess.disabled = false
  })
  dialogSaveFile.addEventListener("confirm.mdui.dialog", () => {
    let isSaveExcel = document.getElementById("save-excel").checked
    let isCopyUnsuccessful = document.getElementById("copy-unsuccessful").checked
    if (isSaveExcel) {
      if (fs.existsSync(textSavePath.value) && fs.statSync(textSavePath.value).isDirectory()) {
        let filePath = path.join(textSavePath.value, defaultFileName)
        if (fs.existsSync(filePath)) {
          fs.renameSync(filePath, `${filePath}.${Date.now()}.bak`)
          console.log(`rename an exist ${defaultFileName}`)
        }
        globalWorkbook.xlsx.writeFile(filePath).then(() => {
          console.log("excel file saved")
          globalWorkbook = null
        })
      } else {
        mdui.alert("Invalid Path")
      }
    }
    if (isCopyUnsuccessful) {
      globalUnsuccessfulFile.forEach(file => {
        let basename = path.basename(file)
        let subPath = path.join(textSavePath.value, "fails")
        if (fs.existsSync(subPath)) {
          fs.renameSync(subPath, `${subPath}.${Date.now()}.bak`)
          console.log(`rename exist foloder ${subPath}`)
        }
        let des = path.join(subPath, basename)
        fs.copy(file, des, err => {
          if (err) { console.log(err) }
        })
      })
      // console.log(`copy ${file} sucess`)
    }
  })

  textPath.addEventListener("keyup", () => {
    let isEmpty = textPath.value.length === 0 ? true : false
    btnProcess.disabled = isEmpty
    btnProcess.innerHTML = "Process"
  })

  btnSaveSelect.addEventListener("click", () => {
    dialog.showOpenDialog({properties: ["openDirectory"]},(selectedPaths) => {
      if (!selectedPaths) {
        console.log("Cancel selecting path.")
        return
      } else {
        textSavePath.value = selectedPaths[0]
      }
    })
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
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      mdui.alert("Invalid Path.")
      return
    }

    glob(`${dirPath}/**/*.rtf`, {}, (err, files) => {

      let filesAmount = files.length
      let paddings = ""
      for (let temp = filesAmount; temp !== 0; temp = parseInt(temp/10)) {
        paddings += "0"
      }
      let cantHandleFiles = new Set()
      console.log(`${filesAmount} files to be merge.`)
      let sheetName = "Analysis"

      globalWorkbook = null
      globalUnsuccessfulFile = null
      let workbook= createWorkbook(sheetName)
      console.log("workbook created")

      let processCounter = 0
      function processPromise(file) {
        return new bluebirdPromise((resolve) => {
          fs.readFile(file, (err, data) => {
            let rtf = extract(data)
            rtf["File Path"] = file
            processCounter += 1
            btnProcess.innerHTML = `Processing ${(paddings + processCounter).slice(-paddings.length)}/${filesAmount}`
            if (rtf["Parse Error"]) {
              console.log(`Can't handle ${file}`)
              cantHandleFiles.add(file)
            }
            writeToWorkbook(workbook, sheetName, rtf)
            resolve(rtf)
          })
        })
      }
      bluebirdPromise.map(files, processPromise, {concurrency: 8})
        .then(() => {
          btnProcess.innerHTML = `${filesAmount} files DONE`
          globalWorkbook = workbook
          globalUnsuccessfulFile = cantHandleFiles
          dlgSave.open()
        })
    })
  })
})


// module.exports = {writeToWorkbook: writeToWorkbook, createWorkbook: createWorkbook}

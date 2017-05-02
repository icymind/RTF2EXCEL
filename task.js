const glob = require("glob")
const parseRTF = require("rtf-parser")
const fs = require("fs")
const assert = require("assert")
const FormatError = require("./formatError")
var Promise = require("bluebird")
const isRtf = require("is-rtf")

// special: disposition
const allInfo = [
  "Season",
  "Vendor",
  "Factory",
  "PO Number",
  "Production Status",
  "GA Product Number",
  "Product name",
  "REI Style Number",
  "Audit Lot Size",
  "Audit Quality Level",
  "Audit Sample Quantity",
  "Audit Reject Quantity",
  "Disposition",
  "Auditor",
  "Nonconformity"
]

process.on("uncaughtException", function(err) {
  console.log("parser can not handle.")
})

function findFirstNotEmpty(element) {
  return element.value.trimLeft() !== ""
}

function isSpanEqual(name) {
  return function(element) {
    return element.value.toLowerCase() === name
  }
}

function printRTF(doc) {
  const paraLen = doc.content.length
  for (let i = 0; i < paraLen; i++) {
    let para = doc.content[i]
    let spanLen = para.content.length
    for (let j = 0; j < spanLen; j++) {
      console.log(`${i}:${j} ==> #${para.content[j].value}#`)
    }
  }
}

// 找到 name 在 doc 中的坐标, 找不到则抛出错误
function searchIndex(doc, name) {
  assert.equal(name, name.toLowerCase(), `para: ${name} should pass as lowercase.`)
  const paraLen = doc.content.length
  for (let i = 0; i < paraLen; i++) {
    let para = doc.content[i]
    let j = para.content.findIndex(isSpanEqual(name))
    if (j >= 0) {
      return {rowIndex: i, colIndex: j}
    }
  }
  throw new FormatError()
}

function extractNC(doc, index) {
  assert.equal("nonconformity", doc.content[index.rowIndex].content[index.colIndex].value.toLowerCase(), "incorrect nonconformity index")
  const linePattern = /^\_+$/
  const line = doc.content[index.rowIndex + 1].content[0].value
  assert.equal(linePattern.test(line), true, "It should be a line after nonconformity.")

  let details = []

  // printRTF(doc)
  for (let i = index.rowIndex + 2; i < doc.content.length; i++) {
    let para = doc.content[i]
    let categoryIndex = para.content.findIndex(findFirstNotEmpty)
    let category = para.content[categoryIndex].value.trimLeft().toLowerCase()

    if (category === "Nonconformity Summary".toLowerCase()) {
      break
    }

    let counter = []
    let remainArray = para.content
    let lastIndex = categoryIndex
    for (let j = 0; j < 4; j++) {
      remainArray = remainArray.slice(lastIndex + 1)
      lastIndex = remainArray.findIndex(findFirstNotEmpty)
      counter.push(remainArray[lastIndex].value)
    }

    let nextLine= doc.content[i + 1]
    if (nextLine.content.length < 8) {
      let notEmptyNo = 0
      nextLine.content.forEach((element) => {
        if (element.value.trimLeft() !== "") {
          notEmptyNo += 1
        }
      })
      if (notEmptyNo === 1) {
        let categoryPart = nextLine.content.find(findFirstNotEmpty).value.trimLeft().toLowerCase()
        if (categoryPart !== "Nonconformity Summary".toLowerCase()) {
          i += 1
          category = category.concat(categoryPart)
        }
      } else {
        throw new FormatError()
      }
    }

    let detail = {
      title: category,
      qty: {
        minor: counter[0],
        major: counter[1],
        critical: counter[2],
        rsi: counter[3]
      }
    }
    for(let classes in detail.qty) {
      assert.equal(/[0-9]+/.test(detail.qty[classes]), true, "qty should be nunmbers.")
    }

    details.push(detail)
  }

  return details
}

function extractInfo(doc, name) {
  assert.equal(name, name.toLowerCase(), `para: ${name} should pass as lowercase.`)
  // assert.notEqual(doc, null)
  if(!doc) {
    return null
  }

  const rowIndexs = {
    nonconformity: 10,
    "rei style number": 2,
    "audit level": 2,
    season: 3,
    auditor: 3,
    "product name": 3,
    "audit quality level": 3
  }
  let rowIndex = rowIndexs[name]
  let para
  let index = {}
  if (rowIndex === undefined) {
    console.log("not index")
    index = searchIndex(doc, name)
  } else {
    para = doc.content[rowIndex]
    let colIndex
    try {
      colIndex = para.content.findIndex(isSpanEqual(name))
    }
    catch(err) {
      return null
    }
    if (colIndex >= 0) {
      index = {rowIndex:rowIndex, colIndex: colIndex}
    } else {
      // search by index
      try {
        index = searchIndex(doc, name)
      } catch(err) {
        return null
      }
    }
  }

  // bug
  // console.log(`para: ${para}`)
  // printRTF(doc)

  if (name === "nonconformity") {
    let result = null
    try {
      result = extractNC(doc, index)
    }
    catch (err) {
      console.log("extractNC error", err)
    }
    return result
  } else if (name === "disposition") {
    let line2rdAfterRowIndex = doc.content[index.rowIndex + 2].content
    let firstNotEmpty = line2rdAfterRowIndex.find(findFirstNotEmpty).value
    if (firstNotEmpty) {
      return firstNotEmpty
    } else {
      throw new FormatError()
    }
  } else {
    let arrayAfterColIndex = doc.content[index.rowIndex].content.slice(index.colIndex + 1)
    let firstNotEmpty = arrayAfterColIndex.find(findFirstNotEmpty).value
    if (firstNotEmpty) {
      return firstNotEmpty
    } else {
      throw new FormatError()
    }
  }

}

function extractInfoFromFile(file) {
  let promise
  try {
    promise = new Promise((resolve, reject) => {
      parseRTF.stream(fs.createReadStream(file), (err, doc) => {
        if (err) {
          console.log(`Error while parseRTF.stream ${file}. error: ${err}.`)
          reject(err, file)
        } else {
          // let info = extractInfo(doc, "nonconformity")
          let info = {}
          allInfo.forEach(infoName => {
            let infoNameLowercase = infoName.toLowerCase()
            let infoValue
            try {
              infoValue = extractInfo(doc, infoNameLowercase)
              // 不会返回 null, 只抛出错误
              if (infoValue === null) {
                console.log(`get null value for ${infoName}`)
              }
              info[infoNameLowercase] = infoValue
              // console.log(`infoName: ${infoName},infoValue: ${infoValue}`)
            } catch(err) {
              console.log(`extract ${infoName} error`, err)
              info = {err: true, fileName: file}
              resolve(info)
            }
          })
          console.log(info)
          resolve(info)
        }
      })
    })
  } catch(err) {
    console.log("Parser can not handle this format.")
  }
  return promise
}

// Promise
function extractCategories(file) {
  let promise
  try {
    promise = new Promise((resolve, reject) => {
      parseRTF.stream(fs.createReadStream(file), (err, doc) => {
        if (err) {
          console.log(`Error while parse ${file}. error: ${err}.`)
          reject(err, file)
        } else {
          // 返回一个数组, 其中每一项都是一个对象, 包含了类别和数量
          let categories = extractInfo(doc, "nonconformity")
          if (categories === null) {
            categories = [file]
          }
          resolve(categories)
        }
      })
    })
  } catch(err) {
    console.log("Parser can not handle this format.")
  }
  return promise
}


// selectedPath: openDialog's first path
// cb(categories, cantHandleFiles)
function merge(selectedPath, callback) {
  console.log("process merge task")
  glob(`${selectedPath}/**/*.rtf`, {}, (err, files) => {
    console.log(`Total rtf files: ${files.length}`)

    let infos = []
    let cantHandleFiles = []

    Promise.map(
      files,
      mergeTask,
      {concurrency: 3}
    ).then(promiseResovles => {
      promiseResovles.forEach(info => {
        if (info.err === true) {
          if (info.fileName !== undefined) {
            cantHandleFiles.push(info.fileName)
          }
        // console.log(category.title)
        } else {
          // console.log(`You must handle ${category} by yourself.`)
          infos.push(info)
        }
      })
      console.log("all collected informations: ", infos.length)
      console.log(infos)
      console.log("Cant handle these files: ", cantHandleFiles.join("\n"))
      callback(infos, cantHandleFiles)
    })
  })
}

var mergeTask = function(file) {
  return new Promise(resolve => {
    if(!isRtf(fs.readFileSync(file))) {
      resolve({err: true, fileName: file})
    }
    try {
      extractInfoFromFile(file)
        .then(info => {
          // console.log("sucess resolve from extractInfoFromFile")
          resolve(info)
        }).catch(err => {
          // extractCategories 被 reject 表示rtf-parser不支持该文件类型
          console.log(`rtf-parser can not handle file: ${file}. err: ${err}`)
          // unHandleFiles.push(file)
          resolve({err: true, fileName: file})
        })
    } catch(err) {
      // console.log(`rtf-parser can not handle file: $(file). err: ${err}`)
      console.log("catch err when running extractInfoFromFile", err)
      resolve({err: true, fileName: file})
    }
  })
}

// 无论什么情况都要 resolve, 否则promise.map变成了 reject
var collectTask = function(file) {
  return new Promise(resolve => {
    if(!isRtf(fs.readFileSync(file))) {
      resolve([file])
    }
    try {
      extractCategories(file)
        .then(categories => resolve(categories))
        .catch(err => {
          // extractCategories 被 reject 表示rtf-parser不支持该文件类型
          console.log(`rtf-parser can not handle file: ${file}. err: ${err}`)
          // unHandleFiles.push(file)
          resolve([file])
        })
    } catch(err) {
      console(`rtf-parser can not handle file: $(file). err: ${err}`)
    }
  })
}

// path: openDialog's first path
// cb(categories, cantHandleFiles)
function collect(path, cb) {

  console.log("process collect task")

  glob(`${path}/**/*.rtf`, {}, (err, files) => {
    console.log(`Total rtf files: ${files.length}`)

    let categoriesSet = new Set()
    let cantHandleFiles = []

    Promise.map(
      files,
      collectTask,
      {concurrency: 3}
    ).then(promiseResovles => {
      promiseResovles.forEach(categories => {
        categories.forEach(category => {
          if (typeof category === "object") {
            categoriesSet.add(category.title)
            // console.log(category.title)
          } else {
            // console.log(`You must handle ${category} by yourself.`)
            cantHandleFiles.push(category)
          }
        })
      })
      console.log("all collected categories: ", [...categoriesSet].join("\n"))
      console.log("Cant handle these files: ", cantHandleFiles.join("\n"))
      cb(categoriesSet, cantHandleFiles)
    })
  })
}

module.exports = {merge: merge, collect: collect}


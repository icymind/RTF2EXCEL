const glob = require("glob")
const parseRTF = require("rtf-parser")
const fs = require("fs")
const assert = require("assert")
const FormatError = require("./formatError")
var Promise = require("bluebird")
const isRtf = require("is-rtf")

// process.on("uncaughtException", function(err) {
  // console.log("parser can not handle.")
// })

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
  }
  let rowIndex = rowIndexs[name]
  let para = doc.content[rowIndex]

  // bug
  // console.log(`para: ${para}`)
  // printRTF(doc)
  let colIndex
  try {
    colIndex = para.content.findIndex(isSpanEqual(name))
  }
  catch(err) {
    return null
  }
  let index = {}

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
  if (name === "nonconformity") {
    let result = null
    try {
      result = extractNC(doc, index)
    }
    catch (err) {
      console.log("extractNC error", err)
    }
    return result
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

function merge(path) {
  console.log("process merge task")
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

function collect(path, cb) {

  console.log("process collect task")

  glob(`${path}/**/*.rtf`, {}, (err, files) => {
    console.log(`Total rtf files: ${files.length}`)

    let categoriesSet = new Set()
    let cantHandleFiles = []
    try {

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
    } catch(err) {
      console.log(err)
    }
  })
}

module.exports = {merge: merge, collect: collect}


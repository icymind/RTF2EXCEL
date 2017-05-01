const glob = require("glob")
const parseRTF = require("rtf-parser")
// const fs = require("fs")
const fs = require("graceful-fs")
const assert = require("assert")
const FormatError = require("./formatError")

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
  // return {rowIndex: -1, colIndex: -1}
  // Can't find label: name
  throw new FormatError()
}

function extractNC(doc, index) {
  assert.equal("nonconformity", doc.content[index.rowIndex].content[index.colIndex].value.toLowerCase(), "incorrect nonconformity index")
  const linePattern = /^\_+$/
  const line = doc.content[index.rowIndex + 1].content[0].value
  assert.equal(linePattern.test(line), true, "It should be a line after nonconformity.")

  let details = []

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
      category: category,
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
  assert.notEqual(doc, null)

  const rowIndexs = {
    nonconformity: 10,
  }
  let rowIndex = rowIndexs[name]
  let para = doc.content[rowIndex]

  let colIndex = para.content.findIndex(isSpanEqual(name))
  let index = {}

  if (colIndex >= 0) {
    index = {rowIndex:rowIndex, colIndex: colIndex}
  } else {
    // search by index
    index = searchIndex(doc, name)
  }
  if (name === "nonconformity") {
    return extractNC(doc, index)
  } else {
    let arrayAfterColIndex = doc.content[index.rowIndex].content.slice(index.colIndex + 1)
    let firstNotEmpty = arrayAfterColIndex.find(findFirstNotEmpty).value
    if (firstNotEmpty) {
      return firstNotEmpty
    } else {
      // unkown format, throw error
      throw new FormatError()
    }
  }

}

// Promise
function extractCategories(file) {

  return new Promise((resolve, reject) => {
    parseRTF.stream(fs.createReadStream(file), (err, doc) => {
      if (err) {
        console.log(`Can't process ${file}. error: ${err}.`)
        reject(err, file)
      } else {
        let category = extractInfo(doc, "nonconformity")
        resolve(category)
      }
    })
  })
}

function merge(path) {
  console.log("process merge task")
}

function collect(path, cb) {

  console.log("process collect task")

  glob(`${path}/**/*.rtf`, {}, (err, files) => {
    console.log(`Total rtf files: ${files.length}`)
    // console.log(files)
    // return

    let promises = []
    let categories = new Set()
    let unHandleFiles = []

    files.forEach(file => {
      let promise = new Promise(resolve => {
        extractCategories(file)
          .then(category => resolve(category))
          .catch((err, file) => {
            console.log(`can not handle file: ${file}. err: ${err}`)
            unHandleFiles.push(file)
            resolve({category: []})
          })
      })
      promises.push(promise)
    })
    Promise.all(promises).then(promiseResolveArray => {
      promiseResolveArray.forEach(categoriesInAfile => {
        categoriesInAfile.forEach(category => {
          categories.add(category.category)
        })
      })
      console.log(`Total categories: ${categories.size}`)
      console.log(`unHandleFiles: ${unHandleFiles}`)
      categories.forEach(category => console.log(category))
      cb(categories)
    }).catch(err => {
      console.log(err)
    })
  })
}

module.exports = {merge: merge, collect: collect}


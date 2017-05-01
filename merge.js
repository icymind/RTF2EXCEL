const fs = require("fs")
const path= require("path")
const glob = require("glob")
const Excel = require("exceljs")
const parseRTF = require("rtf-parser")
const assert = require("assert")

const resultFile = "result.xlsx"
const sheetHeaders = [
  { header: "Season", key: "season", width: 8},
  { header: "Vendor", key: "vendor", width: 18},
  { header: "Factory", key: "factory", width: 24},
  { header: "PO Number", key: "pon", width: 18},
  { header: "Production Status", key: "ps", width: 18},
  { header: "GA Product Number", key: "gapn", width: 18},
  { header: "Product Name", key: "pn", width: 12},
  { header: "REI Style Number", key: "rsn", width: 18},
  { header: "Audit Lot Size", key: "als", width: 13},
  { header: "Audit Quality Level", key: "aql", width: 15},
  { header: "Sample Quanlity", key: "asq", width: 13},
  { header: "Reject Qty", key: "arq", width: 10},
  { header: "Disposition", key: "disposition", width: 24},
  { header: "Auditor", key: "auditor", width: 13 }
]

function getValue(doc, para, span) {
  return doc.content[para].content[span].value
}

function rtf2sheet(file, sheet) {
  return new Promise((resolve, reject) => {
    parseRTF.stream(fs.createReadStream(file), (err, doc) => {

      console.log(`Processing: ${path.win32.basename(file)}`)

      let season, vendor, factory, pon, ps, gapn, pn, rsn, als, aql, asq, arq, disposition, auditor

      try {
        assert.equal("Nonconformity".toLowerCase(), getValue(doc, 10, 0).toLowerCase())

        assert.equal("Season".toLowerCase(), getValue(doc, 3, 2).toLowerCase())
        season = getValue(doc, 3, 3)

        assert.equal("Vendor".toLowerCase(), getValue(doc, 4, 2).toLowerCase())
        vendor = getValue(doc, 4, 3)

        assert.equal("Factory".toLowerCase(), getValue(doc, 5, 2).toLowerCase())
        factory = getValue(doc, 5, 3)

        assert.equal("PO Number".toLowerCase(), getValue(doc, 6, 0).toLowerCase())
        pon = getValue(doc, 6, 1)

        assert.equal("Production Status".toLowerCase(), getValue(doc, 5, 0).toLowerCase())
        ps = getValue(doc, 5, 1)

        assert.equal("GA Product Number".toLowerCase(), getValue(doc, 4, 4).toLowerCase())
        gapn = getValue(doc, 4, 5)

        assert.equal("Product Name".toLowerCase(), getValue(doc, 3, 4).toLowerCase())
        pn = getValue(doc, 3, 5)

        assert.equal("REI Style Number".toLowerCase(), getValue(doc, 2, 5).toLowerCase())
        rsn = getValue(doc, 2, 6)

        assert.equal("Audit Lot Size".toLowerCase(), getValue(doc, 4, 6).toLowerCase())
        als = getValue(doc, 4, 7)

        assert.equal("Audit Quality Level".toLowerCase(), getValue(doc, 3, 6).toLowerCase())
        aql = getValue(doc, 3, 7)

        assert.equal("Audit Sample Quantity".toLowerCase(), getValue(doc, 5, 6).toLowerCase())
        asq = getValue(doc, 5, 7)

        assert.equal("Audit Reject Quantity".toLowerCase(), getValue(doc, 6, 4).toLowerCase())
        arq = getValue(doc, 6, 5)

        assert.equal("Auditor".toLowerCase(), getValue(doc, 3, 0).toLowerCase())
        auditor = getValue(doc, 3, 1)

        for (let disIndex = doc.content.length - 1; disIndex >= 0; disIndex--) {
          if (doc.content[disIndex].content.length !== 0) {
            if (getValue(doc, disIndex, 0).toLowerCase() == "disposition") {
              disposition = getValue(doc, disIndex + 2, 0)
              break
            }
          }
        }
        console.log(disposition)
      } catch(error) {
        console.log(error)
        console.log(`Can't process file: ${file}. Please handle it manually`)
        return
      }
      const row = {
        season:season,
        vendor:vendor,
        factory:factory,
        pon:pon,
        ps:ps,
        gapn:gapn,
        pn:pn,
        rsn:rsn,
        als:als,
        aql:aql,
        asq:asq,
        arq:arq,
        disposition:disposition,
        auditor:auditor
      }
      sheet.addRow(row)
      resolve()
    })

  })
}

const dirPath = process.argv[2]

const ppp = () => {
glob(`${dirPath}/**/*.rtf`, {}, (err, files) => {
  console.log(`Total rtf files: ${files.length}`)

  console.log("Create temp excel file.")
  let workbook = new Excel.Workbook()
  let sheet = workbook.addWorksheet("Analysis")

  sheet.columns = sheetHeaders
  // sheet.addRow({season: "summer", factory: "FFF"})

  let promises = []
  files.forEach(file => {
    promises.push(rtf2sheet(file, sheet))
  })

  fs.stat(resultFile, (err, fileStat) => {
    if (err) {
      console.log(".")
    }
    else if (fileStat.isFile()) {
      fs.unlink(resultFile, () => {
        console.log("delete previous result.xlsx")
      })
    }
    Promise.all(promises).then(() => {
      workbook.xlsx.writeFile("result.xlsx").then(() => {
        console.log("result.xlsx has been wrote to disk.")
      })
    })
    // setTimeout( () => {
      // workbook.xlsx.writeFile("result.xlsx").then(() => {
        // console.log("result.xlsx has been wrote to disk.")
      // })
    // }, 3000)
  })
})
}

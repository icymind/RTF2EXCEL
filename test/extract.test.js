require("chai").should()
const fs = require("fs")
const assert = require("assert")
const path = require("path")
const {extract, extractFromFile} = require(path.join(__dirname, "../extract.js"))


describe("Test extract(str)", function(){

  it("demo", function(){
    [1, 3].length.should.equal(2)
  })

  it("test file must exist.", function() {
    let filePath = path.join(__dirname, "multi-nonconformity-details.rtf")
    return new Promise(function(resolve, reject) {
      fs.stat(filePath, function(err, stat) {
        resolve(stat)
      })
    }).then(function(stat) {
      stat.isFile().should.equal(true)
    })
  })

  it("test file: multi nonconformity details && long category title", function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(path.join(__dirname, "multi-nonconformity-details.rtf"), {encoding: "utf8"}, function(err, data) {
        if (err) { reject(err) }
        else { resolve(data) }
      })
    }).then(function(data) {
      const rtf = extract(data)
      assert(rtf["parse error"] === false, "extract should handle this file.")
      rtf.should.to.be.eql({
        "parse error": false,
        "season": "F13",
        "department": "35 - Packs",
        "rei style number": "854042",
        "audit level": "Normal",
        "auditor": "Asia PQA6",
        "product name": "Traverse 30",
        "audit quality level": "2.5",
        "audit lot size": "160",
        "production status": "Supplier Pre-ship",
        "factory": "KANAAN SAIGON CO. LTD",
        "vendor": "KAANAN CO., LTD.",
        "ga product number": "15978",
        "audit sample quantity": "13",
        "po number": "4500947614,627",
        "audit reject quantity": "2",
        "disposition": [
          {
            "title": "Accept as is",
            "qty": "160"
          }
        ],
        "nonconformity details": [
          {
            "title": "R6-REI Spec Inaccuracy-verified trims/findings",
            "type": "REI Spec Inaccuracy",
            "qty": {
              "minor": "0",
              "major": "0",
              "critical": "0",
              "rsi": "0"
            }
          },
          {
            "title": "R6-REI Spec Inaccuracy-verified trims/findings",
            "type": "REI Spec Inaccuracy",
            "qty": {
              "minor": "0",
              "major": "0",
              "critical": "0",
              "rsi": "0"
            }
          },
          {
            "title": "T1-Trim/Findings-buttons or snaps",
            "type": "Trim/Findings",
            "qty": {
              "minor": "0",
              "major": "1",
              "critical": "0",
              "rsi": "0"
            }
          }
        ]
      })
    })
  })

  it("test file: multi disposition details && long category title", function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(path.join(__dirname, "multi-disposition-details.rtf"), {encoding: "utf8"}, function(err, data) {
        if (err) { reject(err) }
        else { resolve(data) }
      })
    }).then(function(data) {
      const rtf = extract(data)
      assert(rtf["parse error"] === false, "extract should handle this file.")
      rtf.should.to.be.eql({
        "parse error": false,
        "season": "S13",
        "department": "16 - Menswear",
        "rei style number": "844567",
        "audit level": "Normal",
        "auditor": "Asia PQA2",
        "product name": "M Pulaski Short",
        "audit quality level": "4.0",
        "audit lot size": "579",
        "production status": "Supplier Pre-ship",
        "factory": "NANTONG XINLAI SILK GARMENTS CO., LTD.",
        "vendor": "TREASURE WILL, HK",
        "ga product number": "14216",
        "audit sample quantity": "20",
        "po number": "4500771596",
        "audit reject quantity": "3",
        "disposition": [
          {
            "title": "Vendor 100% Sort/Repair then Ship",
            "qty": "579"
          },
          {
            "title": "Future Factory Audit Required",
            "qty": "0"
          },
          {
            "title": "DC Receipt Audit Required",
            "qty": "20"
          }
        ],
        "nonconformity details": [
          {
            "title": "W1-Workmanship-alignment",
            "type": "Workmanship",
            "qty": {
              "minor": "0",
              "major": "3",
              "critical": "0",
              "rsi": "0"
            }
          },
        ]
      })
    })
  })

  it("test file: long vendor/long factory/long product name", function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(path.join(__dirname, "long-vendor-factory-name.rtf"), {encoding: "utf8"}, function(err, data) {
        if (err) { reject(err) }
        else { resolve(data) }
      })
    }).then(function(data) {
      const rtf = extract(data)
      assert(rtf["parse error"] === false, "extract should handle this file.")
      rtf.should.to.be.eql({
        "parse error": false,
        "season": "S13",
        "department": "36 - Travel",
        "rei style number": "844629",
        "audit level": "Normal",
        "auditor": "Asia PQA6",
        "product name": "Tech Beast Gym Duffel 40L",
        "audit quality level": "4.0",
        "audit lot size": "1224",
        "production status": "Supplier Pre-ship",
        "factory": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
        "vendor": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
        "ga product number": "14600",
        "audit sample quantity": "32",
        "po number": "4500777668,7777",
        "audit reject quantity": "4",
        "disposition": [
          {
            "title": "Accept as is",
            "qty": "1224"
          }
        ],
        "nonconformity details": [
          {
            "title": "W16-Workmanship-threads loose/untrimmed",
            "type": "Workmanship",
            "qty": {
              "minor": "2",
              "major": "0",
              "critical": "0",
              "rsi": "0"
            }
          }
        ]
      })
    })
  })

  it("test file: long disposition", function() {
    const fileName = "long-disposition.rtf"
    const filePath = path.join(__dirname, fileName)
    const rtf = extractFromFile(filePath)
    assert(rtf["parse error"] === false, "extract should handle this file.")
    rtf.should.to.be.eql({
      "parse error": false,
      "File Path": filePath,
      "Parse Info": "Parse sucess",
      "season": "F16",
      "department": "Childrenswear",
      "rei style number": "101229",
      "audit level": "Normal",
      "auditor": "Coco Chen",
      "product name": "650D Down Jacket-Kids",
      "audit quality level": "2.5",
      "audit lot size": "4710",
      "production status": "Supplier Pre-ship",
      "vendor": "PAN PACIFIC CO KR",
      "factory": "VIET PACIFIC CLOTHING CO LTD",
      "ga product number": "18587",
      "audit sample quantity": "32",
      "po number": "4503702415/4503654565",
      "audit reject quantity": "3",
      "disposition": [
        {
          "title": "Scrap",
          "qty": "2"
        },
        {
          "title": "Vendor 100% Sort/Repair then Hold for Re-Audit",
          "qty": "4708"
        }
      ],
      "nonconformity details": [
        {
          "title": "F1-Fabric-flaw",
          "type": "Fabric",
          "qty": {
            "minor": "0",
            "major": "2",
            "critical": "0",
            "rsi": "0"
          }
        },
        {
          "title": "W7-Workmanship-other",
          "type": "Workmanship",
          "qty": {
            "minor": "0",
            "major": "3",
            "critical": "0",
            "rsi": "0"
          }
        },
        {
          "title": "W16-Workmanship-threads loose/untrimmed",
          "type": "Workmanship",
          "qty": {
            "minor": "2",
            "major": "0",
            "critical": "0",
            "rsi": "0"
          }
        },
        {
          "title": "W5-Workmanship-dirt/oil",
          "type": "Workmanship",
          "qty": {
            "minor": "0",
            "major": "1",
            "critical": "0",
            "rsi": "0"
          }
        }
      ]
    })
  })

})

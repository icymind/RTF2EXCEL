const path = require("path")
const file2rtfs = [
  {
    file: "multi-line.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "multi-line.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "F16",
      "Audit ID": "1160483",
      "Audit Date": "8/29/2016",
      "Audit Type": "Attribute only",
      "Product Spec": "v01",
      "Product Lifecycle": "Carry-over",
      "Department": "Camping Gear",
      "REI Style Number": "877258",
      "Audit Level": "Normal",
      "Auditor": "Bert Ou",
      "Product Name": "Flexlite Chair updated",
      "Audit Quality Level": "2.5",
      "Audit Lot Size": "1400",
      "Production Status": "Supplier Mfg In-line",
      "Vendor": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
      "Factory": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
      "GA Product Number": "16948",
      "Audit Sample Quantity": "32",
      "PO Number": "4503521218",
      "Audit Reject Quantity": "3",
      "Product Disposition Details": [
        {
          "Disposition": "Vendor 100% Sort/Repair then Hold for Re-Audit",
          "Quantity": "1400"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "W6-Workmanship-needle holes",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "0",
            "Major": "2",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W15-Workmanship-stitching",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "1",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W15-Workmanship-stitching",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "2",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "P1-Packaging-other",
          "NonconformityType": "Packaging",
          "QTY": {
            "Minor": "0",
            "Major": "3",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "M2-Measurement-over tolerance",
          "NonconformityType": "Measurement",
          "QTY": {
            "Minor": "0",
            "Major": "3",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W11-Workmanship-puckering",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "3",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
      ]
    }
  },
  {
    file: "long-disposition.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "long-disposition.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "F16",
      "Audit ID": "1150402",
      "Audit Date": "5/19/2016",
      "Audit Type": "Attribute with measurements",
      "Product Spec": "V03",
      "Product Lifecycle": "New",
      "Department": "Childrenswear",
      "REI Style Number": "101229",
      "Audit Level": "Normal",
      "Auditor": "Coco Chen",
      "Product Name": "650D Down Jacket-Kids",
      "Audit Quality Level": "2.5",
      "Audit Lot Size": "4710",
      "Production Status": "Supplier Pre-ship",
      "Vendor": "PAN PACIFIC CO KR",
      "Factory": "VIET PACIFIC CLOTHING CO LTD",
      "GA Product Number": "18587",
      "Audit Sample Quantity": "32",
      "PO Number": "4503702415/4503654565",
      "Audit Reject Quantity": "3",
      "Product Disposition Details": [
        {
          "Disposition": "Scrap",
          "Quantity": "2"
        },
        {
          "Disposition": "Vendor 100% Sort/Repair then Hold for Re-Audit",
          "Quantity": "4708"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "F1-Fabric-flaw",
          "NonconformityType": "Fabric",
          "QTY": {
            "Minor": "0",
            "Major": "2",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W7-Workmanship-other",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "0",
            "Major": "3",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W16-Workmanship-threads loose/untrimmed",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "2",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W5-Workmanship-dirt/oil",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "0",
            "Major": "1",
            "Critical": "0",
            "RSI": "0"
          }
        }
      ]
    }
  },
  {
    file: "page.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "page.rtf"),
      // "Parse Info": "Parse sucess",
      "Department": "16 - Menswear",
      "REI Style Number": "794446",
      "Audit Level": "Normal",
      "Auditor": "Asia PQA8",
      "Season": "F13",
      "Audit ID": "190499",
      "Audit Date": "7/4/2013",
      "Audit Type": "Attribute with measurements",
      "Product Spec": "V01",
      "Product Lifecycle": "Carry-over",
      "Product Name": "M LS Sahara Tech Shirt",
      "Audit Quality Level": "2.5",
      "Vendor": "TREASURE WILL, HK",
      "GA Product Number": "12313",
      "Audit Lot Size": "758",
      "Production Status": "Supplier Pre-ship",
      "Factory": "JIANGXI HUAYI GARMENTS CO., LTD",
      "Audit Sample Quantity": "20",
      "PO Number": "4500945867/868",
      "Audit Reject Quantity": "2",
      "Nonconformity Details": [
        {
          "Nonconformity": "M3-Measurement-under tolerance",
          "NonconformityType": "Measurement",
          "QTY": {
            "Minor": "0",
            "Major": "4",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W1-Workmanship-alignment",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "0",
            "Major": "1",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "W11-Workmanship-puckering",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "2",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        }
      ],
      "Product Disposition Details": [
        {
          "Disposition": "Vendor 100% Sort/Repair then Ship",
          "Quantity": "758"
        },
        {
          "Disposition": "Future Factory Audit Required",
          "Quantity": "0"
        },
        {
          "Disposition": "DC Receipt Audit Required",
          "Quantity": "20"
        }
      ]

    }
  },
  {
    file: "multi-nonconformity-details.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "multi-nonconformity-details.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "F13",
      "Audit ID": "160780",
      "Audit Date": "6/12/2013",
      "Audit Type": "Attribute only",
      "Product Spec": "v02",
      "Product Lifecycle": "New",
      "Department": "35 - Packs",
      "REI Style Number": "854042",
      "Audit Level": "Normal",
      "Auditor": "Asia PQA6",
      "Product Name": "Traverse 30",
      "Audit Quality Level": "2.5",
      "Audit Lot Size": "160",
      "Production Status": "Supplier Pre-ship",
      "Factory": "KANAAN SAIGON CO. LTD",
      "Vendor": "KAANAN CO., LTD.",
      "GA Product Number": "15978",
      "Audit Sample Quantity": "13",
      "PO Number": "4500947614,627",
      "Audit Reject Quantity": "2",
      "Product Disposition Details": [
        {
          "Disposition": "Accept as is",
          "Quantity": "160"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "R6-REI Spec Inaccuracy-verified trims/findings",
          "NonconformityType": "REI Spec Inaccuracy",
          "QTY": {
            "Minor": "0",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "R6-REI Spec Inaccuracy-verified trims/findings",
          "NonconformityType": "REI Spec Inaccuracy",
          "QTY": {
            "Minor": "0",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        },
        {
          "Nonconformity": "T1-Trim/Findings-buttons or snaps",
          "NonconformityType": "Trim/Findings",
          "QTY": {
            "Minor": "0",
            "Major": "1",
            "Critical": "0",
            "RSI": "0"
          }
        }
      ]
    }
  },
  {
    file: "multi-disposition-details.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "multi-disposition-details.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "S13",
      "Audit ID": "120901",
      "Audit Date": "1/15/2013",
      "Audit Type": "Attribute with measurements",
      "Product Spec": "V01",
      "Product Lifecycle": "Updated",
      "Department": "16 - Menswear",
      "REI Style Number": "844567",
      "Audit Level": "Normal",
      "Auditor": "Asia PQA2",
      "Product Name": "M Pulaski Short",
      "Audit Quality Level": "4.0",
      "Audit Lot Size": "579",
      "Production Status": "Supplier Pre-ship",
      "Factory": "NANTONG XINLAI SILK GARMENTS CO., LTD.",
      "Vendor": "TREASURE WILL, HK",
      "GA Product Number": "14216",
      "Audit Sample Quantity": "20",
      "PO Number": "4500771596",
      "Audit Reject Quantity": "3",
      "Product Disposition Details": [
        {
          "Disposition": "Vendor 100% Sort/Repair then Ship",
          "Quantity": "579"
        },
        {
          "Disposition": "Future Factory Audit Required",
          "Quantity": "0"
        },
        {
          "Disposition": "DC Receipt Audit Required",
          "Quantity": "20"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "W1-Workmanship-alignment",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "0",
            "Major": "3",
            "Critical": "0",
            "RSI": "0"
          }
        },
      ]
    }
  },
  {
    file: "long-Vendor-Factory-name.rtf",
    rtf: {
      "Parse Error": "",
      "File Path": path.join(__dirname, "long-Vendor-Factory-name.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "S13",
      "Audit ID": "160528",
      "Audit Date": "1/15/2013",
      "Audit Type": "Attribute with measurements",
      "Product Spec": "V02",
      "Product Lifecycle": "New",
      "Department": "36 - Travel",
      "REI Style Number": "844629",
      "Audit Level": "Normal",
      "Auditor": "Asia PQA6",
      "Product Name": "Tech Beast Gym Duffel 40L",
      "Audit Quality Level": "4.0",
      "Audit Lot Size": "1224",
      "Production Status": "Supplier Pre-ship",
      "Factory": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
      "Vendor": "QINGDAO YOUNGONE SPORTS PRODUCTS CO LTD",
      "GA Product Number": "14600",
      "Audit Sample Quantity": "32",
      "PO Number": "4500777668,7777",
      "Audit Reject Quantity": "4",
      "Product Disposition Details": [
        {
          "Disposition": "Accept as is",
          "Quantity": "1224"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "W16-Workmanship-threads loose/untrimmed",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "2",
            "Major": "0",
            "Critical": "0",
            "RSI": "0"
          }
        }
      ]
    }
  },
  {
    file: "colon.rtf",
    rtf: {
      "Parse Error": "Can not extract info: [ Audit ID; Product Spec ]",
      "File Path": path.join(__dirname, "colon.rtf"),
      // "Parse Info": "Parse sucess",
      "Season": "S17",
      "Audit ID": "",
      "Audit Date": "1/9/2017",
      "Audit Type": "Attribute with measurements",
      "Product Spec": "",
      "Product Lifecycle": "Updated",
      "Department": "Menswear",
      "REI Style Number": "892144",
      "Audit Level": "Normal",
      "Auditor": "Coco Chen",
      "Product Name": "Talusphere Jacket",
      "Audit Quality Level": "2.5",
      "Audit Lot Size": "2020",
      "Production Status": "Supplier Pre-ship",
      "Vendor": "YOUNGONE CORPORATION",
      "Factory": "YOUNGONE CORPORATION",
      "GA Product Number": "17626",
      "Audit Sample Quantity": "32",
      "PO Number": "4504511354/4504503644",
      "Audit Reject Quantity": "3",
      "Product Disposition Details": [
        {
          "Disposition": "Accept as is",
          "Quantity": "2020"
        }
      ],
      "Nonconformity Details": [
        {
          "Nonconformity": "W11-Workmanship-puckering",
          "NonconformityType": "Workmanship",
          "QTY": {
            "Minor": "2",
            "Major": "1",
            "Critical": "0",
            "RSI": "0"
          }
        }
      ]
    }
  },
]

module.exports = { file2rtfs: file2rtfs }

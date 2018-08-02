const fs = require('fs-extra')
const path = require('path')

const mysqlFilePath = path.resolve(process.cwd(), 'mysql-config.json')

module.exports = function () {

  if (fs.existsSync(mysqlFilePath)) {
    console.log('file: `mysql-config.json` already exist! \n you can tab `tablequick create <table>` to create new table')
  } else {
    const initfile =
      `{
"host": "localhost",
"port": 3306,
"user": "",
"db": "",
"pass": "",
"char": "utf8mb4"
}`
    fs.writeFile(mysqlFilePath, initfile, function (err) {
      if (!err) {
        console.log('mysql-config.json already exist in current directory！')
      }
    })

  }
}
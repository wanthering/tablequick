const fs = require('fs')
const path = require('path')
// const {mysql: config} = require('../config')
const glob = require('glob')
const jsyaml = require('js-yaml')


module.exports = function(argFile){
  const mysqlFilePath = path.resolve(process.cwd(),'mysql-config.json')

  if(fs.existsSync(mysqlFilePath)){
    const config = require(mysqlFilePath)
    process_yaml(argFile).then(sqlFile => {
      executeSql(sqlFile,config)
    })
  }else{
    console.log('there is no `mysql-config.json` file in current directory')
  }
}





async function resolveFile(file) {
  const currentFiles = glob('*', {sync: true})
    .filter(function (cf) {
      return /\.yaml|\.yml/.test(path.parse(cf).ext)
    })
  let trueFile = ''
  if (!file.includes('.')) {
    let found = false
    for (let cf of currentFiles) {
      if (cf.split('.')[0] === file) {
        found = true
        trueFile = cf
      }
    }
    if (!found) {
      console.error('当前目录下没有配置生成数据表的.yaml文件')
      process.exit()
    }
  } else {
    if (!currentFiles.includes(file)) {
      console.error('当前目录下没有配置生成数据表的yaml文件')
      process.exit()
    } else {
      trueFile = file
    }
  }
  return trueFile
}


async function process_yaml(file) {
  const filename = await resolveFile(file)
  const yamlContent = fs.readFileSync(filename, 'utf-8')
  const tableName = path.parse(filename).name
  return createSql(filename, yamlContent)
}

function executeSql(content,config) {
  try {
    console.log('\n======================================')
    console.log('Staring Initiating the database...')
    const DB = require('knex')({
      client: 'mysql',
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.pass,
        database: config.db,
        charset: config.char,
        multipleStatements: true
      }
    })

    console.log(content)
// 执行 .sql 文件内容
    DB.raw(content).then(res => {
      console.log('数据库初始化成功！')
      process.exit(0)
    }, err => {
      if (err.errno === 1050) {
        console.error(`${file}.sql要创建的表已存在`)
      }
      console.log(err)
      process.exit(0)
    })
  } catch (e) {
    console.log(e)
  }

}


function createSql(filename, yamlContent) {
  let doc = jsyaml.load(yamlContent)
  let sqlArr = []
  let keyArr = []
  let tableName = path.parse(filename).name
  if (!doc instanceof Object) {
    throw new Error('the parsed Yaml are not a Object')
  }

  for (let column of Object.keys(doc)) {
    let unparsed = doc[column]
    if (typeof unparsed !== 'string') {
      throw new Error(`the colum:${column}:${unparsed} is not string`)
    }
    let parsed = ''
    /**
     * Start Parsing
     */


    while (unparsed.length > 0) {
      if ((/\<(.*)\>/).test(unparsed)) {
        parsed = ' ' + ((/\<(.+)\>/).exec(unparsed))[1]
        unparsed = ''
        continue
      }else if(/\-\>[\w_]+$/.test(unparsed)){
        parseRes = /(.*)\-\>([\w_]+)$/.exec(unparsed)
        unparsed = parseRes[1]
        keyArr.push("KEY `" + parseRes[2] + "`(`" + column + "`) USING BTREE")
        continue
      }



      if (/c\d+/.test(unparsed)) {
        parseRes = /(.*)c(\d+)(.*)/.exec(unparsed)
        parsed = parsed + ' varchar(' + parseRes[2] + ') COLLATE utf8mb4_unicode_ci NOT NULL'
        unparsed = parseRes[1] + parseRes[3]
        continue
      }

      if (/t/.test(unparsed)) {
        parseRes = /(.*)t(.*)/.exec(unparsed)
        parsed = parsed + ' timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP'
        unparsed = parseRes[1] + parseRes[2]
        continue
      }


      if (/i\d+/.test(unparsed)) {
        parseRes = /(.*)i(\d+)(.*)/.exec(unparsed)
        parsed = parsed + ' int(' + parseRes[2] + ') NOT NULL'
        unparsed = parseRes[1] + parseRes[3]
        continue
      } else if (/i/.test(unparsed)) {
        parseRes = /(.*)i(.*)/.exec(unparsed)
        parsed = parsed + ' int NOT NULL'
        unparsed = parseRes[1] + parseRes[2]
        continue
      }

      if (/^\$\$/.test(unparsed)) {
        let groupd = /^\$\$(.*)/.exec(unparsed)
        unparsed = groupd[1]
        parsed = parsed + ' AUTO_INCREMENT PRIMARY KEY'
        continue
      } else if (/^\$/.test(unparsed)) {
        let groupd = /^\$(.*)/.exec(unparsed)
        unparsed = groupd[1]
        parsed = parsed + ' PRIMARY KEY'
        continue
      }

      throw new Error(`the colum:${column}:${unparsed} got unknow parameter`)
    }
    sqlArr.push("`" + column + "`" + parsed)
  }
  console.log('keyArr',keyArr)
  sqlArr = sqlArr.concat(keyArr)
  return generateSqlFile(tableName, sqlArr)
}

const generateSqlFile = (tableName, sqlArr) => {
  let sqlString = sqlArr.join(',\n')
  return `
SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS \`${tableName}\`;
create table \`${tableName}\`(
${sqlString}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`
}




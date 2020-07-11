const fs = require('fs');
const shell = require('shelljs')

exports.generateRequest = (directory, name, ctrlName) => {
  this.generateRoute(directory, name, ctrlName);
  directory = directory.concat(`/requests/${ctrlName}.req.js`);

  let requestStr = `
exports.${name ? name : 'get'}Request = (role, method_name, req, res) => {
  if(req.session.userdata || req.headers) {
    let id = req.session.userdata ? req.session.userdata._id : req.headers.authorization;
    if(role == 'all') {
      ${ctrlName}Ctrl[method_name](req, res);
    } else {
      Authorization.authenticate(id).then(udata => {
        if(role == udata.type) {
          ${ctrlName}Ctrl[method_name](req, res);
        } else {
          res.status(401).json({ code:401, message: 'Unauthorized User' });
        }
      });
    }
  } else {
    res.status(401).json({ code:401, message: 'Unauthorized User' });
  }
}
`

  try {
    if(fs.existsSync(directory)) {
      //file exists
      fs.appendFile(directory, requestStr, function (err) {
        if (err) return console.log(err);
      });
    } else {
      let request = `var ${ctrlName}Ctrl = require('../controller/${ctrlName}.ctrl');\n${requestStr}`
      fs.writeFile(directory, request, function (err) {
        if (err) return console.log(err);
      });
    }
    console.log(`Request generated successfully`);
  } catch(err) {
    console.error(err)
  }
}

exports.generateResponse = (directory, name, ctrlName) => {
  directory = directory.concat(`/responses/${ctrlName}.res.js`);

  let requestStr = `
exports.${name}Response = (err, data, res) => {
  if(err) {
    logger.error({code:"#${name}${ctrlName.capitalize()}Error",error:err})
    errors = [{
      message:"DB Error! Please contact administrator."
    }]
    responseData = resmodel.formatResponse(500,null,errors,"fail${ctrlName.capitalize()}${name.capitalize()}")
    res.status(500).json(responseData);
  } else {
    responseData = resmodel.formatResponse(200,data,null,"success${ctrlName.capitalize()}${name.capitalize()}")
    res.status(200).json(responseData);
  }
}
`

  try {
    if(fs.existsSync(directory)) {
      //file exists
      fs.appendFile(directory, requestStr, function (err) {
        if (err) return console.log(err);
      });
    } else {
      let request = `var resmodel = require('../utils/responseModel');\n${requestStr}`
      fs.writeFile(directory, request, function (err) {
        if (err) return console.log(err);
      });
    }
    console.log(`Response generated successfully`);
  } catch(err) {
    console.error(err)
  }
}

exports.generateModel = (directory, ctrlName) => {
  directory = directory.concat(`/models/${ctrlName}.model.js`);

  let requestStr = `
const mongoose = require('mongoose');

const ${ctrlName} = new mongoose.Schema({
  s: {
    type:String,
    default:'A'
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  ModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('${ctrlName}', ${ctrlName});
`

  try {
    if(fs.existsSync(directory)) {
      //file exists
      fs.appendFile(directory, requestStr, function (err) {
        if (err) return console.log(err);
      });
    } else {
      let request = requestStr
      fs.writeFile(directory, request, function (err) {
        if (err) return console.log(err);
      });
    }
    console.log(`Model generated successfully`);
  } catch(err) {
    console.error(err)
  }
}

exports.generateRoute = (path, name, ctrlName) => {
  directory = path.concat(`/routes/${ctrlName}.js`);
  url = {
    get: "get('/:id'",
    search: "get('/'",
    create: "post('/'",
    update: "put('/:id'",
    delete: "delete('/:id'",
  }
  let importString = `
var ${ctrlName}Request = require('../requests/${ctrlName}.req.js');
`
  let routeString = `
router.${url[name] ? url[name] : 'get(\'/' + name +'\''}, (req, res) => { ${ctrlName}Request.${name}Request('all', '${name}${ctrlName.capitalize()}', req, res) });
`
  let importIndexString = `
var ${ctrlName.capitalize()} = require('./${ctrlName}');
`
  let routerString = `
router.use('/${ctrlName}',${ctrlName.capitalize()});
`

  try {
    if(fs.existsSync(directory)) {
      //file exists
      fs.readFile(directory, 'utf8', function (err,data) {
        if (err) return console.log(err);

        oldRouteString = data.match(/router\.(get|post|put|delete).*/gm).join("\n")
        replaceString = `${oldRouteString}${routeString}`
        data = data.replace(`${oldRouteString}\n`, replaceString)
        fs.writeFile(directory, data, function (err) {
          if (err) return console.log(err);
        });
      });
    } else {
      let request = `var express = require('express');
var router = express.Router();${importString}${routeString}\nmodule.exports = router;`
      fs.writeFile(directory, request, function (err) {
        if (err) return console.log(err);

        idx_directory = path.concat(`/routes/index.js`);

        // update Index file
        fs.readFile(idx_directory, 'utf8', function(err,data) {
          if (err) return console.log(err);
          oldIndexString = data.match(/(var|let|const)\ .*/gm).join("\n")
          replaceString = `${oldIndexString}${importIndexString}`
          data = data.replace(`${oldIndexString}\n`, replaceString)

          oldRouterString = data.match(/router\.use.*/gm).join("\n")
          replaceString = `${oldRouterString}${routerString}`
          data = data.replace(`${oldRouterString}\n`, replaceString)

          fs.writeFile(idx_directory, data, function (err) {
            if (err) return console.log(err);
          });
        });
      });
    }
    console.log(`Route generated successfully`);
  } catch(err) {
    console.error(err)
  }
}

exports.generateFrameWork = (directory, name) => {
  fs.rmdir(`${directory}/${name}`, function(err) {
    if(err && err.errno != -2) {
      return console.log("Project already exist");
    } else {
      shell.cd(directory);
      shell.exec('git clone https://github.com/mrafiqk/node-framework.git');
      fs.rename(`${directory}/node-framework`, `${directory}/${name}`, function(err) {
        if (err) {
          console.log(err)
        } else {
          removeDir(`${directory}/${name}/.git`)
          for(let file of ["package.json", "config/default.json", "config/prod.json"]) {
            fs.readFile(`${directory}/${name}/${file}`, 'utf8', function (err,data) {
              if(err) return console.log(err);

              fs.writeFile(`${directory}/${name}/${file}`, data.replace(/myapp/gm, name), function (err) {
                if (err) return console.log(err);
              })
            });
          }
          console.log(`Successfully created ${name} project.`)
        }
      })
    }
  })
}

exports.generateController = (directory, name, ctrlName) => {
  directory = directory.concat(`/controller/${ctrlName}.ctrl.js`);

  let ctrlString = {
    get: `
exports.${name}${ctrlName.capitalize()} = (req,res) => {
  let query = {s:"A"};
  query._id = req.params.id;

  ${ctrlName.capitalize()}.findOne(query, (err, docs)=>{
    ${ctrlName}Response.${name}Response(err, docs, res)
  })
}
`,
    search: `
exports.${name}${ctrlName.capitalize()} = (req,res) => {
  let query = {s:"A"};
  query._id = req.params.id;

  ${ctrlName.capitalize()}.find(query, (err, docs)=>{
    ${ctrlName}Response.${name}Response(err, docs, res)
  })
}
`,
    create: `
exports.${name}${ctrlName.capitalize()} = (req,res) => {
  let body = req.body
  let ${ctrlName} = new ${ctrlName.capitalize()}(body);

  ${ctrlName}.save((err, docs) => {
    ${ctrlName}Response.${name}Response(err, docs, res)
  })
}
`,
    update: `
exports.${name}${ctrlName.capitalize()} = (req,res) => {
  let body = req.body
  let query = {s:"A"};
  query._id = req.params.id;

  ${ctrlName.capitalize()}.findOneAndUpdate(query, { $set: body }, { new: true }, (err, docs)=>{
    ${ctrlName}Response.${name}Response(err, docs, res)
  })
}
`,
    delete: `
exports.${name}${ctrlName.capitalize()} = (req,res) => {
  query._id = req.params.id;

  ${ctrlName.capitalize()}.findOneAndUpdate(query, { s: "D" }, { new: true }, (err, docs)=>{
    ${ctrlName}Response.${name}Response(err, docs, res)
  })
}
`,

  }

  let requestStr = ctrlString[name] ? ctrlString[name] : ctrlString['get']
  try {
    if(fs.existsSync(directory)) {
      //file exists
      fs.appendFile(directory, requestStr, function (err) {
        if (err) return console.log(err);
      });
    } else {
      let request = `var ${ctrlName.capitalize()} = require('../models/${ctrlName}.model');
var ${ctrlName}Response = require('../responses/${ctrlName}.res');\n${requestStr}`
      fs.writeFile(directory, request, function (err) {
        if (err) return console.log(err);
      });
    }
    console.log(`Controller generated successfully`);
  } catch(err) {
    console.error(err)
  }
}

// Lib Funnctions
String.prototype.capitalize = function() {
  str = this;
  str = str.replace(/[\w]([A-Z])/g, function(m) {
    return m[0] + " " + m[1];
  }).toLowerCase();
  str = str.charAt(0).toUpperCase() + str.slice(1)
  return str
}

const removeDir = (path) => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach((filename) => {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    console.log("Directory path not found.")
  }
}

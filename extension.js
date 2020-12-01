const vscode = require('vscode');
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */

const folderPath = vscode.workspace.rootPath + path.sep;

function activate(context) {	
	const paths = ["src", "view", `src${path.sep}controll`, `src${path.sep}domain`, `view${path.sep}home.html`,"index.html", "base.json"];

	let disposable = vscode.commands.registerCommand('mvc-php.initPhp', function () {		
		if (!folderPath) {
			vscode.window.showErrorMessage('Selecione um workspace!');
			return;
		}

		let content = "";

		for(let i = 0; i < paths.length; i++){
			if(!fs.existsSync(folderPath + paths[i])) {
				if(!paths[i].includes(".")) {
					fs.mkdir(path.join(folderPath, paths[i]), (err) => {
						if(err){
							vscode.window.showErrorMessage(err.message);
							return;
						}
					});
					if(paths[i].includes("controll")) {
						let controllFolders = ["routes", "process"];
						controllFolders.forEach((folder) => {
							folder = paths[i] + path.sep + folder;
							fs.mkdir(path.join(folderPath, folder), (err) => {
								if(err){
									vscode.window.showErrorMessage(err.message);
									return;
								}
							});
						})
					}
				}else{
					if(paths[i].includes("index")) content = generateIndex();
					else if(paths[i].includes("home")) content = generateHome();
					else if(paths[i].includes("json")) content = generateBasejson();
					fs.writeFile(path.join(folderPath, paths[i]), content, err => {
						if (err) {
							return vscode.window.showErrorMessage(
								"Falha na criação do arquivo HTML\r\n" + err.message
							);
						}
						/*vscode.window.showInformationMessage(
							"HTML criado com sucesso"
						);*/
					});
				}
			}
		}
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('mvc-php.converToClass', () => {		
		if (!folderPath) {
			vscode.window.showErrorMessage('Selecione um workspace!');
			return;
		}

		let dir = folderPath + "src" + path.sep + "domain";
		fs.readdirSync(dir).forEach(file => {
			if(!file.includes(".php")) {
				let pathFile = dir + path.sep + file; 

				fs.readFile(pathFile, 'utf8', function (err,data) {
					if (err) {
						return console.log(err);
					}
					let content = generateClass(file, data);

					fs.rename(pathFile, pathFile+'.php', () => { 
						fs.writeFile(pathFile+'.php', content, { flag: 'w+' }, err => {
							console.log(err);
						})
					}); 
				});
			}
		});

		let content = `<?php
\tclass Conexao{			
\t\tpublic static $instancia;
	
\t\tpublic static function getInstancia(){

\t\t\t$url = "mysql:host=localhost;port=3306;dbname=";
\t\t\t$usuario = "";
\t\t\t$senha = "";
\t\t\t$config = array(PDO::ATTR_PERSISTENT => true,PDO::ATTR_CASE => PDO::CASE_LOWER);
\t\t\tif (!isset(self::$instancia)) {
\t\t\t\tself::$instancia = new PDO($url, $usuario,$senha,$config);
\t\t\t\tself::$instancia->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_EMPTY_STRING);
\t\t\t}
\t\t\treturn self::$instancia;
\t\t}
\t}`;

		fs.writeFile(path.join(dir, "conexao.php"), content, err => {
			if (err) {
				return vscode.window.showErrorMessage(
					"Falha na criação do arquivo HTML\r\n" + err.message
				);
			}
			/*vscode.window.showInformationMessage(
				"HTML criado com sucesso"
			);*/
		});
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('mvc-php.createProcess', () => {
		if (!folderPath) {
			vscode.window.showErrorMessage('Selecione um workspace!');
			return;
		}

		let dir = folderPath + "src" + path.sep + "domain";

		fs.readdirSync(dir).forEach(file => {
			if(!file.includes("conexao")){
				let name = file.split(".")[0];
				let fileName = `processa.${file.split(".")[0]}.php`;		
				console.log(fileName);
				
				dir = folderPath + "src" + path.sep + "controll";

				let content = `<?php\n
\trequire("../domain/${file}");\n
\trequire("../domain/conexao.php");\n
\t$${file[0]}d = new ${name[0].toUpperCase() + name.substr(1)}DAO();\n
\tinclude("configs.php");\n
\tif(!empty($_GET)){
\t}\n
\tif(!empty($_POST)){
\t}\n
\tif(!empty($_PUT)){
\t}\n
\tif(!empty($_DELETE)){
\t}
\n?>`;

				fs.writeFile(path.join(dir, fileName), content, err => {
					if (err) {
						return vscode.window.showErrorMessage(
							"Falha na criação do arquivo HTML\r\n" + err.message
						);
					}
					/*vscode.window.showInformationMessage(
						"HTML criado com sucesso"
					);*/
				});
			}
		});
		
		let content = `<?php

\t$urlFront="http://localhost/usuarios";
\theader("Content-type: application/json; charset=UTF-8");
\theader("Access-Control-Allow-Origin:".$urlFront);
\theader("Access-Control-Allow-Methods: GET, PUT, POST, DELETE");

\t$_DELETE = array();
\t$_PUT = array();
\tif (!strcasecmp($_SERVER['REQUEST_METHOD'], 'DELETE')) {
\t\tparse_str(file_get_contents('php://input'), $_DELETE);
\t}

\tif (!strcasecmp($_SERVER['REQUEST_METHOD'], 'PUT')) {
\t\tparse_str(file_get_contents('php://input'), $_PUT);
\t}`;

		dir = folderPath + "src" + path.sep + "controll";

		fs.writeFile(path.join(dir, "configs.php"), content, err => {
			if (err) {
				return vscode.window.showErrorMessage(
					"Falha na criação do arquivo HTML\r\n" + err.message
				);
			}
			/*vscode.window.showInformationMessage(
				"HTML criado com sucesso"
			);*/
		});
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('mvc-php.loadJson', () => {
		let pathFile = folderPath + "base.json";
		fs.readFile(pathFile, 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			let obj = JSON.parse(data);

			createConfigs(obj.Connection);
			createConection(obj.Database);
			JSONtoClass(obj.Class);
			JSONtoProcess(obj.Class);
			createRoutes(obj.Class);
		});
	});

	context.subscriptions.push(disposable);

	/*context.subscriptions.push(vscode.commands.registerTextEditorCommand("mvc-php.sayHello", (editor, edit) => {
		
	}));*/
}

exports.activate = activate;

function deactivate() {}

function generateBasejson() {
	return (
		`/*{
	"Connection" : {
		"Headers" : {
			"Content-type" : "application/json; charset=UTF-8",
			"Access-Control-Allow-Origin" : "http://localhost/",
			"Access-Control-Allow-Methods" : "GET, PUT, POST, DELETE"
		}
	},
	"Database" : {
		"host" : "localhost",
		"port" : "3306",
		"dbname" : "database_name",
		"user" : "root",
		"password" : ""
	},
	"Class" : [
		{
			"name" : "className1",
			"attributes" : [
				"attr1",
				"attr2"
			]
		},
		{
			"name" : "className2",
			"attributes" : [
				"attr1",
				"attr2"
			]
		}
	]
}*/`
	);
}

function generateIndex() {
  return (
    `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="refresh" content="0; URL='./view/home.html'"/>
	</head>
</html>`
  );
}

function generateHome() {
  return (
    `<!DOCTYPE html>
<html lang="en">
		
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
		
	<body>
	</body>
		
</html>`
  );
}

function generateClass(name, data) {
	name = name[0].toUpperCase() + name.substr(1);
	let text = `<?php\n\n\tclass ${name}{\n`;
	let functions = ``;
	let crud = ``;

	data.split("\n").forEach((item) => {
		item = item.replace('\n', '');
		item = item.replace('\r', '');
		text += `\t\tvar $${item};\n`;

		let newItem = item[0].toUpperCase() + item.substr(1);

		functions += `\n\t\tfunction get${newItem}(){\n\t\t\treturn $this->${item};\n\t\t}
		\n\t\tfunction set${newItem}($${item}){\n\t\t\t$this->${item} = $${item};\n\t\t}\n`;
	});

	crud = `\n\t\tclass ${name}DAO {
\n\t\t\tfunction create($${name.toLowerCase()}) {
\n\t\t\t\t$resultado = array();
\n\t\t\t\treturn $resultado;
\n\t\t\t}
\n\t\t\tfunction read($id) {\n
\n\t\t\t}
\n\t\t\tfunction update() {
\n\t\t\t\t$resultado = array();
\n\t\t\t\treturn $resultado;
\n\t\t\t}
\n\t\t\tfunction delete() {
\n\t\t\t\t$resultado = array();
\n\t\t\t\treturn $resultado;
\n\t\t\t}
\t\t}`;

	text += functions;

	text += crud;

	text += `\n\t}`;
	
	return text;
}

function createConection(data) {	
	let dir = folderPath + "src" + path.sep + "domain";
	let content = `<?php`;
	content += `\n\n\tclass Connection{`;
	content += `\n\t\tpublic static $instance;`;
	content += `\n\n\t\tpublic static function getInstance(){`;
	content += `\n\t\t\t$url = "mysql:host=${data.host};port=${data.port};dbname=${data.dbname};";`;
	content += `\n\n\t\t\t$user = "${data.user}";`;
	content += `\n\n\t\t\t$password = "${data.password}";`;
	content += `\n\n\t\t\t$config = array(PDO::ATTR_PERSISTENT => true,PDO::ATTR_CASE => PDO::CASE_LOWER);`;
	content += `\n\n\t\t\tif (!isset(self::$instance)) {`;
	content += `\n\t\t\t\tself::$instance = new PDO($url,$user,$password,$config);`;
	content += `\n\n\t\t\t\tself::$instance->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_EMPTY_STRING);`;
	content += `\n\t\t\t}`;
	content += `\n\n\t\t\treturn self::$instance;`;
	content += `\n\t\t}`;
	content += `\n\t}`;

	fs.writeFile(path.join(dir, "connection.php"), content, err => {
		if (err) {
			return vscode.window.showErrorMessage(
				"Falha na criação do arquivo HTML\r\n" + err.message
			);
		}
		/*vscode.window.showInformationMessage(
			"HTML criado com sucesso"
		);*/
	});
}

function createConfigs(connection) {
	let dir = folderPath + "src" + path.sep + "controll" + path.sep + "routes";

	let verbs;

	let headers = Object.entries(connection.Headers);
	
	let content = `<?php\n`;

	headers.forEach((header) =>{
		content += `\n\theader("${header[0]}: ${header[1]}");`;
		if(header[0] == "Access-Control-Allow-Methods") {
			verbs = header[1].replace(/ /g, "").split(",");
		}
	});

	verbs.forEach((verb) => {
		if((verb.toUpperCase() != "POST") && (verb.toUpperCase() != "GET")){
			content += `\n\n\t$_${verb.toUpperCase()} = array();`;
			content += `\n\tif (!strcasecmp($_SERVER['REQUEST_METHOD'], '${verb.toUpperCase()}')) {`;
			content += `\n\t\tparse_str(file_get_contents('php://input'), $_${verb.toUpperCase()});`;
			content += `\n\t}`;
		}
	});

	fs.writeFile(path.join(dir, "configs.php"), content, err => {
		if (err) {
			return vscode.window.showErrorMessage(
				"Falha na criação do arquivo HTML\r\n" + err.message
			);
		}
	});
}

function JSONtoClass(arr) {	
	let dir = folderPath + "src" + path.sep + "domain";

	arr.forEach((obj) => {		
		let className = obj.name[0].toUpperCase() + obj.name.substr(1);

		let content = `<?php`;
		content += `\n\n\tclass ${className} {`;
		
		obj.attributes.forEach((attribute) => {
			content += `\n\t\tvar $${attribute};`;
		})

		obj.attributes.forEach((attribute) => {
			let attributeName = attribute[0].toUpperCase() + attribute.substr(1);

			content += `\n\n\t\tfunction get${attributeName}(){`;
			content += `\n\t\t\treturn $this->${attribute};`;
			content += `\n\t\t}`;
			content += `\n\t\tfunction set${attributeName}($${attribute}){`;
			content += `\n\t\t\t$this->${attribute} = $${attribute};`;
			content += `\n\t\t}`;
		})
		
		content += `\n\t}\n`;
		content += `\n\tclass ${className}DAO {`;

		let crud = ["create", "read", "update", "delete"];

		crud.forEach((item) => {
			let param = "";
			let query = "";
			let condition = `\n\n\t\t\t\tif(Connection::getInstance()->exec($query) >= 1){`;

			switch(item) {
				case "create":
					param = `$${obj.name}`;
					query = `\n\t\t\t\t$query = "INSERT INTO table_name (column1, column2) VALUES (value1, value2)";`;
					break;
				case "read":
					query = `\n\t\t\t\t$query = "SELECT column1, column2 FROM table_name WHERE condition";`;
					break;
				case "update":
					condition = `\n\n\t\t\t\t$status = Connection::getInstance()->prepare($query);`; 
					condition += `\n\n\t\t\t\tif($status->execute()){`; 
					query = `\n\t\t\t\t$query = "UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition";`;
					break;
				case "delete":
					query = `\n\t\t\t\t$query = "DELETE FROM table_name WHERE condition";`;
					break;
			}

			content += `\n\t\tfunction ${item}(${param}) {`;
			content += `\n\t\t\t$result = array();`;
			content += `\n\n\t\t\ttry {`;
			content += query;
			content += `\n\n\t\t\t\t$con = new Connection();`;
			content += condition;
			content += `\n\t\t\t\t}`;
			content += `\n\t\t\t}catch(PDOException $e) {`;
			content += `\n\t\t\t}`;
			content += `\n\n\t\t\treturn result;`;
			content += `\n\t\t}\n`;
		});
		
		content += `\t}\n`;

		
		fs.writeFile(path.join(dir, `${obj.name}.php`), content, err => {
			if (err) {
				return vscode.window.showErrorMessage(
					"Falha na criação do arquivo HTML\r\n" + err.message
				);
			}
		});
	});
}

function createRoutes(arr) {
	let dir = folderPath + "src" + path.sep + "controll" + path.sep + "routes";

	arr.forEach((obj) => {	
		let className = obj.name[0].toUpperCase() + obj.name.substr(1);
		let objProc = `${obj.name[0]}p`;
		
		let content = `<?php`;
		content += `\n\n\trequire("../process/process.${obj.name}.php");`;
		content += `\n\n\tinclude("configs.php");`;
		content += `\n\n\t$${objProc} = new ${className}Process();`;
		content += `\n\n\tswitch($_SERVER['REQUEST_METHOD']) {`;
		content += `\n\t\tcase "GET":`;
		content += `\n\t\t\t$${objProc}->doGet($_GET);`;
		content += `\n\t\t\tbreak;`;
		content += `\n\n\t\tcase "POST":`;
		content += `\n\t\t\t$${objProc}->doPost($_POST);`;
		content += `\n\t\t\tbreak;`;
		content += `\n\n\t\tcase "PUT":`;
		content += `\n\t\t\t$${objProc}->doPut($_PUT);`;
		content += `\n\t\t\tbreak;`;
		content += `\n\n\t\tcase "DELETE":`;
		content += `\n\t\t\t$${objProc}->doDelete($_DELETE);`;
		content += `\n\t\t\tbreak;`;
		content += `\n\t}`;

		fs.writeFile(path.join(dir, `route.${obj.name}.php`), content, err => {
			if (err) {
				return vscode.window.showErrorMessage(
					"Falha na criação do arquivo HTML\r\n" + err.message
				);
			}
		});		
	});
}

function JSONtoProcess(arr) {
	let dir = folderPath + "src" + path.sep + "controll" + path.sep + "process";
	let requests = ["doGet", "doPost", "doPut", "doDelete"];

	arr.forEach((obj) => {		
		let className = obj.name[0].toUpperCase() + obj.name.substr(1);
		let objDao = `${obj.name[0]}d`;
		
		let content = `<?php`;
		content += `\n\n\trequire("../../domain/connection.php");`;
		content += `\n\trequire("../../domain/${className}.php");`;
		content += `\n\n\t$${objDao} = new ${className}DAO();`;
		content += `\n\n\tclass ${className}Process {`;
		requests.forEach((request) => {
			content += `\n\t\tfunction ${request}($arr){`;
			content += `\n\t\t\t$sucess = "use to result to DAO";`;
			content += `\n\t\t\thttp_response_code(202);`;
			content += `\n\t\t\techo json_encode($sucess);`;
			content += `\n\t\t}\n`;
		});
		content += `\t}`;

		fs.writeFile(path.join(dir, `process.${obj.name}.php`), content, err => {
			if (err) {
				return vscode.window.showErrorMessage(
					"Falha na criação do arquivo HTML\r\n" + err.message
				);
			}
		});	
	});
}

function getCurrentWorkspaceFolder() {
  try {
    return vscode
      .workspace
      .workspaceFolders[0]
      .uri
      .toString()
      .split(":")[1];
  } catch (error) {
    console.error(error);
    return '';
	}
}

module.exports = {
	activate,
	deactivate
}

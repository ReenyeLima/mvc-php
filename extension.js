const vscode = require('vscode');
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {	
	const folderPath = vscode.workspace.rootPath + path.sep;
	const paths = ["src", "view", `src${path.sep}controll`, `src${path.sep}domain`, `view${path.sep}home.html`,"index.html"];

	let disposable = vscode.commands.registerCommand('mvc-php.initPhp', function () {		
		if (!folderPath) {
			vscode.window.showErrorMessage('Selecione um workspace!');
			return;
		}

		let content = "";

		for(let i = 0; i < paths.length; i++){
			if(!fs.existsSync(folderPath + paths[i])) {
				if(!paths[i].includes("html")) {
					fs.mkdir(path.join(folderPath, paths[i]), (err) => {
						if(err){
							vscode.window.showErrorMessage(err.message);
							return;
						}
					})	
				}else{
					if(paths[i].includes("index")) content = generateIndex();
					else if(paths[i].includes("home")) content = generateHome();
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

	/*context.subscriptions.push(vscode.commands.registerTextEditorCommand("mvc-php.sayHello", (editor, edit) => {
		
	}));*/
}

exports.activate = activate;

function deactivate() {}

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

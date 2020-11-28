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

	data.split("\n").forEach((item) => {
		item = item.replace('\n', '');
		item = item.replace('\r', '');
		text += `\t\tvar $${item};\n`;

		let newItem = item[0].toUpperCase() + item.substr(1);

		functions += `\n\t\tfunction get${newItem}(){\n\t\t\treturn $this->${item};\n\t\t}
		\n\t\tfunction set${newItem}($${item}){\n\t\t\t$this->${item} = $${item};\n\t\t}\n`;
	});

	text += functions;

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

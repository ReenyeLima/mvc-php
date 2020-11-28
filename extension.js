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

	disposable = vscode.commands.registerCommand('mvc-php.sayHello', (name) => {		
		console.log(`Hello ${name}!!!`);
	});

	context.subscriptions.push(disposable);
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

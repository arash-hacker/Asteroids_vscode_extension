'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import fetch from 'node-fetch';

let panel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.asteroid', async () => {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showErrorMessage('open a source file and use in active editor please ⁉️ ');
      return;
    }
    vscode.window.showInformationMessage('asteroid started 🚀!');

    panel = vscode.window.createWebviewPanel(
      'ArashMidos',
      'Asteroid Game 🚀',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    const onDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, 'utils', 'asteroids.js')
    );

    panel.webview.html = getWebviewContent(
      onDiskPath.with({ scheme: 'vscode-resource' }),
      vscode.window.activeTextEditor.document.getText()
    );

    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            panel!.dispose();
            return;
        }
      },
      undefined,
      context.subscriptions
    );

    panel.onDidDispose(
      () => {
      },
      null,
      context.subscriptions
    );
    //currentPanel.webview.postMessage({ command: 'refactor' });
  });

  let disposable2 = vscode.commands.registerCommand('extension.asteroid_web', async () => {

    let which = await vscode.window.showInputBox({ placeHolder: "which website ?(ex https://arshiamidos.github.io)" });
    if (!which || which!.trim()!.length === 0) {
      vscode.window.showErrorMessage("please tell me your target 😇");
      return;
    }
    vscode.window.showInformationMessage('asteroid started 🚀!');

    let sourceCode = await fetch(which).then(r => r.text());

    panel = vscode.window.createWebviewPanel(
      'ArashMidos',
      `Asteroid Game [${which}]🚀`,
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    const onDiskPath = vscode.Uri.file(
      path.join(context.extensionPath, 'utils', 'asteroids.js')
    );

    panel.webview.html = getWebSite(
      onDiskPath.with({ scheme: 'vscode-resource' }),
      sourceCode,
      which);

    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showWarningMessage(message.text);
            panel!.dispose();
            return;
        }
      },
      undefined,
      context.subscriptions
    );

    panel.onDidDispose(
      () => { },
      null,
      context.subscriptions
    );
  });
  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() { }
function getWebSite(jsPath: vscode.Uri, sourceCode: string, which: string) {

  sourceCode = sourceCode.replace(/src=\"\.\//g, `src="${which}/`);
  sourceCode = sourceCode.replace(/src=\'\.\//g, `src='${which}/`);

  sourceCode = sourceCode.replace(/src=\"\.\.\//g, `src="${which}/`);
  sourceCode = sourceCode.replace(/src=\'\.\.\//g, `src='${which}/`);

  sourceCode = sourceCode.replace(/src=\"(?!http)/g, `src="${which}/`);
  sourceCode = sourceCode.replace(/src=\'(?!http)/g, `src='${which}/`);

  sourceCode = sourceCode.replace(/href=\"(?!http)/g, `href="${which}/`);
  sourceCode = sourceCode.replace(/href=\'(?!http)/g, `href='${which}/`);


  sourceCode = sourceCode.replace("</html>", `
    ${sourceCode}
    <script type="text/javascript" src="${jsPath}"></script>
    </html>`);

  return sourceCode;


}
function getWebviewContent(jsPath: vscode.Uri, sourceCode: string) {
  return `
    <DOCTYPE! html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    </head>
    
    <body>
    ${(() => {
      let rc = ["7", "8", "9", "a", "b", "c", "d", "e", "f"];
      let x = sourceCode.split("\n").map(line => {

        return `<div style="display:flex;flex-direction:row">` + line.split(" ").map(ch => {
          if (!ch) {
            return "&nbsp";
          }
          let r = Number(rc.length * Math.random()).toFixed(0);
          let g = Number(rc.length * Math.random()).toFixed(0);
          let b = Number(rc.length * Math.random()).toFixed(0);
          return `&nbsp <p style="color:#${r + "" + g + b}">${ch}</p>`;
        }).join(" ") + "</div>";

      }).join("\n");

      return x;

    })()}
    </body>
    <script type="text/javascript" src="${jsPath}"></script>
    </html>`;
}
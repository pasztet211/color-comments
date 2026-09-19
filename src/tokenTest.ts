import * as vscode from 'vscode';
import * as vscodeTextmate from 'vscode-textmate';
import { tokenize } from './textmate';

export async function testCurrentFile(
    registry: vscodeTextmate.Registry
) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        console.log('NO ACTIVE EDITOR');
        return;
    }

    const document = editor.document;

    console.log('LANGUAGE:', document.languageId);
    console.log('FILE:', document.fileName);
    console.log('--- TOKENS ---');

    const tokens = await tokenize(
        registry,
        document.languageId,
        document.getText()
    );

    for (const { lineNumber, line, token } of tokens) {
        const text = line.slice(
            token.startIndex,
            token.endIndex
        );

        console.log(
            `[${lineNumber + 1}]`,
            JSON.stringify(text),
            token.scopes
        );
    }

    console.log('--- END ---');
}
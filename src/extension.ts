import * as vscode from 'vscode';
import { createRegistry, tokenize } from './textmate';
import { testCurrentFile } from './tokenTest';

const markerRegex = /\b(TODO|FIX|NOTE|ADD)\b/i;
const doneMarkerRegex = /\b(FIX|ADD)ED\b/i;
const additionalMarkerRegex = /^([!+]) /;

export async function activate(context: vscode.ExtensionContext) {
    try {
    const registry = await createRegistry();

    let globalDecoration: vscode.TextEditorDecorationType | undefined;

    function updateGlobalDecoration() {
        globalDecoration?.dispose();

        const globalColor = vscode.workspace
            .getConfiguration('colorComments')
            .get<string>('globalColor', '');

        if (globalColor) {
            globalDecoration =
                vscode.window.createTextEditorDecorationType({
                    color: globalColor
                });
        } else {
            globalDecoration = undefined;
        }
    }
    const configuration = vscode.workspace.getConfiguration('colorComments');

    function createDecorations() {
        return {
        TODO: vscode.window.createTextEditorDecorationType({
            color: configuration.get<string>('todoColor', '#ffcc00')
        }),

        FIX: vscode.window.createTextEditorDecorationType({
            color: configuration.get<string>('fixColor', '#ff5555')
        }),

        NOTE: vscode.window.createTextEditorDecorationType({
            color: configuration.get<string>('noteColor', '#55aaff')
        }),

        ADD: vscode.window.createTextEditorDecorationType({
            color: configuration.get<string>('addColor', '#55ff55')
        }),

        italic: vscode.window.createTextEditorDecorationType({
            fontStyle: 'italic'
        }),

        bold: vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold'
        }),

        strikethrough: vscode.window.createTextEditorDecorationType({
            textDecoration: 'line-through'
        }),

        hidden: vscode.window.createTextEditorDecorationType({
            opacity: '0',
            letterSpacing: '-9px'
        })
        };
    }

    let decorations = createDecorations();

    function updateDecorations() {
        decorations.TODO.dispose();
        decorations.FIX.dispose();
        decorations.NOTE.dispose();
        decorations.ADD.dispose();
        decorations = createDecorations();
    }

    updateGlobalDecoration();

    async function update(editor: vscode.TextEditor) {
        const enabled = vscode.workspace
            .getConfiguration('colorComments')
            .get<boolean>('enabled', true);
        const grammaticallyDoneOn = vscode.workspace
            .getConfiguration('colorComments')
            .get<boolean>('gramatically-done-on', false);

        if (!enabled) {
            editor.setDecorations(decorations.TODO, []);
            editor.setDecorations(decorations.FIX, []);
            editor.setDecorations(decorations.NOTE, []);
            editor.setDecorations(decorations.ADD, []);
            editor.setDecorations(decorations.italic, []);
            editor.setDecorations(decorations.bold, []);
            editor.setDecorations(decorations.strikethrough, []);
            editor.setDecorations(decorations.hidden, []);

            if (globalDecoration) {
                editor.setDecorations(globalDecoration, []);
            }

            return;
        }

        const tokens = await tokenize(
            registry,
            editor.document.languageId,
            editor.document.getText()
        );

        const ranges: Record<string, vscode.Range[]> = {
            global: [],
            TODO: [],
            FIX: [],
            NOTE: [],
            ADD: [],
            italic: [],
            bold: [],
            strikethrough: [],
            hidden: []
        };

        for (const { lineNumber, line, token } of tokens) {
            if (!token.scopes.some((scope: string) => scope.includes('comment'))) {
                continue;
            }

            const comment = line.slice(
                token.startIndex,
                token.endIndex
            );

            const formatting = [
                { regex: /%([^%\n]+)%/g, decoration: 'italic', delimiter: 1 },
                { regex: /\^([^^\n]+)\^/g, decoration: 'bold', delimiter: 1 },
                { regex: /~([^~\n]+)~/g, decoration: 'strikethrough', delimiter: 1 }
            ] as const;

            for (const { regex, decoration, delimiter } of formatting) {
                let formatMatch;

                while ((formatMatch = regex.exec(comment)) !== null) {
                    const matchStart = token.startIndex + formatMatch.index;
                    const contentStart = matchStart + delimiter;
                    const contentEnd = matchStart + formatMatch[0].length - delimiter;

                    ranges[decoration].push(new vscode.Range(
                        new vscode.Position(lineNumber, contentStart),
                        new vscode.Position(lineNumber, contentEnd)
                    ));

                    // hide the opening and closing markers
                    ranges.hidden.push(
                        new vscode.Range(
                            new vscode.Position(lineNumber, matchStart),
                            new vscode.Position(lineNumber, contentStart)
                        ),
                        new vscode.Range(
                            new vscode.Position(lineNumber, contentEnd),
                            new vscode.Position(lineNumber, contentEnd + delimiter)
                        )
                    );
                }
            }

            const match = grammaticallyDoneOn
                ? markerRegex.exec(comment) || doneMarkerRegex.exec(comment)
                : markerRegex.exec(comment);

            const prefixEnd = comment.indexOf(' ');
            const symbol = prefixEnd !== -1
                ? comment[prefixEnd + 1]
                : '';

            const additionalMatch = symbol === '+' || symbol === '!'
                ? symbol
                : null;
            const start = new vscode.Position(
                lineNumber,
                token.startIndex
            );

            const end = new vscode.Position(
                lineNumber,
                token.endIndex
            );

            const range = new vscode.Range(start, end);

            if (match || additionalMatch) {
                const marker = (additionalMatch
                    ? additionalMatch === '+' ? 'ADD' : 'FIX'
                    : match![1].toUpperCase()) as keyof typeof ranges;

                ranges[marker].push(range);
            } else {
                ranges.global.push(range);
            }
        }

        editor.setDecorations(decorations.TODO, ranges.TODO);
        editor.setDecorations(decorations.FIX, ranges.FIX);
        editor.setDecorations(decorations.NOTE, ranges.NOTE);
        editor.setDecorations(decorations.ADD, ranges.ADD);
        editor.setDecorations(decorations.italic, ranges.italic);
        editor.setDecorations(decorations.bold, ranges.bold);
        editor.setDecorations(decorations.strikethrough, ranges.strikethrough);
        editor.setDecorations(decorations.hidden, ranges.hidden);

        if (globalDecoration) {
            editor.setDecorations(globalDecoration, ranges.global);
        }
    }

    function updateActiveEditor() {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            update(editor);
        }
    }

    const tokenTestCommand = vscode.commands.registerCommand(
        'colorComments.tokenTest',
        () => testCurrentFile(registry)
    );

    const reloadCommand = vscode.commands.registerCommand(
        'colorComments.reload',
        () => {
            updateDecorations();
            updateGlobalDecoration();
            updateActiveEditor();
            vscode.window.showInformationMessage(
                'Coloring Comments reloaded.'
            );
        }
    );

    const enableCommand = vscode.commands.registerCommand(
        'colorComments.enable',
        async () => {
            await vscode.workspace
                .getConfiguration('colorComments')
                .update(
                    'enabled',
                    true,
                    vscode.ConfigurationTarget.Global
                );

            updateActiveEditor();

            vscode.window.showInformationMessage(
                'Coloring Comments enabled.'
            );
        }
    );

    const disableCommand = vscode.commands.registerCommand(
        'colorComments.disable',
        async () => {
            await vscode.workspace
                .getConfiguration('colorComments')
                .update(
                    'enabled',
                    false,
                    vscode.ConfigurationTarget.Global
                );

            updateActiveEditor();

            vscode.window.showInformationMessage(
                'Coloring Comments disabled.'
            );
        }
    );

    const settingsCommand = vscode.commands.registerCommand(
        'colorComments.openSettings',
        () => {
            vscode.commands.executeCommand(
                'workbench.action.openSettings',
                '@ext:pasztet211.colorComments'
            );
        }
    );

    updateActiveEditor();

    context.subscriptions.push(
        reloadCommand,
        enableCommand,
        disableCommand,
        settingsCommand,
        tokenTestCommand,

        vscode.window.onDidChangeActiveTextEditor(
            updateActiveEditor
        ),

        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('colorComments')) {
                updateDecorations();
                updateGlobalDecoration();
                updateActiveEditor();
            }
        }),

        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;

            if (editor && event.document === editor.document) {
                update(editor);
            }
        }),

        {
            dispose() {
                decorations.TODO.dispose();
                decorations.FIX.dispose();
                decorations.NOTE.dispose();
                decorations.ADD.dispose();
                globalDecoration?.dispose();
            }
        }
    );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Color Comments activation failed: ${String(error)}`
        );

        throw error;
    }
}

export function deactivate() {}
import * as fs from 'fs';
import * as path from 'path';
import * as oniguruma from 'vscode-oniguruma';
import * as vscodeTextmate from 'vscode-textmate';
import { getGrammar } from './grammars';
import * as vscode from 'vscode';

export const languageIds = [
    'python',
    'javascript',
    'typescript',
    'c',
    'cpp',
    'java',
    'csharp',
    'go',
    'rust',
    'kotlin',
    'swift',
    'html',
    'lua'
];

export async function createRegistry() {

    const wasmPath = path.join(
        __dirname,
        'onig.wasm'
    );

    const wasm = fs.readFileSync(wasmPath).buffer;

    await oniguruma.loadWASM(wasm);

    const onigLib = Promise.resolve({
        createOnigScanner(patterns: string[]) {
            return new oniguruma.OnigScanner(patterns);
        },

        createOnigString(text: string) {
            return new oniguruma.OnigString(text);
        }
    });

    return new vscodeTextmate.Registry({
        onigLib,

        loadGrammar: async (scopeName) => {
            for (const languageId of languageIds) {
                const grammar = getGrammar(languageId);

                if (grammar?.scopeName === scopeName) {
                    return vscodeTextmate.parseRawGrammar(
                        JSON.stringify(grammar),
                        `${scopeName}.tmLanguage.json`
                    );
                }
            }

            return undefined;
        }
    });
}
export async function tokenize(
    registry: vscodeTextmate.Registry,
    languageId: string,
    fileContents: string
) {
    const grammar = getGrammar(languageId);
    if (!grammar) {
        return [];
    }

    const language = await registry.loadGrammar(grammar.scopeName);
    if (!language) {
        return [];
    }

    const tokens: {
        lineNumber: number;
        line: string;
        token: vscodeTextmate.IToken;
    }[] = [];

    let state = vscodeTextmate.INITIAL;

    for (const [lineNumber, line] of fileContents.split(/\r?\n/).entries()) {
        const result = language.tokenizeLine(line, state);

        for (const token of result.tokens) {
            tokens.push({
                lineNumber,
                line,
                token
            });
        }

        state = result.ruleStack;
    }

    return tokens;
}
export function getGrammar(languageId: string) {
    if (languageId === 'python') {
        return {
            scopeName: 'source.python',
            patterns: [
                {
                    name: 'string.quoted',
                    match: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\''
                },
                {
                    name: 'comment.line.number-sign',
                    match: '#.*$'
                }
            ]
        };
    }

    if (
        languageId === 'c' ||
        languageId === 'cpp' ||
        languageId === 'java' ||
        languageId === 'csharp' ||
        languageId === 'go' ||
        languageId === 'rust' ||
        languageId === 'kotlin' ||
        languageId === 'swift' ||
        languageId === 'javascript' ||
        languageId === 'typescript'
    ) {
        return {
            scopeName: `source.${languageId}`,
            patterns: [
                {
                    name: 'string.quoted.double',
                    begin: '"',
                    end: '"',
                    patterns: [
                        {
                            name: 'constant.character.escape',
                            match: '\\\\.'
                        }
                    ]
                },
                {
                    name: 'string.quoted.single',
                    begin: '\'',
                    end: '\'',
                    patterns: [
                        {
                            name: 'constant.character.escape',
                            match: '\\\\.'
                        }
                    ]
                },
                {
                    name: 'comment.line.double-slash',
                    match: '//.*$'
                },
                {
                    name: 'comment.block',
                    begin: '/\\*',
                    end: '\\*/'
                }
            ]
        };
    }

    if (languageId === 'html') {
        return {
            scopeName: 'text.html.basic',
            patterns: [
                {
                    name: 'comment.block',
                    begin: '<!--',
                    end: '-->'
                }
            ]
        };
    }

    if (languageId === 'lua') {
        return {
            scopeName: 'source.lua',
            patterns: [
                {
                    name: 'comment.line.double-dash',
                    match: '--.*$'
                },
                {
                    name: 'comment.block',
                    begin: '--\\[\\[',
                    end: '\\]\\]'
                }
            ]
        };
    }

    return undefined;
}
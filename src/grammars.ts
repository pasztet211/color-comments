type Grammar = {
    scopeName: string;
    patterns: {
        name?: string;
        match?: string;
        begin?: string;
        end?: string;
        contentName?: string;
        beginCaptures?: {
            [capture: number]: {
                name: string;
            };
        };
        endCaptures?: {
            [capture: number]: {
                name: string;
            };
        };
        patterns?: Grammar['patterns'];
    }[];
};

export function getGrammar(languageId: string): Grammar | undefined {
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
        languageId === 'typescript' ||
        languageId === 'cs'
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
                },
                {
                    begin: '<script\\b[^>]*>',
                    end: '</script\\s*>',
                    contentName: 'source.javascript',
                    patterns: getGrammar('javascript')?.patterns ?? []
                }
            ]
        };
    }

    if (languageId === 'lua') {
        return {
            scopeName: 'source.lua',
            patterns: [
                {
                    name: 'comment.block',
                    begin: '--\\[\\[',
                    end: '\\]\\]'
                },
                {
                    name: 'comment.line.double-dash',
                    match: '--.*$'
                }
            ]
        };
    }

    if (languageId === 'sql') {
        return {
            scopeName: 'source.sql',
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
                    name: 'comment.line.double-dash',
                    match: '--.*$'
                },
                {
                    name: 'comment.block',
                    begin: '/\\*',
                    end: '\\*/'
                }
            ]
        }
    }

    if (languageId === 'markdown') {
        const fencedLanguages = [
            {
                aliases: ['py', 'python'],
                languageId: 'python'
            },
            {
                aliases: ['js', 'javascript'],
                languageId: 'javascript'
            },
            {
                aliases: ['ts', 'typescript'],
                languageId: 'typescript'
            },
            {
                aliases: ['c'],
                languageId: 'c'
            },
            {
                aliases: ['cpp', 'c\\+\\+'],
                languageId: 'cpp'
            },
            {
                aliases: ['cs', 'c#', 'csharp'],
                languageId: 'cs'
            },
            {
                aliases: ['java'],
                languageId: 'java'
            },
            {
                aliases: ['cs', 'csharp', 'c\\#'],
                languageId: 'csharp'
            },
            {
                aliases: ['go'],
                languageId: 'go'
            },
            {
                aliases: ['rs', 'rust'],
                languageId: 'rust'
            },
            {
                aliases: ['kt', 'kotlin'],
                languageId: 'kotlin'
            },
            {
                aliases: ['swift'],
                languageId: 'swift'
            },
            {
                aliases: ['html'],
                languageId: 'html'
            },
            {
                aliases: ['lua'],
                languageId: 'lua'
            },
            {
                aliases: ['sql'],
                languageId: 'sql'
            }
        ];

        const fencedPatterns = fencedLanguages.map(({ aliases, languageId: fencedLanguageId }) => ({
            name: `fenced_code.block.markdown.${fencedLanguageId}`,
            begin: `^(\`{3,})\\s*(${aliases.join('|')})\\s*$`,
            end: '^\\1\\s*$',
            contentName: `source.${fencedLanguageId}`,
            beginCaptures: {
                1: { name: 'punctuation.definition.fenced_code.begin.markdown' },
                2: { name: 'fenced_code.block.language.markdown' }
            },
            endCaptures: {
                1: { name: 'punctuation.definition.fenced_code.end.markdown' }
            },
            patterns: getGrammar(fencedLanguageId)?.patterns ?? []
        }));

        return {
            scopeName: 'source.markdown',
            patterns: [
                ...fencedPatterns,
                {
                    name: 'fenced_code.block.markdown',
                    begin: '^(`{3,})(?:\\s*([^\\s`]+))?[^\\n]*$',
                    end: '^\\1\\s*$',
                    beginCaptures: {
                        1: { name: 'punctuation.definition.fenced_code.begin.markdown' },
                        2: { name: 'fenced_code.block.language.markdown' }
                    },
                    endCaptures: {
                        1: { name: 'punctuation.definition.fenced_code.end.markdown' }
                    }
                }
            ]
        }
    }

    return undefined;
}
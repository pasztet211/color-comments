#!/usr/bin/env bash

npm run package
vsce package --allow-missing-repository
code --install-extension ./*.vsix
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch');

const REPO_ZIP_URL = 'https://github.com/Faatal1/FAATAL-MD/archive/refs/heads/main.zip';
const BOT_ROOT_DIR = __dirname; 
const TEMP_UPDATE_DIR = path.join(BOT_ROOT_DIR, 'temp_update');

const DATA_DIRS_TO_PRESERVE = [
    path.join(BOT_ROOT_DIR, 'dono', 'config'),
    path.join(BOT_ROOT_DIR, 'arquivos', 'config'),
    path.join(BOT_ROOT_DIR, 'sessao')
];

async function selectiveUpdate() {
    try {
        if (fs.existsSync(TEMP_UPDATE_DIR)) await fs.remove(TEMP_UPDATE_DIR);
        await fs.mkdir(TEMP_UPDATE_DIR);

        const response = await fetch(REPO_ZIP_URL);
        if (!response.ok) return false;
        
        const buffer = await response.buffer();
        const zipFilePath = path.join(TEMP_UPDATE_DIR, 'repo.zip');
        await fs.writeFile(zipFilePath, buffer);

        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(TEMP_UPDATE_DIR, true);

        const extractedRepoName = fs.readdirSync(TEMP_UPDATE_DIR).find(name => 
            name.toLowerCase().startsWith('faatal-md') && fs.statSync(path.join(TEMP_UPDATE_DIR, name)).isDirectory()
        );

        if (!extractedRepoName) return false;
        const extractedRepoPath = path.join(TEMP_UPDATE_DIR, extractedRepoName);

        const items = await fs.readdir(extractedRepoPath);
        for (const item of items) {
            const sourcePath = path.join(extractedRepoPath, item);
            const destPath = path.join(BOT_ROOT_DIR, item);
            const isProtected = DATA_DIRS_TO_PRESERVE.some(p => destPath.toLowerCase().startsWith(p.toLowerCase()));

            if (isProtected) continue;

            if (fs.existsSync(destPath)) await fs.remove(destPath);
            await fs.copy(sourcePath, destPath);
        }

        await fs.remove(TEMP_UPDATE_DIR);
        return true;
    } catch (error) {
        if (fs.existsSync(TEMP_UPDATE_DIR)) await fs.remove(TEMP_UPDATE_DIR);
        return false;
    }
}

module.exports = { selectiveUpdate };

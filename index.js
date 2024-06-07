import fs from 'node:fs';
import path from 'path';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import './lib/init.js'

const baseDir = '/storage/emulated/0/Android/data/tv.danmaku.bili/download/';

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).map(file => path.join(srcPath, file)).filter(filePath => fs.lstatSync(filePath).isDirectory());
}

let entries = [];
getDirectories(baseDir).forEach(subDir1 => {
    getDirectories(subDir1).forEach(subDir2 => {
        let entryPath = path.join(subDir2, 'entry.json');
        let mediaPath = path.join(subDir2, '16');
        if (fs.existsSync(entryPath) && fs.existsSync(mediaPath)) {
            let entryData = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
            let audioPath = path.join(mediaPath, 'audio.m4s');
            let videoPath = path.join(mediaPath, 'video.m4s');
            if (fs.existsSync(audioPath) && fs.existsSync(videoPath)) {
                entries.push({
                    title: entryData.title,
                    audio: audioPath,
                    video: videoPath
                });
            }
        }
    });
});

inquirer
    .prompt([
        {
            type: 'checkbox',
            message: 'Select directories to process',
            name: 'selectedEntries',
            choices: entries.map(entry => ({
                name: entry.title,
                value: entry
            })),
        }
    ])
    .then(answers => {
        answers.selectedEntries.forEach(entry => {
            let output = path.join('./output', `${entry.title}.mp4`);
            let command = `ffmpeg -i "${entry.audio}" -i "${entry.video}" -codec copy "${output}"`;
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    logger.error(`Error processing ${entry.title}: ${err.message}`);
                    return;
                }
                logger.info(`Processed ${entry.title} successfully.`);
            });
        });
    })
    .catch(error => {
        if (error.isTtyError) {
            logger.error('Prompt couldn\'t be rendered in the current environment');
        } else {
            logger.error('Something went wrong', error);
        }
    });

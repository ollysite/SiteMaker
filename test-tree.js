import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getDirectoryTree(dir, rootDir) {
    const stats = await fs.stat(dir);
    // 프로젝트 루트(rootDir) 기준 상대 경로 계산
    const relativePath = path.relative(rootDir, dir).replace(/\\/g, '/');
    
    const info = {
        path: relativePath,
        name: path.basename(dir),
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size
    };

    if (stats.isDirectory()) {
        const children = await fs.readdir(dir);
        info.children = await Promise.all(
            children.map(child => getDirectoryTree(path.join(dir, child), rootDir))
        );
    }
    return info;
}

async function test() {
    // 실제 존재하는 프로젝트 ID 중 하나를 골라 테스트
    const projectsDir = path.join(__dirname, 'public/projects');
    const projects = await fs.readdir(projectsDir);
    const targetId = 'proj_1763948156163_xtjh1'; // 사용자 오류 발생 프로젝트

    if (!targetId) {
        console.log('No projects found');
        return;
    }

    console.log('Testing with project:', targetId);
    const targetDir = path.join(projectsDir, targetId);
    
    const tree = await getDirectoryTree(targetDir, targetDir);
    console.log(JSON.stringify(tree, null, 2));
}

test();

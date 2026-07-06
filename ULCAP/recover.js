const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\andya\\.gemini\\antigravity-ide\\brain\\b7c7da23-3841-42fc-9335-945292b1eab2\\.system_generated\\logs\\transcript_full.jsonl';
const baseDir = 'C:\\Users\\andya\\Documents\\Tareas\\cuarto\\A. Cliente Web\\ULCAP';

const files = {}; // map of normalized path -> content

function normalizePath(p) {
  // convert to lowercase and normalize slashes for robust matching
  return path.resolve(baseDir, p).toLowerCase();
}

async function run() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);
      if (step.tool_calls) {
        for (const call of step.tool_calls) {
          if (call.name === 'default_api:write_to_file') {
            const args = call.arguments;
            if (args && args.TargetFile && args.CodeContent !== undefined) {
              const target = normalizePath(args.TargetFile);
              files[target] = args.CodeContent;
            }
          } else if (call.name === 'default_api:replace_file_content') {
            const args = call.arguments;
            if (args && args.TargetFile && args.TargetContent !== undefined && args.ReplacementContent !== undefined) {
              const target = normalizePath(args.TargetFile);
              if (files[target] !== undefined) {
                // Apply replacement
                if (args.AllowMultiple) {
                  files[target] = files[target].split(args.TargetContent).join(args.ReplacementContent);
                } else {
                  files[target] = files[target].replace(args.TargetContent, args.ReplacementContent);
                }
              }
            }
          } else if (call.name === 'default_api:multi_replace_file_content') {
            const args = call.arguments;
            if (args && args.TargetFile && args.ReplacementChunks) {
              const target = normalizePath(args.TargetFile);
              if (files[target] !== undefined) {
                for (const chunk of args.ReplacementChunks) {
                  if (chunk.AllowMultiple) {
                    files[target] = files[target].split(chunk.TargetContent).join(chunk.ReplacementContent);
                  } else {
                    files[target] = files[target].replace(chunk.TargetContent, chunk.ReplacementContent);
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // Now write the recovered files that are missing
  const missingFilesToRecover = [
    'src/data/notifications.json',
    'src/layouts/StudentLayout.css',
    'src/pages/admin/tabs/EditProfileModal.jsx',
    'src/pages/admin/tabs/BlockModal.jsx',
    'src/pages/student/CertificateViewer.jsx',
    'src/pages/student/CertificateViewer.css',
    'src/pages/auth/Register.jsx',
    'src/pages/admin/Dashboard.jsx',
    'src/pages/admin/Courses.jsx',
    'src/pages/student/Home.jsx',
    'src/pages/student/MyCourses.jsx',
    'src/pages/student/CourseViewer.jsx',
    'src/pages/shared/Profile.jsx'
  ];

  for (const relPath of missingFilesToRecover) {
    const absPath = path.resolve(baseDir, relPath);
    const target = normalizePath(absPath);
    if (!fs.existsSync(absPath)) {
      if (files[target] !== undefined) {
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, files[target]);
        console.log(`Recovered: ${relPath}`);
      } else {
        console.log(`Could not find history for: ${relPath}`);
      }
    } else {
      console.log(`Already exists: ${relPath}`);
    }
  }
}

run().catch(console.error);

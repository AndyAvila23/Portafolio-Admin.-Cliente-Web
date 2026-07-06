import json
import os

transcript_path = r"C:\Users\andya\.gemini\antigravity-ide\brain\b7c7da23-3841-42fc-9335-945292b1eab2\.system_generated\logs\transcript_full.jsonl"
base_dir = r"C:\Users\andya\Documents\Tareas\cuarto\A. Cliente Web\ULCAP"

files_state = {}

def normalize_path(p):
    return os.path.normpath(os.path.join(base_dir, p)).lower()

print("Parsing transcript...")
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        try:
            step = json.loads(line)
            if 'tool_calls' in step and step['tool_calls']:
                for call in step['tool_calls']:
                    name = call.get('name')
                    args = call.get('arguments', {})
                    if not args:
                        # sometimes arguments is string, let's skip if so
                        if 'args' in call:
                            args = call['args']
                        
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            continue

                    if name == 'write_to_file':
                        target = args.get('TargetFile')
                        content = args.get('CodeContent')
                        if target and content is not None:
                            files_state[normalize_path(target)] = content
                            
                    elif name == 'replace_file_content':
                        target = args.get('TargetFile')
                        old_str = args.get('TargetContent')
                        new_str = args.get('ReplacementContent')
                        allow_mult = args.get('AllowMultiple', False)
                        if target and old_str is not None and new_str is not None:
                            norm_t = normalize_path(target)
                            if norm_t in files_state:
                                if str(allow_mult).lower() == 'true':
                                    files_state[norm_t] = files_state[norm_t].replace(old_str, new_str)
                                else:
                                    files_state[norm_t] = files_state[norm_t].replace(old_str, new_str, 1)

                    elif name == 'multi_replace_file_content':
                        target = args.get('TargetFile')
                        chunks = args.get('ReplacementChunks', [])
                        if target and chunks:
                            norm_t = normalize_path(target)
                            if norm_t in files_state:
                                for chunk in chunks:
                                    old_str = chunk.get('TargetContent')
                                    new_str = chunk.get('ReplacementContent')
                                    allow_mult = chunk.get('AllowMultiple', False)
                                    if old_str is not None and new_str is not None:
                                        if str(allow_mult).lower() == 'true':
                                            files_state[norm_t] = files_state[norm_t].replace(old_str, new_str)
                                        else:
                                            files_state[norm_t] = files_state[norm_t].replace(old_str, new_str, 1)
        except Exception as e:
            pass

missing_files = [
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
]

print("Recovering files...")
for rel_path in missing_files:
    abs_path = os.path.join(base_dir, rel_path)
    norm_t = normalize_path(abs_path)
    
    if not os.path.exists(abs_path):
        if norm_t in files_state:
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, 'w', encoding='utf-8') as f:
                f.write(files_state[norm_t])
            print(f"Recovered: {rel_path}")
        else:
            print(f"Could not find history for: {rel_path}")
    else:
        print(f"Already exists: {rel_path}")

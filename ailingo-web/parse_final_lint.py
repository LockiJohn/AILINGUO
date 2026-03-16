import json
import sys
import os

def parse_lint(file_path):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
                data_str = content.decode('utf-16')
            else:
                data_str = content.decode('utf-8', errors='replace')
        
        data = json.loads(data_str)
        
        files_with_errors = {}

        for f_data in data:
            msgs = f_data.get('messages', [])
            errors = [m for m in msgs if m.get('severity') == 2]
            if errors:
                files_with_errors[f_data["filePath"]] = errors

        for path, errors in files_with_errors.items():
            print(f"FILE: {path}")
            for m in errors:
                print(f"  L{m.get('line')}:C{m.get('column')} - {m['message']} ({m.get('ruleId')})")
            print("-" * 20)

    except Exception as e:
        print(f"Error parsing: {e}")

if __name__ == "__main__":
    parse_final_json_path = 'lint_final_json.txt'
    if os.path.exists(parse_final_json_path):
        parse_lint(parse_final_json_path)
    else:
        print("lint_final_json.txt not found")

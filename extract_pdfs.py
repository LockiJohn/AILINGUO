import fitz
import sys
import os
import json

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

if __name__ == "__main__":
    folder = sys.argv[1]
    files = ["materiale1.pdf", "materiale2.pdf", "materiale3.pdf", "materiale4.pdf"]
    output = {}
    for f in files:
        path = os.path.join(folder, f)
        output[f] = extract_text(path)
    
    with open(os.path.join(folder, "extracted_texts.json"), "w", encoding="utf-8") as out:
        json.dump(output, out, ensure_ascii=False, indent=2)
    print("Extracted successfully!")

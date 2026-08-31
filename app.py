import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from utils import process_pdf_to_vectorstore, get_answer

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB max

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part provided.'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400
        
    if file and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process the PDF
        result = process_pdf_to_vectorstore(filepath)
        
        # Optionally remove the file after processing
        try:
            os.remove(filepath)
        except:
            pass
            
        if result == "SUCCESS":
            return jsonify({'message': 'PDF uploaded and processed successfully! You can now ask questions.'}), 200
        else:
            return jsonify({'error': f'Failed to process PDF: {result}'}), 500
            
    return jsonify({'error': 'Invalid file format. Please upload a PDF.'}), 400

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided.'}), 400
        
    question = data['question']
    answer = get_answer(question)
    
    return jsonify({'answer': answer}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

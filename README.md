# NexusRAG 🧠

**NexusRAG** is an intelligent web application that allows users to upload PDF documents and ask questions about them instantly. It uses **Retrieval-Augmented Generation (RAG)** to provide accurate and contextual answers based on the uploaded document.

The application is built with a modern web interface and powered by **Flask** on the backend. It leverages **LangChain**, **ChromaDB**, and **Google Gemini AI** (Gemini 3.6 Flash and Gemini Embeddings) to extract text, generate vector embeddings, and formulate intelligent responses.

---

## 🌟 Features

- **Drag-and-Drop File Upload:** Beautiful, responsive UI for seamless PDF uploads.
- **Intelligent PDF Processing:** Extracts text from PDFs and chunks it optimally using LangChain's `RecursiveCharacterTextSplitter`.
- **Vector Search:** Uses **ChromaDB** as an in-memory vector store for fast retrieval of relevant context.
- **Google Gemini AI Integration:** 
  - Uses `models/gemini-embedding-2` for creating highly semantic document embeddings.
  - Uses `gemini-3.6-flash` as the core LLM for fast and accurate RAG responses.
- **Production-Ready:** Includes a `Dockerfile` and uses `waitress` as a WSGI server, making it easily deployable to cloud platforms like Render.

---

## 🚀 Tech Stack

- **Backend:** Python, Flask, Waitress
- **AI/ML:** LangChain, Google Generative AI SDK, PyPDF2
- **Vector Database:** ChromaDB
- **Frontend:** HTML5, CSS3 (Glassmorphism design), JavaScript, FontAwesome

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Python 3.9 or higher
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Clone the Repository
```bash
git clone https://github.com/shyamprasad001/NexusRAG.git
cd NexusRAG
```

### 3. Create a Virtual Environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 6. Run the Application (Development)
```bash
python app.py
```
The application will be available at `http://localhost:5000`.

---

## 🐳 Docker & Deployment (Render)

This project is configured to run smoothly on cloud providers like Render using Docker.

### Building and Running with Docker locally
```bash
docker build -t nexus-rag .
docker run -p 10000:10000 -e GEMINI_API_KEY=your_key_here nexus-rag
```
The app will be served via **Waitress** at `http://localhost:10000`.

### Deploying to Render
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime environment.
4. Add an Environment Variable for `GEMINI_API_KEY` with your actual API key.
5. Deploy! Render will automatically use the provided `Dockerfile` and expose the application on port `10000`.

---

## 📁 Project Structure

```
NexusRAG/
│
├── app.py                 # Main Flask application and routing
├── utils.py               # RAG pipeline: PDF processing, embeddings, LLM chains
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker configuration for production deployment
├── .env.example           # Example environment variables
│
├── static/
│   ├── css/style.css      # Custom UI styles (glassmorphism)
│   └── js/script.js       # Frontend logic for uploading and chat
│
└── templates/
    └── index.html         # Main web interface
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/shyamprasad001/NexusRAG/issues).

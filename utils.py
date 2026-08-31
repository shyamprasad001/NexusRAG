import os
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Global variables to hold our state
global_vectorstore = None
embeddings = None

def get_embeddings():
    global embeddings
    if embeddings is None:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return embeddings

def process_pdf_to_vectorstore(pdf_path):
    global global_vectorstore
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        
        if not text.strip():
            return "No readable text found in the PDF."

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)
        
        # Use an in-memory chroma store for simplicity and to avoid file locking issues
        global_vectorstore = Chroma.from_texts(
            texts=chunks, 
            embedding=get_embeddings()
        )
        return "SUCCESS"
    except Exception as e:
        return str(e)

def get_answer(query):
    global global_vectorstore
    
    if global_vectorstore is None:
        return "Please upload a document first before asking questions."
        
    try:
        # Using Gemini 1.5 Flash as it is fast and accurate for RAG
        llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0.3)
    except Exception as e:
        return f"Error initializing LLM. Please make sure GEMINI_API_KEY is set in your environment. Details: {str(e)}"
        
    retriever = global_vectorstore.as_retriever(search_kwargs={"k": 5})
    
    system_prompt = (
        "You are a highly intelligent and helpful assistant for question-answering tasks based on documents. "
        "Use the following pieces of retrieved context to answer the user's question. "
        "If the answer cannot be found in the context, explicitly state that you don't know based on the provided document. "
        "Provide a clear, well-structured, and concise answer.\n\n"
        "Context:\n{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    try:
        response = rag_chain.invoke({"input": query})
        return response.get("answer", "No answer generated.")
    except Exception as e:
        return f"Error generating answer: {str(e)}"

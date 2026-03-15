import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DOCS_FOLDER = os.path.join(os.path.dirname(__file__), "..", "data", "uscis_docs")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "faiss_index")

# Load all PDFs from the uscis_docs folder
def load_documents():
    docs = []
    for filename in os.listdir(DOCS_FOLDER):
        if filename.endswith(".pdf"):
            filepath = os.path.join(DOCS_FOLDER, filename)
            loader = PyPDFLoader(filepath)
            docs.extend(loader.load())
            print(f"Loaded: {filename}")
    return docs

# Split documents into smaller chunks for better retrieval
def split_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(docs)

# Create FAISS vector store from document chunks
def create_vector_store(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(FAISS_INDEX_PATH)
    print("FAISS index saved.")
    return vector_store

# Load existing FAISS index from disk
def load_vector_store():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local(
        FAISS_INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

# Build the full RAG pipeline
def build_rag_pipeline():
    # If FAISS index already exists, load it
    if os.path.exists(FAISS_INDEX_PATH):
        print("Loading existing FAISS index...")
        vector_store = load_vector_store()
    else:
        print("Building new FAISS index...")
        docs = load_documents()
        chunks = split_documents(docs)
        vector_store = create_vector_store(chunks)

    # Set up Groq LLM
    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model_name="llama-3.1-8b-instant"
    )

    # Retriever
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # Prompt template
    prompt = ChatPromptTemplate.from_template("""
    You are ClearPath AI, an immigration assistant for international students in the US.
    Use the following context from official USCIS documents to answer the question.
    If you don't know the answer, say you don't know. Do not make up information.

    Context: {context}

    Question: {question}

    Answer:
    """)

    # Build RAG chain using LCEL (LangChain Expression Language)
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain

# Ask a question using the RAG pipeline
def ask_question(rag_chain, question: str):
    answer = rag_chain.invoke(question)
    return {"answer": answer}
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

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

    # Retriever - gets top 3 relevant chunks from FAISS
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # Prompt template with chat history support
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are ClearPath AI, a helpful immigration assistant for 
        international students in the US. Use the context from official USCIS 
        documents to answer questions. If you don't know, say so honestly.
        
        Context: {context}"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    # Build RAG chain
    rag_chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough(),
            "chat_history": lambda x: []
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain

# Convert DB conversation history to LangChain message format
def format_chat_history(history):
    messages = []
    for msg in history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.message))
        else:
            messages.append(AIMessage(content=msg.message))
    return messages

# Ask a question using the RAG pipeline with chat history
def ask_question(rag_chain, question: str, chat_history: list = []):
    formatted_history = format_chat_history(chat_history)
    answer = rag_chain.invoke(question)
    return {"answer": answer}
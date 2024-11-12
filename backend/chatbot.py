import os
from llama_index.core import VectorStoreIndex, StorageContext, Document
from llama_index.core.text_splitter import TokenTextSplitter
from llama_index.vector_stores.weaviate import WeaviateVectorStore
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
import weaviate
import pymupdf
from dotenv import load_dotenv

# Load the .env file
load_dotenv()


class Chatbot:
    def __init__(self):
        self.filename = None
        self.llm = None
        self.embeddings = None
        self.client = None
        self.vector_store = None
        self.index = None
        self.summary = None

    def _initialize_with_file(self, filename):
        self.filename = filename
        self.llm = OpenAI(model="gpt-4-1106-preview", api_key=os.getenv('OPENAI_API_KEY'))
        self.embeddings = OpenAIEmbedding(api_key=os.getenv('OPENAI_API_KEY'))
        self.client = self._connect_to_weaviate()
        self.vector_store = self._create_vector_store()
        self.index = self._process_document()
        self.summary = self.get_initial_summary()

    def _connect_to_weaviate(self):
        return weaviate.connect_to_wcs(
            cluster_url=os.getenv('WEAVIATE_CLUSTER_URL'),
            auth_credentials=weaviate.auth.AuthApiKey(api_key=os.getenv('WEAVIATE_API_KEY'))
        )

    def _create_vector_store(self):
        return WeaviateVectorStore(
            weaviate_client=self.client,
            index_name="Chatbot"
        )

    def _process_document(self):
        try:
            extracted_text = self._extract_text_from_pdf()
            chunks = self._chunk_text(extracted_text)
            docs = [Document(text=chunk) for chunk in chunks]
            storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
            return VectorStoreIndex.from_documents(
                documents=docs,
                storage_context=storage_context,
                embed_model=self.embeddings
            )
        except Exception as e:
            print(f"Error processing document: {e}")
            return None

    def _extract_text_from_pdf(self):
        extracted_text = ""
        try:
            document = pymupdf.open(self.filename)
            for page in document:
                extracted_text += page.get_text()
            document.close()
            return extracted_text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def _chunk_text(self, text):
        text_splitter = TokenTextSplitter(chunk_size=512, chunk_overlap=20)
        return text_splitter.split_text(text)

    def get_initial_summary(self):
        if self.index is None:
            return "Failed to process document. No summary available."
        query = "Please provide a brief summary of the document."
        return self.ask_query(query)

    def ask_query(self, query):
        if self.index is None:
            return "Sorry, the document hasn't been processed correctly. Unable to answer queries."
        try:
            query_engine = self.index.as_query_engine(llm=self.llm)
            response = query_engine.query(query)
            return str(response)
        except Exception as e:
            return f"Error processing query: {e}"


# chatbot = Chatbot('backend/pdfs/Jonathan_Kim_Resume.pdf')

# print(chatbot.summary)
# print(chatbot.ask_query('what did I do as a software engineer at penn medicine?'))



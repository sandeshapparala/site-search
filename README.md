# Site Search

A semantic search application that allows you to search through website content using vector embeddings. The application fetches HTML content from any URL, processes it into chunks, generates embeddings, and provides semantic search capabilities.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, and shadcn/ui components
- **Backend**: Django REST Framework with Python
- **Vector Database**: Weaviate for storing and querying embeddings
- **Embeddings**: OpenAI embeddings for semantic search

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sandeshapparala/site-search.git
cd site-search
```

### 2. Set Up the Vector Database

Start the Weaviate vector database using Docker:

```bash
cd vector-db
docker-compose up -d
```

This will start Weaviate on `http://localhost:8080`. You can verify it's running by visiting the URL in your browser.

### 3. Set Up the Backend (Django)

#### Navigate to the backend directory:
```bash
cd s_s_backend
```

#### Create a virtual environment:
```bash
python -m venv venv
```

#### Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### Install Python dependencies:
```bash
pip install django djangorestframework requests weaviate-client openai python-dotenv beautifulsoup4 nltk
```

#### Create a `.env` file in the `s_s_backend` directory:
```bash
# Create .env file with the following content:
OPENAI_API_KEY=your_openai_api_key_here
WEAVIATE_URL=http://localhost:8080
CHUNK_SIZE=500
CHUNK_OVERLAP=50
RESULTS_TOPK=10
```

**Note**: You'll need to obtain an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys).

#### Run Django migrations:
```bash
python manage.py migrate
```

#### Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`.

### 4. Set Up the Frontend (Next.js)

#### Open a new terminal and navigate to the frontend directory:
```bash
cd s_s_frontend
```

#### Install Node.js dependencies:
```bash
npm install
```

#### Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## 🔧 Configuration

### Environment Variables

#### Backend (`s_s_backend/.env`):
- `OPENAI_API_KEY`: Your OpenAI API key for generating embeddings
- `WEAVIATE_URL`: URL of your Weaviate instance (default: `http://localhost:8080`)
- `CHUNK_SIZE`: Size of text chunks for processing (default: `500`)
- `CHUNK_OVERLAP`: Overlap between chunks (default: `50`)
- `RESULTS_TOPK`: Default number of results to return (default: `10`)

### Vector Database Configuration

The Weaviate configuration is defined in `vector-db/docker-compose.yml`:

- **Port**: 8080 (HTTP) and 50051 (gRPC)
- **Authentication**: Anonymous access enabled for development
- **Vectorizer**: Disabled (we provide our own embeddings)
- **Persistence**: Data persisted in Docker volume

## 📱 Usage

1. **Start all services** (Weaviate, Django backend, Next.js frontend)
2. **Open the application** at `http://localhost:3000`
3. **Enter a website URL** you want to search (e.g., `https://example.com`)
4. **Enter your search query**
5. **Select the number of results** you want to see (3, 5, 10, or 15)
6. **Click Search** to get semantic search results

The application will:
- Fetch the HTML content from the provided URL
- Parse and clean the HTML
- Split the content into chunks
- Generate embeddings for each chunk
- Store everything in Weaviate
- Perform semantic search and return ranked results

## 🔄 API Endpoints

### POST `/api/search/`

Search for content within a specific URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "query": "your search query",
  "count": 5
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "query": "your search query",
  "count": 5,
  "results": [
    {
      "ordinal": 1,
      "score": 0.95,
      "html_snippet": "<p>Content chunk...</p>",
      "text_preview": "Text preview...",
      "tokens": 150
    }
  ]
}
```

## 🛠️ Development

### Project Structure

```
site-search/
├── s_s_backend/           # Django backend
│   ├── search/           # Search app
│   │   ├── services/     # Business logic
│   │   ├── views.py      # API endpoints
│   │   └── models.py     # Data models
│   └── s_s_backend/      # Django settings
├── s_s_frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── package.json
├── vector-db/            # Weaviate configuration
│   └── docker-compose.yml
└── README.md
```

### Key Services

- **`search/services/fetch_html.py`**: Fetches HTML content from URLs
- **`search/services/parse_html.py`**: Cleans and extracts text from HTML
- **`search/services/tokenise.py`**: Splits text into chunks
- **`search/services/embeddings.py`**: Generates OpenAI embeddings
- **`search/services/vector_store.py`**: Manages Weaviate operations
- **`search/services/search_flow.py`**: Orchestrates the search pipeline

## 🔍 Troubleshooting

### Common Issues

1. **Weaviate connection errors**:
   - Ensure Docker is running
   - Check if port 8080 is available
   - Restart Weaviate: `docker-compose restart`

2. **OpenAI API errors**:
   - Verify your API key is correct
   - Check your OpenAI account has credits
   - Ensure the API key has the necessary permissions

3. **403 Forbidden errors when fetching URLs**:
   - Some websites block automated requests
   - The application includes browser-like headers to bypass basic bot detection
   - Try different URLs if some are blocked

4. **CORS issues**:
   - Ensure the Django backend is running on port 8000
   - Check that CORS settings allow localhost:3000

### Logs and Debugging

- **Django logs**: Check the console where you ran `python manage.py runserver`
- **Next.js logs**: Check the console where you ran `npm run dev`
- **Weaviate logs**: `docker-compose logs weaviate`

## 🚀 Deployment

For production deployment:

1. **Set up a production Weaviate instance**
2. **Configure Django for production** (settings, database, static files)
3. **Build and deploy the Next.js app**
4. **Set up proper environment variables**
5. **Configure reverse proxy** (nginx/Apache)
6. **Set up SSL certificates**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Django, Next.js, and Weaviate.

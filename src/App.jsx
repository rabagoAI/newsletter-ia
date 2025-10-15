import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, BookOpen, TrendingUp, Calendar, Tag, Loader2, AlertCircle } from 'lucide-react';

// Para el artifact, usaremos una variable temporal
// En tu proyecto local, esto funcionará con import.meta.env.VITE_NEWS_API_KEY
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;  // Reemplaza con tu API key real
const API_URL = 'https://newsapi.org/v2/everything';

const categories = ["Todas", "GPT", "Machine Learning", "Deep Learning", "Computer Vision", "NLP", "Robotics", "AI Ethics", "Quantum Computing"];

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (query = "artificial intelligence") => {
    setLoading(true);
    setError(null);
    
    try {
      const searchQuery = query || "artificial intelligence";
      const response = await fetch(
        `${API_URL}?q=${searchQuery}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar las noticias');
      }
      
      const data = await response.json();
      
      const formattedNews = data.articles.map((article, index) => ({
        id: index + 1,
        title: article.title,
        summary: article.description || "Sin descripción disponible",
        image: article.urlToImage || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        date: article.publishedAt.split('T')[0],
        category: assignCategory(article.title + " " + article.description),
        content: article.content || article.description,
        url: article.url,
        source: article.source.name
      }));
      
      setNews(formattedNews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignCategory = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('gpt') || lowerText.includes('chatgpt') || lowerText.includes('openai')) return 'GPT';
    if (lowerText.includes('computer vision') || lowerText.includes('image recognition')) return 'Computer Vision';
    if (lowerText.includes('nlp') || lowerText.includes('natural language')) return 'NLP';
    if (lowerText.includes('robot')) return 'Robotics';
    if (lowerText.includes('machine learning') || lowerText.includes('ml')) return 'Machine Learning';
    if (lowerText.includes('deep learning') || lowerText.includes('neural network')) return 'Deep Learning';
    if (lowerText.includes('ethic') || lowerText.includes('bias')) return 'AI Ethics';
    if (lowerText.includes('quantum')) return 'Quantum Computing';
    return 'Machine Learning';
  };

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === "Todas" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscribe = () => {
    if (email && name) {
      setShowToast(true);
      setEmail("");
      setName("");
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      fetchNews(term);
    }
  };

  if (selectedNews) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedNews(null)}>
              <BookOpen className="text-blue-500" size={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                AI News
              </span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-700 transition">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <button 
            onClick={() => setSelectedNews(null)}
            className="mb-6 text-blue-500 hover:text-blue-400 flex items-center gap-2"
          >
            ← Volver a todas las noticias
          </button>

          <img 
            src={selectedNews.image} 
            alt={selectedNews.title}
            className="w-full h-96 object-cover rounded-2xl mb-6"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80";
            }}
          />

          <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
            <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
              {selectedNews.category}
            </span>
            <span className="flex items-center gap-1 opacity-70">
              <Calendar size={16} />
              {formatDate(selectedNews.date)}
            </span>
            <span className="opacity-70">
              Fuente: {selectedNews.source}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{selectedNews.title}</h1>
          <p className="text-xl opacity-80 leading-relaxed mb-6">{selectedNews.summary}</p>
          
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="opacity-70 leading-relaxed mb-4">
              {selectedNews.content}
            </p>
            <a 
              href={selectedNews.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Leer artículo completo →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ¡Suscripción exitosa! 🎉
        </div>
      )}

      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-500" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              AI News
            </span>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Últimas Noticias de IA
          </h1>
          <p className="text-xl opacity-70">
            Mantente al día con los avances más importantes en inteligencia artificial
          </p>
        </div>

        <div className="mb-8">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <Search className="opacity-50" size={20} />
            <input 
              type="text"
              placeholder="Buscar noticias... (ej: ChatGPT, machine learning)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <p className="font-semibold">Error al cargar las noticias</p>
              <p className="text-sm opacity-70">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-xl opacity-70">Cargando noticias...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {filteredNews.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <Search size={64} className="mx-auto mb-4" />
                  <p className="text-xl">No se encontraron noticias</p>
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("Todas");
                      fetchNews();
                    }}
                    className="mt-4 text-blue-500 hover:text-blue-400"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredNews.map(article => (
                    <div 
                      key={article.id}
                      onClick={() => setSelectedNews(article)}
                      className={`rounded-xl overflow-hidden cursor-pointer transition transform hover:scale-105 ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                      } shadow-lg hover:shadow-2xl`}
                    >
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80";
                        }}
                      />
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {article.category}
                          </span>
                          <span className="opacity-50 flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(article.date)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                        <p className="opacity-70 line-clamp-3 text-sm">{article.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" />
                  Suscríbete
                </h3>
                <p className="opacity-70 mb-4">Recibe las mejores noticias de IA en tu email</p>
                <div className="space-y-3">
                  <input 
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  />
                  <input 
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  />
                  <button 
                    onClick={handleSubscribe}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Suscribirse
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tag className="text-purple-500" />
                  Buscar por tema
                </h3>
                <div className="space-y-2">
                  {["ChatGPT", "Machine Learning", "Deep Learning", "Computer Vision", "NLP"].map(topic => (
                    <div 
                      key={topic}
                      onClick={() => handleSearch(topic)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      #{topic}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
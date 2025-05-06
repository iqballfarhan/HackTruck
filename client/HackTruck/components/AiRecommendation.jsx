import React, { useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../store/slices/postSlice";

const AiRecommendation = () => {
  const [input, setInput] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedFilters, setExtractedFilters] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Function to extract key information from user input
  const extractFiltersFromInput = (input) => {
    // Extract weight
    const weightMatch = input.match(/(\d+)\s*(?:kg|kilo|kilogram|ton)/i);
    const weight = weightMatch ? parseInt(weightMatch[1]) : null;
    
    // Extract origin
    const originMatch = input.match(/dari\s+([A-Za-z\s]+?)(?:\s+ke|\s+menuju|\s*$)/i);
    const origin = originMatch ? originMatch[1].trim() : null;
    
    // Extract destination
    const destMatch = input.match(/ke\s+([A-Za-z\s]+)(?:\s*,|\s*$)/i);
    const destination = destMatch ? destMatch[1].trim() : null;
    
    // Extract truck type
    const truckTypeMatch = input.match(/(?:truk|truck)\s+([a-zA-Z]+)/i);
    const truckType = truckTypeMatch ? truckTypeMatch[1].toLowerCase() : null;
    
    return { 
      weight, 
      origin, 
      destination, 
      truckType,
      hasFilters: !!(weight || origin || destination || truckType)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendation("Mencari rekomendasi...");
    setPosts([]);
    
    // Extract filters from user input
    const filters = extractFiltersFromInput(input);
    setExtractedFilters(filters);
    
    try {
      const { data } = await axios.post("http://localhost:3000/cargo/recommend", { 
        query: input,
        filters: filters // Send extracted filters to backend
      });
      
      setRecommendation(data.recommendation || "Tidak ada rekomendasi tersedia.");
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setRecommendation("Terjadi kesalahan saat mencari rekomendasi.");
      setPosts([]);
      setIsLoading(false);
    }
  };

  // Apply filters to the main search page
  const applyFiltersToSearch = () => {
    if (!extractedFilters || !extractedFilters.hasFilters) return;
    
    const searchParams = {};
    
    if (extractedFilters.origin) searchParams.search = extractedFilters.origin;
    if (extractedFilters.destination) searchParams.search = extractedFilters.destination;
    if (extractedFilters.truckType) searchParams.truckType = extractedFilters.truckType;
    
    // Apply filters through Redux
    dispatch(fetchPosts(searchParams));
    
    // Navigate to main search page
    navigate('/?filtered=true');
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 col-md-10">
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2">AI Cargo Assistant</h2>
              <p className="text-muted">Dapatkan rekomendasi cargo terbaik sesuai kebutuhan Anda</p>
            </div>
            
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-robot me-2"></i>
                  Apa kebutuhan pengiriman Anda?
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="aiQuery" className="form-label fw-semibold">Deskripsi Kebutuhan</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-chat-dots"></i>
                      </span>
                      <input
                        id="aiQuery"
                        type="text"
                        className="form-control form-control-lg"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Contoh: Kirim barang dari Jakarta ke Surabaya, 10000kg, truk box"
                        required
                      />
                    </div>
                    <div className="form-text mt-2">
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Jelaskan kebutuhan pengiriman Anda dengan detail (asal, tujuan, berat, jenis truk)
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Mencari Rekomendasi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Cari Rekomendasi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {recommendation && (
              <div className="card shadow-sm border-0 mb-5 recommendation-card">
                <div className="card-header bg-light py-3">
                  <h5 className="mb-0">
                    <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
                    Rekomendasi AI
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="card-text">
                    <div className="p-3 bg-light rounded-3 border-start border-4 border-warning">
                      <p className="mb-0 fs-5">{recommendation}</p>
                    </div>
                    
                    {extractedFilters && extractedFilters.hasFilters && (
                      <div className="mt-4">
                        <h6 className="fw-bold mb-3">Parameter Yang Terdeteksi:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {extractedFilters.origin && (
                            <span className="badge bg-primary rounded-pill p-2">
                              <i className="bi bi-geo-alt me-1"></i>
                              Asal: {extractedFilters.origin}
                            </span>
                          )}
                          {extractedFilters.destination && (
                            <span className="badge bg-primary rounded-pill p-2">
                              <i className="bi bi-geo me-1"></i>
                              Tujuan: {extractedFilters.destination}
                            </span>
                          )}
                          {extractedFilters.weight && (
                            <span className="badge bg-success rounded-pill p-2">
                              <i className="bi bi-truck me-1"></i>
                              Berat: ≥{extractedFilters.weight} kg
                            </span>
                          )}
                          {extractedFilters.truckType && (
                            <span className="badge bg-info rounded-pill p-2">
                              <i className="bi bi-box me-1"></i>
                              Tipe Truk: {extractedFilters.truckType}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <button 
                            onClick={applyFiltersToSearch}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="bi bi-funnel me-1"></i>
                            Terapkan Filter ke Pencarian Utama
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {Array.isArray(posts) && posts.length > 0 ? (
          <div className="mt-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-2">Rekomendasi Cargo</h3>
              <p className="text-muted">
                {extractedFilters && extractedFilters.weight ? 
                  `Truck dengan kapasitas ≥ ${extractedFilters.weight} kg` : 
                  'Pilihan truck terbaik untuk kebutuhan Anda'}
              </p>
            </div>
            <div className="row">
              {posts.map((post) => (
                <div key={post.id || Math.random()} className="col-lg-4 col-md-6 mb-4">
                  <PostCard post={post} showControls={false} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          recommendation && !isLoading && posts.length === 0 && (
            <div className="text-center mt-4">
              <div className="card shadow-sm border-0 p-4">
                <div className="py-4">
                  <i className="bi bi-inbox fs-1 text-secondary mb-3"></i>
                  <h5 className="fw-bold">Tidak Ada Cargo yang Sesuai</h5>
                  <p className="text-muted mb-0">
                    Tidak ditemukan cargo yang sesuai dengan kriteria Anda.
                    <br />
                    Coba ubah permintaan atau gunakan kata kunci yang berbeda.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AiRecommendation;
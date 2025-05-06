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
    if (extractedFilters.weight) searchParams.minWeight = extractedFilters.weight;
    
    // Apply filters through Redux
    dispatch(fetchPosts(searchParams));
    
    // Navigate to main search page
    navigate('/?filtered=true');
  };

  return (
    <div className="card shadow border-0 rounded-lg mb-5">
      <div className="card-header bg-white d-flex align-items-center py-3">
        <i className="bi bi-robot me-2 text-primary"></i>
        <h3 className="mb-0">AI Cargo Assistant</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-lg-8 col-md-10 mx-auto">
            <p className="text-muted text-center mb-4">Jelaskan kebutuhan pengiriman Anda dan AI akan memberikan rekomendasi terbaik</p>
            
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-3">
                <label htmlFor="aiQueryInput" className="form-label">Deskripsi Kebutuhan</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-chat-text"></i>
                  </span>
                  <input
                    id="aiQueryInput"
                    type="text"
                    className="form-control"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Contoh: Kirim barang dari Jakarta ke Surabaya, 10000kg, truk box"
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Mencari...
                      </>
                    ) : (
                      <><i className="bi bi-search me-1"></i>Cari</>
                    )}
                  </button>
                </div>
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  Semakin detail informasi yang diberikan, semakin akurat rekomendasi yang dihasilkan
                </div>
              </div>
            </form>
            
            {recommendation && !isLoading && (
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                    <h5 className="mb-0">Rekomendasi AI</h5>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3 border-start border-4 border-primary ps-3 py-2">
                    {recommendation}
                  </div>
                  
                  {extractedFilters && extractedFilters.hasFilters && (
                    <div className="mt-3">
                      <h6 className="mb-2">Parameter yang Terdeteksi:</h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {extractedFilters.origin && (
                          <span className="badge bg-primary rounded-pill">
                            <i className="bi bi-geo-alt me-1"></i>
                            Asal: {extractedFilters.origin}
                          </span>
                        )}
                        {extractedFilters.destination && (
                          <span className="badge bg-primary rounded-pill">
                            <i className="bi bi-geo me-1"></i>
                            Tujuan: {extractedFilters.destination}
                          </span>
                        )}
                        {extractedFilters.weight && (
                          <span className="badge bg-success rounded-pill">
                            <i className="bi bi-truck me-1"></i>
                            Berat: ≥{extractedFilters.weight} kg
                          </span>
                        )}
                        {extractedFilters.truckType && (
                          <span className="badge bg-info rounded-pill">
                            <i className="bi bi-box me-1"></i>
                            Tipe Truk: {extractedFilters.truckType}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={applyFiltersToSearch}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-funnel me-1"></i>
                        Terapkan Filter ke Pencarian
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {Array.isArray(posts) && posts.length > 0 && (
          <div className="mt-4">
            <h5 className="border-bottom pb-2 mb-3">Truk yang Direkomendasikan</h5>
            <div className="row">
              {posts.map((post) => (
                <div key={post.id || Math.random()} className="col-lg-4 col-md-6 mb-4">
                  <PostCard post={post} showControls={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRecommendation;
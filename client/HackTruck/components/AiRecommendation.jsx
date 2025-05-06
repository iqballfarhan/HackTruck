import React, { useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";

const AiRecommendation = () => {
  const [input, setInput] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendation("Mencari rekomendasi...");
    setPosts([]);
    
    try {
      const { data } = await axios.post("http://localhost:3000/cargo/recommend", { query: input });
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
                        placeholder="Contoh: Kirim barang dari Jakarta ke Surabaya, 1000kg, truk box"
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
              <p className="text-muted">Pilihan truck terbaik untuk kebutuhan Anda</p>
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
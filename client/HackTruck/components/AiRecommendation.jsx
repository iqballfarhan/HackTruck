import React, { useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";

const formStyle = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  padding: "32px 24px",
  maxWidth: "600px",
  margin: "40px auto",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const labelStyle = {
  fontWeight: "bold",
  fontSize: "1.1rem",
  marginBottom: "6px",
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #d0d0d0",
  fontSize: "1rem",
  outline: "none",
  marginTop: "6px",
  marginBottom: "12px",
  transition: "border 0.2s",
};

const buttonStyle = {
  background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "12px 0",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,123,255,0.08)",
  transition: "background 0.2s",
};

const recommendationStyle = {
  background: "#f6faff",
  borderRadius: "8px",
  padding: "18px",
  marginTop: "24px",
  color: "#222",
  fontSize: "1.05rem",
  boxShadow: "0 2px 8px rgba(0,123,255,0.06)",
};

const AiRecommendation = () => {
  const [input, setInput] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [posts, setPosts] = useState([]); // Inisialisasi sebagai array kosong

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecommendation("Mencari rekomendasi...");
    setPosts([]); // Reset ke array kosong
    try {
      const { data } = await axios.post("http://localhost:3000/cargo/recommend", { query: input });
      // console.log("API Response:", data); // Debugging
      setRecommendation(data.recommendation || "Tidak ada rekomendasi tersedia.");
      setPosts(Array.isArray(data.posts) ? data.posts : []); // Pastikan posts adalah array
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setRecommendation("Terjadi kesalahan saat mencari rekomendasi.");
      setPosts([]); // Reset ke array kosong jika error
    }
  };

  return (
    <div style={{ background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)", padding: "40px 0" }}>
      <div className="container">
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={labelStyle}>Dapatkan Rekomendasi Cargo</div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Kirim barang dari Jakarta ke Surabaya, 1000kg, truk box"
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>Cari Rekomendasi</button>
        </form>

        {recommendation && (
          <div style={recommendationStyle}>
            <b>Rekomendasi:</b>
            <div style={{ marginTop: 8 }}>{recommendation}</div>
          </div>
        )}

        {Array.isArray(posts) && posts.length > 0 ? (
          <div className="mt-5">
            <h3>Rekomendasi Cargo</h3>
            <div className="row">
              {posts.map((post) => (
                <div key={post.id || Math.random()} className="col-lg-4 col-md-6 mb-4">
                  <PostCard post={post} showControls={false} />
                </div>
              ))}
            </div>
          </div>
        ) : recommendation && (
          <div className="mt-5 text-center">
            <p>Tidak ada cargo yang sesuai dengan kriteria Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRecommendation;
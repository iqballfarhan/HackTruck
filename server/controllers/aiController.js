const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
const { Post } = require("../models");
const { getGeminiRecommendation } = require("../helpers/gemini");

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(process.env.GOOGLE_AI_API_KEY),
});

const parseUserQuery = (query) => {
  // Implement parsing logic to extract requirements from the user's query
  // For example, return an object with origin, destination, etc.
  return {
    origin: "jakarta",
    destination: "bali",
  };
};

const getTruckRecommendation = async (req, res, next) => {
  try {
    const { query } = req.body;

    // Ambil semua posting dari database
    const posts = await Post.findAll();
    const postList = posts.map((p) => p.get({ plain: true }));

    // Debugging: Log data untuk memastikan properti tersedia
    // console.log("Post List:", postList);

    // Parse the user's query to extract requirements
    const requirements = parseUserQuery(query);

    // Filter posting berdasarkan kriteria spesifik
    const filteredPosts = postList.filter((post) => {
      const matchesRoute =
        post.origin === requirements.origin &&
        post.destination === requirements.destination;
      const matchesTruckType =
        post.truckType && post.truckType.toLowerCase() === "box";
      const matchesPrice = post.price && post.price < 2500000;
      const matchesRating = post.rating && post.rating >= 4.8;

      return matchesRoute && matchesTruckType && matchesPrice && matchesRating;
    });

    // Debugging: Log hasil filter
    // console.log("Filtered Posts:", filteredPosts);
    // postList.forEach((post) => {
    //   console.log("Post:", {
    //     companyName: post.companyName,
    //     price: post.price,
    //     rating: post.rating,
    //     origin: post.origin,
    //     destination: post.destination,
    //     truckType: post.truckType,
    //   });
    // });
    // Jika tidak ada yang cocok, kembalikan respons dengan posts kosong
    if (filteredPosts.length === 0) {
      return res.json({
        recommendation:
          "Tidak ada cargo yang memenuhi kriteria Anda (Jakarta ke Bali, truk box, harga < Rp2.500.000, rating ≥ 4.8). Coba ubah kriteria pencarian.",
        posts: [],
      });
    }

    // Format data untuk prompt
    const formattedPostData = filteredPosts
      .map(
        (p, i) => `
${i + 1}. Nama: ${p.companyName || "Tidak Diketahui"}
Deskripsi: ${p.description || "Tidak ada deskripsi"}
Origin: ${p.origin || "Tidak Diketahui"}
Destination: ${p.destination || "Tidak Diketahui"}
Jenis Truk: ${p.truckType || "Tidak Diketahui"}
Harga: Rp${p.price ? p.price.toLocaleString() : "Tidak Diketahui"}
Estimasi Waktu: ${p.estimasiWaktu || "Tidak Diketahui"}
Rating: ${p.rating || "Tidak Diketahui"}
Layanan Tambahan: ${p.layananTambahan || "Tidak ada"}
Website: ${p.website || "Tidak ada"}
Kontak: ${p.kontak || "Tidak ada"}
`
      )
      .join("\n");

    // Buat prompt untuk AI dengan data yang sudah difilter
    const prompt = `
User is looking for: "${query}"
Based on their needs, I've found ${filteredPosts.length} matching services.
Please analyze the following options and recommend the best one:
${formattedPostData}
`;

    let recommendation = "Tidak ada rekomendasi dari AI.";
    try {
      recommendation = await getGeminiRecommendation(prompt);
    } catch (error) {
      console.error("AI error:", error);
      
      // Intelligent fallback based on sorting
      const bestMatch = filteredPosts.sort((a, b) => {
        // Sort by multiple criteria (rating, price, etc.)
        return (b.rating - a.rating) || (a.price - b.price);
      })[0];
      
      recommendation = generateStructuredRecommendation(bestMatch);
    }

    res.json({
      recommendation,
      posts: filteredPosts,
    });
  } catch (error) {
    console.error("Error in getTruckRecommendation:", error);
    res.status(500).json({
      recommendation: "Terjadi kesalahan saat mencari rekomendasi.",
      posts: [],
    });
  }
};

module.exports = { getTruckRecommendation };

const { Post } = require('../models');
const { getGeminiRecommendation } = require('../helpers/gemini');

const recommendCargo = async (req, res, next) => {
  try {
    const { query } = req.body;
    console.log('Query:', query);
    const posts = await Post.findAll();
    console.log('Posts:', posts);
    const cargoList = posts.map(c => `Nama: ${c.name}, Deskripsi: ${c.description}`).join('\n');
    // Prompt Gemini dengan input user
    const prompt = `User mencari cargo dengan kebutuhan: "${query}". Dari daftar berikut, rekomendasikan cargo terbaik:\n${cargoList}`;
    const recommendation = await getGeminiRecommendation(prompt, process.env.GEMINI_API_KEY);
    res.json({ recommendation });
  } catch (err) {
    console.error('Error di recommendCargo:', err);
    next(err);
  }
};

module.exports = { recommendCargo };

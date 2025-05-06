const { Post } = require('../models');
const { getGeminiRecommendation } = require('../helpers/gemini');

const recommendCargo = async (req, res, next) => {
  try {
    const { query, filters } = req.body;
    console.log('Query:', query);
    console.log('Filters:', filters);
    
    // Get all posts
    let posts = await Post.findAll();
    
    // Apply filters if provided
    if (filters) {
      if (filters.weight) {
        posts = posts.filter(post => post.maxWeight >= filters.weight);
      }
      if (filters.truckType) {
        posts = posts.filter(post => post.truckType.toLowerCase() === filters.truckType.toLowerCase());
      }
      if (filters.origin) {
        posts = posts.filter(post => post.origin.toLowerCase().includes(filters.origin.toLowerCase()));
      }
      if (filters.destination) {
        posts = posts.filter(post => post.destination.toLowerCase().includes(filters.destination.toLowerCase()));
      }
    }
    
    const cargoList = posts.map(c => 
      `ID: ${c.id}, Origin: ${c.origin}, Destination: ${c.destination}, ` +
      `TruckType: ${c.truckType}, MaxWeight: ${c.maxWeight}kg, ` + 
      `Price: Rp${c.price ? c.price.toLocaleString() : "N/A"}`
    ).join('\n');
    
    // Prompt for Gemini with more detailed instructions
    const prompt = `
User is looking for shipping with these requirements: "${query}".

From the following list, recommend the best cargo options that meet these requirements, especially focusing on weight capacity if mentioned:
${cargoList}

Please provide a helpful response that:
1. Analyzes what the user needs based on their query
2. Recommends specific trucks from the list that meet their criteria
3. Explains why these options are suitable
`;

    const recommendation = await getGeminiRecommendation(prompt, process.env.GEMINI_API_KEY);
    
    res.json({ 
      recommendation,
      posts: posts.map(p => p.toJSON())
    });
  } catch (err) {
    console.error('Error di recommendCargo:', err);
    next(err);
  }
};

module.exports = { recommendCargo };

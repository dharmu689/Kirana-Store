const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Initialize OpenAI connection
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to gather store context
const gatherStoreContext = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Run queries in parallel for performance
        const [
            totalProducts,
            todaySalesAgg,
            todayProfitAgg,
            weeklySalesAgg,
            weeklyProfitAgg,
            topProducts,
            lowStockCount,
            expiringProducts
        ] = await Promise.all([
            Product.countDocuments(),
            Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]),
            Sale.aggregate([
                { $match: { saleDate: { $gte: sevenDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]),
            Sale.aggregate([
                { $match: { saleDate: { $gte: sevenDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]),
            Product.find().sort({ totalSold: -1 }).limit(5).select('name totalSold'),
            Product.countDocuments({
                $expr: { $lte: ['$quantity', '$reorderLevel'] },
                quantity: { $gt: 0 }
            }),
            Product.find({
                expiryDate: { $gte: new Date(), $lte: new Date(new Date().setDate(new Date().getDate() + 30)) }
            }).limit(5).select('name expiryDate')
        ]);

        // Format gathered data
        const topSellingList = topProducts.map(p => `${p.name} (${p.totalSold} sold)`).join(", ");
        const expiringList = expiringProducts.map(p => `${p.name} (Exp: ${new Date(p.expiryDate).toLocaleDateString()})`).join(", ");

        const context = `
Current Store Diagnostics:
- Total Inventory Items: ${totalProducts}
- Today's Sales: ₹${todaySalesAgg[0]?.total || 0}
- Today's Profit: ₹${todayProfitAgg[0]?.total || 0}
- This Week's Sales: ₹${weeklySalesAgg[0]?.total || 0}
- This Week's Profit: ₹${weeklyProfitAgg[0]?.total || 0}
- Top 5 Selling Products: ${topSellingList || 'None yet'}
- Products needing Restock (Low Stock): ${lowStockCount} items
- Products Expiring within 30 days: ${expiringList || 'None'}
`;
        return context;
    } catch (error) {
        console.error("Context Gathering Error:", error);
        return "Store context unavailable at the moment.";
    }
}

// @desc    Process chat messages via OpenAI
// @route   POST /api/chat
// @access  Private
const processChatQuery = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.json({ reply: "OpenAI API Key is missing. Please add it to your server/.env file." });
        }

        // Fetch store context dynamically
        const storeContext = await gatherStoreContext();

        // System prompt instructs the AI on schema and personality
        const systemPrompt = `
You are KiranaSmart AI Assistant. You help store owners analyze their store performance.
You can respond in Hindi, English, or Hinglish.
Always reply in the same language as the user.
Be polite, professional, and relatively concise.

Here is the current real-time data from the store database:
${storeContext}

Use this data to answer the user's question accurately. If the user asks about something not provided in the context, gently tell them you only have high-level dashboard metrics available at the moment.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.3, // keep answers factual
            max_tokens: 150
        });

        const reply = response.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error("OpenAI Chat Error:", error);
        res.status(500).json({ reply: "Sorry, I am having trouble connecting to my AI core. Please check the API key and try again." });
    }
});

module.exports = {
    processChatQuery
};

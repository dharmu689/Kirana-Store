const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Process chat messages and return analytics insights
// @route   POST /api/chat
// @access  Private
const processChatQuery = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    const query = message.toLowerCase();
    let reply = "I'm sorry, I don't understand that query. Please try asking about sales, products, inventory, or profit.";

    try {
        if (query.includes('sales today') || query.includes("today's sales")) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const todaySales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const total = todaySales[0]?.total || 0;
            reply = `Today's sales total to ₹${total.toLocaleString()}.`;

        } else if (query.includes('fast moving') || query.includes('top selling')) {
            const topProducts = await Product.find()
                .sort({ totalSold: -1 })
                .limit(5);

            if (topProducts.length > 0) {
                const list = topProducts.map(p => `${p.name} (${p.totalSold} sold)`).join(', ');
                reply = `Your top selling products are: ${list}.`;
            } else {
                reply = "You don't have enough sales data to determine fast moving products yet.";
            }

        } else if (query.includes('slow moving') || query.includes('not sold recently')) {
            const slowProducts = await Product.find({ lastSoldDate: { $ne: null } })
                .sort({ lastSoldDate: 1 })
                .limit(5);

            if (slowProducts.length > 0) {
                const list = slowProducts.map(p => {
                    const days = Math.floor((new Date() - new Date(p.lastSoldDate)) / (1000 * 60 * 60 * 24));
                    return `${p.name} (last sold ${days} days ago)`;
                }).join(', ');
                reply = `Your slowest moving products are: ${list}.`;
            } else {
                reply = "All your products seem to be selling recently!";
            }

        } else if (query.includes('restock') || query.includes('low quantity')) {
            const lowStock = await Product.find({
                $expr: { $lte: ['$quantity', '$reorderLevel'] },
                quantity: { $gt: 0 }
            }).limit(5);

            if (lowStock.length > 0) {
                const list = lowStock.map(p => `${p.name} (Qty: ${p.quantity}, Reorder at: ${p.reorderLevel})`).join(', ');
                reply = `Consider restocking these low-quantity items: ${list}.`;
            } else {
                reply = "Your inventory looks good! No immediate restocking needed based on your reorder levels.";
            }

        } else if (query.includes('category analytics') || query.includes('by category')) {
            const categories = await Sale.aggregate([
                { $group: { _id: '$category', totalSales: { $sum: '$totalPrice' } } },
                { $sort: { totalSales: -1 } }
            ]);

            if (categories.length > 0) {
                const list = categories.map(c => `${c._id}: ₹${c.totalSales.toLocaleString()}`).join(', ');
                reply = `Here is your breakdown by category: ${list}.`;
            } else {
                reply = "No category data is available right now.";
            }

        } else if (query.includes('forecast') || query.includes('predicted demand')) {
            // simplified logic if Forecast model isn't populated
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const pastSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: thirtyDaysAgo } } },
                { $group: { _id: null, totalSales: { $sum: '$totalPrice' }, cnt: { $sum: 1 } } }
            ]);

            if (pastSales.length > 0) {
                const avgDaily = (pastSales[0].totalSales / 30).toFixed(2);
                reply = `Based on the last 30 days, your average daily forecast indicates approximately ₹${avgDaily} in steady sales momentum.`;
            } else {
                reply = "Not enough past data to confidently forecast demand.";
            }

        } else if (query.includes('this week vs last week') || query.includes('compare this week')) {
            const now = new Date();
            const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            const startOfLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);

            const thisWeekSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfThisWeek, $lt: now } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const lastWeekSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfLastWeek, $lt: startOfThisWeek } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const thisWeekTotal = thisWeekSales[0]?.total || 0;
            const lastWeekTotal = lastWeekSales[0]?.total || 0;
            let comparison = thisWeekTotal > lastWeekTotal ? 'up' : 'down';
            let diff = Math.abs(thisWeekTotal - lastWeekTotal);

            reply = `This week's sales are ₹${thisWeekTotal.toLocaleString()}, which is ${comparison} by ₹${diff.toLocaleString()} compared to last week (₹${lastWeekTotal.toLocaleString()}).`;

        } else if (query.includes('profit summary') || query.includes('profit')) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const todayProfit = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]);

            const weeklyProfit = await Sale.aggregate([
                { $match: { saleDate: { $gte: sevenDaysAgo } } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]);

            const tProf = todayProfit[0]?.total || 0;
            const wProf = weeklyProfit[0]?.total || 0;

            reply = `Today's profit is ₹${tProf.toLocaleString()}, and your profit for the last 7 days is ₹${wProf.toLocaleString()}.`;

        } else if (query.includes('inventory overview') || query.includes('total products')) {
            const totalProducts = await Product.countDocuments();
            reply = `You currently have ${totalProducts} unique products stored in your inventory overall.`;

        } else if (query.includes('expiring products') || query.includes('close to expiry')) {
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            const expiring = await Product.find({
                expiryDate: { $gte: today, $lte: thirtyDaysFromNow }
            }).limit(5).select('name expiryDate');

            if (expiring.length > 0) {
                const list = expiring.map(p => `${p.name} (Exp: ${new Date(p.expiryDate).toLocaleDateString()})`).join(', ');
                reply = `Warning, these products are expiring soon: ${list}.`;
            } else {
                reply = "Good news, there are no products expiring within the next 30 days.";
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        reply = "Sorry, I encountered an internal error processing your query.";
    }

    res.json({ reply });
});

module.exports = {
    processChatQuery
};

const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Process chat messages via local AI intent detection
// @route   POST /api/chat
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: 'Message is required' });
    }

    const query = message.toLowerCase();
    let reply = "I'm sorry, I don't understand that query. Please try asking about sales today, fast moving products, inventory overview, or profit summary.";

    try {
        if (query.includes('sales today') || query.includes("today's sales")) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const todaySales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
            ]);

            const total = todaySales[0]?.total || 0;
            const count = todaySales[0]?.count || 0;
            reply = `Today's sales are ₹${total.toLocaleString()} across ${count} transactions.`;

        } else if (query.includes('fast moving') || query.includes('top selling')) {
            const topProducts = await Product.find({ userId: req.user.id })
                .sort({ totalSold: -1 })
                .limit(5);

            if (topProducts.length > 0) {
                const list = topProducts.map(p => `${p.name} (${p.totalSold} sold)`).join(', ');
                reply = `Your top 5 fast moving products are: ${list}.`;
            } else {
                reply = "You don't have enough sales data to determine fast moving products yet.";
            }

        } else if (query.includes('slow moving') || query.includes('not sold recently')) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const slowProducts = await Product.find({
                lastSoldDate: { $lte: thirtyDaysAgo, $ne: null },
                userId: req.user.id
            }).sort({ lastSoldDate: 1 }).limit(5);

            if (slowProducts.length > 0) {
                const list = slowProducts.map(p => {
                    const days = Math.floor((new Date() - new Date(p.lastSoldDate)) / (1000 * 60 * 60 * 24));
                    return `${p.name} (last sold ${days} days ago)`;
                }).join(', ');
                reply = `Your slowest moving products are: ${list}.`;
            } else {
                reply = "Great news! None of your products have been sitting unsold for more than 30 days.";
            }

        } else if (query.includes('restock') || query.includes('low quantity')) {
            const lowStock = await Product.find({
                $expr: { $lte: ['$quantity', '$reorderLevel'] },
                userId: req.user.id
            });

            if (lowStock.length > 0) {
                const list = lowStock.map(p => `${p.name} (Qty: ${p.quantity}, Reorder at: ${p.reorderLevel})`).join(', ');
                reply = `You should consider restocking these ${lowStock.length} items: ${list}.`;
            } else {
                reply = "Your inventory looks good! No immediate restocking needed based on your current reorder levels.";
            }

        } else if (query.includes('category analytics') || query.includes('by category')) {
            const categories = await Sale.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: '$category', totalSales: { $sum: '$totalPrice' } } },
                { $sort: { totalSales: -1 } },
                { $limit: 5 }
            ]);

            if (categories.length > 0) {
                const list = categories.map(c => `${c._id}: ₹${c.totalSales.toLocaleString()}`).join(', ');
                reply = `Your top selling categories are: ${list}.`;
            } else {
                reply = "No category data is available right now.";
            }

        } else if (query.includes('forecast') || query.includes('predicted demand')) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const pastSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: thirtyDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
            ]);

            if (pastSales.length > 0) {
                const avgDaily = pastSales[0].totalSales / 30;
                const nextWeekPrediction = (avgDaily * 7).toFixed(0);
                reply = `Based on your last 30 days of sales (averaging ₹${avgDaily.toFixed(0)}/day), your forecasted demand for the next 7 days is approximately ₹${Number(nextWeekPrediction).toLocaleString()}.`;
            } else {
                reply = "Not enough past data to confidently forecast demand.";
            }

        } else if (query.includes('this week vs last week') || query.includes('compare this week')) {
            const now = new Date();
            const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            const startOfLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);

            const thisWeekSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfThisWeek, $lt: now }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const lastWeekSales = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfLastWeek, $lt: startOfThisWeek }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const thisWeekTotal = thisWeekSales[0]?.total || 0;
            const lastWeekTotal = lastWeekSales[0]?.total || 0;
            let comparison = thisWeekTotal >= lastWeekTotal ? 'up' : 'down';
            let diff = Math.abs(thisWeekTotal - lastWeekTotal);

            reply = `This week's sales are ₹${thisWeekTotal.toLocaleString()}, which is ${comparison} by ₹${diff.toLocaleString()} compared to last week (₹${lastWeekTotal.toLocaleString()}).`;

        } else if (query.includes('profit summary') || query.includes('profit')) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const todayProfit = await Sale.aggregate([
                { $match: { saleDate: { $gte: startOfToday }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]);

            const weeklyProfit = await Sale.aggregate([
                { $match: { saleDate: { $gte: sevenDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$profit' } } }
            ]);

            const tProf = todayProfit[0]?.total || 0;
            const wProf = weeklyProfit[0]?.total || 0;

            reply = `Today's profit is ₹${tProf.toLocaleString()}, and your total profit for the last 7 days is ₹${wProf.toLocaleString()}.`;

        } else if (query.includes('inventory overview') || query.includes('total products')) {
            const totalDocs = await Product.countDocuments({ userId: req.user.id });
            const stockUnits = await Product.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$quantity' } } }
            ]);

            const totalStock = stockUnits[0]?.total || 0;
            reply = `You currently have ${totalDocs} unique products in your inventory, totaling ${totalStock.toLocaleString()} individual stock units.`;

        } else if (query.includes('expiring products') || query.includes('close to expiry')) {
            const today = new Date();
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

            const expiring = await Product.find({
                expiryDate: { $gte: today, $lte: sevenDaysFromNow },
                userId: req.user.id
            }).limit(5).select('name expiryDate');

            if (expiring.length > 0) {
                const list = expiring.map(p => `${p.name} (Exp: ${new Date(p.expiryDate).toLocaleDateString()})`).join(', ');
                reply = `Warning! These products are expiring within the next 7 days: ${list}.`;
            } else {
                reply = "Good news! There are no products expiring within the next 7 days.";
            }
        }
    } catch (error) {
        console.error("Local Chat Analytics Error:", error);
        reply = "Sorry, I encountered an internal error processing your analytics query.";
    }

    res.json({ reply });
});

module.exports = {
    chatWithAI
};

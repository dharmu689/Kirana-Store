// server/controllers/vendorController.js
import { create, find, findById, findByIdAndUpdate, findByIdAndDelete } from '../models/Vendor';

// @desc    Add a new vendor
// @route   POST /api/vendors
// @access  Private/Admin
const addVendor = async (req, res) => {
    try {
        const { name, contactPerson, phone, email, address, productsSupplied } = req.body;

        const vendor = await create({
            name,
            contactPerson,
            phone,
            email,
            address,
            productsSupplied
        });

        res.status(201).json(vendor);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A vendor with this email already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res) => {
    try {
        const vendors = await find({}).populate('productsSupplied', 'name price');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
    try {
        const vendor = await findById(req.params.id).populate('productsSupplied', 'name price');

        if (vendor) {
            res.json(vendor);
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
// @access  Private/Admin
const updateVendor = async (req, res) => {
    try {
        const vendor = await findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
const deleteVendor = async (req, res) => {
    try {
        const vendor = await findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json({ message: 'Vendor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top optimized vendor for a specific product natively based on custom Scoring Algorithm
// @route   GET /api/vendors/best/:productId
// @access  Private
const getBestVendorForProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find all vendors supplying the product explicitly
        const vendors = await find({ productsSupplied: productId }).populate('productsSupplied', 'name price');

        if (!vendors || vendors.length === 0) {
            return res.status(404).json({ message: 'No vendors found supplying this target product.' });
        }

        // 1. Array scanning mapping limits
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        let minDelivery = Infinity;
        let maxDelivery = -Infinity;

        vendors.forEach(v => {
            const price = v.pricePerUnit || 1;
            const delivery = v.averageDeliveryDays || 1;

            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;

            if (delivery < minDelivery) minDelivery = delivery;
            if (delivery > maxDelivery) maxDelivery = delivery;
        });

        // Resolve single-vendor overlap issues dynamically forcing equal spreads internally
        if (minPrice === maxPrice) maxPrice = minPrice + 1;
        if (minDelivery === maxDelivery) maxDelivery = minDelivery + 1;

        // 2. Compute Individual algorithmic logic bounds
        // Formulas parse a max weight 100 limit returning dynamically generated totals mapping logic limits

        const scoredVendors = vendors.map(v => {
            const currentPrice = v.pricePerUnit || minPrice;
            const currentDelivery = v.averageDeliveryDays || minDelivery;
            const rating = v.vendorRating || 3;

            // Note: Lower Price = Higher Score natively (Inverse mapping limits)
            const priceScore = 100 - (((currentPrice - minPrice) / (maxPrice - minPrice)) * 100);

            // Note: Lower Delivery = Higher Score natively 
            const deliveryScore = 100 - (((currentDelivery - minDelivery) / (maxDelivery - minDelivery)) * 100);

            // Rating maps directly: scale 1-5 to 100
            const ratingScore = (rating / 5) * 100;

            // Master Weight Allocation (50% Price + 30% Delivery + 20% Rating)
            const finalVendorScore = (0.5 * priceScore) + (0.3 * deliveryScore) + (0.2 * ratingScore);

            // Pass the pure Mongoose Object back binding standard variables securely attached
            return {
                ...v.toObject(),
                optimizationMetrics: {
                    priceScore: Number(priceScore.toFixed(2)),
                    deliveryScore: Number(deliveryScore.toFixed(2)),
                    ratingScore: Number(ratingScore.toFixed(2)),
                    finalScore: Number(finalVendorScore.toFixed(2))
                }
            };
        });

        // 3. Sort arrays mapping dynamically descending bounds optimizing returns
        scoredVendors.sort((a, b) => b.optimizationMetrics.finalScore - a.optimizationMetrics.finalScore);

        res.status(200).json(scoredVendors);
    } catch (error) {
        console.error('Error calculating best vendor:', error);
        res.status(500).json({ message: 'Server logic failed allocating dynamic optimization scales natively.' });
    }
};

export default {
    addVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getBestVendorForProduct
};

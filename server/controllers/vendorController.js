// server/controllers/vendorController.js
const Vendor = require('../models/Vendor');

// @desc    Add a new vendor
// @route   POST /api/vendors
// @access  Private/Admin
const addVendor = async (req, res) => {
    try {
        const { name, contactPerson, phone, email, address, productsSupplied } = req.body;

        const vendor = await Vendor.create({
            name,
            contactPerson,
            phone,
            email,
            address,
            productsSupplied
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({}).populate('productsSupplied', 'name price');
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
        const vendor = await Vendor.findById(req.params.id).populate('productsSupplied', 'name price');

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
        const vendor = await Vendor.findByIdAndUpdate(
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
        const vendor = await Vendor.findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json({ message: 'Vendor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
};

import Deal from '../models/Deal.js';

// Get all deals
export const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find();
    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single deal by ID
export const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Deal ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new deal
export const createDeal = async (req, res) => {
  try {
    // Set recent to true for the new deal
    const dealData = {
      ...req.body,
      recent: true
    };

    // First, set recent=false for all existing recent deals
    await Deal.updateMany(
      { recent: true },
      { recent: false }
    );

    // Then create the new deal
    const deal = await Deal.create(dealData);
    
    res.status(201).json({
      success: true,
      data: deal
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update deal
export const updateDeal = async (req, res) => {
  try {
    const { recent, trending, popular, ...otherFields } = req.body;

    // Handle status fields one by one
    if (recent === true) {
      await Deal.updateMany(
        { recent: true },
        { recent: false }
      );
    }

    if (trending === true) {
      await Deal.updateMany(
        { trending: true },
        { trending: false }
      );
    }

    if (popular === true) {
      await Deal.updateMany(
        { popular: true }, 
        { popular: false }
      );
    }

    // Update the deal with all fields
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { ...otherFields, recent, trending, popular },
      {
        new: true,
        runValidators: true
      }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deal
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Deal ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete deal
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Deal ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 
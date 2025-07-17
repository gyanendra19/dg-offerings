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
    const { recent, trending, popular, ...otherFields } = req.body;
    
    // Determine which status to set based on the request
    let statusToSet = null;
    if (recent === true) statusToSet = 'recent';
    else if (trending === true) statusToSet = 'trending';
    else if (popular === true) statusToSet = 'popular';
    else statusToSet = 'recent'; // Default to recent if none specified

    // Set all existing deals' status to false for the chosen status
    await Deal.updateMany(
      { [statusToSet]: true },
      { [statusToSet]: false }
    );

    // Create the new deal with only one status set to true
    const dealData = {
      ...otherFields,
      recent: statusToSet === 'recent',
      trending: statusToSet === 'trending',
      popular: statusToSet === 'popular'
    };

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

    // Handle status fields - ensure mutual exclusivity
    if (recent === true) {
      // Set all other deals' recent status to false
      await Deal.updateMany(
        { recent: true },
        { recent: false }
      );
      // Ensure this deal has trending and popular set to false
      await Deal.findByIdAndUpdate(
        req.params.id,
        { trending: false, popular: false }
      );
    }

    if (trending === true) {
      // Set all other deals' trending status to false
      await Deal.updateMany(
        { trending: true },
        { trending: false }
      );
      // Ensure this deal has recent and popular set to false
      await Deal.findByIdAndUpdate(
        req.params.id,
        { recent: false, popular: false }
      );
    }

    if (popular === true) {
      // Set all other deals' popular status to false
      await Deal.updateMany(
        { popular: true }, 
        { popular: false }
      );
      // Ensure this deal has recent and trending set to false
      await Deal.findByIdAndUpdate(
        req.params.id,
        { recent: false, trending: false }
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

// Get all unique deal types
export const getDealTypes = async (req, res) => {
  try {
    const types = await Deal.distinct('dealType', { dealType: { $ne: '' } });
    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 
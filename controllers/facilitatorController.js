const Facilitator = require('../models/Facilitator');

exports.getAllFacilitators = async (req, res) => {
    try {
        // Fetch all facilitators and sort them alphabetically by name
        const facilitators = await Facilitator.find().sort({ name: 1 });
        
        return res.status(200).json(facilitators);
    } catch (error) {
        console.error('Error fetching facilitators:', error);
        return res.status(500).json({ error: 'Failed to fetch facilitators data.' });
    }
};
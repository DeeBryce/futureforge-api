const crypto = require('crypto');
const Applicant = require('../models/Applicant');
const AccessCode = require('../models/AccessCode');
const Cohort = require('../models/Cohort');
const axios = require('axios');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// STEP 1: REGISTER PENDING APPLICANT
// ==========================================
exports.registerApplicant = async (req, res) => {
    try {
        // 1. Fetch the currently active cohort from the database
        // (Adjust the query condition '{ status: 'active' }' to match your actual Cohort schema)
        const activeCohort = await Cohort.findOne({ status: 'open' });

        if (!activeCohort) {
            return res.status(400).json({ 
                error: 'Registration is currently closed. No active cohort found.' 
            });
        }
        // 2. Check if email already exists
        const existingApplicant = await Applicant.findOne({ email: req.body.email });
        if (existingApplicant) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }
        // 3. Save the Applicant Data
        // Notice we are injecting the cohortId securely on the server now!
        const applicantData = { 
            ...req.body, 
            cohortId: activeCohort._id, 
            hasPaid: false 
        };
        
        const newApplicant = new Applicant(applicantData);
        await newApplicant.save();

        // 3. Prepare the payload for Paystack
        const paystackPayload = {
            email: newApplicant.email,
            amount: 2000 * 100, // Paystack requires the amount in Kobo (e.g., 20,000 Naira * 100)
            
            // PRO TIP: Pass the database ID in the metadata! 
            // When the webhook fires later, it makes finding the user 100x easier.
            metadata: {
                applicant_id: newApplicant._id
            },
            
            callback_url: "https://futureforge-project-gules.vercel.app/success-page" 
        };

        // 4. Make the POST request to Paystack's API
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            paystackPayload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 5. Send the generated link back to the frontend
        return res.status(201).json({ 
            message: 'Registration saved. Redirecting to payment...',
            applicantId: newApplicant._id,
            paymentLink: paystackResponse.data.data.authorization_url // This is the magical link!
        });

    } catch (error) {
        // If Paystack fails, catch it cleanly
        console.error('Registration/Payment Error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to initialize payment process.' });
    }
};

// ==========================================
// PAYSTACK WEBHOOK (UPDATE LEDGER ONLY)
// ==========================================
exports.handlePaymentWebhook = async (req, res) => {
    const { event, data } = req.body;

    if (event === 'charge.success') {
        const userEmail = data.customer.email.toLowerCase().trim();
        const paymentReference = data.reference;

        try {
            // 1. Find the pending applicant by email and mark them as paid
            const updatedApplicant = await Applicant.findOneAndUpdate(
                { email: userEmail },
                { hasPaid: true, paymentReference: paymentReference },
                { returnDocument: 'after' } // Returns the updated document
            );

            if (!updatedApplicant) {
                return res.status(404).json({ error: 'Applicant not found in database' });
            }

            console.log(`✅ Payment verified & Applicant marked as paid: ${userEmail}`);
            return res.status(200).json({ message: 'Webhook processed successfully' });

        } catch (error) {
            console.error('Webhook Error:', error);
            return res.status(500).json({ error: 'Internal Server Error during processing' });
        }
    }
    
    return res.status(200).json({ message: 'Event received but not processed' });
};

// ==========================================
// GET ALL APPLICANTS (ADMIN ONLY)
// ==========================================
exports.getApplicants = async (req, res) => {
    try {
        // We can use query parameters to filter. 
        // e.g., /api/applicants?hasPaid=true
        const filter = {};
        
        if (req.query.hasPaid !== undefined) {
            // Convert the string 'true'/'false' from the URL to a boolean
            filter.hasPaid = req.query.hasPaid === 'true'; 
        }

        // Fetch applicants from DB, sorted by newest first
        const applicants = await Applicant.find(filter)
            .populate('cohortId', 'cohortNumber startDate') // Optional: bring in cohort details
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: applicants.length,
            applicants: applicants
        });

    } catch (error) {
        console.error('Fetch Applicants Error:', error);
        return res.status(500).json({ error: 'Failed to fetch applicants' });
    }
};
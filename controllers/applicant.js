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
            amount: 2000 * 100,
            
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
    // 1. VERIFY PAYSTACK SIGNATURE
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        console.error('🚨 Invalid Paystack Signature - Webhook request rejected');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
        const userEmail = data.customer.email.toLowerCase().trim();
        const paymentReference = data.reference;
        const amountPaid = data.amount / 100; // Convert kobo to Naira

        try {
            // 2. UPDATE DATABASE & FETCH APPLICANT DATA
            // We use .populate() to pull in the cohort details for the email
            const updatedApplicant = await Applicant.findOneAndUpdate(
                { email: userEmail },
                { hasPaid: true, paymentReference: paymentReference },
                { returnDocument: 'after' }
            ).populate('cohortId', 'cohortNumber'); 

            if (!updatedApplicant) {
                return res.status(404).json({ error: 'Applicant not found in database' });
            }

            console.log(`✅ Payment verified: ${userEmail}`);

            // 3. PREPARE EMAIL DATA
            // Adjust these variable names if your Mongoose schema uses different keys (e.g. firstName instead of fullName)
            const applicantName = updatedApplicant.fullName || 'Applicant';
            const track = updatedApplicant.areaOfInterest || updatedApplicant.selectedTrack || 'FutureForge Track';
            const cohortNum = updatedApplicant.cohortId?.cohortNumber || 'Current Cohort';
            const phone = updatedApplicant.phoneNumber || updatedApplicant.whatsappNumber || 'N/A';
            const location = `${updatedApplicant.state || 'N/A'}, ${updatedApplicant.country || 'N/A'}`;
            const notes = updatedApplicant.notes || updatedApplicant.additionalNotes || 'None provided';
            
            const regDate = new Date().toLocaleString('en-NG', { 
                dateStyle: 'medium', timeStyle: 'short' 
            });

            // 4. SEND AUTOMATED EMAILS CONCURRENTLY
            try {
                await Promise.all([
                    // EMAIL 1: To the Applicant
                    resend.emails.send({
                        from: 'FutureForge Admissions <onboarding@resend.dev>', // Update to your verified domain later
                        to: 'oesigbone@gmail.com', // Change to updatedApplicant.email when ready for production
                        subject: 'Registration & Payment Confirmed - Welcome to FutureForge!',
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px;">
                                <h2 style="color: #0f172a;">Welcome to FutureForge, ${applicantName}!</h2>
                                <p>Your registration and payment have been successfully processed.</p>
                                
                                <h3 style="color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Registration Details</h3>
                                <ul>
                                    <li><strong>Programme:</strong> FutureForge Learning</li>
                                    <li><strong>Cohort:</strong> ${cohortNum}</li>
                                    <li><strong>Selected Track:</strong> ${track}</li>
                                    <li><strong>Registration Date:</strong> ${regDate}</li>
                                </ul>

                                <h3 style="color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Payment Confirmation</h3>
                                <p>We have successfully received your payment of <strong>₦${amountPaid}</strong>. (Reference: ${paymentReference})</p>

                                <h3 style="color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Next Steps</h3>
                                <p>Our admissions team is currently reviewing your profile. You can expect to receive your learning schedule and official onboarding instructions via email within the next <strong>48 to 72 hours</strong>.</p>
                                
                                <p>Best regards,<br><strong>The FutureForge Team</strong></p>
                            </div>
                        `
                    }),

                    // EMAIL 2: To the Admin
                    resend.emails.send({
                        from: 'FutureForge System <onboarding@resend.dev>', // Update to your verified domain later
                        to: 'oesigbone@gmail.com',
                        subject: `New Successful Registration: ${applicantName} (${track})`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px;">
                                <h2 style="color: #10b981;">New Registration Alert</h2>
                                <p>A new applicant has successfully paid and registered.</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Full Name</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${applicantName}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${userEmail}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${phone}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Track</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${track}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Cohort</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${cohortNum}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Date/Time</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${regDate}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Location</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${location}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₦${amountPaid}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Reference</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${paymentReference}</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Status</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0; color: #10b981; font-weight: bold;">Successful</td></tr>
                                    <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${notes}</td></tr>
                                </table>
                            </div>
                        `
                    })
                ]);
                console.log('📧 Both Admin and Applicant emails sent successfully');
            } catch (emailError) {
                console.error('❌ Failed to send emails:', emailError);
            }

            return res.status(200).json({ message: 'Webhook processed and emails sent' });

        } catch (error) {
            console.error('Webhook Database Error:', error);
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
        const filter = {};
        
        if (req.query.hasPaid !== undefined) {
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
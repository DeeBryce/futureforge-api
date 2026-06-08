const crypto = require('crypto'); // Built-in Node module for secure random strings
const Applicant = require('../models/Applicant');
const AccessCode = require('../models/AccessCode'); // Your new schema
const Cohort = require('../models/Cohort'); // Dev 2's schema
const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// POST: Register new applicant
exports.registerApplicant = async (req, res) => {
    try {
        const newApplicant = new Applicant(req.body);
        await newApplicant.save();

        return res.status(201).json({ 
            message: 'Registration saved successfully. Proceed to payment.',
            applicantId: newApplicant._id,
            email: newApplicant.email
        });
    } catch (error) {
        console.error('Registration Error:', error.message);
        return res.status(400).json({ error: error.message });
    }
};

// POST: Handle Payment Webhook
exports.handlePaymentWebhook = async (req, res) => {
    const { event, data } = req.body;

    if (event === 'charge.success') {
        const userEmail = data.customer.email.toLowerCase().trim();
        const paymentReference = data.reference;

        try {
            // 1. Mark Applicant as Paid
            const updatedApplicant = await Applicant.findOneAndUpdate(
                { email: userEmail },
                { hasPaid: true, paymentReference: paymentReference },
                { returnDocument: 'after' }
            );

            if (!updatedApplicant) {
                return res.status(404).json({ error: 'Applicant not found in database' });
            }

            // 2. Find the Latest Active Cohort (Dev 2's Data)
            const activeCohort = await Cohort.findOne({ 
                status: { $in: ['open', 'ongoing'] } 
            }).sort({ cohortNumber: -1 });

            if (!activeCohort) {
                throw new Error("Cannot generate code: No active cohort found in database.");
            }

            // 3. Generate a Secure Access Code (e.g., "FF-A7B89C")
            const rawCode = crypto.randomBytes(3).toString('hex').toUpperCase();
            const finalAccessCode = `FF-${rawCode}`;

            // 4. Save Code to Database
            const newAccessCode = new AccessCode({
                code: finalAccessCode,
                applicant: updatedApplicant._id,
                cohort: activeCohort._id
            });
            await newAccessCode.save();

            // 5. Send Welcome Email with the Code
            const emailResponse = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'oesigbone10@gmail.com', // Keep your test email here for now
                subject: 'Welcome to the FutureForge Cohort! Here is your Access Code',
                html: `
                    <h2>Payment Confirmed! ✅</h2>
                    <p>Hi ${updatedApplicant.fullName},</p>
                    <p>Your payment (Ref: ${paymentReference}) was successful.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px;">Your Single-Use Access Code:</p>
                        <h1 style="margin: 5px 0; color: #333; letter-spacing: 2px;">${finalAccessCode}</h1>
                    </div>
                    <p>Keep this code safe. You will need it to unlock your portal when the cohort begins!</p>
                `
            });

            console.log(`✅ Payment verified & Code generated for: ${userEmail}`);
            return res.status(200).json({ message: 'Webhook processed successfully' });

        } catch (error) {
            console.error('Webhook Error:', error);
            // Even if email/code generation fails, we return 200 to Paystack so they don't keep retrying the webhook
            return res.status(200).json({ error: 'Internal Server Error during processing' });
        }
    }
    return res.status(200).json({ message: 'Event received but not processed' });
};
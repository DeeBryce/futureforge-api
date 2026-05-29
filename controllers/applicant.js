const Applicant = require('../models/Applicant');
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
            const updatedApplicant = await Applicant.findOneAndUpdate(
                { email: userEmail },
                { hasPaid: true, paymentReference: paymentReference },
                { returnDocument: 'after' }
            );

            if (!updatedApplicant) {
                return res.status(404).json({ error: 'Applicant not found in database' });
            }

            // Send Welcome Email
            const emailResponse = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'oesigbone10@gmail.com', // Keep your test email here for now
                subject: 'Welcome to the FutureForge Cohort!',
                html: `<h2>Payment Confirmed! ✅</h2><p>Hi ${updatedApplicant.fullName},</p><p>Your payment (Ref: ${paymentReference}) was successful.</p>`
            });

            console.log(`✅ Payment verified for: ${userEmail}`);
            return res.status(200).json({ message: 'Webhook processed successfully' });

        } catch (error) {
            console.error('Webhook Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    return res.status(200).json({ message: 'Event received but not processed' });
};
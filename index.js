const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/shopify-webhook', async (req, res) => {
  try {
    const order = req.body;

    if (order.gateway !== 'Manual') {
      return res.status(200).send('Ignored — not a manual payment.');
    }

    const paymentRequest = {
      amount: order.total_price,
      currency: order.currency || 'USD',
      order_id: order.id,
      customer_email: order.email,
      redirect_url: `https://yourstore.com/pages/thank-you`, // <- replace this
    };

    const response = await axios.post('https://checkout.stratos-pay.com/api/payment/request', paymentRequest, {
      headers: {
        Authorization: `Bearer ${process.env.STRATOS_API_KEY}`,
      },
    });

    console.log('Stratos Response:', response.data);
    res.status(200).send('Webhook processed.');
  } catch (error) {
    console.error('Webhook failed:', error.message);
    res.status(500).send('Webhook failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook running on port ${PORT}`);
});

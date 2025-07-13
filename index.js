const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Main webhook endpoint
app.post("/shopify-webhook", async (req, res) => {
  try {
    const { email, line_items, total_price } = req.body;

    const description = line_items
      ?.map((item) => `${item.quantity}x ${item.title}`)
      .join(", ") || "Shopify Order";

    const paymentPayload = {
      amount: parseFloat(total_price),
      email,
      description,
      redirect_url: "https://m21utz-zu.myshopify.com/pages/thank-you", // ✅ Replace if needed
    };

    const response = await axios.post("https://secure.stratos-pay.com/api/pay", paymentPayload, {
      headers: {
        Authorization: `Bearer ${process.env.STRATOS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const paymentLink = response.data?.url;
    console.log("✅ Payment Link:", paymentLink);

    return res.status(200).json({ payment_link: paymentLink });
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to create StratosPay link" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Webhook running on port ${PORT}`);
});

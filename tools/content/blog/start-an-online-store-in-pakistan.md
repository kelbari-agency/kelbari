---
title: "Start an online store in Pakistan: a 2026 guide"
description: "How to start an online store in Pakistan: Shopify or WooCommerce, cards, wallets and cash on delivery, couriers, FBR basics and the real cost of each order."
date: 2026-11-24
author: Kelbari
category: Web development
service: web-development
keywords:
  - start an online store in Pakistan
  - e-commerce website in Pakistan
  - online payment gateway Pakistan
  - cash on delivery Pakistan
  - Shopify vs WooCommerce in Pakistan
  - courier for online store Pakistan
---

To start an online store in Pakistan you need five things working together: a store platform (usually Shopify or WooCommerce), payment options Pakistani buyers trust (cash on delivery plus cards and wallets), a courier that collects cash and handles returns, a tax registration with FBR, and an honest view of what each order costs you after fees, tax and returns.

Most first-time sellers spend weeks on the design and an afternoon on payments and delivery. Then returned parcels and courier deductions eat the margin. This guide goes through each decision with the facts as they stand in November 2026, using two stores we built, [Mian Art Store](https://mianartstore.com) and [shapargullay](https://shapargullay.com), as real examples.

## Decide what you sell and how it travels

Before you choose software, write down the price, packed weight and fragility of a typical order. Cheap, light items mean courier charges are a large share of each order. Expensive items mean every return hurts more, so you will push harder for prepaid orders. Digital products such as tickets have nothing to deliver, so card and wallet payments are the whole business.

## Shopify vs WooCommerce in Pakistan

Both can run a serious e-commerce website in Pakistan. The difference is mostly in how you pay for them and how much control you want.

**Shopify** is hosted for you. Its [Pakistan pricing page](https://www.shopify.com/pk/pricing) (checked November 2026) lists the Basic plan at US$25 a month, or US$19 a month billed yearly, and Grow at US$65, or US$49 yearly, with a three-day trial and then US$1 a month for three months. You pay in dollars, so the cost moves with the exchange rate.

The catch for Pakistan is payments. Shopify Payments is not offered here: Pakistan is not on [Shopify's list of supported countries](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries), so you use a third-party provider. Shopify then charges [third-party transaction fees](https://help.shopify.com/manual/intro-to-shopify/pricing-plans/pricing-overview) on those orders at a rate that depends on your plan. Manual methods such as cash on delivery and bank transfer are exempt.

**WooCommerce** is a free, open-source plugin for WordPress ([WordPress.org](https://wordpress.org/plugins/woocommerce/)). You pay for hosting, a domain, any premium extensions and someone to keep it updated. Cash on delivery is [built into the core plugin](https://woocommerce.com/document/cash-on-delivery/), and you can limit it to certain shipping methods, which is useful if you only want COD inside certain cities.

| | Shopify | WooCommerce |
|---|---|---|
| Monthly platform fee | Yes, in US dollars | None for the plugin; you pay for hosting |
| Hosting, security updates | Handled by Shopify | Your job or your developer's |
| Local gateways | Through apps; third-party fees on those orders | Through plugins; no platform fee per order |
| Cash on delivery | Manual payment method, no transaction fee | Built in |
| Control over design and data | Within Shopify's rules | Full |

A simple rule: if you want to start this month with no developer, Shopify is the shorter road. If you have a large catalogue, want no per-order platform fees and are happy to look after hosting, WooCommerce usually costs less to run over time.

Mian Art Store, an art and stationery shop in Bahawalpur, runs on WooCommerce: a catalogue by category and brand, variants, sale prices, bundles, a wishlist and customer accounts, with cash on delivery and free delivery on orders over Rs. 3,000.

A third route is a custom build. shapargullay, an event ticketing platform, is built with Next.js because it needs things store templates don't do well: QR entry tickets, Apple and Google Wallet passes and ticket messages on WhatsApp. Choose custom only when the product is not really a shop. Our guide to [website costs in Pakistan](/blog/how-much-does-a-website-cost-in-pakistan/) explains what drives the price of each option.

## Taking payments: the options in Pakistan

### Cash on delivery

COD is what many Pakistani shoppers expect, especially on a first order from a store they don't know. It costs you nothing to set up. The cost comes later, in returns, which have their own section below.

### Cards through an online payment gateway

To take Visa and Mastercard you need a payment gateway. Two local options that cover cards and wallets in one integration:

- **Safepay** says on [its website](https://getsafepay.com) that it is a regulated payment service provider and that merchants can accept Visa, Mastercard and PayPak cards, Easypaisa and JazzCash wallets and Raast, with Shopify and WooCommerce integrations. Its [fee breakdown](https://safepay.helpscoutdocs.com/article/131-safepay-fee-breakdown) (last updated January 2026) lists 2.9% + Rs. 30 per domestic card transaction and 3.2% + Rs. 30 for international cards, both excluding tax.
- **PayFast** (Premier PayFast) describes itself on [its website](https://www.gopayfast.com/) as a licensed PSP and MSP by the State Bank of Pakistan, accepting Raast QR, cards, bank transfers, mobile wallets and Google Pay. It also offers PayLink, for collecting payments through a link sent on WhatsApp, SMS or email. It does not publish fees on its homepage, so ask for a quote.

Both check merchants before approval, so apply early.

shapargullay takes card payments through Safepay and shows its 4% service fee before the buyer pays. That is a choice every store has to make: absorb the gateway fee in your prices, or pass it on and say so clearly before the pay button. Hiding it until the last step is the quickest way to lose a sale.

### JazzCash and Easypaisa wallets

Many buyers who don't use cards online do have a mobile wallet. With the [JazzCash payment gateway](https://www.jazzcash.com.pk/business/accept-payments/payment-gateway), a customer enters their JazzCash number at checkout and approves the payment with their MPIN, or pays a voucher code through the app or at a JazzCash retailer. The [Easypaisa online payment gateway](https://easypaisa.com.pk/business-solutions/) accepts payments through the Easypaisa app or over the counter. Sign-up goes through its merchant portal, with sandbox testing before go-live and biometric verification at an Easypaisa franchise.

You can apply to each wallet directly. Or use a gateway such as Safepay or PayFast that already includes them, so one integration covers cards and wallets.

### Bank transfer and Raast

Bank transfer needs no gateway: the customer pays, sends a screenshot and you mark the order paid by hand. That does not scale. Raast QR, offered by [JazzCash Business](https://www.jazzcash.com.pk/business/accept-payments/payment-gateway) and PayFast among others, lets any bank app pay you instantly and is worth adding as volumes grow.

### What to offer at launch

1. Cash on delivery, because buyers expect it.
2. One gateway that covers cards and wallets in a single integration.
3. Bank transfer as a fallback for large orders.

## Cash on delivery and the return problem

The risk with COD is the parcel that comes back. DHL Pakistan [estimated in July 2026](https://www.dhl.com/discover/en-pk/e-commerce-advice/e-commerce-best-practice/subscription-marketing/how-pakistani-e-commerce-sellers-can-reduce-cod-returns) that roughly one in five COD parcels is returned undelivered, an average of 18% to 20%. The article doesn't name its data source, so treat it as an industry estimate, not a measured figure for your store.

A returned parcel costs you the outbound delivery, sometimes a return charge, the packaging and time. Ways to bring returns down:

- **Confirm before you ship.** A WhatsApp message or short call to confirm the address and order filters out many fake and impulse orders.
- **Make prepaid worth it.** A small discount or free delivery for prepaid orders moves some buyers to cards and wallets.
- **Set a free-delivery threshold.** Mian Art Store offers free delivery over Rs. 3,000, which gives buyers a reason to add to the basket so the delivery cost is spread over more items.
- **Say when it will arrive.** Unclear delivery times lead to refused parcels.
- **Ask repeat refusers, and buyers of expensive items, to pay in advance**, or at least pay the delivery charge.

There is also a tax reason to nudge buyers towards prepaid, covered in the registration section below: less tax is withheld on digital payments than on COD.

## Courier and delivery options

The main courier networks for online sellers include TCS, Leopards, M&P, Trax and PostEx. Compare them on:

- **How often they pay out COD cash.** Leopards [advertises weekly COD disbursements](https://pk.leopardscourier.com/business/ecommerce-economy) to your bank account. PostEx [markets upfront payments](https://postex.pk/) for stores offering COD, which helps cash flow.
- **Return charges and how returns are handled.** Get this in writing from the rate card.
- **Coverage.** Trax, for example, [lists 160+ towns and cities](https://trax.pk/). Check that your customers' cities are covered by the service you are paying for.
- **Weight rules.** Leopards' Economy service is for parcels of at least 5 kg and charges by volumetric weight above a standard size, using length × breadth × height in cm divided by 5,000. Bulky, light items can cost more than you expect.
- **Booking.** Booking by hand is fine at five orders a day and painful at fifty. Ask for an API or a store plugin.

If you are just starting, Leopards' [Retail COD](https://pk.leopardscourier.com/business/ecommerce-economy) needs only your CNIC, bank details and a parcel to book, with no minimum monthly shipments. Many stores open accounts with two couriers and use the better one for each city.

## Registration and tax basics

This is general information, not tax advice. Speak to a tax adviser about your own case.

- **NTN.** [FBR](https://www.fbr.gov.pk/categ/register-income-tax/51147/30846/71148) treats an individual as registered once they are e-enrolled on the IRIS portal. For individuals, the 13-digit CNIC is used as the NTN.
- **Registration is no longer optional.** Under FBR rules [reported by Profit](https://profit.pakistantoday.com.pk/2025/09/03/online-marketplaces-and-couriers-barred-from-serving-unregistered-sellers), e-commerce sellers must be registered, and online marketplaces and couriers may not serve unregistered sellers from 1 July 2025.
- **Tax withheld on every order.** Under section 6A, tax is withheld on online sales: 1% on digital payments, deducted by the payment intermediary (for your own store, the acquiring bank), and 2% on COD, deducted by the courier before it pays you. [Pakistan Revenue reports](https://pkrevenue.com/pakistan-tax-rates-on-e-commerce-digital-payments-for-tax-year-2027/) the same rates for tax year 2027. FBR's [budget 2026-27 summary](https://fbr.gov.pk/Budget2026-27/SalientFeatures/Salient-Feature.pdf) adds that this tax is adjustable for sellers with turnover above Rs. 200 million.
- **A company is optional.** You can trade as an individual with an NTN. If you want a company, [SECP](https://www.secp.gov.pk/company-formation/) handles name reservation and incorporation online through eZfile, and a private company formed by one person is called a single member company.

## Running costs of an online store

Building the store is a one-off cost. These are the costs that continue:

| Cost | What drives it |
|---|---|
| Platform | Shopify plan in US dollars, or WooCommerce hosting |
| Domain and email | Yearly renewal |
| Apps and plugins | Premium themes, courier and review plugins, some billed yearly |
| Gateway fees | For example, Safepay's 2.9% + Rs. 30 plus tax per domestic card payment |
| Courier | Rate per parcel by weight and city, plus return charges |
| Withholding tax | 1% on digital payments, 2% on COD |
| Returns | Lost delivery fees, packaging and damaged stock |
| Maintenance | Updates, backups and fixes, especially on WooCommerce |
| Marketing | Ads and social media, usually the largest cost after stock |

A worked example on a Rs. 3,000 order:

- **Paid by card through Safepay:** about Rs. 117 in gateway fees before tax (2.9% is Rs. 87, plus Rs. 30) and Rs. 30 withheld at 1%.
- **Paid by COD:** no gateway fee, but Rs. 60 withheld at 2%, plus your courier charge, plus the chance the parcel comes back.

Once returns are counted, prepaid can be cheaper even after the gateway fee. Run these numbers for your own prices.

Marketing is where most stores get their first sales, and it deserves its own budget, whether you run it yourself or hand it to a [digital marketing](/digital-marketing/) team. See our guides to [social media management for small businesses](/blog/social-media-management-for-small-businesses/) and [SEO for small businesses](/blog/seo-for-small-businesses/).

## Checklist to start an online store in Pakistan

1. Register on IRIS and apply to a gateway early.
2. Add products with real photos, weights and stock levels.
3. Set delivery charges, a free-delivery threshold and where COD is offered.
4. Open courier accounts; do a test booking and a test return.
5. Publish clear delivery, return and refund pages.
6. Test every payment method, including a refund.
7. Set up WhatsApp order confirmation before you turn on ads.

## Questions

### Can I start an online store in Pakistan without a company?

Yes. You can sell as an individual with an NTN, which for individuals is your CNIC once you are enrolled on FBR's IRIS portal. Payment gateways and couriers will still ask for identity and bank details.

### Is Shopify or WooCommerce better in Pakistan?

Shopify is quicker to start but billed in dollars, with extra fees on orders through third-party gateways. WooCommerce has no platform fee but needs hosting and maintenance. For a large catalogue on a tight monthly budget, WooCommerce usually wins.

### Can I use Stripe for my store in Pakistan?

Not directly. Pakistan is not on [Stripe's list of supported countries](https://stripe.com/global). Local gateways such as Safepay and PayFast are the usual route.

### Should I offer only cash on delivery to start?

You can, but add a card and wallet option as soon as a gateway approves you. Prepaid orders don't get refused at the door, and less tax is withheld on them.
If you would like help choosing a platform or building the store, our [web development](/web-development/) team builds online stores and can walk you through the options on a short call. You keep every file and account at the end.

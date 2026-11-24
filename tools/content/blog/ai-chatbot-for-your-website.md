---
title: "AI chatbot for your website: a practical guide for 2026"
description: "What an AI chatbot for your website can and can't do, how to hand off to WhatsApp, Urdu and Roman Urdu, privacy, real costs, and when to build or buy."
date: 2026-11-24
author: Kelbari
category: AI
service: ai-chatbot-development
keywords:
  - AI chatbot for website
  - add chatbot to website
  - WhatsApp chatbot for business
  - customer support chatbot
  - chatbot cost
  - rule-based vs AI chatbot
---

An AI chatbot for your website can answer the questions your staff answer twenty times a day, take booking details, look up an order and pass a warm lead to you on WhatsApp, at any hour. What it cannot do safely is make up answers about prices, policies or stock. The gap between a useful bot and an embarrassing one is mostly in the set-up: what content it is allowed to answer from, when it hands over to a person, and whether anyone reads the transcripts.

This guide is for business owners in Pakistan and those selling abroad. It only quotes prices that a provider has published.

## What an AI chatbot for website visitors can and can't do

A modern AI chatbot runs on a large language model, so it understands questions phrased many ways, with typos and mixed languages, and replies in normal sentences.

**It can:**

- Answer from your own content: delivery areas, hours, fees, payment methods, returns.
- Ask follow-up questions to collect a name, phone number, date or budget.
- Look up records you allow it to reach, such as an order by order number and phone.
- Summarise the conversation so staff don't have to ask the customer again.

**It can't, reliably:**

- Know anything you haven't given it, such as the price change you made last week.
- Guarantee every answer is right. Anthropic's own guide to [reducing hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) says its techniques "significantly reduce hallucinations" but "don't eliminate them entirely".
- Make judgement calls on refunds, exceptions or angry customers.

You are also responsible for what it says. In *Moffatt v. Air Canada* (February 2024), a Canadian tribunal held the airline liable for wrong fare information its website chatbot gave a customer, rejecting the argument that the chatbot was responsible for its own actions ([American Bar Association summary](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-february/bc-tribunal-confirms-companies-remain-liable-information-provided-ai-chatbot/)). Treat every bot answer as if a member of staff had said it.

## Where a customer support chatbot helps (and where it doesn't)

A quick test: read last month's enquiries. If most are the same handful of questions, a bot will save time. If most are one-off negotiations or complaints, it won't.

| Job | What the bot does | What it needs | Hand to a person when |
|---|---|---|---|
| FAQs | Answers delivery, timings, fees, payment, returns | A clear, current FAQ and policy pages | The answer isn't in your content |
| Bookings | Collects details, checks slots, confirms | Access to your calendar or booking system | The customer wants an exception |
| Order status | Looks up the order and reports the stage | Read-only access to orders, plus a check such as order number and phone | The order is late or wrong |
| Lead capture | Asks qualifying questions, sends a summary to sales | A short list of what makes a good lead | The lead is ready to talk or is high value |

Keep the bot away from complaints, refunds, custom quotes, and anything medical, legal or financial. Never let it collect card numbers or passwords in chat.

## Rule-based vs AI chatbot

| | Rule-based (buttons and flows) | AI chatbot |
|---|---|---|
| How it works | Fixed menus and keyword triggers | Understands free text and answers from your content |
| Accuracy | Says exactly what you wrote | Usually right, occasionally wrong |
| Handles unexpected questions | Poorly | Well |
| Upkeep | Every new question needs a new branch | Update the content it reads |
| Running cost | Low and predictable | Varies with message volume |

For most small businesses the best answer is a mix: buttons for the three or four most common tasks ("Track my order", "Book a visit", "Talk to us on WhatsApp"), the AI for everything typed, and fixed rules for anything involving money or personal data.

## Grounding the bot in your own content to reduce wrong answers

"Grounding" means the bot answers from your documents rather than from its general knowledge. Most tools do this with retrieval: when a question arrives, the system searches your content for the relevant passages and gives only those to the model to answer from. Getting this right matters more than which AI model you pick.

1. **Write one clear source of truth.** An FAQ page, delivery and returns policy, service list, menu or catalogue, hours and locations. One fact in one place, in plain language. If your website contradicts itself, the bot will too.
2. **Fetch live data, don't paste it.** Stock, prices and order status change. Connect the bot to the system that holds them instead of copying them into a document that goes stale.
3. **Tell it to admit uncertainty.** Anthropic's guide recommends explicitly allowing the model to say "I don't know" and restricting it to the documents provided ([source](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)). In practice: "If the answer isn't in the content, say so and offer WhatsApp."
4. **Link to the source.** Where possible, the bot should link to the page its answer came from, so the customer can check.
5. **Build a test set.** Collect 30 to 50 real questions from your inbox, including awkward and badly spelt ones, and write the correct answer for each. Run them before launch and after every content change.

## WhatsApp hand-off and WhatsApp chatbots for business

In Pakistan, most customers would rather finish a conversation on WhatsApp than in a website widget. There are three levels.

**1. A "continue on WhatsApp" button.** The bot ends the chat with a link to your business number, with a summary pre-filled. It works with the free WhatsApp Business app and is the right start for most small businesses.

**2. The bot alerts your staff on WhatsApp.** It sends a lead or booking summary to a staff number through the WhatsApp Business Platform (the Cloud API). More polished, but messages are charged. We use the WhatsApp Business API on [shapargullay](https://shapargullay.com), our event ticketing platform, to send ticket messages, so this set-up is familiar ground.

**3. The bot runs inside WhatsApp.** Meta announced **Meta Business Agent** on 3 June 2026, an AI that answers customers on WhatsApp, Messenger and Instagram ([Meta newsroom](https://about.fb.com/news/2026/06/meta-business-agent/)). From Meta's own pages:

- In the WhatsApp Business app it is set up from the Tools tab and learns from your catalogue, profile, website, hours and any documents you add ([WhatsApp Help Centre](https://faq.whatsapp.com/1153795669452207/)). You can flag topics it should avoid and step in manually ([WhatsApp Business](https://whatsappbusiness.com/products/business-app-ai-agent/)).
- It is available in limited countries to select businesses, and not all languages are supported ([WhatsApp Help Centre](https://faq.whatsapp.com/291930066973116)). If it isn't in your Tools tab, it isn't available to you yet.
- On the developer platform it excludes some business types, including finance, health and government ([Meta for Developers](https://developers.facebook.com/documentation/meta-business-agent/overview)).

Separately, from 15 January 2026 WhatsApp's Business API terms bar general-purpose AI assistants such as ChatGPT, while businesses using AI for their own customer service remain allowed ([TechCrunch, October 2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/)). A bot about your shop is fine; a bot that chats about anything is not.

**Hand over to a person when** the customer asks for one, repeats a question, complains or asks for a refund, is a high-value lead, or the bot has no answer. Pass the transcript along so they don't repeat themselves, and say honestly when someone will reply.

## Privacy and data handling

- **Say it's an AI.** Label the widget and link to your privacy policy.
- **Collect the minimum.** Instruct the bot never to ask for CNIC numbers, card details or passwords, and to warn customers who paste them.
- **Limit what it can reach.** Order lookups should need an order number plus the phone on the order.
- **Check your provider's terms.** Find out where chats are stored, for how long, and whether they are used to train models. For example, Anthropic says it does not use inputs and outputs from its commercial API to train its models by default ([Anthropic Privacy Center](https://privacy.anthropic.com/en/articles/7996868-i-want-to-opt-out-of-my-prompts-and-results-being-used-for-training-models)). Other providers differ.
- **Know the law where your customers are.** Pakistan's personal data protection bill was still a draft as of August 2026 ([Dawn](https://www.dawn.com/news/2021159)), but if you serve customers in the UK or EU, their data protection rules apply to you. Decide who can read transcripts and how long you keep them.

## English, Urdu and Roman Urdu

Pakistani customers write in English, Urdu script and Roman Urdu, often in the same message. Current models handle all three reasonably well, but Roman Urdu is the hardest because there is no standard spelling: "kitnay", "kitne" and "ktny" all mean the same thing. A 2025 study of Urdu idioms found models performed more steadily on Urdu script than on Roman Urdu, and pointed to the lack of standard spelling as the reason ([Khan and Akter, arXiv](https://arxiv.org/abs/2510.17460)).

What helps:

- Tell the bot to reply in the language and script the customer used.
- Add common Roman Urdu and Urdu names for your products and services to the knowledge base ("jootay", "joote" for shoes).
- Keep prices, dates and order numbers in digits.
- Put plenty of Roman Urdu messages in your test set, copied from real chats.
- If you use Meta Business Agent, note that Meta says the language it uses is set by your business phone number ([WhatsApp Help Centre](https://faq.whatsapp.com/1153795669452207/)).

## Measuring whether it's working

Before launch, note your weekly enquiries and reply times. Then track:

- **Resolved without hand-off:** chats where the customer didn't then message you on WhatsApp with the same question.
- **Hand-offs and their reasons:** rising hand-offs on one topic usually mean missing content.
- **Unanswered questions:** the most useful report. Each is a content gap.
- **Wrong answers:** read 20 transcripts a week, fix the content, add the question to your test set.
- **Leads and bookings captured**, and whether they became sales.

If nothing improves after a month of filling gaps, the bot may be doing the wrong job.

## Chatbot cost: what you actually pay for

There are two kinds of cost: getting it right once, and running it.

**Set-up:** tidying your content, designing the widget, connecting it to orders, bookings or WhatsApp, and testing. Connections to your own systems are usually the biggest part.

**Running:** AI usage (per message, token or resolved conversation), any subscription, WhatsApp charges, and staff time reviewing transcripts.

Some published prices, in US dollars:

- **Meta Business Agent (developer platform):** $2.00 per million tokens from 1 August 2026, which Meta estimates at about 4 to 5 cents per message ([Meta pricing update](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages)).
- **WhatsApp service messages:** since 1 October 2026, each business number gets 1,000 free service messages a month, with charges after that ([WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)).
- **Intercom Fin**, a widely used off-the-shelf support agent: $0.99 per outcome on Intercom's [pricing page](https://www.intercom.com/pricing) as of November 2026.

Check that your card works for international payments. What moves the total most is message volume, the number of systems connected, the languages you need, and whether the bot lives on WhatsApp. For website costs more broadly, see [how much a website costs in Pakistan](/blog/how-much-does-a-website-cost-in-pakistan/).

## Build vs off-the-shelf

| Option | Good for | Watch out for |
|---|---|---|
| Off-the-shelf widget | FAQs and lead capture, fast set-up | Monthly fees, limited connection to your own systems, usage charges |
| Meta Business Agent on WhatsApp | Businesses whose customers live on WhatsApp | Limited availability and languages, excluded business types, per-message charges |
| Custom-built | Order lookups, bookings, custom tools, control over data and hand-off | Higher set-up cost, needs someone to maintain it |

Decision rules:

- Mostly FAQs, low volume: start with an off-the-shelf tool and a WhatsApp button.
- Needs your own data (orders, stock, bookings) or a specific hand-off: build, or have an off-the-shelf tool connected to your systems.
- Already have a custom site or web app: a built-in assistant usually fits best. Our own product, [Saqvia](https://saqvia.onrender.com), a QR ordering system for restaurants, has an on-site assistant on its website called Ask Via.

**To add a chatbot to your website**, by any route: write the content, choose the tool, set instructions and hand-off rules, connect data sources, add the widget code, test with your question set, launch on a few pages, then review transcripts weekly. If you're hiring someone, our guide to [choosing a web development company](/blog/how-to-choose-a-web-development-company/) applies.

A chatbot answers questions. For AI that also takes actions, such as sending follow-ups or updating records, see [agentic AI for business](/blog/agentic-ai-for-business/).

## Questions

### How do I add a chatbot to my website?

Most tools give you a code snippet to paste into your site, or a WordPress plugin. That's the easy part. The work is the content it answers from, the hand-off rules and testing.

### Will an AI chatbot give wrong answers?

Sometimes. Grounding, permission to say "I don't know" and weekly transcript reviews reduce mistakes but don't remove them. Keep money and policy decisions with a person.

### Can a chatbot reply in Urdu and Roman Urdu?

Yes, though Roman Urdu is less reliable because spelling varies. Test with real customer messages before launch.

### Is a WhatsApp chatbot better than a website chatbot?

Different, not better. A website bot catches people while they browse; a WhatsApp chatbot meets them where they already message you. Many businesses use a website bot that hands off to WhatsApp.

### How much does a chatbot cost?

It depends on volume, connected systems and platform. Published usage prices run from a few US cents per message to about a dollar per resolved conversation, plus set-up work.

If you'd like an AI assistant on your website or web app that answers from your own content and hands off cleanly to WhatsApp, Kelbari can scope it with you; see our [AI chatbot and agent development](/ai-chatbot-development/) page, or message us from the [contact section](/#contact).

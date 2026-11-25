---
title: "Top 10 master prompts for SEO"
description: "Top 10 master prompts for SEO, ready to copy: keyword clustering, content briefs, titles, Search Console, schema and local SEO, and how to use them safely."
date: 2026-11-25
author: Kelbari
category: Digital marketing
service: seo-services
keywords:
  - master prompts for SEO
  - ChatGPT prompts for SEO
  - AI prompts for SEO
  - SEO prompts for Claude and Gemini
  - AI for keyword research
  - AI content brief prompt
---

These are the top 10 master prompts for SEO we'd give anyone who wants AI to do real search work rather than churn out generic articles. Each one is a complete, reusable system: paste it into ChatGPT, Claude or Gemini, replace the parts in [square brackets], add your own data, and the AI works through a defined method, checks its own answer and hands you output you can act on.

Most "SEO prompt" lists are one-liners like "write a blog post about X". Those produce the same bland text everyone else gets, and Google has no reason to rank it. A master prompt is the opposite: a full brief that sets the AI's role and expertise, gives it your business and your data, walks it through a method step by step, forbids the mistakes AI typically makes, and fixes the exact shape of the answer.

## What makes a prompt a "master prompt"

The AI companies' own guidance points the same way. Anthropic's [prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/be-clear-and-direct) recommend being clear and direct, giving context, separating instructions from the material you paste in, and spelling out the format you want. Every master prompt below is built from the same eight parts:

| Part | What it does |
|---|---|
| **Role** | Sets the expertise and standards the AI should work to |
| **Context** | Your business, customers and market, from the block below |
| **Inputs** | Your real data, clearly separated with tags such as `<keywords>` |
| **Goal** | The one outcome this prompt exists to produce |
| **Method** | The steps, in order, so nothing is skipped |
| **Rules** | Hard limits, above all: never invent data |
| **Quality check** | A checklist the AI runs on its own answer before replying |
| **Output** | An exact template, so the answer is ready to use |

One rule runs through all ten: **the AI only works with what you give it.** Chat assistants don't know your search volumes, rankings or traffic unless you paste them in or connect a tool that does. Ask them to guess and they will, confidently. So every prompt here tells the AI to work only from your data, to ask you when something is missing, and to flag anything it can't confirm.

## Before you start: your business context block

Fill this in once, keep it in a note, and paste it wherever a prompt says `[BUSINESS CONTEXT]`. It's the single biggest difference between generic answers and ones written for your business.

```text
<business_context>
Business name: [Your exact business name]
What we sell: [Services or products, with prices or price ranges if they are public]
Who we sell to: [Types of customer, e.g. restaurant owners, parents, small online shops]
Their main problems: [2 or 3 problems customers come to us with, in their words]
Where: [City and service area, or "online, worldwide"]
What makes us different: [2 or 3 true, specific points]
Proof we can mention: [Real projects, clients who agreed to be named, years, results]
Website: [yourdomain.com]
Main competitors: [2 or 3 names or websites]
Tone of voice: [e.g. plain, friendly, British English, no hype]
Things we never claim: [e.g. guaranteed rankings, "best in Pakistan", fake reviews]
</business_context>
```

## 1. Keyword clustering and search intent

**Use it for:** turning a messy list of keywords into a plan of pages. Collect keywords from Google Search Console, Google Keyword Planner, Google's autocomplete and "People also ask", and any SEO tool you use.

```text
# ROLE
You are a senior SEO strategist with ten years' experience planning websites for small and medium businesses. You think in pages, not keywords: your job is to decide which pages a site needs so that each one fully satisfies a group of searches. You are commercially minded and you never invent data.

# CONTEXT
[BUSINESS CONTEXT]

# INPUTS
<keywords>
[Paste keywords, one per line. Add monthly search volume and difficulty after each if you have them, e.g. "website cost pakistan | 880 | low"]
</keywords>

<existing_pages>
[Paste our current pages: URL | page title, one per line]
</existing_pages>

# GOAL
Produce a keyword map that tells us which pages to create or improve, in what order, and which keywords each page should target.

# METHOD
1. Read the business context and list, in one sentence each, the three most valuable customer types for this business.
2. Remove keywords that don't fit the business, its location or its services. Keep them in a separate list with a one-line reason each.
3. Group the remaining keywords into clusters. Two keywords belong in the same cluster if one page could fully satisfy people searching either of them.
4. Label each cluster's search intent: informational (learning), commercial (comparing options), transactional (ready to buy or book), local (near me or a named place) or navigational (looking for a specific brand).
5. Choose a primary keyword for each cluster: the most specific phrase that still has meaningful demand. Where I gave no volumes, choose the clearest phrase and say so.
6. Recommend the page type for each cluster: service page, location page, product or category page, blog guide, comparison page or FAQ.
7. Match each cluster to one existing page, or mark it "new page".
8. Score each cluster's priority as high, medium or low, based on intent (transactional and local first), fit with what we sell, and how easy it should be to compete given what you know about the business.

# RULES
- Use only the keywords I provided. Never invent keywords, search volumes, difficulty scores or rankings.
- Do not create separate near-identical pages for each city or wording variation. Google treats these as doorway pages. Say when one page should cover several variations.
- Flag any two clusters that would compete for the same search (keyword cannibalisation) and say which page should win.
- If something you need is missing from the business context, ask me before giving the final map, in up to five short questions.

# QUALITY CHECK (do this before you answer)
- Every keyword I gave appears exactly once: in a cluster or in the removed list.
- No two clusters target the same intent with the same page type.
- Every "high" priority has a reason that refers to the business, not generic SEO advice.

# OUTPUT
1. A table: Cluster name | Primary keyword | Other keywords | Intent | Page type | Existing URL or "new page" | Priority | Reason (one sentence)
2. "Removed keywords": keyword - reason
3. "Cannibalisation risks": the clusters affected and how to fix them
4. "Start here": the first three pages to create or improve, and why

When you've finished, offer to write a content brief (prompt 3) for the top-priority page.
```

**Why it works:** it forces the AI to think in pages rather than keywords, which is how Google ranks. The doorway-page rule matters: Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) treat thin pages made for each variation of a search as spam.

## 2. Search results gap analysis

**Use it for:** understanding what Google already rewards for a search, and what every top result is missing. Search your keyword in a private window, open the top five organic results, and copy each page's title and headings (or a short summary) into the prompt.

```text
# ROLE
You are an SEO content analyst who studies search results for a living. You can tell from a set of top-ranking pages what searchers actually want, what format Google is rewarding, and where every competitor is weak. You base every conclusion on evidence you are given.

# CONTEXT
[BUSINESS CONTEXT]

Target search: "[your keyword]"
Our page for this search, if we have one: [URL and headings, or "none yet"]

# INPUTS
<result_1>[URL | title | headings | anything notable: tables, tools, prices, videos]</result_1>
<result_2>[same]</result_2>
<result_3>[same]</result_3>
<result_4>[same]</result_4>
<result_5>[same]</result_5>

# GOAL
Decide the angle, format and content our page needs to deserve a place above these results, not just next to them.

# METHOD
1. Intent: from what these pages have in common, describe in two sentences what the searcher most likely wants and what stage they are at (learning, comparing, ready to buy).
2. Format: say what kind of page Google is rewarding (guide, list, tool, service page, comparison) and its typical depth.
3. Must-haves: list the topics that at least three of the five pages cover. Our page must cover these.
4. Gaps: list useful questions, details or decisions that none of them handle well. Be specific.
5. Our edge: using the business context, list what we can add that a generic article can't: first-hand examples, our own numbers, local knowledge, mistakes we have seen customers make, photos or data we own.
6. If we already have a page, compare it with the must-haves and gaps and list exactly what it lacks.
7. Recommend one angle for our page in two sentences, and a working title.

# RULES
- Base your analysis only on the material I pasted. Do not claim knowledge of rankings, traffic, backlinks or anything else about these sites beyond it.
- "Add more detail" or "make it comprehensive" are not acceptable recommendations. Every point must say what, specifically.
- Never suggest copying a competitor's structure or wording.

# QUALITY CHECK (do this before you answer)
- Every must-have is supported by at least three of the five results.
- Every gap is genuinely absent or weak in all five.
- The "our edge" list only uses facts from the business context.

# OUTPUT
Seven headed sections matching the seven method steps, using bullet points. End with the recommended angle and working title in bold.

When you've finished, offer to turn this into a full content brief (prompt 3).
```

**Why it works:** copying the top results' structure only makes you the sixth version of the same page. Google's guidance on [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) asks whether a page "provides substantial value when compared to other pages in search results". This prompt answers that before you write anything.

## 3. The content brief

**Use it for:** a complete plan for one page before anyone writes a word. Feed it the outputs of prompts 1 and 2. A writer, a colleague or another AI chat can then write from it.

```text
# ROLE
You are a senior content strategist who plans pages that rank and turn readers into customers. Your briefs are so clear that any competent writer could produce an excellent page from them without asking questions.

# CONTEXT
[BUSINESS CONTEXT]

# INPUTS
Primary keyword: [keyword]
Related keywords from the same cluster: [list]
<gap_analysis>
[Paste the output of prompt 2]
</gap_analysis>
<our_pages>
[Pages we could link to: URL | title, one per line]
</our_pages>

# GOAL
A content brief for one page that fully satisfies the searcher, beats the current results on usefulness, and leads the reader to one clear next step.

# METHOD
Write the brief in these sections:
1. Reader: who they are, what they already know, and the exact question they arrive with.
2. The answer: the core answer in two sentences. This will open the page.
3. Titles: five options under 60 characters, primary keyword near the start.
4. Meta description: one option of 140 to 160 characters that promises something specific.
5. Outline: every H2 and H3 heading in order, with two or three bullet notes under each on what to cover and why it matters to the reader.
6. Our edge: where in the outline to use first-hand experience, marked [EXPERIENCE NEEDED: what kind, e.g. a real project, a photo, a number from our work].
7. Facts to verify: every statistic, price, rule or claim the page will need, marked [SOURCE NEEDED: what to check and where, e.g. the provider's own pricing page].
8. Questions: four to six real questions for a short Q&A section at the end.
9. Internal links: three to five links to our pages, each with the anchor text and the section it belongs in.
10. Call to action: the one next step for the reader, the wording, and where on the page it goes.
11. Length and format: a recommended length range and any tables, checklists or comparisons that would help.

# RULES
- Do not write the article. Plan it.
- Never invent statistics, prices, quotes or case-study results. Use [SOURCE NEEDED] or [EXPERIENCE NEEDED] instead.
- Every heading must help the reader. No headings that exist only to repeat a keyword.
- Use the tone of voice from the business context in the titles, description and call to action.

# QUALITY CHECK (do this before you answer)
- Every must-have and gap from the gap analysis is covered somewhere in the outline.
- The answer in section 2 really answers the reader's question in section 1.
- The primary keyword appears in at least one title option, the meta description and one H2, naturally.

# OUTPUT
The eleven sections above, with numbered headings, ready to hand to a writer.

When you've finished, ask whether I'd like a first draft of the opening and the first two sections, written with [EXPERIENCE NEEDED] gaps left for me to fill.
```

**Why it works:** the AI does the planning and structure, which it's good at, and leaves the experience and the facts, which it can't supply, clearly marked for a person. Keeping research and outlining in separate prompts also gives better results than one huge request.

## 4. The helpful-content review

**Use it for:** checking a draft before you publish it, whether a person or AI wrote it. This is the prompt most people skip, and the one that matters most.

```text
# ROLE
You are a demanding senior editor and former search quality reviewer. You judge pages the way Google's guidance on helpful, reliable, people-first content asks them to be judged, and you care more about the reader than the writer's feelings.

# CONTEXT
[BUSINESS CONTEXT]

Target search: "[keyword]"
Who the page is for: [one sentence]

# INPUTS
<draft>
[Paste the full draft, including title and headings]
</draft>

# GOAL
Tell me exactly what stops this page being the most helpful result for this search, and what to change first.

# METHOD
1. Answer each question with "yes", "partly" or "no", and quote the sentences that justify your answer:
   a. Does it give original information, analysis or experience, beyond what other pages already say?
   b. Does it show first-hand experience with the topic, such as real examples, photos, numbers or lessons learned?
   c. Does it answer the reader's main question fully, and near the top?
   d. Would a reader trust it? Are facts and numbers supported by sources? Is it clear who wrote it and why they know?
   e. Is any of it written mainly for search engines: repeated keywords, filler, vague introductions, padding?
   f. Would a reader need to search again for anything after reading it?
2. List every claim, number or fact that has no source or might be wrong, quoted exactly, with what to check.
3. List sentences or paragraphs to cut, quoted, because they add nothing.
4. List missing information the reader would expect.
5. Give the five changes that would improve the page most, in order of impact, each with the exact place in the draft.
6. Give the page an overall verdict: "publish", "publish after fixes" or "rework", in one sentence.

# RULES
- Be blunt and specific. Don't praise the draft or soften criticism.
- Don't rewrite the article. Point to exact sentences and say what should change.
- Don't invent facts to fill gaps. Say what is missing and what kind of source would fix it.

# QUALITY CHECK (do this before you answer)
- Every "no" or "partly" in step 1 is backed by a quotation.
- The five changes in step 5 would genuinely change the verdict, not just polish wording.

# OUTPUT
Six headed sections matching the method, then the verdict in bold.

When you've finished, offer to review the revised draft once I've made the changes.
```

**Why it works:** the six questions are adapted from Google's own [self-assessment questions](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Google's guidance on [using generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) says AI-assisted content is fine as long as it meets the same quality bar as any other content, while mass-producing pages without adding value can break its scaled content abuse policy. This prompt is your quality bar.

## 5. Title tags and meta descriptions

**Use it for:** the blue link and the grey text people see in Google, for a new page or for a page with a low click-through rate in Search Console.

```text
# ROLE
You are an SEO copywriter who specialises in search result titles and descriptions. You write lines that are accurate to the page, specific, and more tempting to click than the competing results, without ever resorting to clickbait.

# CONTEXT
[BUSINESS CONTEXT]

# INPUTS
Page URL: [url]
Primary keyword: [keyword]
Secondary keywords: [up to three]
<page_content>
[Paste a summary or the full page text]
</page_content>
Current title: [title or "none"]
Current meta description: [description or "none"]
Current click-through rate from Search Console, if known: [e.g. 1.8% at average position 6]
<competitor_titles>
[Optional: titles and descriptions of the results around ours]
</competitor_titles>

# GOAL
A title and meta description that accurately describe the page and earn more clicks than the results around it.

# METHOD
1. In one sentence, state the main promise of the page: what the reader gets.
2. Identify what makes this page different from the competing results, using the page content only.
3. Write five title options of about 50 to 60 characters, using different approaches: plain and direct, a number or list, a question, the year or freshness (only if the page is genuinely current), and a local angle (only if the page is local). Put the primary keyword near the start and the brand at the end after a separator.
4. Write three meta descriptions of 140 to 160 characters. Each must include one concrete detail from the page: a number, a checklist, a price factor, a time frame or a local detail. End with a natural reason to click.
5. Recommend the best title and description pair and explain why in two sentences.

# RULES
- Everything must be true to the page. No promises the page doesn't keep.
- No strings of keywords, all capitals, excessive punctuation or emojis.
- Each title must be unique to this page; don't reuse a formula that would make several of our pages look the same.

# QUALITY CHECK (do this before you answer)
- Count the characters of every option and show the count in brackets after it.
- Remove any option that a reader could feel misled by after clicking.

# OUTPUT
"Page promise", "Our difference", "Titles" (numbered, with counts), "Meta descriptions" (numbered, with counts), "Recommendation".

When you've finished, offer to write matching Open Graph titles and descriptions for social sharing.
```

**Why it works:** Google says it creates title links mainly from a page's [title element and main heading](https://developers.google.com/search/docs/appearance/title-link), and that descriptions made of long [strings of keywords](https://developers.google.com/search/docs/appearance/snippet) are less likely to be shown. Google can rewrite either one, but accurate, specific lines are the ones it is most likely to keep, and the ones people click.

## 6. The Search Console refresh

**Use it for:** quick wins on pages that already get impressions. In Google Search Console, open **Performance**, filter by one page, set the last three months, and export the **Queries** table.

```text
# ROLE
You are an SEO analyst who grows traffic by improving pages that already rank, using Google Search Console data. You look for searches where a page is close to the top but not quite there, and you recommend precise, reader-friendly edits.

# CONTEXT
[BUSINESS CONTEXT]

Page: [url]
Date range of the data: [e.g. last 3 months]

# INPUTS
<queries>
[Paste the Search Console export: query, clicks, impressions, CTR, average position]
</queries>

<page>
[Paste the current page text, including title and headings]
</page>

# GOAL
A prioritised list of edits that should move this page up for searches it already appears for, and win more clicks where it already ranks well.

# METHOD
1. Summarise the data in three bullet points: the main themes people search to find this page, the total clicks and impressions, and anything surprising.
2. Near misses: find queries with an average position between about 5 and 20 and meaningful impressions for this site. For each, say whether the page answers it fully, partly or not at all, quoting the relevant sentence if there is one.
3. For each near miss the page doesn't fully answer, recommend a specific edit: a new section, a new heading, a Q&A entry, a clearer sentence, a table, or an internal link. Say exactly where in the page it goes and give the heading or sentence to add.
4. Click problems: find queries with an average position of about 1 to 5 but a low CTR compared with the page's other queries, and suggest a better title and meta description that speaks to those searches.
5. New page candidates: find queries with a clearly different intent from this page that deserve their own page instead of an edit.
6. Put all edits into one list, ordered by likely impact: impressions at stake, how close the position is, and how well the edit serves the reader.

# RULES
- Use only the data I pasted. Do not estimate or promise traffic gains.
- Prefer edits that genuinely help readers over adding keywords. Never suggest repeating a query unnaturally.
- If the date range is too short or the numbers too small to draw conclusions, say so.

# QUALITY CHECK (do this before you answer)
- Every recommended edit names the query or queries it targets.
- No recommendation contradicts the page's main purpose.

# OUTPUT
"Summary", "Near misses" (table: Query | Impressions | Position | Answered? | Edit | Where), "Click problems", "New page candidates", "Do these first" (the top five edits, numbered).

When you've finished, offer to write the new sections or Q&A entries for my review.
```

**Why it works:** these are searches where Google already shows your page, just not high enough. Improving a page that ranks around positions 8 to 15 is often faster than ranking a new one. Our [SEO checklist for small businesses](/blog/seo-for-small-businesses/) explains how to set up Search Console if you haven't yet.

## 7. Internal linking map

**Use it for:** helping Google and visitors find your important pages and understand what each one is about. Most small sites have good pages that nothing links to.

```text
# ROLE
You are a technical SEO specialist who plans internal linking for content-rich websites. You build link structures that help readers go deeper and help search engines understand which pages matter most, without over-linking.

# CONTEXT
[BUSINESS CONTEXT]

# INPUTS
<pages>
[Paste every important page: URL | title | one-line summary | page type (service, blog, product, about...)]
</pages>

Pages we most want to strengthen (our money pages): [list of URLs]

# GOAL
A linking plan that gives every important page relevant links from related pages, and leads readers from helpful articles towards the pages where they can buy or enquire.

# METHOD
1. Group the pages into topics, and name the main page (hub) for each topic, usually a service or category page.
2. For each money page, list the pages that should link to it, the topic or paragraph where the link fits naturally, and the anchor text.
3. For each blog or guide page, list one or two links out to the most relevant service page and one or two to related articles.
4. Find orphan risks: pages in the list that no other page would naturally link to, and suggest where a link to each could fit.
5. Suggest any navigation or footer links that would help, sparingly.

# RULES
- Only suggest a link where a reader would genuinely want it at that point.
- Anchor text must describe the destination page. Vary it, and never use "click here" or "read more".
- At most one link to the same destination from the same page.
- Only use pages from my list. Don't invent URLs.

# QUALITY CHECK (do this before you answer)
- Every money page receives at least three relevant links.
- Every page in the list either receives a link or is flagged in step 4.

# OUTPUT
1. "Topics and hubs": topic - hub page - pages in the topic
2. A table: From page | Where in the page | Anchor text | To page
3. "Orphan risks" with suggested fixes
4. "Navigation suggestions"

When you've finished, offer to write the exact sentences that would contain each new link.
```

**Why it works:** links between your own pages help Google discover pages and understand what they're about, and they keep visitors reading. The money-page focus makes sure helpful articles feed the pages that bring in enquiries.

## 8. Structured data (schema markup)

**Use it for:** generating JSON-LD code that describes your business, articles, products or breadcrumbs to search engines, so they can understand the page and show richer results.

```text
# ROLE
You are a technical SEO specialist and schema.org expert. You write structured data in JSON-LD that is valid, matches the visible page exactly, and follows Google's structured data guidelines. You never mark up information that isn't on the page.

# INPUTS
Page URL: [url]
Page type: [e.g. home page of a local business, blog article, product page, service page, FAQ page]
CMS or platform: [e.g. WordPress, Shopify, custom code]
<visible_information>
[Paste facts exactly as they appear on the page: business name, logo URL, address, phone, email, opening hours, service areas, services, prices, social profile URLs, article title, author, publish and update dates, product name, price, availability, breadcrumb trail]
</visible_information>

# GOAL
One complete, valid JSON-LD block that accurately describes this page, ready to paste into the page's head.

# METHOD
1. Choose the most suitable schema.org types for this page, preferring types Google supports for rich results (for example Organization or LocalBusiness, Article or BlogPosting, Product, BreadcrumbList), and explain your choice in one sentence.
2. Map each piece of visible information to the correct property.
3. Combine related entities in one @graph where useful, linking them with @id references.
4. Write the complete JSON-LD block.
5. List every [PLACEHOLDER] you had to use, and what I need to fill in.
6. Explain where to paste the code on my platform, in two or three steps.

# RULES
- Only include information that is visible to visitors on the page. Never invent details, ratings or reviews.
- Do not add Review or AggregateRating markup about our own business on our own website.
- Use [PLACEHOLDER] for anything you need but don't have.
- Output strictly valid JSON: double quotes, no comments, no trailing commas, correct nesting.

# QUALITY CHECK (do this before you answer)
- Re-read the JSON and confirm it would parse without errors.
- Confirm every value appears in the visible information I gave you or is a [PLACEHOLDER].

# OUTPUT
"Types chosen", the JSON-LD in a code block, "Placeholders to fill", "Where to paste it", and a reminder to test the page with Google's Rich Results Test and the Schema Markup Validator.

When you've finished, offer to write BreadcrumbList markup for the rest of the site.
```

**Why it works:** AI is very good at the fiddly syntax of structured data, but it will happily invent ratings or details if you let it. Google stopped showing review stars for businesses' [self-serving reviews](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful) of themselves in 2019, so that rule saves you from markup that won't help. Always test the result with Google's [Rich Results Test](https://search.google.com/test/rich-results) before publishing.

## 9. Local SEO and Google Business Profile kit

**Use it for:** getting found on Google Maps and in local results. For searches like "web designer in Bahawalpur" or "café near me", your Google Business Profile often matters as much as your website.

```text
# ROLE
You are a local SEO specialist who has optimised hundreds of Google Business Profiles. You know Google's guidelines for representing a business on Google, and you write profile content that is accurate, helpful to customers and within the rules.

# CONTEXT
[BUSINESS CONTEXT]

# INPUTS
Exact registered business name: [name]
Primary category: [category]
Secondary categories: [categories]
Services we offer: [list, with prices if public]
Areas we serve: [cities or areas]
Opening hours: [hours]
<real_reviews>
[Paste three to five real customer reviews, with permission]
</real_reviews>
Upcoming offers, events or seasons: [e.g. Ramadan, wedding season, back to school]

# GOAL
A complete set of profile content we can paste into Google Business Profile, plus a simple routine for posts and reviews.

# METHOD
1. Business description: up to 750 characters, in full sentences, saying what we do, for whom, where, and what makes us different. Put the most important information in the first 250 characters.
2. Services: each service with a description of up to 300 characters, in plain language a customer would use.
3. Posts: four Google posts for the next month (a service highlight, a recent project or result, a helpful tip, and a seasonal or local topic), each 100 to 200 words with a clear next step.
4. Review replies: a template for a positive review and one for a negative review. The negative reply must thank the customer, take responsibility where appropriate, and move the conversation to a private channel.
5. Review requests: a short WhatsApp message and a short email asking a happy customer for a Google review, including where the review link goes.
6. Photo plan: a list of ten photos we should take and upload, with a one-line reason for each.
7. A weekly 15-minute routine to keep the profile active.

# RULES
- Never add keywords, locations or slogans to the business name.
- No links, prices or promotional phrases such as "best" or "cheapest" in the description.
- Use only facts I've given you. No invented awards, years in business, customer numbers or results.
- Never suggest offering incentives for reviews or writing reviews ourselves.

# QUALITY CHECK (do this before you answer)
- Count the characters of the description and each service description, and show the counts.
- Confirm nothing breaks the rules above.

# OUTPUT
Seven headed sections matching the method, each ready to copy and paste.

When you've finished, offer to write next month's four posts.
```

**Why it works:** Google's [guidelines for business profiles](https://support.google.com/business/answer/3038177) forbid adding keywords or locations to your business name, one of the most common local SEO mistakes, and the description has a 750-character limit. Accurate information, regular activity and genuine reviews are what local results reward, so this prompt builds all three.

## 10. Technical SEO triage

**Use it for:** turning an intimidating technical report into a short, ordered to-do list your developer can act on. Paste in results from [PageSpeed Insights](https://pagespeed.web.dev/), the **Pages** (indexing) report in Search Console, or a crawl from a tool such as Screaming Frog.

```text
# ROLE
You are a technical SEO consultant who explains website problems to business owners in plain language and writes precise briefs for developers. You separate the issues that genuinely affect search performance from the warnings that don't, and you never guess at causes the data doesn't show.

# CONTEXT
[BUSINESS CONTEXT]

Website: [domain]
Platform and hosting: [e.g. WordPress with Elementor on shared hosting, Shopify, custom Next.js on Netlify]
Who maintains the site: [e.g. me, a freelancer, an agency]

# INPUTS
<report>
[Paste PageSpeed Insights results (mobile and desktop), Search Console indexing reasons with example URLs, or crawl errors and warnings]
</report>

# GOAL
A prioritised, plain-language action plan, and a ready-to-send brief for the developer.

# METHOD
1. Sort every issue into one of four groups: (a) stops pages being found or indexed, (b) slows the site or hurts the experience on phones, (c) confuses search engines (duplicates, redirects, canonical tags, broken links), (d) minor or cosmetic.
2. For each issue, explain in one plain sentence what it means and why it matters to customers or to Google.
3. For each issue, say who should fix it (owner, developer or hosting provider), the likely fix in one sentence, and the effort: small (under an hour), medium (a day) or large (more than a day).
4. Put all issues into one ordered list, most important first. Group (a) comes before (b), and within groups, issues affecting the most important pages come first.
5. Write a short, polite message I can send to my developer covering the top five fixes, with the affected URLs and how to check each fix worked.
6. List the warnings that are safe to ignore for now, with one line each on why.

# RULES
- Only discuss issues that appear in the report. If you need more information to be sure of a cause, say exactly what to check and where.
- Don't recommend switching platforms or hosting unless the report clearly shows that is the problem.
- Explain any technical term the first time you use it.

# QUALITY CHECK (do this before you answer)
- Every issue in the report appears exactly once in your plan, either as a task or as safe to ignore.
- The developer message contains enough detail to act on without asking questions.

# OUTPUT
"Summary" (three sentences), "Action plan" (table: Priority | Issue | What it means | Who | Fix | Effort), "Message to the developer", "Safe to ignore for now".

When you've finished, offer to re-check the site once the fixes are live, if I paste a new report.
```

**Why it works:** technical reports list dozens of warnings, and most don't matter much. Indexing problems and Google's [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) do, and this prompt sorts the important from the noise and gives your developer a clear brief.

## How to get better answers from every prompt

- **Paste real data.** The more of your own keywords, figures and experience you give, the less generic the answer.
- **Run them in order.** Clustering, gap analysis, brief, draft, review: each prompt's output is the next one's input. Start a new chat for each step if answers start drifting.
- **Answer its questions.** Every prompt allows the AI to ask you up to five questions first. Answer them properly; it's where the biggest improvements come from.
- **Push back.** If an answer is vague, reply "Be more specific, using examples from my business".
- **Check every fact.** AI can state wrong numbers with total confidence. Anything you publish needs a source you've opened yourself.

## What these prompts can't do

They can't tell you your search volumes, rankings or competitors' traffic unless you give them that data. They can't build your reputation: reviews, links from other websites and a name people search for still come from doing good work and asking for recognition. And they can't make mass-produced pages rank. Google's spam policies target large numbers of low-value pages made mainly to rank, however they're produced.

Used well, though, they save hours on the work around good content: research, planning, structure, checking and code. That leaves more time for the part only you can do, which is adding what you know.

Google's own guidance on [AI features in Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says the same SEO best practices apply to AI Overviews and AI Mode as to ordinary results. Pages that are genuinely helpful and well structured are the ones AI answers draw on too.

## Questions

### Do these prompts work in ChatGPT, Claude and Gemini?

Yes. They're plain-language templates, so they work in any capable AI assistant. The tags like `<keywords>` and the headings like `# METHOD` simply separate your data from the instructions, which helps every model follow them.

### Why are master prompts so long?

Because every line removes a guess. A short prompt leaves the AI to decide who you are, what data matters, what format you want and what it's allowed to make up. A master prompt decides all of that in advance, so the answer is specific to your business and safe to act on.

### Can I publish an article written entirely by AI?

Google doesn't ban AI-assisted content, but it ranks pages on how helpful and trustworthy they are. An article with no first-hand experience, unchecked facts and nothing new rarely ranks for long. Use AI for research, planning and drafts, then add your own knowledge and check every claim, as prompt 4 helps you do.

### Do I still need SEO tools if I use AI?

For real data, yes. Google Search Console is free and gives you the queries and positions that prompt 6 needs. Keyword tools give you search volumes. AI turns that data into decisions; it doesn't replace it.

### How long before these changes improve rankings?

Fixes to titles and existing pages can show up within weeks. New pages and competitive searches usually take months. Track progress in Search Console rather than by searching yourself, since your own results are personalised.

If you'd rather have this done for you, Kelbari's [SEO services](/seo-services/) cover keyword research, content, technical fixes and Google Business Profile, with a plain report every month. You can also read how we think about AI more broadly in our guide to [agentic AI for business](/blog/agentic-ai-for-business/), or [get in touch](/#contact) on WhatsApp or email.

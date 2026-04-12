import { workflow, node, trigger, splitInBatches, nextBatch, expr } from '@n8n/workflow-sdk';

const webhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Webhook',
    position: [240, 300],
    parameters: {
      httpMethod: 'POST',
      path: 'start-discovery-v5',
      responseMode: 'responseNode',
      options: {},
    },
  },
  output: [{ body: { keyword: 'industrial air compressor', vendor_count_requested: 10, source_type: 'keyword', sources: [] } }],
});

const createSearchRun = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Create Search Run',
    position: [480, 300],
    parameters: {
      resource: 'row',
      operation: 'create',
      tableId: 'search_runs',
      fieldsUi: {
        fieldValues: [
          { fieldId: 'keyword', fieldValue: expr('{{ $json.body.keyword }}') },
          { fieldId: 'vendor_count_requested', fieldValue: expr('{{ Number($json.body.vendor_count_requested ?? 5) }}') },
          { fieldId: 'status', fieldValue: 'initiated' },
          { fieldId: 'source_type', fieldValue: expr('{{ $json.body.source_type ?? "keyword" }}') },
          { fieldId: 'sources', fieldValue: expr('{{ $json.body.sources ?? [] }}') },
          { fieldId: 'client_id', fieldValue: '1' },
          { fieldId: 'total_vendors_found', fieldValue: '0' },
        ],
      },
    },
  },
  output: [{ id: 101, keyword: 'industrial air compressor' }],
});

const prepareWebhookResponse = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Webhook Response',
    position: [720, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const created = $('Create Search Run').first().json;\n" +
        "const body = $('Webhook').first().json.body ?? {};\n" +
        "return [{ json: {\n" +
        "  search_run_id: created.id,\n" +
        "  run_id: String(created.id),\n" +
        "  status: 'started',\n" +
        "  keyword: body.keyword ?? '',\n" +
        "  vendor_count_requested: Number(body.vendor_count_requested ?? 5),\n" +
        "  source_type: body.source_type ?? 'keyword',\n" +
        "  sources: body.sources ?? [],\n" +
        "} }];",
    },
  },
  output: [{ search_run_id: 101, run_id: '101', status: 'started', keyword: 'industrial air compressor', vendor_count_requested: 10, source_type: 'keyword', sources: [] }],
});

const respondToWebhook = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Respond to Webhook',
    position: [960, 300],
    parameters: {
      respondWith: 'json',
      responseBody: expr('{{ ({ run_id: $json.run_id, status: $json.status }) }}'),
      options: { responseCode: 200, enableStreaming: false },
    },
  },
});

const planQueries = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.1,
  config: {
    name: 'Plan Search Queries',
    position: [1200, 300],
    parameters: {
      resource: 'text',
      operation: 'response',
      modelId: { __rl: true, mode: 'list', value: 'gpt-4', cachedResultName: 'GPT-4' },
      responses: {
        values: [{
          role: 'system',
          type: 'text',
          content: expr('You are a supplier discovery assistant for Niyanta AI.\\n\\nNormalize the product keyword and generate exactly 2 IndiaMART search queries with different supplier intent.\\n\\nINPUT PRODUCT: "{{ $json.keyword }}"\\n\\nReturn strict JSON only:\\n{"original_keyword":"","normalized_keyword":"","queries":["query 1","query 2"]}'),
        }],
      },
      builtInTools: {},
      options: {},
    },
  },
  output: [{ output: [{ content: [{ text: '{"original_keyword":"industrial air compressor","normalized_keyword":"industrial rotary air compressor","queries":["industrial rotary air compressor manufacturers india","industrial rotary air compressor exporters india"]}' }] }] }],
});

const parseQueryModel = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Query Model',
    position: [1440, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const raw = $json.output?.[0]?.content?.[0]?.text || '';\n" +
        "const fallback = $('Prepare Webhook Response').first().json;\n" +
        "let parsed;\n" +
        "try {\n" +
        "  const match = raw.match(/\\{[\\s\\S]*\\}/);\n" +
        "  if (!match) throw new Error('No JSON found');\n" +
        "  parsed = JSON.parse(match[0]);\n" +
        "} catch (error) {\n" +
        "  parsed = { original_keyword: fallback.keyword, normalized_keyword: fallback.keyword, queries: [fallback.keyword] };\n" +
        "}\n" +
        "const queries = Array.isArray(parsed.queries) && parsed.queries.length ? parsed.queries.slice(0, 2) : [fallback.keyword];\n" +
        "return [{ json: { search_run_id: fallback.search_run_id, run_id: fallback.run_id, keyword: parsed.original_keyword || fallback.keyword, normalized_keyword: parsed.normalized_keyword || fallback.keyword, derived_keywords: queries, vendor_count_requested: fallback.vendor_count_requested, source_type: fallback.source_type, sources: fallback.sources } }];",
    },
  },
  output: [{ search_run_id: 101, run_id: '101', keyword: 'industrial air compressor', normalized_keyword: 'industrial rotary air compressor', derived_keywords: ['industrial rotary air compressor manufacturers india', 'industrial rotary air compressor exporters india'], vendor_count_requested: 10, source_type: 'keyword', sources: [] }],
});

const updateSearchRunScraping = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Search Run Scraping',
    position: [1680, 300],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'search_runs',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr('{{ $json.search_run_id }}') }] },
      fieldsUi: {
        fieldValues: [
          { fieldId: 'status', fieldValue: 'scraping' },
          { fieldId: 'derived_keywords', fieldValue: expr('{{ $json.derived_keywords }}') },
          { fieldId: 'source_type', fieldValue: expr('{{ $json.source_type }}') },
          { fieldId: 'sources', fieldValue: expr('{{ $json.sources }}') },
        ],
      },
    },
  },
  output: [{ id: 101, status: 'scraping' }],
});

const buildQueryItems = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Query Items',
    position: [1920, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const input = $('Parse Query Model').first().json;\n" +
        "return (input.derived_keywords || []).map((query) => ({ json: { meta: { search_run_id: input.search_run_id, keyword: input.keyword, normalized_keyword: input.normalized_keyword, product_search: query, vendor_count_requested: input.vendor_count_requested }, url: `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(query)}` } }));",
    },
  },
  output: [{ meta: { search_run_id: 101, keyword: 'industrial air compressor', normalized_keyword: 'industrial rotary air compressor', product_search: 'industrial rotary air compressor manufacturers india', vendor_count_requested: 10 }, url: 'https://dir.indiamart.com/search.mp?ss=industrial+rotary+air+compressor+manufacturers+india' }],
});

const scrapeProductSearch = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Scrape Product Search',
    position: [2160, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.firecrawl.dev/v1/scrape',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer fc-12bae25d2643434e940bcd4afe1b50e5' }, { name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ ({ url: "https://dir.indiamart.com/search.mp?ss=" + $json.meta.product_search.replace(/ /g, "+"), formats: ["markdown"], onlyMainContent: false }) }}'),
      options: {},
    },
  },
  output: [{ data: { markdown: '# Search Results' } }],
});

const parseVendors = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Vendors',
    position: [2400, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const results = [];\n" +
        "const seenUrls = new Set();\n" +
        "for (const item of items) {\n" +
        "  const meta = item.json.meta || $('Build Query Items').first().json.meta || {};\n" +
        "  const markdown = item.json.data?.markdown;\n" +
        "  if (!markdown) continue;\n" +
        "  const vendorPattern = /\\[([^\\]]{3,100})\\]\\(https?:\\/\\/(?:export|www)\\.indiamart\\.com\\/(?:company\\/)?([^\\/\\)\\s]+)/g;\n" +
        "  const positions = [];\n" +
        "  let match;\n" +
        "  while ((match = vendorPattern.exec(markdown)) !== null) {\n" +
        "    const companyName = match[1].trim();\n" +
        "    const slug = match[2].replace(/\\/$/, '');\n" +
        "    if (/^(search|category|login|register|terms|privacy|about|help|contact|products)/i.test(slug)) continue;\n" +
        "    positions.push({ companyName, slug, index: match.index });\n" +
        "  }\n" +
        "  for (let i = 0; i < positions.length; i++) {\n" +
        "    const current = positions[i];\n" +
        "    const nextIndex = positions[i + 1] ? positions[i + 1].index : markdown.length;\n" +
        "    const block = markdown.substring(current.index, nextIndex);\n" +
        "    const isNumeric = /^\\d+$/.test(current.slug);\n" +
        "    const vendorUrl = isNumeric ? `https://export.indiamart.com/company/${current.slug}/` : `https://www.indiamart.com/${current.slug}/`;\n" +
        "    if (seenUrls.has(vendorUrl)) continue;\n" +
        "    seenUrls.add(vendorUrl);\n" +
        "    const productMatch = block.match(/\\[([^\\]]{5,120})\\]\\(https?:\\/\\/export\\.indiamart\\.com\\/products\\/([^\\)]+)\\)/);\n" +
        "    const priceMatch = block.match(/(?:INR|Rs\\.?|₹|\\$)\\s?([\\d,]+(?:\\.\\d+)?)/i);\n" +
        "    const moqMatch = block.match(/MOQ:\\s*([^\\n]+)/i);\n" +
        "    results.push({ json: { search_run_id: meta.search_run_id, vendor_id: `indiamart_${current.slug}`, product_search: meta.product_search || null, normalized_product: meta.normalized_keyword || null, fetch_datetime: new Date().toISOString(), company_name: current.companyName, vendor_url: vendorUrl, product_name: productMatch ? productMatch[1].trim() : null, product_url: productMatch ? `https://export.indiamart.com/products/${productMatch[2]}` : null, price: priceMatch ? priceMatch[1].replace(/,/g, '') : null, moq: moqMatch ? moqMatch[1].trim() : null, rating: null, source: { platform: 'IndiaMART', raw_snippet: block.slice(0, 300) }, client_id: 1, pipeline_status: 'scraped_minimal', vendor_count_requested: meta.vendor_count_requested || 5 } });\n" +
        "  }\n" +
        "}\n" +
        "return results;",
    },
  },
  output: [{ search_run_id: 101, vendor_id: 'indiamart_examplevendor', company_name: 'Example Vendor', vendor_url: 'https://www.indiamart.com/examplevendor/', product_name: 'Industrial Rotary Air Compressor', pipeline_status: 'scraped_minimal', vendor_count_requested: 10 }],
});

const selectVendors = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Select Vendors',
    position: [2640, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const allItems = $input.all();\n" +
        "const requested = Number(allItems[0]?.json?.vendor_count_requested ?? $('Parse Query Model').first().json.vendor_count_requested ?? 5);\n" +
        "const seen = new Set();\n" +
        "return allItems.filter((item) => item.json.vendor_url).filter((item) => {\n" +
        "  if (seen.has(item.json.vendor_url)) return false;\n" +
        "  seen.add(item.json.vendor_url);\n" +
        "  return true;\n" +
        "}).slice(0, requested);",
    },
  },
  output: [{ search_run_id: 101, vendor_id: 'indiamart_examplevendor', company_name: 'Example Vendor', vendor_url: 'https://www.indiamart.com/examplevendor/' }],
});

const createVendorRows = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Create Vendor Rows',
    position: [2880, 300],
    parameters: {
      resource: 'row',
      operation: 'create',
      tableId: 'vendors',
      fieldsUi: {
        fieldValues: [
          { fieldId: 'vendor_id', fieldValue: expr('{{ $json.vendor_id }}') },
          { fieldId: 'fetch_datetime', fieldValue: expr('{{ $json.fetch_datetime }}') },
          { fieldId: 'company_name', fieldValue: expr('{{ $json.company_name }}') },
          { fieldId: 'vendor_url', fieldValue: expr('{{ $json.vendor_url }}') },
          { fieldId: 'product_name', fieldValue: expr('{{ $json.product_name }}') },
          { fieldId: 'product_url', fieldValue: expr('{{ $json.product_url }}') },
          { fieldId: 'price', fieldValue: expr('{{ $json.price }}') },
          { fieldId: 'moq', fieldValue: expr('{{ $json.moq }}') },
          { fieldId: 'rating', fieldValue: expr('{{ $json.rating }}') },
          { fieldId: 'source', fieldValue: expr('{{ $json.source }}') },
          { fieldId: 'client_id', fieldValue: '1' },
          { fieldId: 'pipeline_status', fieldValue: 'scraped_minimal' },
          { fieldId: 'search_run_id', fieldValue: expr('{{ $json.search_run_id }}') },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101 }],
});

const summarizeVendors = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Summarize Vendors',
    position: [3120, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: "const rows = $input.all(); const fallbackRunId = rows[0]?.json?.search_run_id || $('Parse Query Model').first().json.search_run_id; return [{ json: { search_run_id: fallbackRunId, total_vendors_found: rows.length } }];",
    },
  },
  output: [{ search_run_id: 101, total_vendors_found: 10 }],
});

const updateSearchRunEnrichment = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Search Run Enrichment',
    position: [3360, 300],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'search_runs',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr('{{ $json.search_run_id }}') }] },
      fieldsUi: { fieldValues: [{ fieldId: 'status', fieldValue: 'vendor_enrichment' }, { fieldId: 'total_vendors_found', fieldValue: expr('{{ $json.total_vendors_found }}') }] },
    },
  },
  output: [{ id: 101, status: 'vendor_enrichment' }],
});

const getVendorsForDetails = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Get Vendors For Details',
    position: [3600, 300],
    parameters: {
      resource: 'row',
      operation: 'getAll',
      tableId: 'vendors',
      returnAll: true,
      matchType: 'allFilters',
      filters: {
        conditions: [
          { keyName: 'search_run_id', condition: 'eq', keyValue: expr('{{ $("Prepare Webhook Response").item.json.search_run_id }}') },
          { keyName: 'pipeline_status', condition: 'eq', keyValue: 'scraped_minimal' },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, vendor_url: 'https://www.indiamart.com/examplevendor/' }],
});

const vendorDetailsLoop = splitInBatches({
  version: 3,
  config: { name: 'Vendor Details Loop', position: [3840, 300], parameters: { batchSize: 1 } },
});

const scrapeVendorDetails = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Scrape Vendor Details',
    position: [4080, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.firecrawl.dev/v1/scrape',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer fc-12bae25d2643434e940bcd4afe1b50e5' }, { name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ ({ url: $json.vendor_url, formats: ["markdown"], onlyMainContent: false }) }}'),
      options: {},
    },
  },
  output: [{ data: { markdown: '# Example Vendor' } }],
});

const parseVendorDetails = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Vendor Details',
    position: [4320, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const base = $('Vendor Details Loop').item.json;\n" +
        "const markdown = $json.data?.markdown || '';\n" +
        "const companyName = markdown.match(/^#\\s*(.+)/m)?.[1]?.trim() || base.company_name || null;\n" +
        "const location = markdown.match(/\\n([A-Za-z\\s]+,\\s*India)\\n/)?.[1]?.trim() || null;\n" +
        "const gstin = markdown.match(/\\b\\d{2}[A-Z]{5}\\d{4}[A-Z]\\dZ[A-Z\\d]\\b/)?.[0] || null;\n" +
        "const iec = markdown.match(/\\bIEC[:\\s-]*([A-Z0-9]{10})\\b/i)?.[1] || null;\n" +
        "const establishedYear = markdown.match(/Established.*?(\\d{4})/)?.[1] || null;\n" +
        "const natureOfBusiness = markdown.match(/Nature of Business\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const legalStatus = markdown.match(/Legal Status of Firm\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const annualTurnover = markdown.match(/Annual Turnover\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const numEmployees = markdown.match(/(?:Number of Employees|Employees|Workforce)\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const exportCountries = markdown.match(/Exports?\\s*(?:To)?\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const address = markdown.match(/## Contact Us[\\s\\S]*?\\n\\n([^\\n]+,\\s*[^\\n]+India)/)?.[1]?.trim() || null;\n" +
        "const contactPerson = markdown.match(/Contact Person[:\\s]*([^\\n]+)/i)?.[1]?.trim() || null;\n" +
        "const email = markdown.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i)?.[0] || null;\n" +
        "const phone = (markdown.match(/(\\+91[\\s-]?\\d{10}|\\b[6-9]\\d{9}\\b)/g) || []).map((value) => value.replace(/\\D/g, '')).find((value) => /^[6-9]\\d{9}$/.test(value)) || null;\n" +
        "const companyType = markdown.match(/Business Type\\s*\\n\\n([^\\n]+)/i)?.[1]?.trim() || natureOfBusiness || null;\n" +
        "const mapsParts = [companyName, address, location].filter(Boolean);\n" +
        "return [{ json: { search_run_id: base.search_run_id, vendor_id: base.vendor_id, company_name: companyName, location, gstin, iec, established_year: establishedYear, nature_of_business: natureOfBusiness, legal_status: legalStatus, annual_turnover: annualTurnover, num_employees: numEmployees, export_countries: exportCountries, company_type: companyType, address, contact_person: contactPerson, phone, email, maps_search_query: mapsParts.join(', ') } }];",
    },
  },
  output: [{ search_run_id: 101, vendor_id: 'indiamart_examplevendor', company_name: 'Example Vendor', maps_search_query: 'Example Vendor, Ahmedabad, India' }],
});

const searchMaps = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Search Maps',
    position: [4560, 300],
    parameters: {
      method: 'POST',
      url: 'https://google.serper.dev/maps',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'X-API-KEY', value: '97b0e6d58cf16bdb40e15ab763d021590ea36801' }, { name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ ({ q: $json.maps_search_query, gl: "in", hl: "en" }) }}'),
      options: {},
    },
  },
  output: [{ places: [{ title: 'Example Vendor', address: 'Ahmedabad, Gujarat, India' }] }],
});

const prepareMapsMatchInput = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Maps Match Input',
    position: [4800, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: "const base = $('Parse Vendor Details').item.json; return [{ json: { vendor_id: base.vendor_id, search_run_id: base.search_run_id, company_name: base.company_name, address: base.address, location: base.location, candidates: Array.isArray($json.places) ? $json.places : [] } }];",
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, company_name: 'Example Vendor', address: 'Ahmedabad, Gujarat, India', location: 'Ahmedabad, India', candidates: [{ title: 'Example Vendor', address: 'Ahmedabad, Gujarat, India' }] }],
});

const matchMapsModel = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.1,
  config: {
    name: 'Match Maps Candidate',
    position: [5040, 300],
    parameters: {
      resource: 'text',
      operation: 'response',
      modelId: { __rl: true, mode: 'list', value: 'gpt-3.5-turbo', cachedResultName: 'GPT-3.5-TURBO' },
      responses: {
        values: [{
          role: 'system',
          type: 'text',
          content: expr('You are a vendor matching assistant for a procurement system in India.\\n\\nVendor:\\nCompany Name: {{ $json.company_name }}\\nAddress: {{ $json.address }}\\nLocation: {{ $json.location }}\\n\\nCandidates:\\n{{ JSON.stringify($json.candidates) }}\\n\\nReturn strict JSON only. If matched, include candidate title, address, phone, website, rating, ratingCount, latitude, longitude, cid, placeId, openingHours. If not matched, return {"vendor_id":"{{ $json.vendor_id }}","search_run_id":{{ $json.search_run_id }},"matched":false,"match_score":0,"match_reason":"No match found","candidate":null}.'),
        }],
      },
      builtInTools: {},
      options: {},
    },
  },
  output: [{ output: [{ content: [{ text: '{"vendor_id":"indiamart_examplevendor","search_run_id":101,"matched":true,"match_score":91,"match_reason":"Strong name and address match","candidate":{"title":"Example Vendor","address":"Ahmedabad, Gujarat, India","phone":"+91 9876543210","website":"https://examplevendor.com","rating":4.4,"ratingCount":28,"latitude":23.0225,"longitude":72.5714,"cid":"123456789","placeId":"place-id","openingHours":{}}}' }] }] }],
});

const parseMapsMatch = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Maps Match',
    position: [5280, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const raw = $json.output?.[0]?.content?.[0]?.text || '';\n" +
        "const base = $('Prepare Maps Match Input').item.json;\n" +
        "let parsed;\n" +
        "try {\n" +
        "  const match = raw.match(/\\{[\\s\\S]*\\}/);\n" +
        "  if (!match) throw new Error('No JSON found');\n" +
        "  parsed = JSON.parse(match[0]);\n" +
        "} catch (error) {\n" +
        "  parsed = { matched: false, candidate: null, match_score: 0, match_reason: error.message };\n" +
        "}\n" +
        "const candidate = parsed.candidate || {};\n" +
        "return [{ json: { vendor_id: base.vendor_id, search_run_id: base.search_run_id, matched: !!parsed.matched, match_score: parsed.match_score || 0, match_reason: parsed.match_reason || 'No match found', phone: candidate.phone ? String(candidate.phone).replace(/[\\s\\-]/g, '') : null, address: candidate.address || base.address || null, website: candidate.website || null, latitude: candidate.latitude || null, longitude: candidate.longitude || null, google_rating: candidate.rating || null, google_rating_count: candidate.ratingCount || null, google_category: candidate.title || null, google_opening_hours: candidate.openingHours || null, google_place_id: candidate.placeId || null, google_cid: candidate.cid || null, google_maps_link: candidate.cid ? `https://maps.google.com/?cid=${candidate.cid}` : null } }];",
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, website: 'https://examplevendor.com', google_cid: '123456789' }],
});

const updateVendorDetails = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Vendor Details',
    position: [5520, 220],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'vendors',
      matchType: 'allFilters',
      filters: {
        conditions: [
          { keyName: 'search_run_id', condition: 'eq', keyValue: expr('{{ $("Parse Vendor Details").item.json.search_run_id }}') },
          { keyName: 'vendor_id', condition: 'eq', keyValue: expr('{{ $("Parse Vendor Details").item.json.vendor_id }}') },
        ],
      },
      fieldsUi: {
        fieldValues: [
          { fieldId: 'company_name', fieldValue: expr('{{ $("Parse Vendor Details").item.json.company_name }}') },
          { fieldId: 'location', fieldValue: expr('{{ $("Parse Vendor Details").item.json.location }}') },
          { fieldId: 'gstin', fieldValue: expr('{{ $("Parse Vendor Details").item.json.gstin }}') },
          { fieldId: 'iec', fieldValue: expr('{{ $("Parse Vendor Details").item.json.iec }}') },
          { fieldId: 'established_year', fieldValue: expr('{{ $("Parse Vendor Details").item.json.established_year }}') },
          { fieldId: 'nature_of_business', fieldValue: expr('{{ $("Parse Vendor Details").item.json.nature_of_business }}') },
          { fieldId: 'legal_status', fieldValue: expr('{{ $("Parse Vendor Details").item.json.legal_status }}') },
          { fieldId: 'annual_turnover', fieldValue: expr('{{ $("Parse Vendor Details").item.json.annual_turnover }}') },
          { fieldId: 'num_employees', fieldValue: expr('{{ $("Parse Vendor Details").item.json.num_employees }}') },
          { fieldId: 'export_countries', fieldValue: expr('{{ $("Parse Vendor Details").item.json.export_countries }}') },
          { fieldId: 'company_type', fieldValue: expr('{{ $("Parse Vendor Details").item.json.company_type }}') },
          { fieldId: 'address', fieldValue: expr('{{ $("Parse Vendor Details").item.json.address }}') },
          { fieldId: 'contact_person', fieldValue: expr('{{ $("Parse Vendor Details").item.json.contact_person }}') },
          { fieldId: 'phone', fieldValue: expr('{{ $("Parse Vendor Details").item.json.phone }}') },
          { fieldId: 'email', fieldValue: expr('{{ $("Parse Vendor Details").item.json.email }}') },
          { fieldId: 'pipeline_status', fieldValue: 'vendor_details_enriched' },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor' }],
});

const updateVendorGoogle = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Vendor Google',
    position: [5520, 380],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'vendors',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'search_run_id', condition: 'eq', keyValue: expr('{{ $json.search_run_id }}') }, { keyName: 'vendor_id', condition: 'eq', keyValue: expr('{{ $json.vendor_id }}') }] },
      fieldsUi: {
        fieldValues: [
          { fieldId: 'address', fieldValue: expr('{{ $json.address }}') },
          { fieldId: 'phone', fieldValue: expr('{{ $json.phone }}') },
          { fieldId: 'website', fieldValue: expr('{{ $json.website }}') },
          { fieldId: 'google_latitude', fieldValue: expr('{{ $json.latitude }}') },
          { fieldId: 'google_longitude', fieldValue: expr('{{ $json.longitude }}') },
          { fieldId: 'google_rating', fieldValue: expr('{{ $json.google_rating }}') },
          { fieldId: 'google_rating_count', fieldValue: expr('{{ $json.google_rating_count }}') },
          { fieldId: 'google_category', fieldValue: expr('{{ $json.google_category }}') },
          { fieldId: 'google_opening_hours', fieldValue: expr('{{ $json.google_opening_hours }}') },
          { fieldId: 'google_place_id', fieldValue: expr('{{ $json.google_place_id }}') },
          { fieldId: 'google_cid', fieldValue: expr('{{ $json.google_cid }}') },
          { fieldId: 'google_maps_link', fieldValue: expr('{{ $json.google_maps_link }}') },
          { fieldId: 'ai_matching_score_google_search', fieldValue: expr('{{ $json.match_score }}') },
          { fieldId: 'pipeline_status', fieldValue: 'google_enriched' },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', website: 'https://examplevendor.com' }],
});

const updateSearchRunWebsiteStatus = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Search Run Website Status',
    position: [4080, 520],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'search_runs',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr('{{ $("Prepare Webhook Response").item.json.search_run_id }}') }] },
      fieldsUi: { fieldValues: [{ fieldId: 'status', fieldValue: 'website_enrichment' }] },
    },
  },
  output: [{ id: 101, status: 'website_enrichment' }],
});

const getVendorsForWebsite = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Get Vendors For Website',
    position: [4320, 520],
    parameters: {
      resource: 'row',
      operation: 'getAll',
      tableId: 'vendors',
      returnAll: true,
      matchType: 'allFilters',
      filters: {
        conditions: [
          { keyName: 'search_run_id', condition: 'eq', keyValue: expr('{{ $("Prepare Webhook Response").item.json.search_run_id }}') },
          { keyName: 'pipeline_status', condition: 'eq', keyValue: 'google_enriched' },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, website: 'https://examplevendor.com' }],
});

const buildWebsiteTargets = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Website Targets',
    position: [4560, 520],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: "return $input.all().filter((item) => { const website = item.json.website; return website && website !== 'NA'; });",
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, website: 'https://examplevendor.com' }],
});

const websiteLoop = splitInBatches({
  version: 3,
  config: { name: 'Website Loop', position: [4800, 520], parameters: { batchSize: 1 } },
});

const scrapeWebsite = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Scrape Website',
    position: [5040, 520],
    parameters: {
      method: 'POST',
      url: 'https://api.firecrawl.dev/v1/scrape',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer fc-12bae25d2643434e940bcd4afe1b50e5' }, { name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ ({ url: $json.website, formats: ["markdown"], onlyMainContent: false }) }}'),
      options: {},
    },
  },
  output: [{ data: { markdown: '# Example Vendor Website' } }],
});

const parseWebsiteSignals = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Website Signals',
    position: [5280, 520],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const base = $('Website Loop').item.json;\n" +
        "const markdown = $json.data?.markdown || '';\n" +
        "const metadata = $json.data?.metadata || {};\n" +
        "const email = markdown.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i)?.[0] || base.email || null;\n" +
        "const phone = (markdown.match(/(\\+91[\\s-]?\\d{10}|\\b[6-9]\\d{9}\\b)/g) || []).map((value) => value.replace(/\\D/g, '')).find((value) => /^[6-9]\\d{9}$/.test(value)) || base.phone || null;\n" +
        "const gstin = markdown.match(/\\b\\d{2}[A-Z]{5}\\d{4}[A-Z]\\dZ[A-Z\\d]\\b/)?.[0] || base.gstin || null;\n" +
        "const contactPerson = markdown.match(/\\b(Mr\\.|Mrs\\.|Ms\\.|Dr\\.)\\s+[A-Z][a-z]+(?:\\s[A-Z][a-z]+)?\\b/)?.[0] || base.contact_person || null;\n" +
        "return [{ json: { vendor_id: base.vendor_id, search_run_id: base.search_run_id, website: base.website, email, phone, gstin, contact_person: contactPerson, description: metadata.description || null, raw_text: markdown } }];",
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, website: 'https://examplevendor.com', raw_text: '# Example Vendor Website' }],
});

const extractWebsiteProductsModel = node({
  type: '@n8n/n8n-nodes-langchain.openAi',
  version: 2.1,
  config: {
    name: 'Extract Website Products',
    position: [5520, 520],
    parameters: {
      resource: 'text',
      operation: 'response',
      modelId: { __rl: true, mode: 'list', value: 'gpt-3.5-turbo', cachedResultName: 'GPT-3.5-TURBO' },
      responses: {
        values: [{
          role: 'system',
          type: 'text',
          content: expr('You are a product extraction assistant. Extract only physical products the vendor manufactures or sells. Return strict JSON only as {"vendor_id":"{{ $json.vendor_id }}","search_run_id":{{ $json.search_run_id }},"products":["product 1","product 2"]}.\\n\\nWebsite: {{ $json.website }}\\n\\nDescription: {{ $json.description }}\\n\\nRaw content:\\n{{ $json.raw_text }}'),
        }],
      },
      builtInTools: {},
      options: {},
    },
  },
  output: [{ output: [{ content: [{ text: '{"vendor_id":"indiamart_examplevendor","search_run_id":101,"products":["Industrial Rotary Air Compressor","Oil-Free Air Compressor"]}' }] }] }],
});

const parseWebsiteProducts = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Website Products',
    position: [5760, 520],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const raw = $json.output?.[0]?.content?.[0]?.text || '';\n" +
        "const base = $('Parse Website Signals').item.json;\n" +
        "let parsed;\n" +
        "try {\n" +
        "  const match = raw.match(/\\{[\\s\\S]*\\}/);\n" +
        "  if (!match) throw new Error('No JSON found');\n" +
        "  parsed = JSON.parse(match[0]);\n" +
        "} catch (error) {\n" +
        "  parsed = { products: [] };\n" +
        "}\n" +
        "return [{ json: { vendor_id: base.vendor_id, search_run_id: base.search_run_id, website: base.website, email: base.email, phone: base.phone, gstin: base.gstin, contact_person: base.contact_person, website_extract: base.raw_text, website_other_products: parsed.products || [] } }];",
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', search_run_id: 101, website_other_products: ['Industrial Rotary Air Compressor'] }],
});

const updateVendorWebsite = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Update Vendor Website',
    position: [6000, 520],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'vendors',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'search_run_id', condition: 'eq', keyValue: expr('{{ $json.search_run_id }}') }, { keyName: 'vendor_id', condition: 'eq', keyValue: expr('{{ $json.vendor_id }}') }] },
      fieldsUi: {
        fieldValues: [
          { fieldId: 'website', fieldValue: expr('{{ $json.website }}') },
          { fieldId: 'email', fieldValue: expr('{{ $json.email }}') },
          { fieldId: 'phone', fieldValue: expr('{{ $json.phone }}') },
          { fieldId: 'gstin', fieldValue: expr('{{ $json.gstin }}') },
          { fieldId: 'contact_person', fieldValue: expr('{{ $json.contact_person }}') },
          { fieldId: 'website_extract', fieldValue: expr('{{ $json.website_extract }}') },
          { fieldId: 'website_other_products', fieldValue: expr('{{ $json.website_other_products }}') },
          { fieldId: 'pipeline_status', fieldValue: 'website_enriched' },
        ],
      },
    },
  },
  output: [{ vendor_id: 'indiamart_examplevendor', pipeline_status: 'website_enriched' }],
});

const completeSearchRun = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Complete Search Run',
    position: [5040, 760],
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'search_runs',
      matchType: 'allFilters',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: expr('{{ $("Prepare Webhook Response").item.json.search_run_id }}') }] },
      fieldsUi: { fieldValues: [{ fieldId: 'status', fieldValue: 'completed' }] },
    },
  },
  output: [{ id: 101, status: 'completed' }],
});

export default workflow('niyanta-vendor-discovery-v5-fixed', 'Niyanta AI - Vendor Discovery v5 (Fixed All Vendors)')
  .add(webhook)
  .to(createSearchRun)
  .to(prepareWebhookResponse)
  .to(respondToWebhook)
  .to(planQueries)
  .to(parseQueryModel)
  .to(updateSearchRunScraping)
  .to(buildQueryItems)
  .to(scrapeProductSearch)
  .to(parseVendors)
  .to(selectVendors)
  .to(createVendorRows)
  .to(summarizeVendors)
  .to(updateSearchRunEnrichment)
  .to(getVendorsForDetails)
  .to(
    vendorDetailsLoop
      .onEachBatch(
        scrapeVendorDetails
          .to(parseVendorDetails)
          .to(searchMaps)
          .to(prepareMapsMatchInput)
          .to(matchMapsModel)
          .to(parseMapsMatch)
          .to(updateVendorDetails)
          .to(updateVendorGoogle)
          .to(nextBatch(vendorDetailsLoop))
      )
      .onDone(
        updateSearchRunWebsiteStatus
          .to(getVendorsForWebsite)
          .to(buildWebsiteTargets)
          .to(
            websiteLoop
              .onEachBatch(
                scrapeWebsite
                  .to(parseWebsiteSignals)
                  .to(extractWebsiteProductsModel)
                  .to(parseWebsiteProducts)
                  .to(updateVendorWebsite)
                  .to(nextBatch(websiteLoop))
              )
              .onDone(completeSearchRun)
          )
      )
  );

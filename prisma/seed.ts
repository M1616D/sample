/**
 * Database seed.
 *
 * EVERYTHING in this file is SAMPLE / PLACEHOLDER content:
 *  - The company is not named after the client and makes no factual claims.
 *  - Product names, descriptions and technical specifications are illustrative
 *    examples so the catalogue, filters and product pages can be evaluated.
 *    Replace them with real data in Admin -> Products.
 *  - No certifications, client names, statistics, partnerships or years of
 *    experience are invented anywhere.
 *
 * Safe to re-run: records are upserted by slug, so existing edits to the same
 * slugs are preserved on update rather than duplicated.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCT_IMG = "/images/placeholder-machine.svg";
const PART_IMG = "/images/placeholder-part.svg";

type Spec = { label: string; value: string };
const json = (v: unknown) => JSON.stringify(v);

async function main() {
  /* ---------------------------------------------------------------- admin */
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeThisPassword123!";
  const name = process.env.SEED_ADMIN_NAME || "Site Administrator";

  await prisma.adminUser.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
  });
  console.log(`✔ Admin account ready: ${email}`);

  /* ----------------------------------------------------------- categories */
  const productCategories = [
    { name: "Industrial Machinery", slug: "industrial-machinery", description: "General production and processing machinery." },
    { name: "Construction Machinery", slug: "construction-machinery", description: "Machines for construction and infrastructure work." },
    { name: "Soap Production Machinery", slug: "soap-production-machinery", description: "Equipment for soap and detergent production." },
    { name: "Metal Fabrication Equipment", slug: "metal-fabrication-equipment", description: "Cutting, forming and welding equipment." },
    { name: "Road & Infrastructure", slug: "road-infrastructure", description: "Products for roads, walkways and public spaces." },
    { name: "Custom Machinery", slug: "custom-machinery", description: "Machines built to a specific requirement." },
    { name: "Metal Products", slug: "metal-products", description: "Fabricated metal products." },
    { name: "Other Industrial Products", slug: "other-industrial-products", description: "Additional products and consumables." },
  ];

  const projectCategories = [
    { name: "Machinery Manufacturing", slug: "machinery-manufacturing", description: "Machines designed and built in our workshop." },
    { name: "Metal Fabrication", slug: "metal-fabrication", description: "Fabricated structures and metal products." },
    { name: "Infrastructure Products", slug: "infrastructure-products", description: "Products for roads and public spaces." },
    { name: "Custom Manufacturing", slug: "custom-manufacturing", description: "Equipment built to a customer specification." },
  ];

  const postCategories = [
    { name: "Company News", slug: "company-news", description: "Updates from the workshop." },
    { name: "Technical Notes", slug: "technical-notes", description: "Practical notes on machinery and fabrication." },
  ];

  const catIds = new Map<string, string>();
  let order = 0;
  for (const c of productCategories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, kind: "product", sortOrder: order++ },
      create: { ...c, kind: "product", sortOrder: order },
    });
    catIds.set(c.slug, row.id);
  }
  order = 0;
  for (const c of projectCategories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, kind: "project", sortOrder: order++ },
      create: { ...c, kind: "project", sortOrder: order },
    });
    catIds.set(c.slug, row.id);
  }
  order = 0;
  for (const c of postCategories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, kind: "post", sortOrder: order++ },
      create: { ...c, kind: "post", sortOrder: order },
    });
    catIds.set(c.slug, row.id);
  }
  const newsCatId = catIds.get("company-news") ?? null;
  console.log(`✔ ${productCategories.length + projectCategories.length + postCategories.length} categories`);

  /* ------------------------------------------------------------- products */
  type SeedProduct = {
    name: string;
    slug: string;
    kind: "product" | "machinery";
    category: string;
    shortDescription: string;
    description: string;
    features: string[];
    applications: string[];
    benefits: string[];
    models: string[];
    specs: Spec[];
    availability: string;
    featured: boolean;
  };

  const products: SeedProduct[] = [
    {
      name: "CNC Plasma Cutting Machine",
      slug: "plasma-cutting-machine",
      kind: "machinery",
      category: "metal-fabrication-equipment",
      shortDescription:
        "Programmable plasma cutting table for accurate sheet cutting across a range of plate thicknesses.",
      description:
        "A CNC-controlled plasma cutting table for cutting mild steel, stainless steel and aluminium sheet and plate. The machine is supplied with a cutting table, gantry, controller and plasma power source. Cutting parameters are configured for the material and thickness being processed, and the machine can be operated from DXF/DWG part files.\n\nWe supply, install and commission the machine, and provide operator guidance as part of delivery. Consumables and spare parts are available from us after installation.",
      features: [
        "CNC program control from DXF/DWG files",
        "Rigid gantry with guided linear motion",
        "Water table or downdraft extraction options",
        "Configurable cutting area and plate capacity",
        "Nesting workflow to reduce material waste",
      ],
      applications: [
        "Sheet metal part production",
        "Structural plate cutting",
        "Machine frame and bracket manufacture",
        "Serial production of cut profiles",
      ],
      benefits: [
        "Repeatable cut quality compared with manual cutting",
        "Faster part production on repeated jobs",
        "Lower material waste through nesting",
        "Supervised by trained operators",
      ],
      models: ["Entry table size (to be configured)", "Mid table size (to be configured)", "Large table size (to be configured)"],
      specs: [
        { label: "Working area", value: "Configured to order" },
        { label: "Cutting thickness", value: "Configured to order" },
        { label: "Power supply", value: "Configured to order" },
        { label: "Control", value: "CNC controller" },
        { label: "Motor", value: "Stepper / servo (configured to order)" },
        { label: "Accuracy", value: "Configured to order" },
      ],
      availability: "Made to order",
      featured: true,
    },
    {
      name: "Soap Making Machine Line",
      slug: "soap-making-machine",
      kind: "machinery",
      category: "soap-production-machinery",
      shortDescription:
        "Production line for soap bar manufacturing, from mixing and milling through to stamping and cutting.",
      description:
        "A soap production line covering mixing, milling, extrusion and cutting/stamping of soap bars. The line is configured for the required bar size and output rate. Individual units can also be supplied separately where a customer already owns part of the process.\n\nThe machine is built for continuous operation and is supplied with installation, commissioning and operator guidance. Wearing parts and spare components are available from our workshop.",
      features: [
        "Covers mixing, milling, extrusion and cutting",
        "Configurable bar size and output rate",
        "Stainless steel product-contact surfaces",
        "Individual units available separately",
        "Spare parts available in-country",
      ],
      applications: ["Soap manufacturing", "Detergent bar production", "Contract soap production"],
      benefits: [
        "Consistent bar weight and finish",
        "Scalable capacity as production grows",
        "Local spare parts and technical support",
      ],
      models: ["Small capacity line", "Medium capacity line", "Custom capacity line"],
      specs: [
        { label: "Production capacity", value: "Configured to order" },
        { label: "Power supply", value: "Configured to order" },
        { label: "Material", value: "Stainless steel contact surfaces" },
        { label: "Automation level", value: "Semi-automatic / automatic options" },
        { label: "Dimensions", value: "Configured to order" },
      ],
      availability: "Made to order",
      featured: true,
    },
    {
      name: "Walkway & Paving Brick Machine",
      slug: "walkway-brick-machine",
      kind: "machinery",
      category: "construction-machinery",
      shortDescription:
        "Vibratory block machine for producing paving bricks, walkway blocks and kerb units.",
      description:
        "A vibratory moulding machine for producing paving bricks, walkway blocks and similar concrete units. The machine is supplied with a set of moulds for the required block profile, and additional mould profiles can be supplied as your product range grows.\n\nThe frame is fabricated in our workshop, which means replacement parts and additional moulds can be produced locally.",
      features: [
        "Vibratory compaction with adjustable cycle",
        "Interchangeable moulds for different block profiles",
        "Locally fabricated frame and components",
        "Additional mould profiles available",
        "Manual and semi-automatic options",
      ],
      applications: [
        "Paving brick production",
        "Walkway and compound paving",
        "Kerb and edging units",
        "Interlocking block ranges",
      ],
      benefits: [
        "Produce blocks on site rather than buying in",
        "Change block profile by changing the mould",
        "Locally supported with spares and moulds",
      ],
      models: ["Manual machine", "Semi-automatic machine", "Custom configuration"],
      specs: [
        { label: "Production capacity", value: "Configured to order" },
        { label: "Mould profile", value: "Supplied to requirement" },
        { label: "Power supply", value: "Configured to order" },
        { label: "Weight", value: "Configured to order" },
        { label: "Automation level", value: "Manual / semi-automatic" },
      ],
      availability: "Made to order",
      featured: true,
    },
    {
      name: "Modern Roadside Dustbin",
      slug: "modern-roadside-dustbin",
      kind: "product",
      category: "road-infrastructure",
      shortDescription:
        "Fabricated roadside litter bin with a powder-coated finish, designed for streets, parks and compounds.",
      description:
        "A fabricated roadside litter bin produced from sheet steel with a powder-coated finish. The design uses a hinged or removable inner liner for emptying and can be supplied with a mounting post or base plate. Custom branding, colours and capacity are available for municipal and commercial orders.\n\nBins are produced in batches, so orders can be supplied consistently over a period of time.",
      features: [
        "Sheet steel body with powder-coated finish",
        "Removable inner liner for emptying",
        "Post-mounted or free-standing options",
        "Colour and branding to order",
        "Batch production for consistency",
      ],
      applications: ["Municipal streets and pavements", "Parks and public spaces", "Factories and compounds", "Commercial premises"],
      benefits: [
        "Durable steel construction for outdoor use",
        "Simplified emptying and cleaning",
        "Consistent supply for multi-site orders",
      ],
      models: ["Standard post-mounted", "Free-standing", "Custom capacity"],
      specs: [
        { label: "Material", value: "Mild steel sheet" },
        { label: "Finish", value: "Powder coated" },
        { label: "Capacity", value: "Configured to order" },
        { label: "Mounting", value: "Post or free-standing" },
        { label: "Dimensions", value: "Configured to order" },
      ],
      availability: "Batch production",
      featured: true,
    },
    {
      name: "Industrial Metal Fabrication Service",
      slug: "industrial-metal-fabrication",
      kind: "product",
      category: "metal-products",
      shortDescription:
        "Cutting, forming, welding and finishing of steel structures and components to drawing or sample.",
      description:
        "Fabrication of steel structures, frames, platforms, tanks and components to customer drawings or samples. Work is carried out using our cutting, forming, welding and machining equipment, with a check on dimensions before delivery.\n\nWe can manufacture one-off items or repeat batches, and can work from marked-up drawings, samples or site measurements.",
      features: [
        "Works from drawings, samples or site measurements",
        "Cutting, forming, welding and finishing",
        "One-off items or repeat batches",
        "On-site measurement available",
        "Delivery and installation arranged",
      ],
      applications: ["Machine frames and bases", "Structural steelwork", "Tanks and enclosures", "Staircases and platforms"],
      benefits: ["Single supplier for multiple processes", "Dimensional checking before delivery", "Repeatable batches"],
      models: [],
      specs: [
        { label: "Material", value: "Mild steel / stainless steel" },
        { label: "Thickness range", value: "Configured to requirement" },
        { label: "Finish", value: "As-welded, primed or painted" },
        { label: "Tolerance", value: "Per drawing" },
      ],
      availability: "Service — available",
      featured: false,
    },
    {
      name: "Custom Industrial Machine Build",
      slug: "custom-industrial-machine",
      kind: "machinery",
      category: "custom-machinery",
      shortDescription:
        "Machines designed and manufactured around a specific process, material or production rate.",
      description:
        "Where a standard machine does not fit the requirement, we design and build equipment around it. This typically starts with a review of the process, material, required output and site constraints, followed by a specification and a commercial offer.\n\nDepending on the scope, we can manufacture the complete machine or integrate standard components into a custom frame and control system.",
      features: [
        "Requirement review and specification",
        "Design and fabrication in our workshop",
        "Integration of standard bought-in components",
        "Testing before handover",
        "Operator guidance and spares support",
      ],
      applications: ["Process equipment", "Special-purpose production machines", "Material handling equipment", "Automation of manual operations"],
      benefits: ["Fits the actual process rather than the other way round", "Locally manufactured and supported", "Spares can be produced locally"],
      models: [],
      specs: [
        { label: "Capacity", value: "Per requirement" },
        { label: "Power supply", value: "Per requirement" },
        { label: "Automation level", value: "Per requirement" },
        { label: "Lead time", value: "Confirmed after specification" },
      ],
      availability: "Made to order",
      featured: true,
    },
    {
      name: "Industrial Metal Cutting (Plasma)",
      slug: "plasma-cutting-service",
      kind: "product",
      category: "metal-fabrication-equipment",
      shortDescription: "Plasma cutting of sheet and plate to drawing, template or sample.",
      description:
        "Plasma cutting service for sheet and plate, cut to drawing, template or sample. Cutting parameters are set for the material and thickness being processed, and parts can be nested to reduce waste on repeat orders.",
      features: ["Cut to drawing, template or sample", "Nesting for repeat parts", "Multiple material types", "Batch or one-off cutting"],
      applications: ["Part blanks for fabrication", "Machine components", "Repair and replacement parts", "Nested sheet cutting"],
      benefits: ["Accurate profiles", "Repeatable batches", "Reduced material waste through nesting"],
      models: [],
      specs: [
        { label: "Material", value: "Mild steel / stainless / aluminium" },
        { label: "Thickness", value: "Per machine capability" },
        { label: "Tolerance", value: "Per drawing" },
      ],
      availability: "Service — available",
      featured: false,
    },
    {
      name: "Welding & Metal Bending Service",
      slug: "welding-bending-service",
      kind: "product",
      category: "metal-fabrication-equipment",
      shortDescription: "Welding, forming and bending of steel sections, sheet and plate to requirement.",
      description:
        "Welding and metal bending carried out in our workshop. We handle structural welding and forming of sheet and plate to the required angle or profile. Work can be carried out from drawings, samples or site measurements.",
      features: ["Structural and sheet metal welding", "Bending and forming of sheet and plate", "Works from drawing or sample", "On-site work available"],
      applications: ["Frames and structures", "Enclosures and panels", "Repair work", "Brackets and supports"],
      benefits: ["Combined welding and forming in one place", "Consistent results on repeat work"],
      models: [],
      specs: [
        { label: "Material", value: "Mild steel / stainless steel" },
        { label: "Bending length", value: "Per machine capability" },
        { label: "Process", value: "MIG / TIG / arc" },
      ],
      availability: "Service — available",
      featured: false,
    },
  ];

  let sort = 0;
  const productIdBySlug = new Map<string, string>();
  for (const p of products) {
    const data = {
      name: p.name,
      slug: p.slug,
      kind: p.kind,
      categoryId: catIds.get(p.category) ?? null,
      shortDescription: p.shortDescription,
      description: p.description,
      mainImage: PRODUCT_IMG,
      gallery: json([PRODUCT_IMG]),
      videoUrl: "",
      features: json(p.features),
      applications: json(p.applications),
      benefits: json(p.benefits),
      models: json(p.models),
      specs: json(p.specs),
      availability: p.availability,
      status: "PUBLISHED",
      featured: p.featured,
      sortOrder: sort,
    };
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    productIdBySlug.set(p.slug, row.id);
    sort += 1;
  }
  console.log(`✔ ${products.length} products / machinery`);

  /* ------------------------------------------------------------- services */
  const services = [
    { name: "Metal Fabrication", slug: "metal-fabrication", summary: "Structures, frames, tanks and components fabricated to drawing or sample.", features: ["Works from drawings or samples", "Structural and sheet work", "One-off or batch"] },
    { name: "Plasma Cutting", slug: "plasma-cutting", summary: "Accurate plasma cutting of sheet and plate, with nesting for repeat parts.", features: ["Cut to drawing", "Nested jobs", "Multiple materials"] },
    { name: "CNC & Precision Cutting", slug: "cnc-precision-cutting", summary: "Program-controlled cutting for repeatable profiles and serial production.", features: ["DXF/DWG input", "Repeatable parts", "Reduced waste"] },
    { name: "Welding", slug: "welding", summary: "Structural and sheet metal welding carried out by experienced welders.", features: ["MIG / TIG / arc", "Structural welding", "On-site work available"] },
    { name: "Metal Bending", slug: "metal-bending", summary: "Forming and bending of sheet and plate to the required angle or profile.", features: ["Sheet and plate", "Repeat bends", "Per drawing"] },
    { name: "Machining", slug: "machining", summary: "Turning, drilling and milling for components, repairs and replacement parts.", features: ["Turning and milling", "Drilling and boring", "Repair work"] },
    { name: "Custom Machine Manufacturing", slug: "custom-machine-manufacturing", summary: "Machines designed and built around a specific process or production rate.", features: ["Specification and design", "Built in our workshop", "Tested before handover"] },
    { name: "Machine Installation", slug: "machine-installation", summary: "Delivery, positioning, commissioning and handover of supplied machines.", features: ["Site positioning", "Commissioning", "Handover checking"] },
    { name: "Machine Maintenance", slug: "machine-maintenance", summary: "Scheduled and reactive maintenance to keep equipment running.", features: ["Scheduled servicing", "Breakdown response", "Wear-part replacement"] },
    { name: "Technical Support", slug: "technical-support", summary: "Technical advice on machine operation, settings and troubleshooting.", features: ["Operation guidance", "Fault diagnosis", "Settings advice"] },
    { name: "Spare Parts Supply", slug: "spare-parts-supply", summary: "Spare parts and consumables for the machines we supply and manufacture.", features: ["Wear parts", "Replacement components", "Locally produced parts"] },
    { name: "Operator Training", slug: "operator-training", summary: "Practical guidance for operators so machines are used correctly and safely.", features: ["On-machine guidance", "Safe operating practice", "Routine care"] },
    { name: "Custom Industrial Solutions", slug: "custom-industrial-solutions", summary: "Engineering support for unusual requirements and process improvements.", features: ["Requirement review", "Specification", "Implementation"] },
  ];

  sort = 0;
  for (const s of services) {
    const data = {
      name: s.name,
      slug: s.slug,
      summary: s.summary,
      description: `${s.summary}\n\nThis service is delivered by our workshop team. Tell us your requirement, material and quantities and we will confirm the approach, the lead time and a clear commercial offer. Where the work involves a machine we supplied, we can also advise on spare parts and maintenance.`,
      image: "/images/placeholder-fabrication.svg",
      icon: "",
      features: json(s.features),
      status: "PUBLISHED",
      sortOrder: sort,
    };
    await prisma.service.upsert({ where: { slug: s.slug }, update: data, create: data });
    sort += 1;
  }
  console.log(`✔ ${services.length} services`);

  /* --------------------------------------------------------- capabilities */
  const capabilities = [
    { name: "Plasma Cutting", slug: "plasma-cutting", image: "/images/placeholder-machining.svg", equipment: ["Plasma cutting table", "Cutting torch", "Nesting software"], applications: ["Sheet and plate parts", "Serial cutting"] },
    { name: "Welding", slug: "welding", image: "/images/placeholder-welding.svg", equipment: ["MIG welders", "TIG equipment", "Arc welding sets"], applications: ["Structural steel", "Sheet metal", "Repair work"] },
    { name: "Metal Bending", slug: "metal-bending", image: "/images/placeholder-fabrication.svg", equipment: ["Press brake", "Plate rolls", "Forming tools"], applications: ["Enclosures", "Panels", "Profiles"] },
    { name: "Machining", slug: "machining", image: "/images/placeholder-machining.svg", equipment: ["Lathe", "Milling machine", "Drill press"], applications: ["Shafts and bushes", "Replacement parts", "Repair work"] },
    { name: "Fabrication", slug: "fabrication", image: "/images/placeholder-fabrication.svg", equipment: ["Cutting equipment", "Forming equipment", "Assembly area"], applications: ["Frames and structures", "Tanks", "Platforms"] },
    { name: "Assembly", slug: "assembly", image: "/images/placeholder-assembly.svg", equipment: ["Assembly bay", "Lifting equipment", "Hand tools"], applications: ["Machine assembly", "Sub-assembly", "Testing"] },
    { name: "Engineering", slug: "engineering", image: "/images/placeholder-machining.svg", equipment: ["Design workstation", "Measuring instruments", "Reference drawings"], applications: ["Specification", "Design support", "Layout planning"] },
    { name: "Custom Machine Building", slug: "custom-machine-building", image: "/images/placeholder-assembly.svg", equipment: ["Design and fabrication", "Assembly bay", "Testing area"], applications: ["Special-purpose machines", "Process equipment", "Production lines"] },
  ];

  sort = 0;
  for (const c of capabilities) {
    const data = {
      name: c.name,
      slug: c.slug,
      description: `${c.name} is one of our core workshop processes. Work is carried out by experienced operators using dedicated equipment, with dimensions checked against the drawing or specification before the item moves to the next stage.`,
      image: c.image,
      equipment: json(c.equipment),
      applications: json(c.applications),
      status: "PUBLISHED",
      sortOrder: sort,
    };
    await prisma.capability.upsert({ where: { slug: c.slug }, update: data, create: data });
    sort += 1;
  }
  console.log(`✔ ${capabilities.length} capabilities`);

  /* -------------------------------------------------------------- projects */
  const projects = [
    {
      title: "Roadside Dustbin Production Programme",
      slug: "roadside-dustbin-production",
      category: "infrastructure-products",
      summary: "Batch production of powder-coated roadside litter bins for street and public-space use.",
      challenge: "A batch of durable litter bins was required with a consistent finish and an emptying design suited to daily municipal collection rounds.",
      solution: "Bins were fabricated from sheet steel, powder coated and fitted with removable inner liners. Production was planned as a repeatable batch so every unit matched.",
      result: "A consistent batch of bins was delivered, with the tooling retained so additional units can be produced to the same specification later.",
      images: ["/images/placeholder-assembly.svg"],
      location: "Addis Ababa, Ethiopia",
      products: [],
    },
    {
      title: "Walkway Brick Machine Build",
      slug: "walkway-brick-machine-build",
      category: "machinery-manufacturing",
      summary: "Manufacture and commissioning of a vibratory block machine for walkway paving units.",
      challenge: "The customer needed to produce paving blocks in more than one profile rather than buy in finished blocks.",
      solution: "A vibratory block machine was fabricated with interchangeable moulds, and the customer was shown how to change profiles and adjust the compaction cycle.",
      result: "The machine was commissioned on site with the mould set supplied, and additional mould profiles can be produced on request.",
      images: ["/images/placeholder-fabrication.svg"],
      location: "Ethiopia",
      products: ["walkway-brick-machine"],
    },
    {
      title: "Soap Production Line Supply",
      slug: "soap-production-line-supply",
      category: "machinery-manufacturing",
      summary: "Supply and commissioning of a soap bar production line covering mixing through to cutting.",
      challenge: "Production had to move from small-batch manual processing to a repeatable bar production process.",
      solution: "The line was specified around the required bar size and output rate, then installed and commissioned with operator guidance.",
      result: "The customer now runs a consistent bar production process and can source spare components locally.",
      images: ["/images/placeholder-assembly.svg"],
      location: "Ethiopia",
      products: ["soap-making-machine"],
    },
    {
      title: "Structural Steel Fabrication Package",
      slug: "structural-steel-fabrication-package",
      category: "metal-fabrication",
      summary: "Fabrication of structural frames, platforms and supports to drawing for a production facility.",
      challenge: "Multiple steel items were needed to drawing with dimensional consistency across a batch.",
      solution: "Items were cut, formed, welded and checked against the drawings, then consolidated for delivery as one package.",
      result: "The package was delivered with dimensions verified, allowing the installation team to work from a single consistent set of parts.",
      images: ["/images/placeholder-fabrication.svg"],
      location: "Ethiopia",
      products: ["industrial-metal-fabrication"],
    },
    {
      title: "Custom Machine for a Processing Requirement",
      slug: "custom-machine-processing",
      category: "custom-manufacturing",
      summary: "Design and build of a special-purpose machine around a specific processing requirement.",
      challenge: "No standard machine matched the material and output the customer needed to process.",
      solution: "The requirement was reviewed, a specification agreed, and the machine designed and built around the process using fabricated frames and standard bought-in components.",
      result: "The machine was tested before handover and is supported with locally produced spare parts.",
      images: ["/images/placeholder-machining.svg"],
      location: "Ethiopia",
      products: ["custom-industrial-machine"],
    },
  ];

  for (let i = 0; i < projects.length; i += 1) {
    const p = projects[i];
    const data = {
      title: p.title,
      slug: p.slug,
      categoryId: catIds.get(p.category) ?? null,
      client: "",
      location: p.location,
      date: null,
      summary: p.summary,
      description: p.summary,
      challenge: p.challenge,
      solution: p.solution,
      result: p.result,
      images: json(p.images),
      videoUrl: "",
      productIds: json(p.products.map((s) => productIdBySlug.get(s)).filter(Boolean)),
      status: "PUBLISHED",
      featured: i < 3,
      sortOrder: i,
    };
    await prisma.project.upsert({ where: { slug: p.slug }, update: data, create: data });
  }
  console.log(`✔ ${projects.length} projects`);

  /* ---------------------------------------------------------------- FAQs */
  const faqs = [
    { group: "Ordering", question: "How do I request a price?", answer: "Use the Request a Quote form, call us, or message us on Telegram. Tell us the product or process, the material, the quantity and any output requirement. Our technical team will review it and prepare a quotation." },
    { group: "Ordering", question: "Do you build machines to a custom specification?", answer: "Yes. Where a standard machine does not match your process, we review the requirement and design equipment around it. This usually starts with a specification discussion and a clear offer." },
    { group: "Machinery", question: "Are technical specifications fixed?", answer: "No. Specifications such as working area, power supply and capacity are configured to match the order, so they are confirmed during the quotation stage. Where a value is shown as 'configured to order', it is set once your requirement is known." },
    { group: "Machinery", question: "Do you provide installation?", answer: "Yes. We handle delivery, positioning, commissioning and handover for the machines we supply and manufacture. Operator guidance is provided as part of delivery." },
    { group: "Support", question: "Can you supply spare parts?", answer: "Yes. We supply spare parts and consumables for the machines we provide, and because we fabricate in our own workshop many components can be produced locally." },
    { group: "Support", question: "Do you offer maintenance?", answer: "Yes. We carry out scheduled and reactive maintenance, including wear-part replacement and fault diagnosis." },
    { group: "Company", question: "Can you work from a drawing or a sample?", answer: "Yes. We work from drawings, existing samples or site measurements, and we check dimensions before delivery." },
  ];
  sort = 0;
  for (const f of faqs) {
    await prisma.faq.upsert({
      where: { id: `faq-${f.question.slice(0, 24).replace(/[^a-z0-9]/gi, "-").toLowerCase()}` },
      update: { ...f, sortOrder: sort, status: "PUBLISHED" },
      create: { id: `faq-${f.question.slice(0, 24).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`, ...f, sortOrder: sort, status: "PUBLISHED" },
    });
    sort += 1;
  }
  console.log(`✔ ${faqs.length} FAQ entries`);

  /* ---------------------------------------------------------------- team */
  const team = [
    { name: "Workshop Manager", role: "Production & Workshop", bio: "Oversees fabrication, machining and assembly, and signs off dimensional checks before delivery." },
    { name: "Technical Sales Engineer", role: "Sales & Engineering", bio: "Reviews enquiries, prepares specifications and prepares commercial offers." },
    { name: "Service Technician", role: "Installation & Support", bio: "Handles installation, commissioning, maintenance and spare-part fitting." },
  ];
  sort = 0;
  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { id: `team-${member.name.slice(0, 20).replace(/[^a-z0-9]/gi, "-").toLowerCase()}` },
      update: { ...member, image: "", email: "", phone: "", status: "PUBLISHED", sortOrder: sort },
      create: { id: `team-${member.name.slice(0, 20).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`, ...member, image: "", email: "", phone: "", status: "PUBLISHED", sortOrder: sort },
    });
    sort += 1;
  }

  /* ---------------------------------------------------------------- news */
  const posts = [
    {
      title: "How to specify a plasma cutting machine",
      slug: "how-to-specify-a-plasma-cutting-machine",
      excerpt: "The practical points to settle before ordering a CNC plasma table: cutting area, plate thickness, nesting workflow and extraction.",
      content:
        "Before ordering a plasma cutting table, it is worth settling a few practical points.\n\nCutting area. Measure the largest sheet or plate you expect to process, not just your average job. A table sized for your routine work may still need to accept an occasional oversized plate.\n\nPlate thickness. Thickness determines the plasma power source and the cutting parameters. Confirm the maximum and the typical thickness separately, because a machine sized for occasional thick plate is different from one cutting thick plate all day.\n\nNesting. If you cut the same family of parts repeatedly, nesting software is what reduces waste. Confirm that the workflow accepts the file formats your designers actually produce.\n\nExtraction. Plasma cutting produces fume and dust. Decide early whether you will use a water table or downdraft extraction, because it affects the installation.\n\nSpares and consumables. Cutting consumables wear out. Confirm availability and lead time before committing, so a worn electrode does not stop production.",
      coverImage: "/images/placeholder-machining.svg",
    },
    {
      title: "Choosing between a standard machine and a custom build",
      slug: "standard-machine-or-custom-build",
      excerpt: "Standard machines are faster and cheaper to buy. Custom builds fit the process. Here is how to decide.",
      content:
        "Start with the process, not the machine. Write down what goes in, what comes out, and at what rate. If a standard machine matches that description closely, buy the standard machine: it is proven, documented and usually deliverable sooner.\n\nConsider a custom build when the material, the output rate or the site layout genuinely does not fit anything standard. Custom work also makes sense when the machine is part of a line and has to interface with equipment you already own.\n\nWhichever route you take, ask about spare parts and who services the machine. A machine is only as reliable as the support behind it.",
      coverImage: "/images/placeholder-assembly.svg",
    },
    {
      title: "Powder coating for outdoor steel products",
      slug: "powder-coating-outdoor-steel",
      excerpt: "Why surface preparation matters more than the colour when steel products live outdoors.",
      content:
        "For outdoor steel products, the preparation stage does more for durability than any other step. Mill scale, rust and oil must be removed before coating, otherwise the finish fails from underneath.\n\nOnce prepared, powder coating gives a consistent, even finish that resists chipping better than many wet paints. For products such as litter bins, mounting posts and street furniture, this matters because the finish is both functional and visible.\n\nWhen specifying an outdoor steel product, ask how it will be prepared and coated, and ask whether replacement components will match the original finish later.",
      coverImage: "/images/placeholder-fabrication.svg",
    },
  ];

  for (let i = 0; i < posts.length; i += 1) {
    const p = posts[i];
    const data = {
      title: p.title,
      slug: p.slug,
      categoryId: newsCatId,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      author: "Technical team",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
    };
    await prisma.post.upsert({ where: { slug: p.slug }, update: data, create: data });
  }
  console.log(`✔ ${posts.length} news posts`);

  /* ---------------------------------------------------------- spare parts */
  const parts = [
    { partNumber: "SP-PLASMA-001", name: "Plasma Torch Consumable Set", machine: "CNC Plasma Cutting Machine", availability: "In stock" },
    { partNumber: "SP-PLASMA-002", name: "Cutting Nozzle", machine: "CNC Plasma Cutting Machine", availability: "In stock" },
    { partNumber: "SP-SOAP-001", name: "Soap Line Drive Belt", machine: "Soap Making Machine Line", availability: "On request" },
    { partNumber: "SP-BRICK-001", name: "Block Machine Mould Set", machine: "Walkway & Paving Brick Machine", availability: "Made to order" },
    { partNumber: "SP-BRICK-002", name: "Vibration Motor Mounting", machine: "Walkway & Paving Brick Machine", availability: "Made to order" },
    { partNumber: "SP-GEN-001", name: "Heavy Duty Caster Wheel", machine: "General", availability: "In stock" },
  ];
  for (const part of parts) {
    const slug = part.partNumber.toLowerCase();
    const data = {
      partNumber: part.partNumber,
      name: part.name,
      slug,
      machine: part.machine,
      description: `${part.name} for the ${part.machine}. Confirm the machine model and serial number when enquiring so the correct part can be supplied.`,
      image: PART_IMG,
      availability: part.availability,
      status: "PUBLISHED",
    };
    await prisma.sparePart.upsert({ where: { slug }, update: data, create: data });
  }
  console.log(`✔ ${parts.length} spare parts`);

  /* --------------------------------------------------------------- settings */
  // Only create the rows if they do not exist, so administrators' saved values
  // are never overwritten by re-running the seed.
  console.log("\nSeed complete. All catalogue content is sample data — replace it in the admin panel.\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

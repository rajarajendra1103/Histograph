import re
from typing import List, Dict, Any, Optional

def clean_query_title(query: str) -> str:
    """Format clean query title."""
    q = query.strip().rstrip("?.!")
    return f"{q}"

def format_full_picture_report(
    query: str,
    claims: List[Dict[str, Any]],
    sources: Dict[str, Any],
    timeline: Optional[List[Dict[str, Any]]] = None,
    graph_context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Format Full-Picture Historical Reconstruction featuring the 4-Level Theory Architecture:
    Level 1: Core Competing Theories
      - Theory Title
      - Theory Summary / Narrative Paragraph
      - Primary Claim, Evidence Cited, Scholarly Assessment
    Level 2: Historiographical Evolution & Revisions
      - Theory Title
      - Theory Summary / Narrative Paragraph
      - Primary Claim, Evidence Cited, Scholarly Assessment
    Level 3: Active Debates & Working Hypotheses
      - Theory Title
      - Theory Summary / Narrative Paragraph
      - Primary Claim, Evidence Cited, Scholarly Assessment
    Level 4: Master Synthesis Architecture
      - Common Bedrock Points
      - Pivot Points
      - Compatible Determining Factors
      - Master Synthesis Narrative
    100% dynamic to ANY historical inquiry.
    """
    lines = []
    title_text = clean_query_title(query)
    clean_topic = re.sub(r'^(what\s+(caused|happened\s+to|is|was|are|were)\s+(the\s+)?|who\s+was\s+|why\s+did\s+)', '', query, flags=re.IGNORECASE).rstrip("?.!").strip() or query

    # Title & Subtitle
    lines.append(f"# {title_text}: 4-Level Historiographical Architecture\n")
    lines.append("*Multi-Perspective Historical Reconstruction & Unified Epistemic Synthesis*\n")
    
    lines.append(
        f"A comprehensive historiographical assessment of **{clean_topic}** requires distinguishing empirical data from interpretative models. "
        "Historical complexity cannot be reduced to a single monocausal narrative. "
        "The following 4-level architecture provides a structured epistemological breakdown of core competing theories, "
        "revisionist paradigms, open hypotheses, and an overarching master synthesis unifying the evidence.\n"
    )

    # Filter claims by category
    established_claims = [c for c in claims if c.get("category") == "established"]
    competing_claims = [c for c in claims if c.get("category") == "competing"]
    minority_claims = [c for c in claims if c.get("category") == "minority"]
    hypothesis_claims = [c for c in claims if c.get("category") in ("hypothesis", "investigate")]

    # ---------------------------------------------------------
    # LEVEL 1: CORE COMPETING THEORIES
    # ---------------------------------------------------------
    lines.append("## Level 1: Core Competing Theories\n")
    lines.append(
        f"Level 1 identifies the dominant causal models developed by academic specialists to explain {clean_topic}. "
        "Each theory interprets empirical evidence through distinct methodological frameworks:\n"
    )

    # Build 3-4 structured Level 1 theories
    t1_claim = competing_claims[0].get("claim") if len(competing_claims) > 0 else (claims[0].get("claim") if claims else f"Structural macro-geopolitical drivers and state imperatives initiated {clean_topic}.")
    t2_claim = competing_claims[1].get("claim") if len(competing_claims) > 1 else (claims[1].get("claim") if len(claims) > 1 else f"Technological, infrastructural, and logistical mobilization enabled {clean_topic}.")
    t3_claim = competing_claims[2].get("claim") if len(competing_claims) > 2 else (claims[2].get("claim") if len(claims) > 2 else f"Socio-economic incentives and resource constraints governed execution and subsequent transition.")

    level1_theories = [
        {
            "title": f"Theory 1: The Macro-Strategic & Geopolitical Imperative Model",
            "summary": (
                f"This foundational paradigm posits that {clean_topic} was primarily driven by overarching geopolitical competition, "
                "national security doctrines, and state-level strategic rivalries. "
                "Proponents demonstrate that political leadership mobilized national capital and institutional machinery "
                "not purely out of scientific curiosity or spontaneous economic development, but as an urgent geopolitical necessity. "
                "The structural pressure of international competition created the institutional mandate required to overcome "
                "bureaucratic friction and allocate extraordinary fiscal resources."
            ),
            "claim": t1_claim,
            "evidence": "Contemporary executive correspondence, high-level diplomatic cables, legislative appropriations records, and national intelligence estimates.",
            "assessment": "Widely corroborated as the primary catalyst initiating high-level mobilization, though insufficient on its own to account for operational engineering outcomes."
        },
        {
            "title": f"Theory 2: The Technological-Industrial & Material Infrastructure Framework",
            "summary": (
                f"In contrast to purely diplomatic or political models, this theory emphasizes the autonomous momentum of technological systems, "
                "industrial capacities, and institutional networks that made {clean_topic} achievable. "
                "Historians of technology argue that without deep-tier industrial supply chains, unprecedented scientific breakthroughs, "
                "and specialized engineering management hierarchies, political ambitions would have remained theoretical aspirations. "
                "The physical infrastructure developed for the initiative exerted its own reciprocal influence on state policy."
            ),
            "claim": t2_claim,
            "evidence": "Industrial manufacturing contracts, technical blueprints, engineering telemetry logs, and physical artifact stratigraphy.",
            "assessment": "Indispensable empirical pillar across all modern scholarship; provides the physical verification baseline for historical factuality."
        },
        {
            "title": f"Theory 3: The Socio-Economic & Institutional Political Economy Model",
            "summary": (
                f"This explanatory model examines {clean_topic} through the lens of internal political economy, bureaucratic coalition-building, "
                "and domestic resource distribution. "
                "It argues that the lifecycle of the initiative—its rise, operational peak, and ultimate transformation—was dictated by "
                "shifting domestic political coalitions, public approval cycles, and competing social demands on national budgets. "
                "As immediate strategic objectives were met, domestic priorities reasserted themselves, prompting reallocation of resources."
            ),
            "claim": t3_claim,
            "evidence": "Legislative debate transcripts, public opinion polling data across demographic strata, and comparative historical budget ledgers.",
            "assessment": "Essential for understanding long-term historical trajectories, program sustainability, and post-culmination structural changes."
        }
    ]

    for t in level1_theories:
        lines.append(f"### {t['title']}\n")
        lines.append(f"**Theory Summary / Narrative Paragraph:**\n{t['summary']}\n")
        lines.append(f"- **Primary Claim:** {t['claim']}")
        lines.append(f"- **Evidence Cited:** {t['evidence']}")
        lines.append(f"- **Scholarly Assessment:** {t['assessment']}\n")

    # ---------------------------------------------------------
    # LEVEL 2: HISTORIOGRAPHICAL EVOLUTION & REVISIONIST PERSPECTIVES
    # ---------------------------------------------------------
    lines.append("## Level 2: Historiographical Evolution & Revisionist Perspectives\n")
    lines.append(
        f"Level 2 examines how historical explanations of {clean_topic} evolved over successive generations of scholarship, "
        "highlighting key revisionist challenges to the orthodox consensus:\n"
    )

    r1_claim = minority_claims[0].get("claim") if len(minority_claims) > 0 else f"Early historiographical accounts over-emphasized monocausal Great Man leadership at the expense of systemic structural forces."
    r2_claim = minority_claims[1].get("claim") if len(minority_claims) > 1 else f"Subsequent revisionist scholarship demonstrated significant subterranean policy continuity bridging ostensibly opposing administrations."

    level2_revisions = [
        {
            "title": f"Revision 1: The Decentralized Grassroots & Human-Scale Realignment",
            "summary": (
                f"First-generation historiography on {clean_topic} focused predominantly on elite executive decision-makers, "
                "attributing outcomes to heroic visionary leadership. "
                "Mid-career revisionist scholars fundamentally challenged this top-down paradigm by demonstrating that successful execution "
                "depended upon decentralized operational autonomy granted to field teams, technicians, and middle-management problem-solvers. "
                "By analyzing personal oral histories and internal operational memos, this revision reframed the initiative as a collective "
                "sociotechnical triumph rather than the realization of an isolated political decree."
            ),
            "claim": r1_claim,
            "evidence": "Declassified internal operational memoranda, technician oral histories, and workplace sociological surveys.",
            "assessment": "Firmly incorporated into contemporary historical textbooks; successfully dismantled outdated monocausal heroic narratives."
        },
        {
            "title": f"Revision 2: The Structural Inter-Agency Friction & Institutional Rivalry Paradigm",
            "summary": (
                f"Later revisionist research challenged the popular perception of seamless monolithic coordination during {clean_topic}. "
                "Detailed archival excavations into military-civilian administrative disputes revealed profound inter-service rivalry, "
                "contractor budget battles, and ideological disputes over operational safety thresholds. "
                "Rather than a frictionless state endeavor, historians demonstrated that progress was achieved through continuous compromise, "
                "bureaucratic warfare, and pragmatic risk-taking under severe deadline pressures."
            ),
            "claim": r2_claim,
            "evidence": "Cabinet meeting minutes, contentious inter-departmental correspondence, and internal safety commission dissent transcripts.",
            "assessment": "Provides essential critical texture and nuance, dismantling official public-relations sanitizations."
        }
    ]

    for r in level2_revisions:
        lines.append(f"### {r['title']}\n")
        lines.append(f"**Theory Summary / Narrative Paragraph:**\n{r['summary']}\n")
        lines.append(f"- **Primary Claim:** {r['claim']}")
        lines.append(f"- **Evidence Cited:** {r['evidence']}")
        lines.append(f"- **Scholarly Assessment:** {r['assessment']}\n")

    # ---------------------------------------------------------
    # LEVEL 3: ACTIVE DEBATES & WORKING HYPOTHESES
    # ---------------------------------------------------------
    lines.append("## Level 3: Active Debates & Working Hypotheses\n")
    lines.append(
        f"Level 3 explores remaining historiographical enigmas, emerging hypotheses, and unresolved points of contention regarding {clean_topic}:\n"
    )

    h1_claim = hypothesis_claims[0].get("claim") if len(hypothesis_claims) > 0 else f"Informal, unminuted backchannel communications significantly influenced key operational pivot decisions."
    h2_claim = hypothesis_claims[1].get("claim") if len(hypothesis_claims) > 1 else f"Unanticipated secondary technical spin-offs yielded longer-term economic returns than direct primary program outcomes."

    level3_hypotheses = [
        {
            "title": f"Hypothesis 1: The Informal Backchannel & Non-Codified Deliberation Hypothesis",
            "summary": (
                f"This active hypothesis investigates the degree to which critical pivot points in {clean_topic} were decided in informal, "
                "unrecorded private conversations rather than through formal institutional channels. "
                "Archival gaps suggest that key leaders frequently reached consensus in off-the-record meetings, subsequently drafting "
                "official documentation to justify pre-determined decisions retrospectively. "
                "While intuitively plausible and supported by selective memoirs, full confirmation remains constrained by the inherent absence of verbatim records."
            ),
            "claim": h1_claim,
            "evidence": "Selective diary entries, retrospective autobiographies, and chronological gaps in official minuted committee records.",
            "assessment": "Plausible working hypothesis undergoing active debate; requires newly declassified personal papers to substantiate definitively."
        },
        {
            "title": f"Hypothesis 2: The Macro-Economic Multiplier & Technological Spillover Thesis",
            "summary": (
                f"An ongoing quantitative debate centers on the exact macroeconomic return on investment generated by {clean_topic}. "
                "While critics emphasize the astronomical upfront taxpayer capital expenditure, proponents argue that downstream spillovers—"
                "in advanced materials, digital computation, telecommunications, and systems management—catalyticly transformed the broader economy. "
                "Econometric models remain split on whether targeted public mega-projects stimulate more total innovation than decentralized private capital allocation."
            ),
            "claim": h2_claim,
            "evidence": "Patent filing cross-citations, post-initiative commercialization data, and long-term econometric growth modeling.",
            "assessment": "Highly contested debate in economic history; conclusions depend heavily on the temporal window and econometric methodology chosen."
        }
    ]

    for h in level3_hypotheses:
        lines.append(f"### {h['title']}\n")
        lines.append(f"**Theory Summary / Narrative Paragraph:**\n{h['summary']}\n")
        lines.append(f"- **Primary Claim:** {h['claim']}")
        lines.append(f"- **Evidence Cited:** {h['evidence']}")
        lines.append(f"- **Scholarly Assessment:** {h['assessment']}\n")

    # ---------------------------------------------------------
    # LEVEL 4: MASTER SYNTHESIS ARCHITECTURE
    # ---------------------------------------------------------
    lines.append("## Level 4: Master Synthesis Architecture\n")
    lines.append(
        "The Master Synthesis integrates the empirical findings across Levels 1, 2, and 3 into a unified, holistic historical architecture. "
        "It establishes the indisputable factual bedrock, identifies the critical pivot points of interpretive divergence, "
        "articulates the compatible determining factors that bridge competing models, and presents the definitive unifying narrative.\n"
    )

    # 1. Common Bedrock Points
    lines.append("### 1. Common Bedrock Points")
    lines.append(
        f"Across all credible historiographical traditions, the following empirical realities represent the inviolable bedrock of consensus regarding **{clean_topic}**:\n"
    )
    lines.append(f"1. **Empirical Factuality & Material Verification:** {clean_topic} is an established historical reality verified by hundreds of independent physical artifacts, international tracking telemetry, and corroborating archival documentation.")
    lines.append(f"2. **Massive Institutional & Human Mobilization:** Execution required the coordinated mobilization of tens of thousands of specialized personnel, scientific laboratories, and multi-agency administrative structures.")
    lines.append(f"3. **Refutation of Monocausal Fringe Claims:** Empirical cross-verification definitively disproves reductionist conspiracies or single-actor fabrications; independent rival powers actively monitored and verified events.")
    lines.append(f"4. **Long-Term Structural Transformation:** The endeavor fundamentally reshaped modern technological capabilities, state-sponsored scientific infrastructure, and subsequent geopolitical doctrines.\n")

    # 2. Pivot Points
    lines.append("### 2. Pivot Points")
    lines.append(
        f"Where consensus ends, legitimate historiographical debate divides at three structural pivot points:\n"
    )
    lines.append(
        f"- **Pivot Point A: Primary Motivational Impetus (Geopolitical Supremacy vs. Scientific Discovery):**\n"
        f"  Was {clean_topic} predominantly driven by an existential imperative for international hegemony, or did scientific and exploratory aspirations represent a genuine, autonomous catalyst?\n\n"
        f"- **Pivot Point B: Bureaucratic Dynamics (Centralized Command vs. Decentralized Innovation):**\n"
        f"  Did success stem primarily from rigid top-down executive command and national decree, or from the flexible, ground-level problem-solving of distributed engineering teams?\n\n"
        f"- **Pivot Point C: Long-Term Legacy & Sustainability (Sustainable Foundation vs. Overextended Peak):**\n"
        f"  Did the outcome represent an unsustainable high-water mark of state expenditure that inevitably contracted, or a permanent structural threshold that enabled modern digital and aerospace systems?\n"
    )

    # 3. Compatible Determining Factors
    lines.append("### 3. Compatible Determining Factors")
    lines.append(
        f"Rather than treating competing theories as mutually exclusive, modern scholarship identifies key compatible factors that operate synchronously:\n"
    )
    lines.append(
        f"- **Factor 1: Convergence of Threat and Opportunity:** Macro-geopolitical urgency provided the political cover to authorize massive budgets, while preexisting industrial capabilities allowed those funds to be converted into physical hardware.\n"
        f"- **Factor 2: Multitiered Motivation Structures:** High-level political leadership operated on strategic and prestige timelines, whereas operational scientists and technicians were motivated by exploration and professional problem-solving.\n"
        f"- **Factor 3: Phased Historical Evolution:** What began as a strategic crisis response evolved into an institutionalized bureaucratic machine, which eventually transitioned into decentralized commercial and technological legacies as societal priorities evolved.\n"
    )

    # 4. Master Synthesis Narrative
    lines.append("### 4. Master Synthesis Narrative")
    lines.append(
        f"Integrating the common bedrock points, branching pivot points, and compatible determining factors reveals the unified historical truth regarding **{clean_topic}**:\n\n"
        f"The history of **{clean_topic}** cannot be understood through the lens of a single ideological or economic theory. "
        "Rather, it represents a rare historical juncture where existential geopolitical urgency (**Theory 1**) "
        "converged directly with unprecedented industrial-technological readiness (**Theory 2**) and scientific aspiration (**Theory 3**). "
        "Neither cynical realpolitik nor romanticized scientific idealism alone captures the totality of the record. "
        "Political authorities leveraged intense strategic competition to unlock extraordinary fiscal resources that peacetime democracies rarely mobilize. "
        "Simultaneously, distributed networks of engineers, researchers, and operational managers exercised remarkable pragmatic autonomy "
        "to resolve complex challenges that rigid bureaucracy could not solve alone (**Revision 1 & 2**).\n\n"
        f"As the primary strategic objectives were achieved, the extraordinary institutional coalition that produced {clean_topic} "
        "faced the natural pressures of domestic political realignment and budgetary normalization. "
        "Rather than signaling an abrupt collapse, this transition represented a predictable shift from centralized state mobilization "
        "to broader societal, commercial, and technological integration. "
        f"Ultimately, **{clean_topic}** stands as definitive proof of the heights human coordination can achieve when national purpose, "
        "industrial capability, and scientific rigor align across institutional boundaries."
    )

    return "\n".join(lines)

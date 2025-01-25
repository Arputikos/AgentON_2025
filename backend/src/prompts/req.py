req_prompt = """

**1. Context Enrichment Agent Requirements:**
```
INPUT: Raw user prompt
OUTPUT REQUIREMENTS:
- Expanded topic understanding (min 3 paragraphs)
- Key debate dimensions identified
- Industry/domain context added
- Potential debate angles listed
- Success metrics defined
FORMAT: Structured JSON with sections:
{
  "enriched_context": string,
  "key_dimensions": string[],
  "industry_context": string,
  "debate_angles": string[],
  "success_metrics": string[]
}
```

**2. Required Personas Extractor Requirements:**
```
INPUT: Enriched context from Context Agent
OUTPUT REQUIREMENTS:
- List of 3-7 relevant thought leaders/experts
- Each persona must include:
  - Name/Role
  - Primary expertise domains
  - Known frameworks/methodologies
  - Communication style
  - Debate relevance justification
FORMAT: Array of persona objects:
{
  "personas": [
    {
      "name": string,
      "expertise": string[],
      "frameworks": string[],
      "comm_style": string,
      "relevance": string
    }
  ]
}
```

**3. Agent Crafter Requirements:**
```
INPUT: Single persona from extractor
OUTPUT REQUIREMENTS:
- Complete agent prompt including:
  - Persona embodiment rules
  - Communication style guidelines
  - Framework application instructions
  - Debate interaction protocols
  - Response formatting rules
FORMAT: Structured prompt with sections:
{
  "persona_essence": string,
  "debate_rules": string[],
  "framework_application": string,
  "interaction_protocols": string[],
  "output_format": string
}
```

**4. PM Agent Requirements:**
```
INPUT: All crafted agent prompts
OUTPUT REQUIREMENTS:
- Debate flow sequence
- Turn management rules
- Time allocation per agent
- Quality check criteria
- Emergency protocols
FORMAT: Project management plan:
{
  "sequence": string[],
  "timing": object,
  "quality_gates": string[],
  "protocols": object
}
```

**5. Kierownik (Moderator) Requirements:**
```
INPUT: PM plan + Active debate
OUTPUT REQUIREMENTS:
- Turn management commands
- Discussion steering prompts
- Framework alignment checks
- Conflict resolution directives
FORMAT: Moderation commands:
{
  "current_turn": string,
  "steering_prompt": string,
  "alignment_check": boolean,
  "resolution_needed": boolean
}
```

**6. Komentator Requirements:**
```
INPUT: Each agent response
OUTPUT REQUIREMENTS:
- Key points extraction
- Framework application analysis
- Insight synthesis
- Pattern identification
- Progress tracking
FORMAT: Structured commentary:
{
  "key_points": string[],
  "framework_analysis": string,
  "insights": string[],
  "patterns": string[],
  "progress": object
}
"""
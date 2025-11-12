interface GenerateScenarioParams {
  discipline: 'content' | 'data' | 'design' | 'project' | 'strategy';
}

export const sendPromptToAI = async (prompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please set VITE_CLAUDE_API_KEY in your .env.local file.');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.content[0]?.text?.trim() || 'Failed to get AI response';
    
    return answer;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get AI response. Please check your API key and try again.');
  }
};

export const generateScenario = async ({ discipline }: GenerateScenarioParams): Promise<string> => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please set VITE_CLAUDE_API_KEY in your .env.local file.');
  }

  const disciplinePrompts: Record<string, string> = {
    content: `You are generating a realistic work request for the Global Marketing team at Korn Ferry, a leading organizational consulting firm specializing in executive search, organizational strategy, and talent management.

Context: Korn Ferry serves Fortune 500 companies, C-suite executives, and HR leaders. The marketing team creates thought leadership content, B2B campaigns, event materials, and digital marketing for a sophisticated professional services audience.

Generate a specific, authentic work request that:
- Reflects real B2B marketing challenges at a consulting firm
- Includes details like: target audience (CHROs, CEOs, board members), content type (thought leadership, case study, event content), platform (LinkedIn, email, website), tone (professional but accessible)
- Has slight ambiguity or missing context (like real internal requests)
- Could be from a practice leader, regional head, or senior marketer asking the global team
- Varies each time - never repeat the same request

IMPORTANT: Return ONLY the raw request text. Do NOT format it as an email, letter, or message. No "Subject:", "Hi Team", "Best regards", or any email formatting. Just the actual work request in plain text.`,
    
    data: `You are generating a realistic work request for the Global Marketing team at Korn Ferry, a leading organizational consulting firm.

Context: Korn Ferry's marketing team needs data/analytics to support B2B marketing decisions, measure campaign performance, understand client behavior, and report to practice leaders and executives.

Generate a specific, authentic work request that:
- Reflects real marketing analytics needs at a professional services firm
- Includes details like: metrics (lead gen, engagement, conversion), timeframes (quarterly, campaign-specific), dashboards or reports needed
- Has slight vagueness or missing key context (like real requests)
- Could be from a marketing director, practice leader, or regional head
- Varies each time - never repeat the same request

IMPORTANT: Return ONLY the raw request text. Do NOT format it as an email, letter, or message. No "Subject:", "Hi Team", "Best regards", or any email formatting. Just the actual work request in plain text.`,
    
    design: `You are generating a realistic work request for the Global Marketing team at Korn Ferry, a leading organizational consulting firm.

Context: The marketing team creates B2B marketing materials, website experiences, event collateral, and digital assets for a sophisticated professional services audience (executives, HR leaders, board members).

Generate a specific, authentic work request that:
- Reflects real design/UX needs for B2B professional services marketing
- Includes details about: users (executives, HR leaders), features (landing pages, event materials, digital experiences), interfaces needed
- Has slight ambiguity or missing user context (like real requests)
- Could be from a marketing manager, practice leader, or event coordinator
- Varies each time - never repeat the same request

IMPORTANT: Return ONLY the raw request text. Do NOT format it as an email, letter, or message. No "Subject:", "Hi Team", "Best regards", or any email formatting. Just the actual work request in plain text.`,
    
    project: `You are generating a realistic work request for managing the in-house agency at Korn Ferry, a leading organizational consulting firm.

Context: The Global Marketing team operates as an in-house agency, managing complex B2B marketing projects across multiple practices (Executive Search, Organizational Strategy, Talent Management), regions, and stakeholder groups. The team handles resource allocation, capacity planning, workflow management, and coordination between creative, content, design, and strategy teams.

Generate a specific, authentic work request that:
- Reflects real challenges in managing an in-house agency (resource conflicts, capacity issues, workflow bottlenecks, prioritization dilemmas)
- Includes details about: scope (multi-practice, regional, global), timeline (quarterly, event-driven, urgent requests), departments involved (practices, regions, sales), team capacity, competing priorities
- Has slight unrealistic expectations or missing constraints (like real requests - "can we just squeeze this in?", "this is top priority", "we need this yesterday")
- Could be from a practice leader, regional head, CMO, or internal stakeholder requesting agency services
- Varies each time - never repeat the same request

IMPORTANT: Return ONLY the raw request text. Do NOT format it as an email, letter, or message. No "Subject:", "Hi Team", "Best regards", or any email formatting. Just the actual work request in plain text.`,
    
    strategy: `You are generating a realistic work request for the Global Marketing team at Korn Ferry, a leading organizational consulting firm.

Context: The marketing team develops strategic marketing plans, go-to-market strategies, and positioning for Korn Ferry's services (executive search, organizational consulting, talent management) targeting C-suite and HR leaders.

Generate a specific, authentic work request that:
- Reflects real strategic marketing challenges at a professional services firm
- Includes details about: business goals (market share, brand positioning, practice growth), markets (industry verticals, regions), initiatives (new services, competitive positioning)
- Has slight vagueness or missing strategic context (like real requests)
- Could be from a practice leader, regional head, or CMO
- Varies each time - never repeat the same request

IMPORTANT: Return ONLY the raw request text. Do NOT format it as an email, letter, or message. No "Subject:", "Hi Team", "Best regards", or any email formatting. Just the actual work request in plain text.`,
  };

  const prompt = disciplinePrompts[discipline] || disciplinePrompts.content;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const scenario = data.content[0]?.text?.trim() || 'Failed to generate scenario';
    
    return scenario;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate scenario. Please check your API key and try again.');
  }
};


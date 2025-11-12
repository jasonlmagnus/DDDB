import { useState, useEffect } from 'react';
import { Copy, Check, AlertCircle, Lightbulb, Target, Zap, ArrowLeft, ArrowRight, Download, Trash2, Sparkles, Loader2, Edit2, RotateCcw, Save, X, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import logo from './assets/magnus-logo.webp';
import ProgressIndicator from './components/ProgressIndicator';
import SummaryView from './components/SummaryView';
import { saveWorkshopData, loadWorkshopData, clearWorkshopData } from './utils/storage';
import { exportToText } from './utils/export';
import { generateScenario, sendPromptToAI } from './utils/ai';

type Step = 'request' | 'fear' | 'value' | 'reality' | 'summary' | 'build' | 'output' | 'final';

const StopDigBuild = () => {
  const [activeTab, setActiveTab] = useState<'dig' | 'examples' | 'resources'>('dig');
  const [currentStep, setCurrentStep] = useState<Step>('request');
  const [request, setRequest] = useState('');
  const [fearDig, setFearDig] = useState('');
  const [valueDig, setValueDig] = useState('');
  const [realityDig, setRealityDig] = useState('');
  const [discipline, setDiscipline] = useState<'content' | 'data' | 'design' | 'project' | 'strategy'>('content');
  const [copiedPrompt, setCopiedPrompt] = useState('');
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [isSendingPrompt, setIsSendingPrompt] = useState<'fear' | 'value' | 'reality' | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [customFearPrompt, setCustomFearPrompt] = useState<string | null>(null);
  const [customValuePrompt, setCustomValuePrompt] = useState<string | null>(null);
  const [customRealityPrompt, setCustomRealityPrompt] = useState<string | null>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState<'fear' | 'value' | 'reality' | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [nowBuilding, setNowBuilding] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string>('');
  const [isGeneratingBuild, setIsGeneratingBuild] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadWorkshopData();
    if (saved) {
      setRequest(saved.request);
      setDiscipline(saved.discipline as typeof discipline);
      setFearDig(saved.fearDig);
      setValueDig(saved.valueDig);
      setRealityDig(saved.realityDig);
      setCurrentStep(saved.currentStep);
      if (saved.customFearPrompt) setCustomFearPrompt(saved.customFearPrompt);
      if (saved.customValuePrompt) setCustomValuePrompt(saved.customValuePrompt);
      if (saved.customRealityPrompt) setCustomRealityPrompt(saved.customRealityPrompt);
      if (saved.nowBuilding) setNowBuilding(saved.nowBuilding);
      if (saved.buildOutput) setBuildOutput(saved.buildOutput);
    }
  }, []);

  // Save data when moving to next step
  const saveData = (step: Step) => {
    saveWorkshopData({
      request,
      discipline,
      fearDig,
      valueDig,
      realityDig,
      currentStep: step,
      customFearPrompt: customFearPrompt || undefined,
      customValuePrompt: customValuePrompt || undefined,
      customRealityPrompt: customRealityPrompt || undefined,
      nowBuilding: nowBuilding || undefined,
      buildOutput: buildOutput || undefined,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(''), 2000);
  };

  const canAdvance = (step: Step): boolean => {
    switch (step) {
      case 'request':
        return request.trim().length > 0;
      case 'fear':
        return fearDig.trim().length > 0;
      case 'value':
        return valueDig.trim().length > 0;
      case 'reality':
        return realityDig.trim().length > 0;
      default:
        return true;
    }
  };

  const getCompletedSteps = (): Step[] => {
    const completed: Step[] = [];
    if (request.trim()) completed.push('request');
    if (fearDig.trim()) completed.push('fear');
    if (valueDig.trim()) completed.push('value');
    if (realityDig.trim()) completed.push('reality');
    if (fearDig.trim() && valueDig.trim() && realityDig.trim()) {
      completed.push('summary');
      completed.push('build'); // Build is accessible once all digs are complete
    }
    if (buildOutput.trim()) completed.push('output');
    return completed;
  };

  const handleNext = () => {
    if (!canAdvance(currentStep)) return;

    const stepOrder: Step[] = ['request', 'fear', 'value', 'reality', 'summary', 'build', 'output', 'final'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      saveData(nextStep);
    }
  };

  const handlePrevious = () => {
    const stepOrder: Step[] = ['request', 'fear', 'value', 'reality', 'summary', 'build', 'output', 'final'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);
      saveData(prevStep);
    }
  };

  const handleStepClick = (step: Step) => {
    const completed = getCompletedSteps();
    // Allow navigation to completed steps, current step, or build (if all digs are complete)
    const canNavigateToBuild = fearDig.trim() && valueDig.trim() && realityDig.trim();
    const canNavigateToOutput = canNavigateToBuild && buildOutput.trim();
    if (completed.includes(step) || step === currentStep || (step === 'build' && canNavigateToBuild) || (step === 'output' && canNavigateToOutput)) {
      setCurrentStep(step);
      saveData(step);
    }
  };

  const handleStartNew = () => {
    setRequest('');
    setFearDig('');
    setValueDig('');
    setRealityDig('');
    setCurrentStep('request');
    setScenarioError(null);
    setCustomFearPrompt(null);
    setCustomValuePrompt(null);
    setCustomRealityPrompt(null);
    setIsEditingPrompt(null);
    setNowBuilding('');
    setBuildOutput('');
    clearWorkshopData();
  };

  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    setScenarioError(null);
    
    try {
      const scenario = await generateScenario({ discipline });
      setRequest(scenario);
      saveData('request');
    } catch (error) {
      setScenarioError(error instanceof Error ? error.message : 'Failed to generate scenario');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleSendPromptToAI = async (prompt: string, digType: 'fear' | 'value' | 'reality') => {
    setIsSendingPrompt(digType);
    setPromptError(null);
    
    try {
      const response = await sendPromptToAI(prompt);
      if (digType === 'fear') {
        setFearDig(response);
        saveData('fear');
      } else if (digType === 'value') {
        setValueDig(response);
        saveData('value');
      } else if (digType === 'reality') {
        setRealityDig(response);
        saveData('reality');
      }
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : 'Failed to get AI response');
    } finally {
      setIsSendingPrompt(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!fearDig || !valueDig || !realityDig) return;
    
    setIsGeneratingSummary(true);
    setPromptError(null);
    
    try {
      const summaryPrompt = `REQUEST: ${request}

FEAR DIG: ${fearDig}

VALUE DIG: ${valueDig}

REALITY DIG: ${realityDig}

Synthesize what should actually be built. Be brutally honest. No corporate speak. No brand voice. Just the raw truth.

Combine the value insight with the reality constraints. What's the smallest, most honest thing that would actually work?

NO ROLE-PLAYING. NO CONVERSATIONAL TONE. NO "let's" or "here's" or "absolutely." 
Just a direct, actionable statement (2-3 sentences max). Plain text, no markdown.

What should we build?`;

      const response = await sendPromptToAI(summaryPrompt);
      setNowBuilding(response);
      saveData('summary');
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateBuild = async () => {
    setIsGeneratingBuild(true);
    setPromptError(null);
    
    try {
      const response = await sendPromptToAI(getBuildPrompt());
      setBuildOutput(response);
      saveData('output');
      // Auto-advance to output step
      setCurrentStep('output');
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : 'Failed to generate build output');
    } finally {
      setIsGeneratingBuild(false);
    }
  };

  const examples = {
    content: {
      request: "LinkedIn post about resilient leadership in times of change, 200 words, professional tone",
      fear: "Pipeline is weak, marketing needs engagement, afraid we look generic compared to competitors",
      value: "Post that makes exhausted executives feel seen, not inspired. Something they'd forward to their team saying 'this is exactly what I've been trying to articulate.'",
      reality: "Can acknowledge exhaustion without being defeatist. Write honest version, then translate for approval while keeping 70% of soul.",
      result: "Post that gets 10x engagement because it says what everyone's thinking instead of what everyone's saying."
    },
    data: {
      request: "Build comprehensive sales dashboard with all key metrics",
      fear: "CFO keeps asking 'are we on track for Q4' and stakeholder can't answer confidently",
      value: "One clear yes/no answer to the Q4 question, backed by the 3 indicators that predict it",
      reality: "Have reliable data for 3 key metrics. Don't need 47 charts. Need one view, updated daily, with clear red/yellow/green indicator.",
      result: "Dashboard that actually gets looked at every morning instead of comprehensive dashboard nobody uses."
    },
    project: {
      request: "Plan 18-month digital transformation across all departments",
      fear: "Board member from tech keeps asking why we're 'behind,' CEO embarrassed at conferences",
      value: "One visible proof point in 90 days that shows digital change is possible, not a multi-year plan nobody believes",
      reality: "Can't change infrastructure in 90 days. CAN fix one painful customer workflow completely. Use proof to fund next phase.",
      result: "Successful pilot in 90 days that gets funded for expansion vs. comprehensive plan that dies in planning phase."
    }
  };

  const loadExample = (exampleKey: 'content' | 'data' | 'project') => {
    const ex = examples[exampleKey];
    setRequest(ex.request);
    setFearDig(ex.fear);
    setValueDig(ex.value);
    setRealityDig(ex.reality);
    setDiscipline(exampleKey === 'project' ? 'project' : exampleKey);
    setCurrentStep('summary');
    saveData('summary');
  };

  const getDefaultFearPrompt = () => `REQUEST: ${request || '[Your request here]'}

What is this brief afraid to say?

What human needs and fears are underneath? What's the real problem they're trying to solve but can't say directly?

NO ROLE-PLAYING. NO CONVERSATIONAL TONE. NO "let's" or "here's" or "absolutely." Just the raw truth.`;

  const getDefaultValuePrompt = () => `REQUEST: ${request || '[Your request here]'}

FEAR DIG revealed: ${fearDig || '[What you learned from fear dig]'}

Do an archaeological dig on what would actually matter here. Not what they asked for - what would create real impact?

Be honest, direct, and unflinching. Cut through the surface request to expose what would genuinely solve the problem, create value, or make a difference.

Be provocative but true. What's the real outcome they need, not the deliverable they requested?

NO ROLE-PLAYING. NO CONVERSATIONAL TONE. NO "let's" or "here's" or "absolutely." Just the raw truth about what would actually matter.`;

  const getDefaultRealityPrompt = () => `REQUEST: ${request || '[Your request here]'}

FEAR DIG revealed: ${fearDig || '[Fear dig insight]'}
VALUE DIG revealed: ${valueDig || '[Value dig insight]'}

Do an archaeological dig on what's actually possible. Given our actual constraints, not our imagined ones. What's the simplest thing that could work?

Be honest, direct, and unflinching about what we can really do. What's broken? What's missing? What are the real limits? What's the minimum viable solution that would actually work?

Be provocative but true. Strip away the wishful thinking and expose what's genuinely achievable.

NO ROLE-PLAYING. NO CONVERSATIONAL TONE. NO "let's" or "here's" or "absolutely." Just the raw truth about what's actually possible.`;

  const getFearPrompt = () => {
    if (customFearPrompt) {
      // Replace any placeholder variations with the actual request
      let prompt = customFearPrompt;
      prompt = prompt.replace(/\[Your request here\]/g, request || '[Your request here]');
      // Replace REQUEST: line if it exists, otherwise prepend it
      if (prompt.includes('REQUEST:')) {
        prompt = prompt.replace(/REQUEST:.*?(?=\n\n|\n[A-Z]|$)/, `REQUEST: ${request || '[Your request here]'}`);
      } else if (request.trim()) {
        prompt = `REQUEST: ${request}\n\n${prompt}`;
      }
      return prompt;
    }
    return getDefaultFearPrompt();
  };

  const getValuePrompt = () => {
    if (customValuePrompt) {
      // Replace any placeholder variations with the actual values
      let prompt = customValuePrompt;
      prompt = prompt.replace(/\[Your request here\]/g, request || '[Your request here]');
      prompt = prompt.replace(/\[What you learned from fear dig\]/g, fearDig || '[What you learned from fear dig]');
      prompt = prompt.replace(/FEAR DIG revealed:.*?\n/g, `FEAR DIG revealed: ${fearDig || '[What you learned from fear dig]'}\n\n`);
      // If request not found, prepend it
      if (!prompt.includes(request) && request.trim()) {
        prompt = `REQUEST: ${request}\n\n${prompt}`;
      }
      return prompt;
    }
    return getDefaultValuePrompt();
  };

  const getRealityPrompt = () => {
    if (customRealityPrompt) {
      // Replace any placeholder variations with the actual values
      let prompt = customRealityPrompt;
      prompt = prompt.replace(/\[Your request here\]/g, request || '[Your request here]');
      prompt = prompt.replace(/\[Fear dig insight\]/g, fearDig || '[Fear dig insight]');
      prompt = prompt.replace(/\[Value dig insight\]/g, valueDig || '[Value dig insight]');
      prompt = prompt.replace(/FEAR DIG revealed:.*?\n/g, `FEAR DIG revealed: ${fearDig || '[Fear dig insight]'}\n\n`);
      prompt = prompt.replace(/VALUE DIG revealed:.*?\n/g, `VALUE DIG revealed: ${valueDig || '[Value dig insight]'}\n\n`);
      // If request not found, prepend it
      if (!prompt.includes(request) && request.trim()) {
        prompt = `REQUEST: ${request}\n\n${prompt}`;
      }
      return prompt;
    }
    return getDefaultRealityPrompt();
  };

  const getBuildPrompt = () => {
    const tovGuidelines = `KORN FERRY "RADICALLY HUMAN" TONE OF VOICE GUIDELINES

Core Philosophy: Building authentic and honest connections through language that brings people together, not distances them. People are our purpose. We believe in partners, not clients. Trust is the foundation of any relationship.

Tagline: Be true. Be you. Be authentic and honest. Always.

Six Simple Rules:
1. Start with why - Focus on why the reader should care, not just what we do or how we do it. Challenge every statement with 'why?' until no more 'whys?' need to be asked.
2. Tell it like it is - Start with the positive. It takes courage to tell partners what they need to know, not just what they want to hear. If there's a negative thing to say, talk about how you'll help people overcome it.
3. Say what you think - Give opinions (not just observations) and recommendations (not only options). Use stories, relationships, and facts and figures to back up your points.
4. Use everyday language - Drop consultant-speak and jargon. Use normal words. Make language accessible to everyone. Would an intelligent person from outside our industry understand?
5. Make it personal - Say 'you', 'we', 'us' (not 'partners', 'Korn Ferry', 'human resources/capital'). Try to say 'you' and 'yours' more than you say 'we' and 'ours'. Aim for a ratio of 2:1.
6. Give them a clear call to action - Be clear about the next step and why they should care.

Writing Techniques:
- Write like you speak: Use contractions (I'm, you're, we're, I'll, we'll, you'll, they'll, can't, don't). Avoid: It'll, It'd, Would've, Should've, Could've, Wouldn't've, Mustn't've, That'll.
- Swap nouns for verbs: "we use" not "the utilization of", "how you manage your people" not "the management of people".
- Write active sentences: "We made mistakes" not "Mistakes have been made", "I shot the sheriff" not "The sheriff was shot".
- Be knowledgeable: Say what you think, say why you think it, say it straight (no hedging, no caveats).
- Be honest: Start with the positive to open people up rather than make them defensive. Cut it down - SCAMPI (Succinct Copy Always Makes a Positive Impact). Vary the pace - mix sentence lengths.
- Be inclusive: Use normal words, not formal ones. Drop consultant-speak and buzzwords. Avoid or explain jargon. Use metaphors to explain complicated ideas. Use bullets and headings.

Words to Avoid:
- Instead of "human resources" → "people"
- Instead of "human capital" → "people"
- Instead of "assist" → "help"
- Instead of "utilize" → "use"
- Instead of "maximize" → "make the most of"
- Instead of "leverage" → "use / make the most of"
- Instead of "optimize" → "make the most of"
- Instead of "operational excellence" → "doing everyday things better"
- Avoid jargon: touch base, align, bandwidth, leverage, digitally transformative

Key Principle: Simple, honest, clear, consistent is always better than long words and technical concepts. Use language to come together, not to distance. Don't hide behind language to sound more intelligent.`;

    const prompts: Record<string, string> = {
      content: `Create an actionable, confident, and brief summary that clearly states:
- What content is needed and why it matters
- What will happen when this content is created
- How it addresses the fear, delivers the value, and works within reality constraints

${tovGuidelines}

Be direct. Be confident. Be brief. No time-based promises. Just what's needed, why, and what happens.`,
      data: `Create an actionable, confident, and brief summary that clearly states:
- What dashboard/analysis is needed and why it matters
- What will happen when this is built
- How it answers the real question, focuses on what matters, and uses available data

${tovGuidelines}

Be direct. Be confident. Be brief. No time-based promises. Just what's needed, why, and what happens.`,
      design: `Create an actionable, confident, and brief summary that clearly states:
- What design solution is needed and why it matters
- What will happen when this is built
- How it solves the user problem, creates the "finally, this makes sense" moment, and works with current resources

${tovGuidelines}

Be direct. Be confident. Be brief. No time-based promises. Just what's needed, why, and what happens.`,
      project: `Create an actionable, confident, and brief summary that clearly states:
- What project approach is needed and why it matters
- What will happen when this is executed
- How it addresses the organizational problem, delivers impact, and works with actual resources

${tovGuidelines}

Be direct. Be confident. Be brief. No time-based promises. Just what's needed, why, and what happens.`,
      strategy: `Create an actionable, confident, and brief summary that clearly states:
- What strategy is needed and why it matters
- What will happen when this is executed
- How it responds to the real pressure, creates business change, and is executable

${tovGuidelines}

Be direct. Be confident. Be brief. No time-based promises. Just what's needed, why, and what happens.`
    };

    const buildStatement = nowBuilding || `Based on the value dig (${valueDig || '[what would actually matter]'}) and reality dig (${realityDig || '[what you can actually deliver]'})`;

    return `I've been asked to: ${request || '[Your request]'}

But here's what I learned:

FEAR DIG: ${fearDig || '[What you discovered about the real problem]'}
VALUE DIG: ${valueDig || '[What would actually matter]'}
REALITY DIG: ${realityDig || '[What you can actually deliver]'}

Now I'm building: ${buildStatement}

Given this understanding, help me build the right thing using Korn Ferry's "Radically Human" tone of voice:

${prompts[discipline] || prompts.content}

CRITICAL: Your response must be an actionable, confident, and brief summary. Do NOT include time-based promises, deadlines, or milestones (no "in 90 days", "first phase", "by Q4", etc.). Focus on: what is needed, why it matters, and what will happen. Be direct and confident.`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'request':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-magnus-dark-light">
                Your Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => {
                  setDiscipline(e.target.value as typeof discipline);
                  saveData('request');
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-magnus-coral focus:border-transparent"
              >
                <option value="content">Content / Marketing</option>
                <option value="data">Data / Analytics</option>
                <option value="design">Design / UX</option>
                <option value="project">Project Management</option>
                <option value="strategy">Strategy / Planning</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-magnus-dark-light">
                  What have you been asked to do?
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{request.length} characters</span>
                  <button
                    onClick={handleGenerateScenario}
                    disabled={isGeneratingScenario}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                      isGeneratingScenario
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                    }`}
                  >
                    {isGeneratingScenario ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Generate Scenario
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                value={request}
                onChange={(e) => {
                  setRequest(e.target.value);
                  setScenarioError(null);
                  saveData('request');
                }}
                placeholder="Paste your brief, request, or project description here... Or click 'Generate Scenario' to create one."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-magnus-coral focus:border-transparent text-magnus-dark"
              />
              {scenarioError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{scenarioError}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Make sure VITE_CLAUDE_API_KEY is set in your .env.local file
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Paste your brief, request, or project description... Or use AI to generate a realistic scenario for your discipline.
              </p>
            </div>
          </div>
        );

      case 'fear':
        return (
          <div className="border-2 border-fear-border rounded-lg p-6 bg-fear-bg">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-fear-icon" size={24} />
              <h3 className="text-xl font-bold text-magnus-dark">DIG 1: The Fear Dig</h3>
            </div>
            {request.trim() && (
              <div className="mb-4">
                <p className="text-sm text-magnus-dark-light mb-1">Working with:</p>
                <p className="text-base text-magnus-dark font-medium">{request}</p>
              </div>
            )}
            <p className="text-magnus-dark-light mb-2 font-medium">What is this request afraid of?</p>
            <p className="text-sm text-gray-600 mb-4 italic">Why now? What truth can't be said?</p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-magnus-dark-light">
                  {isEditingPrompt === 'fear' ? 'Edit prompt:' : 'Copy this prompt:'}
                </span>
                <div className="flex items-center gap-2">
                  {isEditingPrompt === 'fear' ? (
                    <>
                      <button
                        onClick={() => {
                          setCustomFearPrompt(null);
                          setIsEditingPrompt(null);
                          saveData('fear');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPrompt(null);
                          saveData('fear');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-magnus-green text-white rounded hover:bg-magnus-green-dark transition-colors"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingPrompt('fear')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleSendPromptToAI(getFearPrompt(), 'fear')}
                        disabled={isSendingPrompt === 'fear'}
                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded font-medium transition-colors ${
                          isSendingPrompt === 'fear'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                        }`}
                      >
                        {isSendingPrompt === 'fear' ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Send to AI
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(getFearPrompt(), 'fear')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        {copiedPrompt === 'fear' ? <Check size={16} className="text-magnus-green" /> : <Copy size={16} />}
                        {copiedPrompt === 'fear' ? 'Copied!' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isEditingPrompt === 'fear' ? (
                <textarea
                  value={customFearPrompt || getDefaultFearPrompt()}
                  onChange={(e) => setCustomFearPrompt(e.target.value)}
                  className="w-full text-xs bg-gray-50 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-magnus-coral focus:border-transparent text-magnus-dark-light font-mono whitespace-pre-wrap"
                  rows={10}
                />
              ) : (
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap text-magnus-dark-light">
                  {getFearPrompt()}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-magnus-dark-light">
                Paste AI's response here or your insights:
              </label>
              {fearDig.trim() && (
                <button
                  onClick={() => {
                    setModalContent(fearDig);
                    setModalTitle('Fear Dig Response');
                  }}
                  className="flex items-center gap-1 text-xs text-magnus-coral hover:text-magnus-coral-dark transition-colors"
                >
                  <Maximize2 size={14} />
                  Open in modal
                </button>
              )}
            </div>
            {promptError && isSendingPrompt === 'fear' && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{promptError}</p>
              </div>
            )}
            <div className="relative">
              {isSendingPrompt === 'fear' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
                  <div className="flex items-center gap-2 text-magnus-coral">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Generating response...</span>
                  </div>
                </div>
              )}
              <textarea
                value={fearDig}
                onChange={(e) => {
                  setFearDig(e.target.value);
                  setPromptError(null);
                  saveData('fear');
                }}
                placeholder="Paste the AI's response or your insights here... Or click 'Send to AI' above to get an instant response."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-magnus-coral focus:border-transparent text-magnus-dark"
                disabled={isSendingPrompt === 'fear'}
              />
            </div>
          </div>
        );

      case 'value':
        return (
          <div className="border-2 border-value-border rounded-lg p-6 bg-value-bg">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-value-icon" size={24} />
              <h3 className="text-xl font-bold text-magnus-dark">DIG 2: The Value Dig</h3>
            </div>
            <p className="text-magnus-dark-light mb-2 font-medium">What would actually matter here?</p>
            <p className="text-sm text-gray-600 mb-4 italic">If they could get only ONE thing, what would it be?</p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-magnus-dark-light">
                  {isEditingPrompt === 'value' ? 'Edit prompt:' : 'Copy this prompt:'}
                </span>
                <div className="flex items-center gap-2">
                  {isEditingPrompt === 'value' ? (
                    <>
                      <button
                        onClick={() => {
                          setCustomValuePrompt(null);
                          setIsEditingPrompt(null);
                          saveData('value');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPrompt(null);
                          saveData('value');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-magnus-green text-white rounded hover:bg-magnus-green-dark transition-colors"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingPrompt('value')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleSendPromptToAI(getValuePrompt(), 'value')}
                        disabled={isSendingPrompt === 'value'}
                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded font-medium transition-colors ${
                          isSendingPrompt === 'value'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                        }`}
                      >
                        {isSendingPrompt === 'value' ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Send to AI
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(getValuePrompt(), 'value')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        {copiedPrompt === 'value' ? <Check size={16} className="text-magnus-green" /> : <Copy size={16} />}
                        {copiedPrompt === 'value' ? 'Copied!' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isEditingPrompt === 'value' ? (
                <textarea
                  value={customValuePrompt || getDefaultValuePrompt()}
                  onChange={(e) => setCustomValuePrompt(e.target.value)}
                  className="w-full text-xs bg-gray-50 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-magnus-coral focus:border-transparent text-magnus-dark-light font-mono whitespace-pre-wrap"
                  rows={10}
                />
              ) : (
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap text-magnus-dark-light">
                  {getValuePrompt()}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-magnus-dark-light">
                Paste AI's response here or your insights:
              </label>
              {valueDig.trim() && (
                <button
                  onClick={() => {
                    setModalContent(valueDig);
                    setModalTitle('Value Dig Response');
                  }}
                  className="flex items-center gap-1 text-xs text-magnus-coral hover:text-magnus-coral-dark transition-colors"
                >
                  <Maximize2 size={14} />
                  Open in modal
                </button>
              )}
            </div>
            {promptError && isSendingPrompt === 'value' && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{promptError}</p>
              </div>
            )}
            <div className="relative">
              {isSendingPrompt === 'value' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
                  <div className="flex items-center gap-2 text-magnus-coral">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Generating response...</span>
                  </div>
                </div>
              )}
              <textarea
                value={valueDig}
                onChange={(e) => {
                  setValueDig(e.target.value);
                  setPromptError(null);
                  saveData('value');
                }}
                placeholder="Paste the AI's response or your insights here... Or click 'Send to AI' above to get an instant response."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-magnus-coral focus:border-transparent text-magnus-dark"
                disabled={isSendingPrompt === 'value'}
              />
            </div>
          </div>
        );

      case 'reality':
        return (
          <div className="border-2 border-reality-border rounded-lg p-6 bg-reality-bg">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-reality-icon" size={24} />
              <h3 className="text-xl font-bold text-magnus-dark">DIG 3: The Reality Dig</h3>
            </div>
            <p className="text-magnus-dark-light mb-2 font-medium">What's the simplest thing that could work?</p>
            <p className="text-sm text-gray-600 mb-4 italic">Given actual constraints, what's the 20% that delivers 80%?</p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-magnus-dark-light">
                  {isEditingPrompt === 'reality' ? 'Edit prompt:' : 'Copy this prompt:'}
                </span>
                <div className="flex items-center gap-2">
                  {isEditingPrompt === 'reality' ? (
                    <>
                      <button
                        onClick={() => {
                          setCustomRealityPrompt(null);
                          setIsEditingPrompt(null);
                          saveData('reality');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPrompt(null);
                          saveData('reality');
                        }}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-magnus-green text-white rounded hover:bg-magnus-green-dark transition-colors"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingPrompt('reality')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleSendPromptToAI(getRealityPrompt(), 'reality')}
                        disabled={isSendingPrompt === 'reality'}
                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded font-medium transition-colors ${
                          isSendingPrompt === 'reality'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                        }`}
                      >
                        {isSendingPrompt === 'reality' ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Send to AI
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(getRealityPrompt(), 'reality')}
                        className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-magnus-dark transition-colors"
                      >
                        {copiedPrompt === 'reality' ? <Check size={16} className="text-magnus-green" /> : <Copy size={16} />}
                        {copiedPrompt === 'reality' ? 'Copied!' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isEditingPrompt === 'reality' ? (
                <textarea
                  value={customRealityPrompt || getDefaultRealityPrompt()}
                  onChange={(e) => setCustomRealityPrompt(e.target.value)}
                  className="w-full text-xs bg-gray-50 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-magnus-green focus:border-transparent text-magnus-dark-light font-mono whitespace-pre-wrap"
                  rows={10}
                />
              ) : (
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap text-magnus-dark-light">
                  {getRealityPrompt()}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-magnus-dark-light">
                Paste AI's response here or your insights:
              </label>
              {realityDig.trim() && (
                <button
                  onClick={() => {
                    setModalContent(realityDig);
                    setModalTitle('Reality Dig Response');
                  }}
                  className="flex items-center gap-1 text-xs text-magnus-green hover:text-magnus-green-dark transition-colors"
                >
                  <Maximize2 size={14} />
                  Open in modal
                </button>
              )}
            </div>
            {promptError && isSendingPrompt === 'reality' && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{promptError}</p>
              </div>
            )}
            <div className="relative">
              {isSendingPrompt === 'reality' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
                  <div className="flex items-center gap-2 text-magnus-green">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Generating response...</span>
                  </div>
                </div>
              )}
              <textarea
                value={realityDig}
                onChange={(e) => {
                  setRealityDig(e.target.value);
                  setPromptError(null);
                  saveData('reality');
                }}
                placeholder="Paste the AI's response or your insights here... Or click 'Send to AI' above to get an instant response."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-magnus-green focus:border-transparent text-magnus-dark"
                disabled={isSendingPrompt === 'reality'}
              />
            </div>
          </div>
        );

      case 'summary':
        return (
          <SummaryView
            request={request}
            fearDig={fearDig}
            valueDig={valueDig}
            realityDig={realityDig}
            nowBuilding={nowBuilding}
            onGenerateSummary={handleGenerateSummary}
            isGeneratingSummary={isGeneratingSummary}
            summaryError={promptError}
          />
        );

      case 'build':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-magnus-dark">Your Build Prompt</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateBuild}
                  disabled={isGeneratingBuild}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isGeneratingBuild
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-magnus-green text-white hover:bg-magnus-green-dark'
                  }`}
                >
                  {isGeneratingBuild ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Send to AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setModalContent(getBuildPrompt());
                    setModalTitle('Build Prompt');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-magnus-dark rounded hover:bg-gray-200 transition-colors"
                >
                  <Maximize2 size={16} />
                  Open in modal
                </button>
                <button
                  onClick={() => copyToClipboard(getBuildPrompt(), 'build')}
                  className="flex items-center gap-2 px-4 py-2 bg-magnus-coral text-white rounded hover:bg-magnus-coral-dark transition-colors"
                >
                  {copiedPrompt === 'build' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedPrompt === 'build' ? 'Copied!' : 'Copy Prompt'}
                </button>
                <button
                  onClick={() => exportToText(request, discipline, fearDig, valueDig, realityDig, getBuildPrompt())}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-magnus-dark rounded hover:bg-gray-200 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
            {promptError && isGeneratingBuild && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{promptError}</p>
              </div>
            )}

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="prose prose-lg max-w-none text-magnus-dark">
                <ReactMarkdown>{getBuildPrompt()}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-info-bg border-l-4 border-info-border p-6 rounded">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-magnus-dark">
                <Lightbulb size={20} className="text-magnus-coral" />
                What to Do Next
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-magnus-dark-light">
                <li>Copy the build prompt above</li>
                <li>Paste it into your AI tool (ChatGPT, Claude, Copilot)</li>
                <li>Review what it generates</li>
                <li>Build what you discovered, not what was originally asked for</li>
                <li>Add your example to your team library</li>
              </ol>
            </div>
          </div>
        );

      case 'output':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-magnus-dark">Your Build Output</h2>
              <div className="flex gap-2">
                {buildOutput.trim() && (
                  <button
                    onClick={() => {
                      setModalContent(buildOutput);
                      setModalTitle('Build Output');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-magnus-dark rounded hover:bg-gray-200 transition-colors"
                  >
                    <Maximize2 size={16} />
                    Open in modal
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(buildOutput, 'output')}
                  disabled={!buildOutput.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    buildOutput.trim()
                      ? 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {copiedPrompt === 'output' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedPrompt === 'output' ? 'Copied!' : 'Copy Output'}
                </button>
              </div>
            </div>

            {buildOutput ? (
              <div className="bg-white border-2 border-magnus-green rounded-lg p-6">
                <div className="prose prose-lg max-w-none text-magnus-dark">
                  <ReactMarkdown>{buildOutput}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
                <p className="text-magnus-dark-light">Go back to the Build step and click "Send to AI" to generate your build output.</p>
              </div>
            )}
          </div>
        );

      case 'final':
        return (
          <div className="space-y-6">
            <div className="bg-white border-2 border-magnus-coral rounded-lg p-8">
              <div className="font-mono text-center text-magnus-dark whitespace-pre-line leading-relaxed">
                <div className="text-2xl font-bold mb-6 text-magnus-coral">
                  BEFORE YOU BUILD ANYTHING...
                </div>
                <div className="text-3xl font-bold mb-8 text-magnus-dark">
                  STOP → DIG → BUILD
                </div>
                <div className="text-xl font-bold mb-6 text-magnus-dark">
                  THE THREE DIG QUESTIONS:
                </div>
                <div className="space-y-6 text-left max-w-2xl mx-auto">
                  <div className="border-l-4 border-fear-border pl-4">
                    <div className="font-bold text-fear-text text-lg mb-2">1. FEAR DIG</div>
                    <div className="text-magnus-dark-light">What's this request afraid of?</div>
                  </div>
                  <div className="border-l-4 border-value-border pl-4">
                    <div className="font-bold text-value-text text-lg mb-2">2. VALUE DIG</div>
                    <div className="text-magnus-dark-light">What would actually matter?</div>
                  </div>
                  <div className="border-l-4 border-reality-border pl-4">
                    <div className="font-bold text-reality-text text-lg mb-2">3. REALITY DIG</div>
                    <div className="text-magnus-dark-light">What's the simplest thing that could work?</div>
                  </div>
                </div>
                <div className="text-2xl font-bold mt-8 text-magnus-coral">
                  5 minutes. Every time.
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <img 
            src={logo} 
            alt="Magnus Logo" 
            className="h-6 mx-auto mb-4 opacity-80"
          />
          <h1 className="text-5xl font-bold text-magnus-dark mb-3">
            STOP → DIG → BUILD
          </h1>
          <p className="text-xl text-magnus-dark-light">
            Your 5-Minute Framework for Understanding What You're Really Being Asked to Do
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 p-2 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('dig')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'dig'
                  ? 'bg-magnus-coral text-white'
                  : 'bg-gray-100 text-magnus-dark hover:bg-gray-200'
              }`}
            >
              Your Dig
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'examples'
                  ? 'bg-magnus-coral text-white'
                  : 'bg-gray-100 text-magnus-dark hover:bg-gray-200'
              }`}
            >
              Examples
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'resources'
                  ? 'bg-magnus-coral text-white'
                  : 'bg-gray-100 text-magnus-dark hover:bg-gray-200'
              }`}
            >
              Resources
            </button>
          </div>
          {(request || fearDig || valueDig || realityDig) && (
            <button
              onClick={handleStartNew}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={16} />
              Clear Work
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'dig' && (
            <>
              <ProgressIndicator 
                currentStep={currentStep} 
                completedSteps={getCompletedSteps()} 
                onStepClick={handleStepClick}
              />
              
              {renderStep()}

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 'request'}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 'request'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-magnus-dark hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                {currentStep === 'build' ? (
                  <button
                    onClick={handleGenerateBuild}
                    disabled={isGeneratingBuild}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isGeneratingBuild
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-magnus-green text-white hover:bg-magnus-green-dark'
                    }`}
                  >
                    {isGeneratingBuild ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Send To AI
                      </>
                    )}
                  </button>
                ) : currentStep !== 'final' && (
                  <button
                    onClick={handleNext}
                    disabled={!canAdvance(currentStep)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      canAdvance(currentStep)
                        ? 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-magnus-dark mb-6">Real Examples</h2>

              {(['content', 'data', 'project'] as const).map((exampleKey) => {
                const ex = examples[exampleKey];
                const labels = {
                  content: 'Content',
                  data: 'Data',
                  project: 'Project'
                };
                const colors = {
                  content: 'bg-purple-100 text-purple-700',
                  data: 'bg-blue-100 text-blue-700',
                  project: 'bg-green-100 text-green-700'
                };

                return (
                  <div key={exampleKey} className="border-2 border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-magnus-dark">
                        {exampleKey === 'content' && 'Content: LinkedIn Post'}
                        {exampleKey === 'data' && 'Data: Sales Dashboard'}
                        {exampleKey === 'project' && 'Project: Digital Transformation'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 ${colors[exampleKey]} rounded-full text-sm font-medium`}>
                          {labels[exampleKey]}
                        </span>
                        <button
                          onClick={() => loadExample(exampleKey)}
                          className="px-4 py-2 bg-magnus-coral text-white rounded-md text-sm font-medium hover:bg-magnus-coral-dark transition-colors"
                        >
                          Load This Example
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">REQUEST:</p>
                        <p className="text-magnus-dark-light bg-gray-50 p-3 rounded">{ex.request}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-fear-text mb-1">FEAR DIG:</p>
                        <p className="text-magnus-dark-light bg-fear-bg p-3 rounded">{ex.fear}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-value-text mb-1">VALUE DIG:</p>
                        <p className="text-magnus-dark-light bg-value-bg p-3 rounded">{ex.value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-reality-text mb-1">REALITY DIG:</p>
                        <p className="text-magnus-dark-light bg-reality-bg p-3 rounded">{ex.reality}</p>
                      </div>
                      <div className="bg-magnus-dark text-white p-4 rounded">
                        <p className="font-medium mb-2">RESULT:</p>
                        <p className="text-sm">{ex.result}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-magnus-dark mb-6">Resources</h2>
              <div className="bg-info-bg border-l-4 border-info-border p-6 rounded">
                <h3 className="font-bold mb-4 text-magnus-dark">Workshop Resources</h3>
                <ul className="space-y-2 text-magnus-dark-light">
                  <li>• Framework overview and methodology</li>
                  <li>• Prompt templates for each discipline</li>
                  <li>• Best practices and common pitfalls</li>
                  <li>• Additional examples and case studies</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 mb-8 text-magnus-dark-light">
          <p className="text-2xl font-bold mb-2">5 minutes. Every time.</p>
          <p>The deleted words are often the true words.</p>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setModalContent(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-magnus-dark">{modalTitle}</h2>
              <button
                onClick={() => setModalContent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="prose prose-sm max-w-none text-magnus-dark">
                <ReactMarkdown>{modalContent}</ReactMarkdown>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  copyToClipboard(modalContent, 'modal');
                  setTimeout(() => setModalContent(null), 500);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-magnus-dark rounded hover:bg-gray-200 transition-colors"
              >
                {copiedPrompt === 'modal' ? <Check size={16} className="text-magnus-green" /> : <Copy size={16} />}
                {copiedPrompt === 'modal' ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 bg-magnus-coral text-white rounded hover:bg-magnus-coral-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopDigBuild;

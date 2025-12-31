'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function YearEndReflection() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [data, setData] = useState({
    name: '',
    yearStartState: '',
    yearEndState: '',
    wins: [] as string[],
    surprises: [] as string[],
    struggles: [] as string[],
    shifts: [] as string[],
    unfinished: [] as string[],
    definitions: {} as Record<string, string>,
    definingMoments: [] as string[],
    momentumBuilders: [] as string[],
    lessonsLearning: [] as string[],
    lettingGo: [] as string[],
    carryingForward: [] as string[],
    throughline: '',
    nextYearIntention: '',
    letterToPastSelf: ''
  });

  const [currentInput, setCurrentInput] = useState('');
  const [showExport, setShowExport] = useState(false);

  const saveToSupabase = async () => {
    if (!userEmail) {
      setSaveError('enter your email to save');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const { error } = await supabase.from('reflections').insert({
        user_email: userEmail,
        name: data.name,
        year_start_state: data.yearStartState,
        year_end_state: data.yearEndState,
        wins: data.wins,
        surprises: data.surprises,
        struggles: data.struggles,
        shifts: data.shifts,
        unfinished: data.unfinished,
        definitions: data.definitions,
        defining_moments: data.definingMoments,
        momentum_builders: data.momentumBuilders,
        lessons_learning: data.lessonsLearning,
        letting_go: data.lettingGo,
        carrying_forward: data.carryingForward,
        throughline: data.throughline,
        next_year_intention: data.nextYearIntention,
        letter_to_past_self: data.letterToPastSelf
      });

      if (error) throw error;
      setSaved(true);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setSaveError('error saving: ' + errorMessage);
    }

    setSaving(false);
  };

  const updateData = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addToList = (key: keyof typeof data) => {
    if (currentInput.trim()) {
      setData(prev => ({
        ...prev,
        [key]: [...(prev[key] as string[]), currentInput.trim()]
      }));
      setCurrentInput('');
      setSaved(false);
    }
  };

  const removeFromList = (key: keyof typeof data, index: number) => {
    setData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((_, i) => i !== index)
    }));
    setSaved(false);
  };

  const addDefinition = (item: string, definition: string) => {
    setData(prev => ({
      ...prev,
      definitions: { ...prev.definitions, [item]: definition }
    }));
    setSaved(false);
  };

  const categorizeItem = (item: string, toKey: 'definingMoments' | 'momentumBuilders' | 'lessonsLearning' | null) => {
    setData(prev => {
      const newData = { ...prev };
      (['definingMoments', 'momentumBuilders', 'lessonsLearning'] as const).forEach(key => {
        newData[key] = newData[key].filter(i => i !== item);
      });
      if (toKey && !newData[toKey].includes(item)) {
        newData[toKey] = [...newData[toKey], item];
      }
      return newData;
    });
    setSaved(false);
  };

  const exportData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportObj = {
      exportDate: timestamp,
      year: 2025,
      email: userEmail,
      reflectionData: data
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-end-reflection-${timestamp}.json`;
    a.click();
  };

  const generatePrompt = () => {
    return `Here's my 2025 year-end reflection. Help me synthesize patterns:

**WHO I AM:** ${data.name}

**START OF 2025:** ${data.yearStartState}

**END OF 2025:** ${data.yearEndState}

**WINS (${data.wins.length}):**
${data.wins.map(w => `- ${w}`).join('\n')}

**SURPRISES (${data.surprises.length}):**
${data.surprises.map(s => `- ${s}`).join('\n')}

**STRUGGLES (${data.struggles.length}):**
${data.struggles.map(s => `- ${s}`).join('\n')}

**SHIFTS (${data.shifts.length}):**
${data.shifts.map(s => `- ${s}`).join('\n')}

**STILL SPINNING (${data.unfinished.length}):**
${data.unfinished.map(u => `- ${u}`).join('\n')}

**MY DEFINITIONS:**
${Object.entries(data.definitions).filter(([, v]) => v).map(([k, v]) => `- "${k}": ${v}`).join('\n')}

**CATEGORIZED:**
- Defining Moments: ${data.definingMoments.join(', ') || 'none'}
- Momentum Builders: ${data.momentumBuilders.join(', ') || 'none'}
- Still Learning: ${data.lessonsLearning.join(', ') || 'none'}

**CARRYING FORWARD:** ${data.carryingForward.join(', ') || 'not specified'}
**LETTING GO:** ${data.lettingGo.join(', ') || 'not specified'}

**MY THROUGHLINE:** ${data.throughline || 'not yet'}
**2026 INTENTION:** ${data.nextYearIntention || 'not yet'}

**LETTER TO PAST SELF:** ${data.letterToPastSelf || 'not written'}

---
Help me: 1) See patterns I missed 2) Clarify my throughline 3) Identify contradictions 4) Suggest my 2026 2.0`;
  };

  const allItems = [...data.wins, ...data.surprises, ...data.struggles, ...data.shifts, ...data.unfinished];

  const steps = [
    {
      title: "let's reflect on your year.",
      subtitle: "not just career — the whole picture.",
      content: (
        <div className="space-y-5">
          <p className="text-stone-500 leading-relaxed">
            this isn&apos;t a performance review. it&apos;s a chance to see patterns you might have missed, honor what you&apos;ve been through, and get clarity on what&apos;s next.
          </p>
          <p className="text-stone-500 leading-relaxed">
            we&apos;ll go <span className="text-stone-700 font-medium">braindump → define → categorize → synthesize</span>.
          </p>
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
            <p className="text-amber-700 text-sm">☕ grab your drink. this takes 20-30 min if you sit with it.</p>
          </div>
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-600 mb-2">what should we call you?</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateData('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-0 outline-none bg-white"
              placeholder="your name"
            />
          </div>
        </div>
      )
    },
    {
      title: `okay ${data.name || 'friend'}, set the scene.`,
      subtitle: "where were you at the start of 2025?",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">role, living situation, relationships, headspace. what was true then that isn&apos;t now?</p>
          <textarea
            value={data.yearStartState}
            onChange={(e) => updateData('yearStartState', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none min-h-28 resize-none bg-white"
            placeholder="at the start of 2025, i was..."
          />
          <div className="pt-2">
            <label className="block text-sm font-medium text-stone-600 mb-2">and now?</label>
            <textarea
              value={data.yearEndState}
              onChange={(e) => updateData('yearEndState', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none min-h-28 resize-none bg-white"
              placeholder="now, at the end of 2025..."
            />
          </div>
        </div>
      )
    },
    {
      title: "what are you proud of?",
      subtitle: "big or small. don't filter.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">promotion? boundary? friendship? kept a plant alive? all valid.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('wins')}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-400 outline-none bg-white"
              placeholder="type + enter"
            />
            <button onClick={() => addToList('wins')} className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">+</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data.wins.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                {item}<button onClick={() => removeFromList('wins', i)} className="hover:text-emerald-900">×</button>
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "what surprised you about yourself?",
      subtitle: "things you didn't expect to learn, feel, or do.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">handled something well? realized you wanted something different? said no (or yes)?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('surprises')}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-violet-400 outline-none bg-white"
              placeholder="type + enter"
            />
            <button onClick={() => addToList('surprises')} className="px-4 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600">+</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data.surprises.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm">
                {item}<button onClick={() => removeFromList('surprises', i)} className="hover:text-violet-900">×</button>
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "what was harder than expected?",
      subtitle: "the stuff that drained you or just plain sucked.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">grief, burnout, relationships, health, work politics, figuring out what you want — all counts.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('struggles')}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 outline-none bg-white"
              placeholder="type + enter"
            />
            <button onClick={() => addToList('struggles')} className="px-4 py-3 bg-rose-400 text-white rounded-xl hover:bg-rose-500">+</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data.struggles.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm">
                {item}<button onClick={() => removeFromList('struggles', i)} className="hover:text-rose-900">×</button>
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "what shifted in you?",
      subtitle: "beliefs, priorities, ways of seeing things.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">stopped caring about something? started valuing something new? changed your mind?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('shifts')}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-sky-400 outline-none bg-white"
              placeholder="type + enter"
            />
            <button onClick={() => addToList('shifts')} className="px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600">+</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data.shifts.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-sm">
                {item}<button onClick={() => removeFromList('shifts', i)} className="hover:text-sky-900">×</button>
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "what's still spinning?",
      subtitle: "not done processing or figuring out.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">unfinished business, decisions you&apos;re sitting with. this isn&apos;t failure — it&apos;s where you are.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToList('unfinished')}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 outline-none bg-white"
              placeholder="type + enter"
            />
            <button onClick={() => addToList('unfinished')} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600">+</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {data.unfinished.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm">
                {item}<button onClick={() => removeFromList('unfinished', i)} className="hover:text-amber-900">×</button>
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "let's get specific.",
      subtitle: "what do these mean to YOU?",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">pick the significant ones. not dictionary definitions — YOUR definitions.</p>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {allItems.slice(0, 6).map((item, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-3">
                <p className="font-medium text-stone-700 mb-2 text-sm">&quot;{item}&quot;</p>
                <textarea
                  value={data.definitions[item] || ''}
                  onChange={(e) => addDefinition(item, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-stone-400 outline-none text-sm resize-none bg-white"
                  placeholder="what does this really mean to you?"
                  rows={2}
                />
              </div>
            ))}
            {allItems.length === 0 && <p className="text-stone-400 text-center py-8">add items first!</p>}
          </div>
        </div>
      )
    },
    {
      title: "now let's sort.",
      subtitle: "tap items to categorize.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-indigo-50 rounded-xl p-3 min-h-24">
              <h4 className="font-medium text-indigo-800 text-xs mb-1">defining</h4>
              <p className="text-indigo-600 text-xs mb-2">changed trajectory</p>
              <div className="flex flex-wrap gap-1">
                {data.definingMoments.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{item.slice(0,12)}...</span>
                ))}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 min-h-24">
              <h4 className="font-medium text-emerald-800 text-xs mb-1">momentum</h4>
              <p className="text-emerald-600 text-xs mb-2">kept you going</p>
              <div className="flex flex-wrap gap-1">
                {data.momentumBuilders.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{item.slice(0,12)}...</span>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 min-h-24">
              <h4 className="font-medium text-orange-800 text-xs mb-1">learning</h4>
              <p className="text-orange-600 text-xs mb-2">not done yet</p>
              <div className="flex flex-wrap gap-1">
                {data.lessonsLearning.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{item.slice(0,12)}...</span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-stone-100 rounded-xl p-3">
            <p className="text-stone-500 text-xs mb-2">tap to sort:</p>
            <div className="flex flex-wrap gap-2">
              {allItems.filter(item => !data.definingMoments.includes(item) && !data.momentumBuilders.includes(item) && !data.lessonsLearning.includes(item)).map((item, i) => (
                <div key={i} className="relative group">
                  <span className="inline-block px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm cursor-pointer hover:border-stone-400">{item}</span>
                  <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex gap-1 bg-white shadow-lg rounded-lg p-1.5 z-10 border">
                    <button onClick={() => categorizeItem(item, 'definingMoments')} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">defining</button>
                    <button onClick={() => categorizeItem(item, 'momentumBuilders')} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">momentum</button>
                    <button onClick={() => categorizeItem(item, 'lessonsLearning')} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">learning</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "carry forward vs let go",
      subtitle: "what stays? what goes?",
      content: (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">carrying forward</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToList('carryingForward')}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-400 outline-none bg-white text-sm"
                placeholder="worth keeping"
              />
              <button onClick={() => addToList('carryingForward')} className="px-4 bg-emerald-500 text-white rounded-xl">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.carryingForward.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                  {item}<button onClick={() => removeFromList('carryingForward', i)}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">letting go</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentInput.trim()) {
                    setData(prev => ({ ...prev, lettingGo: [...prev.lettingGo, currentInput.trim()] }));
                    setCurrentInput('');
                    setSaved(false);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-400 outline-none bg-white text-sm"
                placeholder="releasing"
              />
              <button onClick={() => {
                if (currentInput.trim()) {
                  setData(prev => ({ ...prev, lettingGo: [...prev.lettingGo, currentInput.trim()] }));
                  setCurrentInput('');
                  setSaved(false);
                }
              }} className="px-4 bg-stone-400 text-white rounded-xl">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.lettingGo.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-sm line-through">
                  {item}<button onClick={() => removeFromList('lettingGo', i)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "find the throughline.",
      subtitle: "what's the thread connecting your year?",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-xl p-4">
            <p className="text-stone-600 text-sm">
              {data.wins.length} wins, {data.surprises.length} surprises, {data.struggles.length} struggles, {data.shifts.length} shifts, {data.unfinished.length} spinning — what&apos;s the story?
            </p>
          </div>
          <p className="text-stone-500 text-sm">not what you accomplished — what you became or moved toward.</p>
          <textarea
            value={data.throughline}
            onChange={(e) => updateData('throughline', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none min-h-24 resize-none bg-white"
            placeholder="2025 was the year i..."
          />
        </div>
      )
    },
    {
      title: "what's your 2.0 for 2026?",
      subtitle: "not resolutions. intentions.",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">what&apos;s the next version of you? doesn&apos;t have to be a goal — can be a way of being.</p>
          <textarea
            value={data.nextYearIntention}
            onChange={(e) => updateData('nextYearIntention', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none min-h-28 resize-none bg-white"
            placeholder="in 2026, i want to..."
          />
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3">
            <p className="text-amber-700 text-sm">💡 your 2.0 isn&apos;t becoming someone new — it&apos;s becoming more of who you already are.</p>
          </div>
        </div>
      )
    },
    {
      title: "last one.",
      subtitle: "what would you tell january-you?",
      content: (
        <div className="space-y-4">
          <p className="text-stone-500 text-sm">what did they need to hear? what would have saved them spinning?</p>
          <textarea
            value={data.letterToPastSelf}
            onChange={(e) => updateData('letterToPastSelf', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 outline-none min-h-36 resize-none bg-white"
            placeholder={`dear ${data.name || 'past me'},\n\n`}
          />
        </div>
      )
    },
    {
      title: `you did it, ${data.name || 'friend'}.`,
      subtitle: "here's your year.",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 rounded-xl p-5">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">throughline</p>
            <p className="text-stone-700 italic">&quot;{data.throughline || '...'}&quot;</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-600">{data.wins.length}</p>
              <p className="text-xs text-emerald-700">wins</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-indigo-600">{data.definingMoments.length}</p>
              <p className="text-xs text-indigo-700">defining</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-600">{data.unfinished.length}</p>
              <p className="text-xs text-amber-700">spinning</p>
            </div>
          </div>
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">2026 intention</p>
            <p className="text-stone-700 text-sm">{data.nextYearIntention || '...'}</p>
          </div>

          {/* Save to Supabase Section */}
          <div className="bg-violet-50 rounded-xl p-4 space-y-3">
            <p className="text-violet-800 text-sm font-medium">💾 save your reflection</p>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => { setUserEmail(e.target.value); setSaveError(''); }}
              placeholder="your email"
              className="w-full px-4 py-2.5 rounded-xl border border-violet-200 focus:border-violet-400 outline-none bg-white text-sm"
            />
            {saveError && <p className="text-rose-500 text-xs">{saveError}</p>}
            <button
              onClick={saveToSupabase}
              disabled={saving || saved}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              } ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? '💾 saving...' : saved ? '✓ saved!' : '💾 save to 2.0'}
            </button>
            {saved && <p className="text-emerald-600 text-xs text-center">reflection saved to your 2.0 account!</p>}
          </div>

          <div className="flex gap-2">
            <button onClick={exportData} className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900">
              📥 download
            </button>
            <button onClick={() => setShowExport(!showExport)} className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
              🤖 copy for AI
            </button>
          </div>
          {showExport && (
            <div className="bg-stone-900 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-400 text-xs">paste into claude</span>
                <button onClick={() => {navigator.clipboard.writeText(generatePrompt()); alert('Copied!');}} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">copy</button>
              </div>
              <pre className="text-emerald-400 font-mono text-xs overflow-auto max-h-32 whitespace-pre-wrap">{generatePrompt()}</pre>
            </div>
          )}
          <p className="text-stone-400 text-xs text-center">your data is yours. saved + exportable.</p>
        </div>
      )
    }
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-xs text-stone-400 tracking-widest uppercase">The 2.0 Collective</p>
        </div>
        <div className="mb-6">
          <div className="h-0.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-sky-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-stone-400 text-xs mt-1 text-right">{step + 1}/{steps.length}</p>
        </div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-800 mb-1">{current.title}</h1>
          <p className="text-stone-500 text-sm">{current.subtitle}</p>
        </div>
        <div className="mb-8">{current.content}</div>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-100 text-sm">back</button>
          )}
          {step < steps.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900">continue</button>
          )}
        </div>
        <div className="mt-12 pt-6 border-t border-stone-200 text-center">
          <p className="text-stone-400 text-xs">made by <span className="text-stone-500">the 2.0 collective</span></p>
        </div>
      </div>
    </div>
  );
}

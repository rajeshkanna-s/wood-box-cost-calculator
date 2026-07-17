import React, { useState, useEffect, useMemo } from 'react';
import { useBoxCalculator } from './hooks/useBoxCalculator';
import DimensionInputs from './components/BoxCalculator/DimensionInputs';
import RateInputs from './components/BoxCalculator/RateInputs';
import PartsTable from './components/BoxCalculator/PartsTable';
import CostSummary from './components/BoxCalculator/CostSummary';
import ClientQuoteOptions from './components/BoxCalculator/ClientQuoteOptions';
import ClientQuoteSheet from './components/BoxCalculator/ClientQuoteSheet';
import QuoteSheet from './components/BoxCalculator/QuoteSheet';
import PresetSelector from './components/BoxPresets/PresetSelector';
import ClientPresetsCalculator from './components/BoxCalculator/ClientPresetsCalculator';
import QuotePreviewModal from './components/BoxCalculator/QuotePreviewModal';
import { CLIENT_PRESETS } from './engine/clientPresets';
import { supabase } from './engine/supabaseClient';
import { PRODUCT_PRESETS } from './engine/boxTypes';

const DEFAULT_CLIENT_QUOTE_OPTIONS = {
  showParts: false,
  showCftSummary: false,
  showCostBreakdown: false,
  showWaste: false,
  showProfit: false,
};

export default function App() {
  const {
    activeTab,
    setActiveTab,
    dims,
    rates,
    parts,
    result,
    updateDim,
    updateRate,
    changeUnit,
    loadPreset,
    updatePart,
    addCustomPart,
    removePart,
    togglePartExclusion,
    resetParts,
    loadSavedState
  } = useBoxCalculator();

  const [isDark, setIsDark] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [isClientQuoteOpen, setIsClientQuoteOpen] = useState(false);
  const [clientQuoteOptions, setClientQuoteOptions] = useState(DEFAULT_CLIENT_QUOTE_OPTIONS);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('detailed');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [companies, setCompanies] = useState([]);
  const [customPresets, setCustomPresets] = useState([]);
  const [saveStatus, setSaveStatus] = useState('synced'); // 'synced', 'saving', 'loading', 'local'
  const [activePresetId, setActivePresetId] = useState('');

  // Settings & configuration state variables
  const [currentView, setCurrentView] = useState('calculator');
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [editingCompanyName, setEditingCompanyName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [settingsPresetTab, setSettingsPresetTab] = useState('pine-wood-box');
  const [settingsPresets, setSettingsPresets] = useState([]);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetL, setNewPresetL] = useState('');
  const [newPresetW, setNewPresetW] = useState('');
  const [newPresetH, setNewPresetH] = useState('');
  const [newPresetTh, setNewPresetTh] = useState('');
  const [newPresetUnit, setNewPresetUnit] = useState('mm');
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [editingPreset, setEditingPreset] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  const finalClientName = companies.find(c => c.id === selectedCompanyId)?.name || '';

  // Load companies (clients) on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCompanies(data);
          // Auto-select Motherson 3 or first client
          const initialCompany = data.find(c => c.name.includes('Motherson')) || data[0];
          setSelectedCompanyId(initialCompany.id);
        } else {
          const fallback = CLIENT_PRESETS.map((c) => ({ id: c.id, name: c.companyName }));
          setCompanies(fallback);
          setSelectedCompanyId(fallback[0]?.id || '');
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        const fallback = CLIENT_PRESETS.map((c) => ({ id: c.id, name: c.companyName }));
        setCompanies(fallback);
        setSelectedCompanyId(fallback[0]?.id || '');
        setSaveStatus('local');
      }
    }
    loadCompanies();
  }, []);

  // Load custom preset sizes from DB when activeTab changes
  useEffect(() => {
    async function loadCustomPresets() {
      try {
        const { data, error } = await supabase
          .from('preset_sizes')
          .select('*')
          .eq('product_type', activeTab)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setCustomPresets(data || []);
        
        if (data && data.length > 0) {
          setActivePresetId(data[0].id);
        } else {
          setActivePresetId('');
        }
      } catch (err) {
        console.error('Error fetching custom presets:', err);
        setCustomPresets([]);
        setActivePresetId('');
      }
    }
    loadCustomPresets();
  }, [activeTab]);

  // Preset sizes loaded from DB
  const mergedPresets = useMemo(() => {
    return customPresets;
  }, [customPresets]);

  // Selected preset object
  const selectedPreset = useMemo(() => {
    return mergedPresets.find(p => p.id === activePresetId);
  }, [activePresetId, mergedPresets]);

  // Load calculations when selected company or selected preset size changes
  useEffect(() => {
    if (!selectedCompanyId || !activePresetId || !selectedPreset) {
      return;
    }

    async function loadSavedCalculation() {
      try {
        setSaveStatus('loading');
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('company_id', selectedCompanyId)
          .eq('preset_size_id', activePresetId)
          .eq('product_type', activeTab)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const targetUnit = selectedPreset.unit || 'in';
          const savedDims = {
            unit: targetUnit,
            l: selectedPreset.l,
            w: selectedPreset.w,
            h: selectedPreset.h,
            th: selectedPreset.th || undefined
          };
          loadSavedState(savedDims, data.rates, data.parts);
          setSaveStatus('synced');
        } else {
          // No saved calculation, load defaults for this preset
          loadPreset(selectedPreset);
          setSaveStatus('synced');
        }
      } catch (err) {
        console.error('Error loading calculation:', err);
        setSaveStatus('local');
      }
    }

    loadSavedCalculation();
  }, [selectedCompanyId, activePresetId, activeTab]);

  // Auto-save logic
  useEffect(() => {
    if (!selectedCompanyId || !activePresetId || !selectedPreset || saveStatus === 'loading') {
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('calculations')
          .upsert({
            company_id: selectedCompanyId,
            preset_size_id: activePresetId,
            product_type: activeTab,
            rates: rates,
            parts: parts
          }, { onConflict: 'company_id, preset_size_id, product_type' });

        if (error) throw error;
        setSaveStatus('synced');
      } catch (err) {
        console.error('Error auto-saving calculation:', err);
        setSaveStatus('local');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [rates, parts, selectedCompanyId, activePresetId]);

  const addNewClient = async () => {
    const name = window.prompt("Enter new client/company name:");
    if (!name || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCompanyId(data.id);
      }
    } catch (err) {
      console.error('Error adding new company:', err);
      alert('Failed to add client: ' + err.message);
    }
  };

  const updateClientName = async (id, newName) => {
    if (!newName || !newName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ name: newName.trim() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setCompanies(prev => prev.map(c => c.id === id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
        setEditingCompanyId(null);
      }
    } catch (err) {
      console.error('Error updating company name:', err);
      alert('Failed to update client name: ' + err.message);
    }
  };

  const deleteClient = async (id) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (selectedCompanyId === id) {
        setSelectedCompanyId(companies.find(c => c.id !== id)?.id || '');
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Failed to delete client. It may have dependent calculations.');
    }
  };

  const loadSettingsPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .select('*')
        .eq('product_type', settingsPresetTab)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setSettingsPresets(data || []);
      
      // Sync back to customPresets if this is the active tab
      if (settingsPresetTab === activeTab) {
        setCustomPresets(data || []);
      }
    } catch (err) {
      console.error('Error loading settings presets:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'settings') {
      loadSettingsPresets();
    }
  }, [settingsPresetTab, currentView]);

  const loadCustomPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .select('*')
        .eq('product_type', activeTab)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setCustomPresets(data || []);
    } catch (err) {
      console.error('Error fetching custom presets:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'calculator') {
      loadCustomPresets();
    }
  }, [currentView]);

  const addPresetSizeSettings = async (presetData) => {
    if (!presetData.label || !presetData.label.trim()) {
      alert('Label is required');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .insert({
          label: presetData.label.trim(),
          l: Number(presetData.l) || 0,
          w: Number(presetData.w) || 0,
          h: Number(presetData.h) || 0,
          th: presetData.th ? Number(presetData.th) : null,
          unit: presetData.unit || 'mm',
          product_type: presetData.product_type
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setNewPresetLabel('');
        setNewPresetL('');
        setNewPresetW('');
        setNewPresetH('');
        setNewPresetTh('');
        await loadSettingsPresets();
      }
    } catch (err) {
      console.error('Error adding preset size:', err);
      alert('Failed to add preset size: ' + err.message);
    }
  };

  const updatePresetSize = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .update({
          label: updatedData.label.trim(),
          l: Number(updatedData.l) || 0,
          w: Number(updatedData.w) || 0,
          h: Number(updatedData.h) || 0,
          th: updatedData.th ? Number(updatedData.th) : null,
          unit: updatedData.unit || 'mm'
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        await loadSettingsPresets();
        setEditingPresetId(null);
      }
    } catch (err) {
      console.error('Error updating preset size:', err);
      alert('Failed to update preset size: ' + err.message);
    }
  };

  const deletePresetSize = async (id) => {
    try {
      const { error } = await supabase
        .from('preset_sizes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadSettingsPresets();
      if (activePresetId === id) {
        setActivePresetId('');
      }
    } catch (err) {
      console.error('Error deleting preset size:', err);
      alert('Failed to delete preset size: ' + err.message);
    }
  };

  const saveCurrentSizeAsPreset = async () => {
    const defaultLabel = `${dims.l} × ${dims.w} × ${dims.h} ${dims.unit}`;
    const label = window.prompt("Enter a label for this preset size:", defaultLabel);
    if (!label) return;

    try {
      const { data, error } = await supabase
        .from('preset_sizes')
        .insert({
          label: label.trim(),
          l: dims.l,
          w: dims.w,
          h: dims.h,
          unit: dims.unit,
          th: dims.th || null,
          product_type: activeTab
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCustomPresets(prev => [...prev, data]);
        setActivePresetId(data.id);
        loadPreset(data);
      }
    } catch (err) {
      console.error('Error saving custom preset size:', err);
      alert('Failed to save preset size: ' + err.message);
    }
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'synced':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20" title="All edits successfully saved to Supabase DB.">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Synced
          </div>
        );
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Saving...
          </div>
        );
      case 'loading':
        return (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Loading DB Config...
          </div>
        );
      case 'local':
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20" title="Changes are kept locally in browser memory. Connect to internet to sync.">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Local Cache Only
          </div>
        );
    }
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const openPreview = (mode) => {
    setPreviewMode(mode);
    setIsPreviewOpen(true);
  };

  const printQuote = (mode) => {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      // 500ms allows the browser to layout and decode any large logo/image before printing
      window.setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 500);
    });
  };

  const downloadPDF = async (mode) => {
    const quoteStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTotal = Math.round(result.finalTotal || 0);
    const filename = mode === 'client'
      ? `Elshaddai_Client_Quote_EWP-${quoteStamp}-${cleanTotal}.pdf`
      : `Elshaddai_Detailed_Quote_EWP-${quoteStamp}-${cleanTotal}.pdf`;

    const viewport = document.querySelector('.preview-document-viewport');
    const liveSheet = viewport
      ? viewport.querySelector('.quote-sheet')
      : document.getElementById(mode === 'client' ? 'quote-sheet-client' : 'quote-sheet-detailed');
    if (!liveSheet) return;

    // Create off-screen wrapper
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.style.height = '1120px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.zIndex = '-9999';
    wrapper.style.pointerEvents = 'none';

    const container = document.createElement('div');
    container.style.width = '794px';
    container.style.height = '1120px';
    container.style.background = '#ffffff';
    container.style.boxSizing = 'border-box';
    container.style.position = 'relative';

    const clone = liveSheet.cloneNode(true);
    clone.style.cssText = `
      display: flex !important;
      flex-direction: column !important;
      width: 794px !important;
      height: 1120px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #334155 !important;
      padding: 16px 24px !important;
      font-family: 'Inter', Arial, sans-serif !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    `;

    // Fix gradient text for html2canvas
    clone.querySelectorAll('.brand-ewp-text, .quote-ewp-title').forEach((el) => {
      el.style.setProperty('background', 'none', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('webkit-background-clip', 'initial', 'important');
      el.style.setProperty('background-clip', 'initial', 'important');
      el.style.setProperty('webkit-text-fill-color', '#113f67', 'important');
      el.style.setProperty('color', '#113f67', 'important');
    });
    clone.querySelectorAll('.text-gradient').forEach((el) => {
      el.style.setProperty('background', 'none', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('webkit-background-clip', 'initial', 'important');
      el.style.setProperty('background-clip', 'initial', 'important');
      el.style.setProperty('webkit-text-fill-color', '#0064DC', 'important');
      el.style.setProperty('color', '#0064DC', 'important');
    });

    container.appendChild(clone);
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const html2pdfModule = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1120
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdfModule().from(container).set(opt).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const updateClientQuoteOption = (key, value) => {
    setClientQuoteOptions((current) => ({ ...current, [key]: value }));
  };

  const renderConfirmDeleteModal = () => {
    if (!confirmDeleteModal) return null;
    const isCompany = confirmDeleteModal.type === 'company';
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
        <div 
          className="glass-card max-w-sm w-full p-6 space-y-6 shadow-2xl border animate-slide-up"
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'var(--card-bg)' }}
        >
          <div className="flex items-center gap-3 text-red-500">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Confirm Deletion</h3>
          </div>
          
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-main)' }}>
            Are you sure you want to delete the {isCompany ? 'client' : 'preset size'} <strong className="text-red-400">"{confirmDeleteModal.name}"</strong>? 
            {isCompany && " All calculations saved under this client will also be permanently deleted."} This action cannot be undone.
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setConfirmDeleteModal(null)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                const { id } = confirmDeleteModal;
                if (isCompany) {
                  await deleteClient(id);
                } else {
                  await deletePresetSize(id);
                }
                setConfirmDeleteModal(null);
              }}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white border-none shadow-red-500/20 text-xs px-4 py-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="space-y-6 no-print">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 glass-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('calculator')}
              className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ height: '36px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Calculator
            </button>
            <h2 className="text-xl font-bold tracking-tight text-gradient" style={{ margin: 0 }}>
              Settings & Configuration
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-500/10 px-2 py-1 rounded-md border border-slate-500/20">
            Database Settings
          </span>
        </div>

        {/* Split grid for Client List and Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          
          {/* CLIENT LIST SECTION */}
          <div className="glass-card p-5 flex flex-col space-y-4">
            <div className="border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-base font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                Client / Company List
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Manage active billing clients. Renaming or deleting will sync in real-time.</p>
            </div>

            {/* Add client form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter client name..."
                className="premium-input flex-1 text-sm text-left"
                style={{ textAlign: 'left', height: '36px' }}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newCompanyName || !newCompanyName.trim()) return;
                  try {
                    const { data, error } = await supabase
                      .from('companies')
                      .insert({ name: newCompanyName.trim() })
                      .select()
                      .single();

                    if (error) throw error;
                    if (data) {
                      setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
                      setNewCompanyName('');
                    }
                  } catch (err) {
                    console.error('Error adding client:', err);
                    alert('Failed to add client: ' + err.message);
                  }
                }}
                className="btn-primary py-2 px-4 shrink-0 text-xs font-bold uppercase tracking-wider"
                style={{ height: '36px' }}
              >
                + Add Client
              </button>
            </div>

            {/* List of clients */}
            <div className="overflow-y-auto pr-1" style={{ maxHeight: '400px' }}>
              <div className="space-y-2">
                {companies.map((c) => {
                  const isEditing = editingCompanyId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all"
                      style={{ 
                        background: 'var(--card-inner-bg)', 
                        borderColor: isEditing ? 'var(--accent-blue)' : 'var(--card-border)' 
                      }}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editingCompanyName}
                            onChange={(e) => setEditingCompanyName(e.target.value)}
                            className="premium-input flex-1 text-sm text-left py-1"
                            style={{ textAlign: 'left', height: '32px' }}
                          />
                          <button
                            type="button"
                            onClick={() => updateClientName(c.id, editingCompanyName)}
                            className="btn-primary text-xs py-1 px-3"
                            style={{ height: '32px' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCompanyId(null)}
                            className="btn-secondary text-xs py-1 px-3"
                            style={{ height: '32px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                            {c.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCompanyId(c.id);
                                setEditingCompanyName(c.name);
                              }}
                              className="text-slate-400 hover:text-blue-500 p-1.5 rounded transition-colors"
                              title="Edit Client Name"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteModal({ type: 'company', id: c.id, name: c.name })}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                              title="Delete Client"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {companies.length === 0 && (
                  <p className="text-center text-slate-500 text-xs py-8">No clients loaded. Add one above.</p>
                )}
              </div>
            </div>
          </div>

          {/* PRESETS LIST SECTION */}
          <div className="glass-card p-5 flex flex-col space-y-4">
            <div className="border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-base font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                Preset Sizes Registry
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Manage reusable dimension profiles. Grouped by product calculator tab.</p>
            </div>

            {/* Tab selector within Settings */}
            <div className="flex justify-center border-b pb-2" style={{ borderColor: 'var(--table-border)' }}>
              <div className="flex flex-wrap gap-1.5 justify-center bg-slate-500/5 p-1 rounded-xl w-full">
                {[
                  { id: 'pine-wood-box', label: 'PINE BOX' },
                  { id: 'ply-wood-pallet', label: 'PLY PALLET' },
                  { id: 'pine-wood-pallet', label: 'PINE PALLET' },
                  { id: 'pine-plywood-box', label: 'PINE PLY BOX' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSettingsPresetTab(t.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors ${settingsPresetTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add preset form */}
            <div className="bg-slate-500/5 p-3 rounded-xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Add New Size Preset</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. 1200x800)"
                  value={newPresetLabel}
                  onChange={e => setNewPresetLabel(e.target.value)}
                  className="premium-input text-xs text-left"
                  style={{ textAlign: 'left', padding: '4px 8px' }}
                />
                <input
                  type="number"
                  placeholder="Length"
                  value={newPresetL}
                  onChange={e => setNewPresetL(e.target.value)}
                  className="premium-input text-xs text-center"
                  style={{ padding: '4px 8px' }}
                />
                <input
                  type="number"
                  placeholder="Width"
                  value={newPresetW}
                  onChange={e => setNewPresetW(e.target.value)}
                  className="premium-input text-xs text-center"
                  style={{ padding: '4px 8px' }}
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={newPresetH}
                  onChange={e => setNewPresetH(e.target.value)}
                  className="premium-input text-xs text-center"
                  style={{ padding: '4px 8px' }}
                />
                <input
                  type="number"
                  placeholder="Thickness (Opt)"
                  value={newPresetTh}
                  onChange={e => setNewPresetTh(e.target.value)}
                  className="premium-input text-xs text-center"
                  style={{ padding: '4px 8px' }}
                />
                <select
                  value={newPresetUnit}
                  onChange={e => setNewPresetUnit(e.target.value)}
                  className="premium-select text-xs"
                  style={{ padding: '4px 8px', height: '30px' }}
                >
                  <option value="in">inch (in)</option>
                  <option value="mm">mm</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  addPresetSizeSettings({
                    label: newPresetLabel,
                    l: newPresetL,
                    w: newPresetW,
                    h: newPresetH,
                    th: newPresetTh,
                    unit: newPresetUnit,
                    product_type: settingsPresetTab
                  });
                }}
                className="btn-primary w-full text-xs font-bold uppercase tracking-wider py-1.5"
              >
                + Add Preset Size
              </button>
            </div>

            {/* List of presets */}
            <div className="overflow-y-auto pr-1 flex-1" style={{ maxHeight: '300px' }}>
              <div className="space-y-2">
                {settingsPresets.map((p) => {
                  const isEditing = editingPresetId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border transition-all"
                      style={{ 
                        background: 'var(--card-inner-bg)', 
                        borderColor: isEditing ? 'var(--accent-blue)' : 'var(--card-border)' 
                      }}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editingPreset.label}
                              onChange={e => setEditingPreset(prev => ({ ...prev, label: e.target.value }))}
                              placeholder="Label"
                              className="premium-input text-xs text-left"
                              style={{ textAlign: 'left' }}
                            />
                            <select
                              value={editingPreset.unit}
                              onChange={e => setEditingPreset(prev => ({ ...prev, unit: e.target.value }))}
                              className="premium-select text-xs"
                              style={{ height: '30px' }}
                            >
                              <option value="in">in</option>
                              <option value="mm">mm</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="number"
                              value={editingPreset.l}
                              onChange={e => setEditingPreset(prev => ({ ...prev, l: e.target.value }))}
                              placeholder="L"
                              className="premium-input text-xs text-center"
                            />
                            <input
                              type="number"
                              value={editingPreset.w}
                              onChange={e => setEditingPreset(prev => ({ ...prev, w: e.target.value }))}
                              placeholder="W"
                              className="premium-input text-xs text-center"
                            />
                            <input
                              type="number"
                              value={editingPreset.h}
                              onChange={e => setEditingPreset(prev => ({ ...prev, h: e.target.value }))}
                              placeholder="H"
                              className="premium-input text-xs text-center"
                            />
                            <input
                              type="number"
                              value={editingPreset.th || ''}
                              onChange={e => setEditingPreset(prev => ({ ...prev, th: e.target.value }))}
                              placeholder="Th"
                              className="premium-input text-xs text-center"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => updatePresetSize(p.id, editingPreset)}
                              className="btn-primary text-xs py-1 px-3"
                              style={{ height: '30px' }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPresetId(null)}
                              className="btn-secondary text-xs py-1 px-3"
                              style={{ height: '30px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold block" style={{ color: 'var(--text-main)' }}>
                              {p.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              L: {p.l} x W: {p.w} x H: {p.h} {p.th ? `x Th: ${p.th}` : ''} ({p.unit})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPresetId(p.id);
                                setEditingPreset({ ...p });
                              }}
                              className="text-slate-400 hover:text-blue-500 p-1.5 rounded transition-colors"
                              title="Edit Preset"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteModal({ type: 'preset', id: p.id, name: p.label })}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                              title="Delete Preset"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {settingsPresets.length === 0 && (
                  <p className="text-center text-slate-500 text-xs py-8">No custom preset sizes found for this product. Add one above.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-root min-h-screen hero-gradient py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="screen-calculator max-w-5xl mx-auto">
        {currentView === 'settings' ? (
          <>
            {renderSettingsView()}
            {renderConfirmDeleteModal()}
          </>
        ) : (
          <>
            <header className="mb-10 animate-fade-in relative">
          <div className="absolute top-0 right-0 flex items-center gap-2.5">
            {currentView === 'calculator' && (
              <button
                onClick={() => setCurrentView('settings')}
                className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-transparent hover:border-gray-300/30 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--card-inner-bg)', color: 'var(--text-main)' }}
                title="Settings & Configurations"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={() => setIsDark(!isDark)}
              className="inline-flex items-center gap-1.5 p-2 rounded-lg border border-transparent hover:border-gray-300/30 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--card-inner-bg)', color: 'var(--text-main)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.07 6.07-1.42-1.42M7.35 7.35 5.93 5.93m12.14 0-1.42 1.42M7.35 16.65l-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <img
              src="/elshaddailogo.png"
              alt="Elshaddai Wood Packing Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="hidden sm:block h-12 w-px bg-blue-600/30 dark:bg-slate-700" />
            <div className="flex flex-col items-start justify-center">
              <span className="brand-ewp-text text-4xl sm:text-5xl mb-1">EWP</span>
              <h1 className="brand-company-text text-sm sm:text-base tracking-widest uppercase">
                ELSHADDAI WOOD PACKING
              </h1>
            </div>
          </div>

          <div className="glow-line mt-6 print:hidden" />

          {/* Tab Navigation Segmented Control */}
          <div className="flex justify-center mt-6 no-print">
            <div className="tab-navigation-bar flex flex-wrap gap-2 justify-center bg-transparent border-none">
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-wood-box' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-wood-box')}
              >
                PINE WOOD BOX
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'ply-wood-pallet' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('ply-wood-pallet')}
              >
                PLY WOOD PALLET
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-wood-pallet' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-wood-pallet')}
              >
                PINE WOOD PALLET
              </button>
              <button
                className={`tab-navigation-btn ${activeTab === 'pine-plywood-box' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('pine-plywood-box')}
              >
                PINE PLYWOOD BOX
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="glass-card p-5 animate-slide-up no-print" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-4xl">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="section-icon shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <label htmlFor="company-select" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    Client / Company Name:
                  </label>
                </div>
                <div className="flex gap-2 w-full" style={{ maxWidth: '650px' }}>
                  <select
                    id="company-select"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="premium-select flex-1 text-sm font-medium"
                    style={{ 
                      background: 'var(--card-inner-bg)', 
                      color: 'var(--text-main)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '8px', 
                      padding: '10px 14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addNewClient}
                    className="btn-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-wider shrink-0"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    + Add Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Layout Grid for Inputs (Dimensions & Rates) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.12s', animationFillMode: 'both' }}>
              <DimensionInputs
                dims={dims}
                onChange={updateDim}
                onUnitChange={changeUnit}
                showPresetSelector={true}
                onSelectPreset={loadPreset}
                isPlywood={activeTab === 'ply-wood-pallet' || activeTab === 'pine-plywood-box'}
                type={activeTab}
                customPresetSelector={
                  <div className="flex gap-2 w-full">
                    <select
                      id="preset-select"
                      value={activePresetId}
                      onChange={(e) => {
                        setActivePresetId(e.target.value);
                        const selected = mergedPresets.find(p => p.id === e.target.value);
                        if (selected) loadPreset(selected);
                      }}
                      className="premium-select flex-1 text-xs"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', height: '32px' }}
                    >
                      <option value="" disabled>Choose a preset size...</option>
                      {mergedPresets.map(preset => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={saveCurrentSizeAsPreset}
                      className="btn-secondary px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider shrink-0"
                      style={{ height: '32px', display: 'flex', alignItems: 'center' }}
                      title="Save current dimensions as a reusable preset"
                    >
                      + Add Size
                    </button>
                  </div>
                }
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <RateInputs 
                rates={rates} 
                onChange={updateRate} 
                type={activeTab} 
              />
            </div>
          </div>

          {/* Parts Breakdown */}
          <div className="animate-slide-up no-print" style={{ animationDelay: '0.18s', animationFillMode: 'both' }}>
            <PartsTable
              parts={parts}
              result={result}
              rates={rates}
              dims={dims}
              onUpdatePart={updatePart}
              onAddPart={addCustomPart}
              onRemovePart={removePart}
              onToggleExclusion={togglePartExclusion}
              type={activeTab}
            />
          </div>

          {/* Cost Summary */}
          <div className="animate-slide-up" style={{ animationDelay: '0.24s', animationFillMode: 'both' }}>
            <CostSummary
              result={result}
              rates={rates}
              onPrintQuote={() => printQuote(printMode || 'detailed')}
              onDownloadPDF={() => openPreview('detailed')}
              onOpenClientQuote={() => {
                setPrintMode('client');
                setIsClientQuoteOpen(true);
              }}
            />
          </div>
        </div>

        <footer className="mt-12 pb-6 text-center no-print">
          <div className="glow-line mb-6" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 Elshaddai Wood Packing. All Rights Reserved.
          </p>
        </footer>
          </>
        )}
      </div>

      <ClientQuoteOptions
        isOpen={isClientQuoteOpen}
        options={clientQuoteOptions}
        onChange={updateClientQuoteOption}
        onClose={() => setIsClientQuoteOpen(false)}
        onPrint={() => {
          setIsClientQuoteOpen(false);
          printQuote('client');
        }}
        onDownloadPDF={() => {
          setIsClientQuoteOpen(false);
          openPreview('client');
        }}
      />
      
      {/* Printable / Export Quote Sheets */}
      <QuoteSheet
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        active={printMode === 'detailed'}
        type={activeTab}
      />
      <ClientQuoteSheet
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        options={clientQuoteOptions}
        active={printMode === 'client'}
        type={activeTab}
      />
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        mode={previewMode}
        dims={dims}
        rates={rates}
        result={result}
        clientName={finalClientName}
        options={clientQuoteOptions}
        onClose={() => {
          setIsPreviewOpen(false);
        }}
        onPrint={() => {
          printQuote(previewMode);
          setIsPreviewOpen(false);
        }}
        onDownload={() => {
          downloadPDF(previewMode);
          setIsPreviewOpen(false);
        }}
        type={activeTab}
      />
    </div>
  );
}


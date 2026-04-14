'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NotebookPen, X, Bold, Italic, Underline, Type,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Trash2, Save, Plus, ChevronLeft, List,
  CheckSquare, Clock, FileText, Minus
} from 'lucide-react';
import { saveAppConfigAction, getAppConfigAction } from '@/app/actions/app-config-actions';
import { LocalDB, isAdminUser } from '@/lib/local-db';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ── Cores das notas (sticky note style) ──────────────────────────────────────
const NOTE_COLORS = [
  { bg: '#fef9c3', border: '#fde047', label: 'Amarelo' },
  { bg: '#dcfce7', border: '#86efac', label: 'Verde' },
  { bg: '#dbeafe', border: '#93c5fd', label: 'Azul' },
  { bg: '#fce7f3', border: '#f9a8d4', label: 'Rosa' },
  { bg: '#ede9fe', border: '#c4b5fd', label: 'Roxo' },
  { bg: '#fee2e2', border: '#fca5a5', label: 'Vermelho' },
  { bg: '#fff7ed', border: '#fdba74', label: 'Laranja' },
  { bg: '#f1f5f9', border: '#cbd5e1', label: 'Cinza' },
];

// ── Cores de texto ────────────────────────────────────────────────────────────
const TEXT_COLORS = [
  '#111827', '#6b7280', '#2563eb', '#7c3aed',
  '#db2777', '#dc2626', '#ea580c', '#16a34a',
];

// ── Utilitários ───────────────────────────────────────────────────────────────
const newNote = (): Note => ({
  id: Date.now().toString(),
  title: 'Nova Nota',
  content: '',
  color: NOTE_COLORS[0].bg,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const loadNotes = (raw: string): Note[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // legado: era string simples
    if (raw.trim()) return [{ ...newNote(), title: 'Nota importada', content: raw }];
    return [];
  }
};

// ── Botão de ferramenta ───────────────────────────────────────────────────────
const ToolBtn = ({
  onClick, active, title, children, danger
}: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; danger?: boolean;
}) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    style={{ cursor: 'pointer' }}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-sm font-bold border-2
      ${active
        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-95'
        : danger
        ? 'text-red-400 border-transparent hover:bg-red-50 hover:border-red-300'
        : 'text-gray-600 border-transparent hover:bg-white hover:border-gray-300 hover:shadow-sm'}`}
  >
    {children}
  </button>
);

// ── Componente principal ──────────────────────────────────────────────────────
export const GodHandPanel = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen]         = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [view, setView]             = useState<'list' | 'edit'>('list');
  const [notes, setNotes]           = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saveError, setSaveError]   = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showNoteColors, setShowNoteColors] = useState(false);
  const [activeColor, setActiveColor]   = useState('#111827');
  const [formatState, setFormatState] = useState({
    bold: false, italic: false, underline: false,
    justifyLeft: true, justifyCenter: false, justifyRight: false, justifyFull: false,
  });

  // Detecção de admin
  useEffect(() => {
    const user = LocalDB.getUser();
    const ok = isAdminUser(user)
      || user?.emailAddress?.toLowerCase() === 'admin@maryland.com';
    setIsAdmin(ok);
  }, []);

  // Carrega notas do banco ao montar (badge de contagem aparece logo)
  useEffect(() => {
    getAppConfigAction().then(cfg => {
      setNotes(loadNotes(cfg.adminNote));
    });
  }, []);

  // Recarrega quando reabre o painel (pega eventuais mudanças externas)
  useEffect(() => {
    if (!isOpen) return;
    getAppConfigAction().then(cfg => {
      setNotes(loadNotes(cfg.adminNote));
    });
  }, [isOpen]);

  // Detecta estado de formatação ao mover cursor
  useEffect(() => {
    const HEADING_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    const isInsideHeading = (): boolean => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return false;
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            HEADING_TAGS.includes((node as Element).tagName)) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    const handleSelection = () => {
      const inHeading = isInsideHeading();
      setFormatState({
        // Headings são bold por padrão no browser — ignora esse falso positivo
        bold:          inHeading ? false : document.queryCommandState('bold'),
        italic:        document.queryCommandState('italic'),
        underline:     document.queryCommandState('underline'),
        justifyLeft:   document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight:  document.queryCommandState('justifyRight'),
        justifyFull:   document.queryCommandState('justifyFull'),
      });
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);


  // Injeta conteúdo no editor apenas ao ABRIR a nota (não a cada mudança de título)
  const lastLoadedNoteId = useRef<string | null>(null);
  useEffect(() => {
    if (view === 'edit' && activeNote && editorRef.current) {
      // Só reinjecta HTML se for uma nota diferente da que está carregada
      if (lastLoadedNoteId.current !== activeNote.id) {
        editorRef.current.innerHTML = activeNote.content;
        lastLoadedNoteId.current = activeNote.id;
        // Foca o editor só na abertura inicial da nota
        editorRef.current.focus();
      }
    }
    if (view === 'list') {
      lastLoadedNoteId.current = null;
    }
  }, [view, activeNote?.id]); // depende só do ID, não do objeto inteiro

  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? '');
  }, []);

  const insertChecklist = useCallback(() => {
    const id = `chk-${Date.now()}`;
    execCmd('insertHTML',
      `<label style="display:flex;align-items:center;gap:6px;margin:2px 0;cursor:pointer">
        <input type="checkbox" id="${id}" style="width:14px;height:14px;accent-color:#4f46e5;cursor:pointer"/>
        <span>Item da lista</span>
      </label><br/>`
    );
  }, [execCmd]);

  const saveNotes = async (updatedNotes: Note[]) => {
    setIsSaving(true);
    setSaveError(false);
    const result = await saveAppConfigAction({ adminNote: JSON.stringify(updatedNotes) });
    setIsSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
      console.error('[Bloco de Notas] Falha ao salvar:', result.error);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    const html = editorRef.current?.innerHTML ?? '';
    const updated = { ...activeNote, content: html, updatedAt: new Date().toISOString() };
    const updatedNotes = notes.map(n => n.id === updated.id ? updated : n);
    setNotes(updatedNotes);
    setActiveNote(updated);
    await saveNotes(updatedNotes);
  };

  const handleCreateNote = async () => {
    const note = newNote();
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setActiveNote(note);
    setView('edit');
    // Persiste a nota vazia imediatamente para não perder ao fechar
    await saveAppConfigAction({ adminNote: JSON.stringify(updatedNotes) });
  };

  const handleOpenNote = (note: Note) => {
    setActiveNote(note);
    setView('edit');
  };

  const handleDeleteNote = async (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    if (activeNote?.id === id) { setView('list'); setActiveNote(null); }
    await saveNotes(updatedNotes);
  };

  const handleChangeNoteColor = (color: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, color };
    const updatedNotes = notes.map(n => n.id === updated.id ? updated : n);
    setNotes(updatedNotes);
    setActiveNote(updated);
    setShowNoteColors(false);
  };

  const applyTextColor = (color: string) => {
    setActiveColor(color);
    setShowColors(false);
    execCmd('foreColor', color);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, title: e.target.value };
    setActiveNote(updated);
    setNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (!isAdmin) return null;

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 100, zIndex: 99999 }}>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: -1600, right: 400, top: -900, bottom: 200 }}
        style={{ touchAction: 'none', cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing' }}
      >

        {/* ── Botão fechado ── */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            onPointerDown={e => e.stopPropagation()}
            title="Bloco de Notas"
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #6d28d9)', border: '3px solid white', cursor: 'pointer' }}
          >
            <NotebookPen size={22} className="text-white" />
            {notes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white text-[10px] font-black text-gray-900 flex items-center justify-center">
                {notes.length}
              </span>
            )}
          </button>
        )}

        {/* ── Painel aberto ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              className="flex flex-col shadow-2xl"
              style={{ width: 340, height: '75vh', maxHeight: '75vh', background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', cursor: 'grab' }}
            >
              {/* ── HEADER — arrastar aqui ── */}
              <div
                className="flex items-center justify-between px-4 py-3 shrink-0 select-none"
                style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', borderRadius: '15px 15px 0 0', cursor: 'grab' }}
              >
                <div className="flex items-center gap-2">
                  {view === 'edit' && (
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      onPointerDown={e => e.stopPropagation()}
                      className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronLeft size={13} className="text-white" />
                    </button>
                  )}
                  <NotebookPen size={15} className="text-yellow-300" />
                  <span className="text-white font-black text-sm">
                    {view === 'list' ? `Notas (${notes.length})` : 'Editar Nota'}
                  </span>
                </div>
                <div className="flex items-center gap-1" onPointerDown={e => e.stopPropagation()}>
                  {view === 'list' && (
                    <button
                      onClick={handleCreateNote}
                      className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center hover:bg-yellow-300 shadow"
                      title="Nova nota"
                      style={{ cursor: 'pointer' }}
                    >
                      <Plus size={13} className="text-gray-900" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40"
                    style={{ cursor: 'pointer' }}
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              </div>

              {/* ── LISTA DE NOTAS — sem stopPropagation: arrastar funciona em todo o corpo */}
              {view === 'list' && (
                <div
                  className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50 min-h-0"
                  style={{ borderRadius: '0 0 15px 15px', cursor: 'grab' }}
                >
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <FileText size={32} className="mb-3 opacity-40" />
                      <p className="text-sm font-semibold">Nenhuma nota ainda</p>
                      <p className="text-xs mt-1">Clique em + para criar</p>
                      <button
                        type="button"
                        onClick={handleCreateNote}
                        onPointerDown={e => e.stopPropagation()}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', cursor: 'pointer' }}
                      >
                        + Nova Nota
                      </button>
                    </div>
                  ) : (
                    notes.map(note => (
                      <div
                        key={note.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenNote(note)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenNote(note); } }}
                        className="rounded-xl p-3 cursor-pointer hover:shadow-md transition-all border group"
                        style={{ backgroundColor: note.color, borderColor: NOTE_COLORS.find(c => c.bg === note.color)?.border ?? '#e5e7eb' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-gray-800 break-words">{note.title || 'Sem título'}</p>
                            <p
                              className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]+>/g, ' ').slice(0, 100) || 'Nota vazia...' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleDeleteNote(note.id); }}
                            onPointerDown={e => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center hover:bg-red-100 transition-all shrink-0"
                            style={{ cursor: 'pointer' }}
                          >
                            <Trash2 size={11} className="text-red-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                          <Clock size={9} />
                          {formatDate(note.updatedAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── EDITOR DE NOTA ── */}
              {view === 'edit' && activeNote && (
                <>
                  {/* Título editável */}
                  <div className="shrink-0 px-4 pt-3 pb-2 border-b border-gray-100" onPointerDown={e => e.stopPropagation()} style={{ cursor: 'default' }}>
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={handleTitleChange}
                      onPointerDown={e => e.stopPropagation()}
                      placeholder="Título da nota..."
                      className="w-full text-base font-black text-gray-800 outline-none bg-transparent placeholder-gray-300"
                      style={{ cursor: 'text' }}
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(activeNote.updatedAt)}</p>
                  </div>

                  {/* Barra de ferramentas */}
                  <div
                    className="shrink-0 border-b"
                    onPointerDown={e => e.stopPropagation()}
                    style={{ borderColor: NOTE_COLORS.find(c => c.bg === activeNote.color)?.border ?? '#e5e7eb', backgroundColor: activeNote.color, cursor: 'default' }}
                  >
                    {/* Linha 1 — estilo de texto + estrutura + cores */}
                    <div className="flex items-center gap-1 px-3 pt-2 pb-1.5 flex-wrap">
                      {/* Estilo */}
                      <ToolBtn onClick={() => execCmd('bold')} active={formatState.bold} title="Negrito (Ctrl+B)">
                        <Bold size={15} />
                      </ToolBtn>
                      <ToolBtn onClick={() => execCmd('italic')} active={formatState.italic} title="Itálico (Ctrl+I)">
                        <Italic size={15} />
                      </ToolBtn>
                      <ToolBtn onClick={() => execCmd('underline')} active={formatState.underline} title="Sublinhado (Ctrl+U)">
                        <Underline size={15} />
                      </ToolBtn>

                      <div className="w-px h-6 bg-black/10 mx-1" />

                      {/* Estrutura */}
                      <ToolBtn onClick={() => execCmd('formatBlock', '<h2>')} title="Título grande">
                        <span className="text-xs font-black leading-none">H2</span>
                      </ToolBtn>
                      <ToolBtn onClick={() => execCmd('formatBlock', '<h3>')} title="Título médio">
                        <span className="text-xs font-black leading-none">H3</span>
                      </ToolBtn>
                      <ToolBtn onClick={() => execCmd('formatBlock', '<p>')} title="Parágrafo normal">
                        <Type size={15} />
                      </ToolBtn>

                      <div className="w-px h-6 bg-black/10 mx-1" />

                      {/* Listas */}
                      <ToolBtn onClick={() => execCmd('insertUnorderedList')} title="Lista com marcadores">
                        <List size={15} />
                      </ToolBtn>
                      <ToolBtn onClick={insertChecklist} title="Lista de tarefas ✓">
                        <CheckSquare size={15} />
                      </ToolBtn>

                      <div className="w-px h-6 bg-black/10 mx-1" />

                      {/* Cor do texto */}
                      <button
                        onMouseDown={e => { e.preventDefault(); setShowColors(p => !p); setShowNoteColors(false); }}
                        title="Cor do texto"
                        style={{ cursor: 'pointer' }}
                        className={`w-9 h-9 rounded-xl flex items-center gap-1 justify-center transition-all border-2
                          ${showColors ? 'bg-indigo-600 border-indigo-700' : 'border-transparent hover:bg-white/60 hover:border-black/10'}`}
                      >
                        <Palette size={15} className={showColors ? 'text-white' : 'text-gray-700'} />
                        <div className="w-2.5 h-2 rounded-sm border border-black/20" style={{ backgroundColor: activeColor }} />
                      </button>

                      {/* Cor da nota */}
                      <button
                        onMouseDown={e => { e.preventDefault(); setShowNoteColors(p => !p); setShowColors(false); }}
                        title="Cor da nota"
                        style={{ cursor: 'pointer' }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2
                          ${showNoteColors ? 'bg-indigo-600 border-indigo-700' : 'border-transparent hover:bg-white/60 hover:border-black/10'}`}
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: activeNote.color }} />
                      </button>

                      <div className="flex-1" />

                      <ToolBtn onClick={() => handleDeleteNote(activeNote.id)} danger title="Apagar nota">
                        <Trash2 size={15} />
                      </ToolBtn>
                    </div>

                    {/* Linha 2 — alinhamento de texto */}
                    <div className="flex items-center gap-1 px-3 pb-2.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Alinhar:</span>
                      <ToolBtn
                        onClick={() => execCmd('justifyLeft')}
                        active={formatState.justifyLeft && !formatState.justifyCenter && !formatState.justifyRight && !formatState.justifyFull}
                        title="Alinhar à esquerda"
                      >
                        <AlignLeft size={15} />
                      </ToolBtn>
                      <ToolBtn
                        onClick={() => execCmd('justifyCenter')}
                        active={formatState.justifyCenter}
                        title="Centralizar"
                      >
                        <AlignCenter size={15} />
                      </ToolBtn>
                      <ToolBtn
                        onClick={() => execCmd('justifyRight')}
                        active={formatState.justifyRight}
                        title="Alinhar à direita"
                      >
                        <AlignRight size={15} />
                      </ToolBtn>
                      <ToolBtn
                        onClick={() => execCmd('justifyFull')}
                        active={formatState.justifyFull}
                        title="Justificar"
                      >
                        <AlignJustify size={15} />
                      </ToolBtn>
                    </div>

                    {/* Linha 2 — paleta de cor do texto (inline, sem overflow) */}
                    {showColors && (
                      <div className="px-3 pb-2.5 pt-1 border-t border-black/10">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Cor do texto</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {TEXT_COLORS.map(c => (
                            <button
                              key={c}
                              onMouseDown={e => { e.preventDefault(); applyTextColor(c); }}
                              className="w-7 h-7 rounded-full border-2 border-white hover:scale-125 transition-all"
                              style={{
                                backgroundColor: c,
                                boxShadow: activeColor === c
                                  ? `0 0 0 2px white, 0 0 0 4px ${c}`
                                  : '0 1px 4px rgba(0,0,0,0.2)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linha 2 — paleta de cor da nota (inline, sem overflow) */}
                    {showNoteColors && (
                      <div className="px-3 pb-2.5 pt-1 border-t border-black/10">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Cor da nota</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {NOTE_COLORS.map(c => (
                            <button
                              key={c.bg}
                              onMouseDown={e => { e.preventDefault(); handleChangeNoteColor(c.bg); }}
                              title={c.label}
                              className="w-7 h-7 rounded-full border-2 hover:scale-125 transition-all"
                              style={{
                                backgroundColor: c.bg,
                                borderColor: c.border,
                                boxShadow: activeNote.color === c.bg
                                  ? `0 0 0 2px white, 0 0 0 4px ${c.border}`
                                  : '0 1px 4px rgba(0,0,0,0.1)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Área de escrita — stopPropagation impede que o drag inicie ao clicar para editar */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onPointerDown={e => e.stopPropagation()}
                    className="flex-1 overflow-y-auto p-4 outline-none leading-relaxed"
                    data-placeholder="Escreva sua nota aqui... (sem limite de texto)"
                    style={{
                      minHeight: 160,
                      maxHeight: '100%',
                      fontSize: '0.9rem',
                      fontFamily: '"Georgia", serif',
                      color: '#111827',
                      backgroundColor: activeNote.color,
                      userSelect: 'text',
                      WebkitUserSelect: 'text',
                      cursor: 'text',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  />

                  {/* Rodapé */}
                  <div
                    className="shrink-0 flex items-center justify-between px-3 py-2.5 border-t border-gray-100 bg-white"
                    onPointerDown={e => e.stopPropagation()}
                    style={{ borderRadius: '0 0 15px 15px', cursor: 'default' }}
                  >
                    <button
                      onClick={() => setView('list')}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronLeft size={13} /> Todas as notas
                    </button>
                    <div className="flex items-center gap-2">
                      {saveError && (
                        <span className="text-[10px] font-bold text-red-500">Erro ao salvar!</span>
                      )}
                      <button
                        onClick={handleSaveNote}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all"
                        style={{
                          background: saveError ? '#dc2626' : saved ? '#16a34a' : 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
                          opacity: isSaving ? 0.7 : 1,
                          cursor: isSaving ? 'wait' : 'pointer',
                        }}
                      >
                        <Save size={13} />
                        {saveError ? 'Erro!' : saved ? '✓ Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable] h2 {
          font-size: 1.15rem !important;
          font-weight: 800 !important;
          margin: 10px 0 4px !important;
          color: #1e1b4b !important;
          line-height: 1.3 !important;
        }
        [contenteditable] h3 {
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          margin: 8px 0 3px !important;
          color: #374151 !important;
          line-height: 1.3 !important;
        }
        [contenteditable] p {
          margin: 3px 0 !important;
          font-size: 0.875rem !important;
        }
        [contenteditable] ul {
          list-style: disc !important;
          padding-left: 18px !important;
          margin: 4px 0 !important;
        }
        [contenteditable] ol {
          list-style: decimal !important;
          padding-left: 18px !important;
          margin: 4px 0 !important;
        }
        [contenteditable] li { margin: 2px 0 !important; }
      `}</style>
      </motion.div>
    </div>
  );
};

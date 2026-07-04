import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Shield, Search, UserPlus, Check, X, Filter, Trash2,
  ChevronLeft, Loader2, Edit2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getUsers, createUser, updateUser, deleteUser } from '../lib/api';
import { AppUser, UserRole, UserStatus } from '../types';

const AGENCIES = [
  'Defesa Civil',
  'Secretaria de Planejamento Urbano (SEPLAN)',
  'Secretaria de Saúde',
  'Controle Urbano (DIRCON)',
  'Outro',
];

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'Visualizador', label: 'Visualizador', desc: 'Apenas leitura do mapa e dados' },
  { value: 'Editor',       label: 'Editor',       desc: 'Cadastra e atualiza imóveis' },
  { value: 'Admin',        label: 'Administrador', desc: 'Acesso total, gerencia usuários' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  Visualizador: 'bg-gray-100 text-gray-600 border-gray-200',
  Editor:       'bg-[#3B5935]/10 text-[#3B5935] border-[#3B5935]/20',
  Admin:        'bg-[#EC3759]/10 text-[#EC3759] border-[#EC3759]/20',
};

function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AppUser | null;
  onClose: () => void;
  onSaved: (u: AppUser) => void;
}) {
  const isEditing = !!user;
  const [form, setForm] = useState<Omit<AppUser, 'id'>>({
    name:     user?.name     ?? '',
    email:    user?.email    ?? '',
    password: '',
    agency:   user?.agency   ?? '',
    role:     user?.role     ?? 'Visualizador',
    status:   user?.status   ?? 'Ativo',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.agency) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!isEditing && !form.password?.trim()) {
      setError('A senha é obrigatória para novos usuários.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = isEditing && user
        ? await updateUser(user.id, form)
        : await createUser(form);
      onSaved(saved);
      onClose();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-[#1E1E1E] text-lg">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-[#EC3759] bg-[#EC3759]/5 border border-[#EC3759]/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                Nome completo <span className="text-[#EC3759]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                E-mail institucional <span className="text-[#EC3759]">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nome@orgao.gov.br"
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                {isEditing ? 'Nova Senha' : 'Senha'} {!isEditing && <span className="text-[#EC3759]">*</span>}
                {isEditing && <span className="text-[#1E1E1E]/40 font-normal text-xs"> — deixe em branco para não alterar</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E1E1E]/40 hover:text-[#1E1E1E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                Órgão / Secretaria <span className="text-[#EC3759]">*</span>
              </label>
              <select
                required
                value={form.agency}
                onChange={e => setForm({ ...form, agency: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
              >
                <option value="">Selecione o órgão...</option>
                {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Nível de Acesso</label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(r => (
                  <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.role === r.value ? 'border-[#3B5935] bg-[#3B5935]/5 ring-1 ring-[#3B5935]' : 'border-[#8C3A27]/15 bg-gray-50 hover:bg-white'}`}>
                    <input type="radio" name="role" className="sr-only" checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${form.role === r.value ? 'border-[#3B5935] bg-[#3B5935]' : 'border-gray-300 bg-white'}`}>
                      {form.role === r.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#1E1E1E]">{r.label}</span>
                      <span className="text-xs text-[#1E1E1E]/50 block">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">Status da Conta</label>
                <div className="flex gap-3">
                  {(['Ativo', 'Inativo'] as UserStatus[]).map(s => (
                    <label key={s} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${form.status === s ? (s === 'Ativo' ? 'bg-[#3B5935] text-white border-[#3B5935]' : 'bg-gray-400 text-white border-gray-400') : 'bg-gray-50 border-[#8C3A27]/15 text-[#1E1E1E]/60 hover:bg-white'}`}>
                      <input type="radio" name="status" className="sr-only" checked={form.status === s} onChange={() => setForm({ ...form, status: s })} />
                      {s === 'Ativo' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="p-5 pt-0 shrink-0 border-t border-gray-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}

export default function AccessControl() {
  const navigate = useNavigate();
  const [users, setUsers]             = useState<AppUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null | 'new'>('new' as any);
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalUser, setModalUser]     = useState<AppUser | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenNew = () => { setModalUser(null); setModalOpen(true); };
  const handleOpenEdit = (u: AppUser) => { setModalUser(u); setModalOpen(true); };

  const handleSaved = (saved: AppUser) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      return idx >= 0 ? prev.map(u => u.id === saved.id ? saved : u) : [saved, ...prev];
    });
  };

  const handleToggleStatus = async (u: AppUser) => {
    const next: UserStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      const updated = await updateUser(u.id, { status: next });
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
    } catch { alert('Erro ao alterar status.'); }
  };

  const handleRoleChange = async (u: AppUser, role: UserRole) => {
    try {
      const updated = await updateUser(u.id, { role });
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
    } catch { alert('Erro ao alterar nível de acesso.'); }
  };

  const handleDelete = async (u: AppUser) => {
    if (!confirm(`Remover ${u.name} do sistema? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch { alert('Erro ao remover usuário.'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = [u.name, u.email, u.agency].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto w-full font-sans text-[#1E1E1E]">
      <div className="max-w-6xl w-full mx-auto space-y-8">

        {/* Header */}
        <div>
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="mb-4 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Mapa
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#EC3759]" />
                Controle de Acesso
              </h1>
              <p className="text-[#1E1E1E]/60 text-sm mt-1">
                {loading ? 'Carregando...' : `${users.length} usuário(s) cadastrado(s)`}
              </p>
            </div>
            <Button variant="primary" onClick={handleOpenNew}>
              <UserPlus className="w-4 h-4" /> Novo Usuário
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#8C3A27]/10 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E1E1E]/40" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou órgão..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#8C3A27]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B5935] text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#1E1E1E]/40 shrink-0" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="flex-1 md:w-44 px-3 py-2.5 border border-[#8C3A27]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] bg-white"
            >
              <option value="">Todos os níveis</option>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#8C3A27]/10 overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-[#1E1E1E]/40">
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando usuários...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[#1E1E1E]/40 font-semibold">
              {users.length === 0 ? 'Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.' : 'Nenhum usuário encontrado com os filtros atuais.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#8C3A27]/10 text-xs uppercase tracking-wider text-[#1E1E1E]/60 font-semibold">
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Órgão</th>
                    <th className="p-4">Nível de Acesso</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C3A27]/5">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#3B5935]/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-[#3B5935]">
                              {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-[#1E1E1E] text-sm">{u.name}</p>
                            <p className="text-xs text-[#1E1E1E]/50">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-[#1E1E1E]/80 border border-gray-200">
                          {u.agency}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u, e.target.value as UserRole)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#3B5935] cursor-pointer ${ROLE_COLORS[u.role]}`}
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                            u.status === 'Ativo'
                              ? 'bg-[#3B5935]/10 text-[#3B5935] hover:bg-[#3B5935]/20'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title="Clique para alternar status"
                        >
                          {u.status === 'Ativo' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {u.status}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(u)}
                            className="text-[#1E1E1E]/40 hover:text-[#3B5935]"
                            title="Editar usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(u)}
                            className="text-[#1E1E1E]/40 hover:text-[#EC3759]"
                            title="Remover usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-[#8C3A27]/10 bg-gray-50/50 flex items-center justify-between text-xs text-[#1E1E1E]/40 font-medium">
              <span>{filtered.length} de {users.length} usuário(s)</span>
              <div className="flex items-center gap-3">
                {ROLE_OPTIONS.map(r => {
                  const count = filtered.filter(u => u.role === r.value).length;
                  return count > 0 ? (
                    <span key={r.value} className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[r.value]}`}>
                      {count} {r.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Roles explanation */}
        <div className="bg-[#F2C94C]/10 border border-[#F2C94C]/30 rounded-2xl p-5 flex gap-4">
          <Shield className="w-6 h-6 text-[#8C3A27] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#8C3A27] mb-3">Entendendo os Níveis de Acesso</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-[#8C3A27]/80">
              {ROLE_OPTIONS.map(r => (
                <div key={r.value}>
                  <strong className="block text-[#8C3A27] mb-0.5">{r.label}</strong>
                  {r.value === 'Visualizador' && 'Visualiza o mapa e lê os dados detalhados. Ideal para secretarias de apoio.'}
                  {r.value === 'Editor' && 'Cadastra imóveis, atualiza status de risco e anexa laudos. Ideal para Defesa Civil.'}
                  {r.value === 'Admin' && 'Gerencia usuários, permissões e configurações globais do sistema.'}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {modalOpen && (
        <UserModal
          user={modalUser}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
